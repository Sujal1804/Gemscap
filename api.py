from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import asyncio
import threading
from contextlib import asynccontextmanager
from datetime import datetime
import pandas as pd
import numpy as np
import io

from src.pipeline import MarketDataPipeline
from src.storage import DataStore

class PipelineConfig(BaseModel):
    symbol_a: str
    symbol_b: str
    timeframes: List[str] = ['1s', '1m', '5m']

class AnalyticsRequest(BaseModel):
    symbol_a: str
    symbol_b: str
    timeframe: str = '1m'
    window: int = 20
    limit: int = 200
    z_score_threshold: float = 2.0

pipeline: Optional[MarketDataPipeline] = None
pipeline_lock = asyncio.Lock()

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up FastAPI backend...")
    yield
    print("Shutting down...")
    global pipeline
    if pipeline:
        await pipeline.stop()

app = FastAPI(title="Gemscap API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"status": "ok", "service": "Gemscap Analytics API"}

@app.post("/pipeline/start")
async def start_pipeline(config: PipelineConfig, background_tasks: BackgroundTasks):
    global pipeline
    
    if not config.symbol_a or not config.symbol_b:
        raise HTTPException(status_code=400, detail="Symbols cannot be empty")
        
    async with pipeline_lock:
        if pipeline and pipeline.running:
            return {"status": "already_running", "message": "Pipeline is already running"}
            
        pipeline = MarketDataPipeline(
            symbols=[config.symbol_a.lower(), config.symbol_b.lower()],
            db_path="market_data.db"
        )
        
        background_tasks.add_task(pipeline.start, config.timeframes)
        
        return {"status": "started", "symbols": [config.symbol_a, config.symbol_b]}

@app.post("/pipeline/stop")
async def stop_pipeline():
    global pipeline
    async with pipeline_lock:
        if pipeline and pipeline.running:
            await pipeline.stop()
            return {"status": "stopped"}
        return {"status": "not_running", "message": "Pipeline is not running"}

@app.get("/pipeline/status")
async def get_status():
    global pipeline
    if pipeline and pipeline.running:
        return {
            "running": True,
            "symbols": pipeline.symbols
        }
    return {"running": False}

@app.post("/analytics")
async def get_analytics(req: AnalyticsRequest):
    global pipeline
    
    req_pipeline = pipeline
    created_temp = False
    
    if not req_pipeline:
        req_pipeline = MarketDataPipeline(
            symbols=[req.symbol_a.lower(), req.symbol_b.lower()],
            db_path="market_data.db"
        )
        created_temp = True
    
    try:
        analytics = await asyncio.to_thread(
            req_pipeline.calculate_pairs_analytics,
            req.symbol_a.lower(),
            req.symbol_b.lower(),
            req.timeframe,
            req.window,
            req.limit
        )
        
        if not analytics:
            return {"status": "no_data", "message": "Not enough data for analytics"}
            
        def serialize_series(series):
            return series.where(pd.notnull(series), None).tolist() if hasattr(series, 'tolist') else []

        def serialize_ohlcv(df):
            if df is None or df.empty: return []
            df = df.reset_index()
            return df.apply(lambda x: {
                'time': x['timestamp'].isoformat() if hasattr(x['timestamp'], 'isoformat') else str(x['timestamp']),
                'open': x['open'],
                'high': x['high'],
                'low': x['low'],
                'close': x['close'],
                'volume': x['volume']
            }, axis=1).tolist()

        def recursive_sanitize(obj):
            if isinstance(obj, (float, np.floating)):
                if pd.isna(obj) or np.isnan(obj) or np.isinf(obj):
                    return None
                return float(obj)
            elif isinstance(obj, (int, np.integer)):
                return int(obj)
            elif isinstance(obj, dict):
                return {k: recursive_sanitize(v) for k, v in obj.items()}
            elif isinstance(obj, (list, tuple)):
                return [recursive_sanitize(v) for v in obj]
            elif isinstance(obj, np.ndarray):
                return [recursive_sanitize(v) for v in obj.tolist()]
            return obj

        result = {
            "hedge_ratio": analytics.get('hedge_ratio'),
            "timestamps": [t.isoformat() for t in analytics.get('timestamps', [])],
            "spread": serialize_series(analytics.get('spread')),
            "z_score": serialize_series(analytics.get('z_score')),
            "price_a": serialize_series(analytics.get('price_a')),
            "price_b": serialize_series(analytics.get('price_b')),
            "correlation": analytics.get('correlation'),
            "ohlcv_a": serialize_ohlcv(analytics.get('ohlcv_a')),
            "ohlcv_b": serialize_ohlcv(analytics.get('ohlcv_b')),
            "metrics": {
                "current_z_score": analytics.get('z_score').iloc[-1] if analytics.get('z_score') is not None and len(analytics.get('z_score')) > 0 else None,
                "half_life": analytics.get('half_life')
            }
        }
        
        result['stats_a'] = analytics.get('stats_a')
        result['stats_b'] = analytics.get('stats_b')
        
        current_z = result['metrics']['current_z_score']
        if current_z is not None and abs(current_z) > req.z_score_threshold:
            ds = DataStore("market_data.db")
            try:
                msg = f"Z-Score Alert: {req.symbol_a}/{req.symbol_b} z-score = {current_z:.2f} (threshold: {req.z_score_threshold})"
                ds.insert_alert(
                    timestamp=datetime.now(),
                    symbol=f"{req.symbol_a}-{req.symbol_b}",
                    alert_type="Z-SCORE",
                    message=msg
                )
            finally:
                ds.close()

        ds = DataStore("market_data.db")
        try:
            alerts_df = ds.get_alerts(limit=5)
            if not alerts_df.empty:
                alerts_df['timestamp'] = alerts_df['timestamp'].apply(lambda x: x.isoformat() if pd.notnull(x) else str(x))
                result['alerts'] = alerts_df.to_dict(orient='records')
            else:
                result['alerts'] = []
        except:
            result['alerts'] = []
        finally:
            ds.close()
        
        return recursive_sanitize(result)
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if created_temp and req_pipeline:
            req_pipeline.close()

@app.post("/analytics/export")
async def export_analytics(request: AnalyticsRequest):
    global pipeline
    
    req_pipeline = pipeline
    created_temp = False
    
    if not req_pipeline:
        req_pipeline = MarketDataPipeline(
            symbols=[request.symbol_a.lower(), request.symbol_b.lower()],
            db_path="market_data.db"
        )
        created_temp = True
        
    try:
        data = await asyncio.to_thread(
            req_pipeline.calculate_pairs_analytics,
            request.symbol_a.lower(),
            request.symbol_b.lower(),
            request.timeframe,
            request.window,
            request.limit
        )
        
        if not data:
             raise HTTPException(status_code=404, detail="No data available")

        df = pd.DataFrame({
            'timestamp': data['timestamps'],
            'price_a': data['price_a'],
            'price_b': data['price_b'],
            'spread': data['spread'],
            'z_score': data['z_score']
        })
        
        stream = io.StringIO()
        df.to_csv(stream, index=True)
        response = StreamingResponse(iter([stream.getvalue()]), media_type="text/csv")
        response.headers["Content-Disposition"] = f"attachment; filename=pairs_analytics_{request.symbol_a}_{request.symbol_b}.csv"
        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if created_temp and req_pipeline:
            req_pipeline.close()

@app.get("/alerts")
async def get_alerts(limit: int = 50):
    ds = DataStore("market_data.db")
    try:
        df = ds.get_alerts(limit=limit)
        if df.empty:
            return []
        
        df['timestamp'] = df['timestamp'].apply(lambda x: x.isoformat() if pd.notnull(x) else str(x))
        return df.to_dict(orient='records')
    finally:
        ds.close()
