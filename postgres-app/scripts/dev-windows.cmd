@echo off
setlocal
cd /d "%~dp0\.."

echo Starting Aotea House Points...
echo.
echo API:      http://localhost:3001
echo Frontend: http://localhost:3000
echo.

start "Aotea House Points API" /D "%CD%" cmd /k npm run dev:server
start "Aotea House Points Frontend" /D "%CD%" cmd /k npm run dev:client

echo Open http://localhost:3000 after both windows finish starting.
