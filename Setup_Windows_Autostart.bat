@echo off
title Setup N.O.V.A. Windows Autostart
color 0A
cls

echo =======================================================
echo    N.O.V.A. WINDOWS AUTOSTART CONFIGURATION
echo =======================================================
echo.

set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "PROJECT_DIR=%~dp0"

echo Creating silent background boot script in Startup folder...
(
  echo Set WshShell = CreateObject("WScript.Shell"^)"
  echo WshShell.Run """%PROJECT_DIR%Launch_NOVA.bat""", 0, False
) > "%STARTUP_FOLDER%\Start_NOVA_Silent.vbs"

echo.
echo SUCCESS! N.O.V.A. is now configured to start automatically whenever Windows boots up.
echo Startup File Created: %STARTUP_FOLDER%\Start_NOVA_Silent.vbs
echo.
pause
