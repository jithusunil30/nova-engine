@echo off
title N.O.V.A. AI Assistant System Launcher
color 0B
cls

echo =======================================================
echo    N.O.V.A. AUTONOMOUS AI SYSTEM LAUNCHER
echo =======================================================
echo.
echo Starting Backend Telemetry Server (Port 3001)...
start /b node server.js > nul 2>&1

echo Starting Web HUD Interface (Port 3000)...
start /b npm run dev > nul 2>&1

echo Waiting for services to initialize...
timeout /t 3 /nobreak > nul

echo.
echo Launching N.O.V.A. HUD...

:: Try launching in Chrome Standalone App Mode if Chrome is available
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app=http://localhost:3000 --window-size=1400,900
) else if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --app=http://localhost:3000 --window-size=1400,900
) else if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --app=http://localhost:3000 --window-size=1400,900
) else (
    start http://localhost:3000
)

echo.
echo N.O.V.A. is now ONLINE and running in the background.
echo You can minimize this terminal window.
