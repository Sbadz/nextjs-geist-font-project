@echo off
echo Starting Cyan Orchestrator...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if dependencies are installed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if errorlevel 1 (
        echo Error: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Start the development server
echo Starting Cyan development server...
echo Server will be available at: http://localhost:8000
echo.

REM Start the Next.js dev server in the background
start /b cmd /c "npm run dev"

REM Wait for server to start (adjust timing if needed)
echo Waiting for server to start...
timeout /t 10 /nobreak >nul

REM Try to open in Avast Secure Browser first, fallback to default browser
echo Opening Cyan in browser...

REM Check for Avast Secure Browser in common locations
set "avast_browser="
if exist "C:\Program Files\AVAST Software\Browser\Application\AvastBrowser.exe" (
    set "avast_browser=C:\Program Files\AVAST Software\Browser\Application\AvastBrowser.exe"
) else if exist "C:\Program Files (x86)\AVAST Software\Browser\Application\AvastBrowser.exe" (
    set "avast_browser=C:\Program Files (x86)\AVAST Software\Browser\Application\AvastBrowser.exe"
) else if exist "%LOCALAPPDATA%\AVAST Software\Browser\Application\AvastBrowser.exe" (
    set "avast_browser=%LOCALAPPDATA%\AVAST Software\Browser\Application\AvastBrowser.exe"
)

if defined avast_browser (
    echo Opening in Avast Secure Browser...
    start "" "%avast_browser%" "http://localhost:8000"
) else (
    echo Avast Secure Browser not found, opening in default browser...
    start "" "http://localhost:8000"
)

echo.
echo Cyan Orchestrator is now running!
echo.
echo - Web interface: http://localhost:8000
echo - To stop the server: Close this window or press Ctrl+C
echo.
echo Keep this window open to keep Cyan running...

REM Keep the window open and show status
:loop
timeout /t 30 /nobreak >nul
echo [%date% %time%] Cyan is running at http://localhost:8000
goto loop
