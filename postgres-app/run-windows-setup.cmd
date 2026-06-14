@echo off
setlocal
cd /d "%~dp0"

echo Running Windows setup for Aotea House Points...
powershell -NoLogo -ExecutionPolicy Bypass -File ".\scripts\setup-windows.ps1"

if errorlevel 1 (
  echo.
  echo Setup failed. Review the error above.
  pause
  exit /b 1
)

pause