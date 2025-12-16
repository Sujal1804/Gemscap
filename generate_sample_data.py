import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def generate_sample_data(symbol="btcusdt", days=1, interval_minutes=1):
    end_time = datetime.now()
    start_time = end_time - timedelta(days=days)
    
    # Generate timestamps
    periods = int(days * 24 * 60 / interval_minutes)
    timestamps = pd.date_range(start=start_time, periods=periods, freq=f'{interval_minutes}min')
    
    # Generate random walk price data
    np.random.seed(42)
    price = 50000.0
    prices = [price]
    for _ in range(periods - 1):
        change = np.random.normal(0, 50) # Random walk
        price += change
        prices.append(price)
        
    prices = np.array(prices)
    
    # Create OHLC from close prices (synthetic)
    # Open is previous close (approx), High/Low are random variance around Close
    opens = prices - np.random.normal(0, 10, periods)
    closes = prices
    highs = np.maximum(opens, closes) + np.abs(np.random.normal(0, 15, periods))
    lows = np.minimum(opens, closes) - np.abs(np.random.normal(0, 15, periods))
    volumes = np.abs(np.random.normal(100, 50, periods))
    
    df = pd.DataFrame({
        'timestamp': timestamps,
        'open': opens,
        'high': highs,
        'low': lows,
        'close': closes,
        'volume': volumes
    })
    
    # Round to 2 decimals
    cols = ['open', 'high', 'low', 'close', 'volume']
    df[cols] = df[cols].round(2)
    
    return df

if __name__ == "__main__":
    df = generate_sample_data()
    filename = "sample_btcusdt.csv"
    df.to_csv(filename, index=False)
    print(f"Generated {filename} with many rows.")
