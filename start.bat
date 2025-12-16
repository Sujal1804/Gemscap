@echo off
REM Quick start script for Windows

echo ============================================
echo Quant Pairs Trading Analytics System
echo ============================================
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from python.org
    pause
    exit /b 1
)

echo [1/3] Checking dependencies...
pip show streamlit >nul 2>&1
if errorlevel 1 (
    echo Installing dependencies...
    pip install -r requirements.txt
) else (
    echo Dependencies already installed
)

echo.
echo [2/3] Running system tests...
python test_system.py
if errorlevel 1 (
    echo.
    echo ERROR: System tests failed
    pause
    exit /b 1
)

echo.
echo [3/3] Starting Streamlit dashboard...
echo.
echo Dashboard will open in your browser at http://localhost:8501
echo Press Ctrl+C to stop
echo.

streamlit run app.py
