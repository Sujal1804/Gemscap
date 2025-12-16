# Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Step 1: Install Dependencies

```bash
pip install -r requirements.txt
```

This installs:
- `streamlit` - Web dashboard framework
- `websockets` - Live data collection
- `pandas` - Data manipulation
- `plotly` - Interactive charts
- `statsmodels` - Statistical tests
- `numpy`, `scipy` - Numerical computing

### Step 2: Test the System

```bash
python test_system.py
```

You should see:
```
✅ All modules imported successfully
✅ Database initialized successfully
✅ Tick insertion works
...
🎉 All tests passed! System is ready.
```

### Step 3: Start the Dashboard

**Windows:**
```bash
start.bat
```

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

**Manual:**
```bash
streamlit run app.py
```

The dashboard will open at: `http://localhost:8501`

### Step 4: Collect Live Data

1. **In the sidebar**, click **"▶️ Start"**
2. Wait 30-60 seconds for data to accumulate
3. Charts will start showing live data

### Step 5: Analyze Pairs

**Default Setup:**
- Symbol A: `btcusdt` (Bitcoin)
- Symbol B: `ethusdt` (Ethereum)
- Timeframe: `1m` (1 minute bars)
- Rolling Window: `20` periods

**What You'll See:**
- **Prices Tab**: Live BTC and ETH price charts
- **Spread & Z-Score Tab**: Trading signals
- **Correlation Tab**: Relationship strength
- **Statistics Tab**: Detailed metrics

### Step 6: Set Up Alerts

1. Adjust **Z-Score Alert Threshold** (default: 2.0)
2. When |Z-Score| > threshold, you'll see alerts
3. Alerts appear below the charts
4. All alerts are logged to database

### Step 7: Export Data

1. Scroll to sidebar bottom
2. Click **"Download Spread & Z-Score"**
3. Or **"Download Alert History"**
4. CSV files saved with timestamp

---

## 📊 Understanding the Charts

### Price Charts
- **Blue line**: Symbol A price (e.g., BTC)
- **Orange line**: Symbol B price (e.g., ETH)
- Hover for exact values
- Zoom with mouse drag

### Spread Chart
- Spread = Price_A - β × Price_B
- β (hedge ratio) shown in metrics
- Should oscillate around a mean

### Z-Score Chart
- Normalized spread deviation
- **Red dashed lines**: Alert thresholds
- **Z > +2**: Spread expensive (short signal)
- **Z < -2**: Spread cheap (long signal)
- **|Z| < 1**: No clear signal

### Correlation Chart
- Rolling correlation between assets
- **> 0.7**: Strong positive (good for pairs)
- **< 0.3**: Weak relationship (avoid)

---

## 🎛️ Dashboard Controls

### Symbol Selection
- Enter any Binance Futures symbol (lowercase)
- Examples: `btcusdt`, `ethusdt`, `solusdt`, `bnbusdt`
- Both symbols must be available on Binance Futures

### Timeframe
- `1s` - 1 second bars (very fast, for tick analysis)
- `1m` - 1 minute bars (recommended for live trading)
- `5m` - 5 minute bars (smoother, less noise)
- `15m` - 15 minute bars (slower signals)

### Rolling Window
- **10-20**: Fast signals, more false positives
- **20-50**: Balanced (recommended)
- **50-200**: Slow, more reliable

### Alert Threshold
- **1.5**: More frequent alerts
- **2.0**: Standard (recommended)
- **3.0**: Only extreme signals

---

## 🔬 Running ADF Test

1. Click **"📊 Run ADF Test"** in sidebar
2. Results appear below charts
3. **P-Value < 0.05**: Spread is stationary ✅
4. **P-Value > 0.05**: Pairs may not be cointegrated ⚠️

**Interpretation:**
- **Stationary spread**: Mean-reverting, good for trading
- **Non-stationary spread**: Trending, avoid or investigate

---

## 💡 Trading Signals (Educational Only)

### Entry Signals
- **Long Spread**: Z-Score < -2
  - Buy Symbol A, Sell β units of Symbol B
- **Short Spread**: Z-Score > +2
  - Sell Symbol A, Buy β units of Symbol B

### Exit Signals
- **Close positions**: Z-Score crosses 0
- **Stop loss**: Z-Score exceeds ±3

### Risk Warning
⚠️ **This is an educational demo. Do NOT trade real money without:**
- Proper backtesting
- Risk management
- Transaction cost analysis
- Slippage consideration
- Professional guidance

---

## 📁 Where is Data Stored?

**Database File**: `market_data.db` (SQLite)

**Tables:**
- `ticks`: Raw tick data
- `resampled`: OHLCV bars
- `alerts`: Alert history

**Viewing Data:**
```bash
# Install SQLite browser (optional)
# https://sqlitebrowser.org/

# Or use command line
sqlite3 market_data.db "SELECT * FROM ticks LIMIT 10;"
```

---

## 🛠️ Troubleshooting

### No Data Showing
1. Check if pipeline is running (green "🟢 Pipeline Running")
2. Wait 30-60 seconds for data accumulation
3. Try clicking "🔄 Refresh Now"
4. Check internet connection

### Database Error
1. Delete `market_data.db` and `test_market_data.db`
2. Restart the application
3. Fresh database will be created

### WebSocket Connection Failed
1. Check firewall settings
2. Ensure Binance is not blocked in your region
3. Try different symbols
4. Restart the pipeline

### High CPU Usage
1. Disable auto-refresh (uncheck sidebar)
2. Increase refresh interval in code
3. Reduce number of symbols
4. Close other applications

### Charts Not Updating
1. Ensure auto-refresh is enabled
2. Click "🔄 Refresh Now" manually
3. Restart Streamlit (Ctrl+C, then restart)

---

## 🎓 Learning Resources

### Pairs Trading
- **Book**: "Algorithmic Trading" by Ernest Chan
- **Paper**: "Pairs Trading: Performance of a Relative-Value Arbitrage Rule"

### Statistical Arbitrage
- **Cointegration**: Engle-Granger methodology
- **Mean Reversion**: Ornstein-Uhlenbeck process
- **Time Series Analysis**: Box-Jenkins approach

### Python for Quant Finance
- **QuantLib**: Derivatives pricing library
- **zipline**: Backtesting framework
- **backtrader**: Trading strategies framework

---

## 🔄 Next Steps

1. **Experiment with Different Pairs**
   - Try correlated crypto pairs
   - Test during different market conditions
   
2. **Backtest Strategies**
   - Export historical data
   - Test z-score thresholds
   - Calculate Sharpe ratio

3. **Enhance the System**
   - Add more statistical tests
   - Implement Kalman filter
   - Create portfolio of pairs

4. **Learn the Math**
   - Study cointegration theory
   - Understand OLS regression
   - Learn time series analysis

---

## 📧 Support

For issues or questions:
1. Check the main README.md
2. Review code comments
3. Inspect logs in terminal
4. Create an issue in the repository

---

**Happy Trading (Simulation)!** 📈

*Remember: This is for educational purposes. Always practice proper risk management.*
