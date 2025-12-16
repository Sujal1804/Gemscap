import requests
import time

url = "http://localhost:8000/analytics"
payload = {
    "symbol_a": "btcusdt",
    "symbol_b": "ethusdt",
    "timeframe": "1m",
    "window": 20,
    "limit": 200,
    "z_score_threshold": 2.0,
    "regression_type": "ols"
}


try:
    print("Making request...")
    res = requests.post(url, json=payload)
    print(f"Status: {res.status_code}")
    print("Response text:", res.text)
except Exception as e:
    print(f"Request failed: {e}")
