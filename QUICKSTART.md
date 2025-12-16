# Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Prerequisites
- Python 3.9+
- Node.js 16+

### Step 1: Backend Setup (Terminal 1)

1.  **Install Python Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
    *Installs FastAPI, Uvicorn, Pandas, Statsmodels, etc.*

2.  **Start the API Server**:
    ```bash
    python -m uvicorn api:app --reload --port 8000
    ```
    *Server will start at `http://localhost:8000`*

### Step 2: Frontend Setup (Terminal 2)

1.  **Navigate to Frontend**:
    ```bash
    cd frontend
    ```

2.  **Install Node Modules**:
    ```bash
    npm install
    ```

3.  **Start the React App**:
    ```bash
    npm run dev
    ```
    *App will launch at `http://localhost:5173`*

### Step 3: Using the Dashboard

1.  **Configuration**:
    - Select **Symbol A** (e.g., `btcusdt`) and **Symbol B** (e.g., `ethusdt`).
    - Choose **Timeframe** (e.g., `1m`).
    - Select **Regression Method**: `OLS` (Standard) or `Robust` (Huber).
    
2.  **Start System**:
    - Click the **Start System** button in the sidebar.
    - Wait ~10 seconds for data to buffer.
    - Status will change to "Pipeline Running".

3.  **Analyze**:
    - Watch the **Z-Score** chart.
    - **Long Signal**: Z-Score < -2.0
    - **Short Signal**: Z-Score > +2.0

### Step 4: Advanced Features

-   **Upload Data**: Click the Cloud icon to upload historical OHLC CSV/JSON files.
-   **Run ADF Test**: Click "Run Stationarity Test" to check if the pair is cointegrated.
-   **Multi-Product**: Use the "Add Pair" feature to track multiple spreads simultaneously.

### Troubleshooting

-   **"API Offline"**: Ensure the backend (Terminal 1) is running without errors.
-   **Charts not updating**: Check if the "Start System" button was clicked.
-   **500 Error**: Check `backend_error.log` in the root directory.
