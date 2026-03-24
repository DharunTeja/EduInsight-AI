@echo off
setlocal
cd /d "%~dp0"

echo ============================================================
echo   🎓 AI-Based Student Performance Prediction System
echo ============================================================
echo.

if not exist "venv" (
    echo [ERROR] Virtual environment 'venv' not found.
    echo Please create it first using: python -m venv venv
    pause
    exit /b 1
)

echo [1/3] Activating virtual environment...
call venv\Scripts\activate

echo [2/3] Checking requirements...
venv\Scripts\python.exe -m pip install -r requirements.txt

echo [3/3] Starting Streamlit Application...
echo.
echo The app will open in your default browser shortly.
echo Press Ctrl+C in this window to stop the server.
echo.

venv\Scripts\python.exe -m streamlit run app.py

pause
