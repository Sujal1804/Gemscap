"""
Simple test script to verify components work
Run this before starting the main dashboard
"""
import sys
import asyncio
from datetime import datetime

print("=" * 60)
print("Quant Pairs Trading Analytics - System Test")
print("=" * 60)

# Test 1: Import all modules
print("\n[1/6] Testing imports...")
try:
    from src.data_ingestion import BinanceWSCollector, TickBuffer
    from src.storage import DataStore
    from src.resampler import DataResampler
    from src.analytics import PairsAnalytics
    from src.pipeline import MarketDataPipeline
    print("✅ All modules imported successfully")
except Exception as e:
    print(f"❌ Import failed: {e}")
    sys.exit(1)

# Test 2: Database initialization
print("\n[2/6] Testing database...")
try:
    db = DataStore(db_path="test_market_data.db")
    print("✅ Database initialized successfully")
    
    # Test tick insertion
    test_tick = {
        'timestamp': datetime.now(),
        'symbol': 'btcusdt',
        'price': 43000.5,
        'size': 0.01,
        'is_buyer_maker': False
    }
    db.insert_tick(test_tick)
    print("✅ Tick insertion works")
    
    # Test retrieval
    ticks = db.get_ticks(symbol='btcusdt', limit=10)
    print(f"✅ Retrieved {len(ticks)} ticks")
    
    db.close()
except Exception as e:
    print(f"❌ Database test failed: {e}")
    sys.exit(1)

# Test 3: Resampler
print("\n[3/6] Testing resampler...")
try:
    import pandas as pd
    import numpy as np
    
    # Create sample tick data
    timestamps = pd.date_range(start='2024-01-01', periods=100, freq='1S')
    sample_data = pd.DataFrame({
        'timestamp': timestamps,
        'symbol': 'btcusdt',
        'price': 43000 + np.random.randn(100) * 10,
        'size': np.random.rand(100)
    })
    
    resampler = DataResampler()
    resampled = resampler.resample_ticks(sample_data, '5m', 'btcusdt')
    print(f"✅ Resampled {len(sample_data)} ticks to {len(resampled)} bars")
except Exception as e:
    print(f"❌ Resampler test failed: {e}")
    sys.exit(1)

# Test 4: Analytics
print("\n[4/6] Testing analytics...")
try:
    analytics = PairsAnalytics()
    
    # Create sample price data
    price_a = pd.Series(np.random.randn(100).cumsum() + 100)
    price_b = pd.Series(np.random.randn(100).cumsum() + 100)
    
    # Test hedge ratio
    beta, alpha, r2 = analytics.calculate_hedge_ratio_ols(price_a, price_b)
    print(f"✅ Hedge ratio calculated: β={beta:.4f}, R²={r2:.4f}")
    
    # Test spread
    spread = analytics.calculate_spread(price_a, price_b, beta)
    print(f"✅ Spread calculated: {len(spread)} points")
    
    # Test z-score
    z_score = analytics.calculate_z_score(spread, window=20)
    print(f"✅ Z-score calculated")
    
    # Test correlation
    corr = analytics.calculate_correlation(price_a, price_b)
    print(f"✅ Correlation calculated: {corr:.4f}")
    
except Exception as e:
    print(f"❌ Analytics test failed: {e}")
    sys.exit(1)

# Test 5: TickBuffer
print("\n[5/6] Testing tick buffer...")
try:
    async def test_buffer():
        buffer = TickBuffer(max_size=1000)
        
        # Add some ticks
        for i in range(10):
            await buffer.add({
                'timestamp': datetime.now(),
                'symbol': 'btcusdt',
                'price': 43000 + i,
                'size': 0.01
            })
        
        size = await buffer.size()
        print(f"✅ Buffer test passed: {size} ticks stored")
        
        await buffer.clear()
        size_after = await buffer.size()
        print(f"✅ Buffer clear works: {size_after} ticks after clear")
    
    asyncio.run(test_buffer())
except Exception as e:
    print(f"❌ Buffer test failed: {e}")
    sys.exit(1)

# Test 6: Pipeline initialization
print("\n[6/6] Testing pipeline...")
try:
    pipeline = MarketDataPipeline(
        symbols=['btcusdt', 'ethusdt'],
        db_path="test_market_data.db"
    )
    print("✅ Pipeline initialized successfully")
    
    pipeline.close()
except Exception as e:
    print(f"❌ Pipeline test failed: {e}")
    sys.exit(1)

print("\n" + "=" * 60)
print("🎉 All tests passed! System is ready.")
print("=" * 60)
print("\nNext steps:")
print("1. Run: streamlit run app.py")
print("2. Click 'Start' in the sidebar")
print("3. Monitor live data and analytics")
print("\n" + "=" * 60)
