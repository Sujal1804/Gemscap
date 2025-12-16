# QuantPairs: Real-time Statistical Arbitrage Platform

A high-performance quantitative trading dashboard for analyzing and executing statistical arbitrage strategies on crypto pairs. Built with a modern **FastAPI** backend and **React** frontend.

## 🚀 Key Features

- **Real-time Z-Score Analysis**: Live calculation of spread and z-score for pairs trading.
- **Dynamic Hedge Ratio**: Real-time beta calculation using OLS.
- **Interactive Charts**:
  - Live Z-Score deviation chart.
  - Synchronized price charts for both assets.
  - Spread vs. Z-Score scatter analysis.
- **Alert System**: Configurable visual alerts for z-score threshold breaches.
- **Data Export**: One-click CSV export of analytics data for backtesting.
- **High Performance**:
  - Asynchronous WebSocket data ingestion.
  - Efficient Pandas/NumPy analytics engine.
  - SQLite storage for trade history.

## 🛠️ Tech Stack

- **Backend**: Python 3.9+, FastAPI, Uvicorn, Pandas, NumPy, Statsmodels.
- **Frontend**: React 18, Vite, Recharts, TailwindCSS, Lucide Icons.
- **Database**: SQLite (optimized with WAL mode).

## 📦 Installation & Setup

### Prerequisites

- Python 3.8+
- Node.js 16+

### 1. Backend Setup

```bash
# Install Python dependencies
pip install -r requirements.txt

# Start the API server
python -m uvicorn api:app --reload --port 8000
```
The API will be available at `http://localhost:8000`.

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```
The application will launch at `http://localhost:5173`.

## 🖥️ Usage

1. **Configure Pair**: Enter two symbols (e.g., `BTCUSDT` and `ETHUSDT`) in the control panel.
2. **Set Parameters**: Adjust timeframe (1m/5m), rolling window (e.g., 20), and alert threshold.
3. **Start System**: Click **Start System**. The app will begin ingesting live data via WebSocket.
4. **Analyze**: Monitor the Z-Score chart.
   - **Long Signal**: Z-Score < -2.0 (Spread is too low).
   - **Short Signal**: Z-Score > +2.0 (Spread is too high).
5. **Export**: Click the Download icon to save the session data as CSV.

## 📂 Project Structure

```
├── api.py                 # FastAPI backend entry point
├── requirements.txt       # Python dependencies
├── src/
│   ├── pipeline.py        # Main data orchestrator
│   ├── storage.py         # Database interface
│   ├── analytics.py       # Quant logic (Hedge Ratio, Z-Score)
│   ├── resampler.py       # OHLCV aggregation
│   └── data_ingestion.py  # WebSocket collector
└── frontend/              # React application
    ├── src/
    │   ├── App.jsx        # Main Dashboard UI
    │   └── main.jsx       # Entry point
    └── package.json
```

## 📝 License

MIT License. Free for educational and personal use.
