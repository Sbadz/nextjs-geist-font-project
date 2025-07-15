# Cyan Orchestrator Launcher
# PowerShell script to start the development server and open browser

param(
    [string]$Port = "8000",
    [switch]$SkipBrowser
)

Write-Host "🚀 Starting Cyan Orchestrator..." -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if we're in the correct directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found" -ForegroundColor Red
    Write-Host "Please run this script from the Cyan orchestrator directory" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if dependencies are installed
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    try {
        npm install
        Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error: Failed to install dependencies" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Start the development server
Write-Host "🖥️  Starting Cyan development server on port $Port..." -ForegroundColor Blue
Write-Host "Server will be available at: http://localhost:$Port" -ForegroundColor Gray
Write-Host ""

# Start the Next.js dev server as a background job
$serverJob = Start-Job -ScriptBlock {
    param($ProjectPath, $Port)
    Set-Location $ProjectPath
    npm run dev
} -ArgumentList (Get-Location).Path, $Port

# Wait for server to start
Write-Host "⏳ Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Function to find Avast Secure Browser
function Find-AvastBrowser {
    $possiblePaths = @(
        "C:\Program Files\AVAST Software\Browser\Application\AvastBrowser.exe",
        "C:\Program Files (x86)\AVAST Software\Browser\Application\AvastBrowser.exe",
        "$env:LOCALAPPDATA\AVAST Software\Browser\Application\AvastBrowser.exe",
        "$env:USERPROFILE\AppData\Local\AVAST Software\Browser\Application\AvastBrowser.exe"
    )
    
    foreach ($path in $possiblePaths) {
        if (Test-Path $path) {
            return $path
        }
    }
    return $null
}

# Open browser if not skipped
if (-not $SkipBrowser) {
    Write-Host "🌐 Opening Cyan in browser..." -ForegroundColor Blue
    
    $avastPath = Find-AvastBrowser
    $url = "http://localhost:$Port"
    
    if ($avastPath) {
        Write-Host "✓ Opening in Avast Secure Browser..." -ForegroundColor Green
        Start-Process -FilePath $avastPath -ArgumentList $url
    } else {
        Write-Host "⚠️  Avast Secure Browser not found, opening in default browser..." -ForegroundColor Yellow
        Start-Process $url
    }
}

Write-Host ""
Write-Host "🎉 Cyan Orchestrator is now running!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Web interface: http://localhost:$Port" -ForegroundColor Cyan
Write-Host "🛑 To stop the server: Close this window or press Ctrl+C" -ForegroundColor Gray
Write-Host ""
Write-Host "Keep this window open to keep Cyan running..." -ForegroundColor Yellow
Write-Host ""

# Monitor the server job and keep the script running
try {
    while ($serverJob.State -eq "Running") {
        Start-Sleep -Seconds 30
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Write-Host "[$timestamp] ✓ Cyan is running at http://localhost:$Port" -ForegroundColor DarkGreen
    }
} catch {
    Write-Host "Server stopped or interrupted" -ForegroundColor Yellow
} finally {
    # Clean up
    if ($serverJob) {
        Stop-Job $serverJob -ErrorAction SilentlyContinue
        Remove-Job $serverJob -ErrorAction SilentlyContinue
    }
    Write-Host "🔴 Cyan Orchestrator stopped" -ForegroundColor Red
}
