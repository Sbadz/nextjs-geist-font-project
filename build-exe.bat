@echo off
echo Creating Cyan Orchestrator Executable...
echo.

REM Check if pkg is installed globally
pkg --version >nul 2>&1
if errorlevel 1 (
    echo Installing pkg globally...
    npm install -g pkg
    if errorlevel 1 (
        echo Error: Failed to install pkg
        pause
        exit /b 1
    )
)

echo Building executable...
pkg launcher.js --target node18-win-x64 --output cyan-orchestrator.exe

if exist "cyan-orchestrator.exe" (
    echo.
    echo ✅ Success! Created cyan-orchestrator.exe
    echo.
    echo You can now run "cyan-orchestrator.exe" to start Cyan!
    echo The executable will:
    echo   - Check for Node.js installation
    echo   - Install dependencies if needed
    echo   - Start the development server
    echo   - Open Avast Secure Browser (or default browser)
    echo.
) else (
    echo ❌ Error: Failed to create executable
    pause
    exit /b 1
)

pause
