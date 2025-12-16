#!/bin/bash
# Quick start script for Linux/Mac

echo "============================================"
echo "Quant Pairs Trading Analytics System"
echo "============================================"
echo ""

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed"
    echo "Please install Python 3.8+ from python.org"
    exit 1
fi

echo "[1/3] Checking dependencies..."
if ! python3 -c "import streamlit" &> /dev/null; then
    echo "Installing dependencies..."
    pip3 install -r requirements.txt
else
    echo "Dependencies already installed"
fi

echo ""
echo "[2/3] Running system tests..."
python3 test_system.py
if [ $? -ne 0 ]; then
    echo ""
    echo "ERROR: System tests failed"
    exit 1
fi

echo ""
echo "[3/3] Starting Streamlit dashboard..."
echo ""
echo "Dashboard will open in your browser at http://localhost:8501"
echo "Press Ctrl+C to stop"
echo ""

streamlit run app.py
