@echo off
echo === Building DineSutra-CCTV-Agent.exe ===
python -m venv .venv
call .venv\Scripts\activate.bat
pip install -r requirements.txt pyinstaller
pyinstaller --onefile --name DineSutra-CCTV-Agent agent.py
echo Built dist\DineSutra-CCTV-Agent.exe
pause
