@echo off
echo === DineSutra Edge AI CCTV Agent Launcher ===
if not exist ".venv" (
  echo Creating Python virtual environment...
  python -m venv .venv
)
call .venv\Scripts\activate.bat
pip install -q -r requirements.txt
if not exist "cameras.json" (
  echo ERROR: cameras.json not found! Copy cameras.example.json to cameras.json and paste your DineSutra camera credentials.
  pause
  exit /b 1
)
python agent.py --config cameras.json
pause
