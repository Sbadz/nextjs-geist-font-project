# Cyan Orchestrator Launcher

This directory contains multiple ways to start the Cyan Orchestrator application automatically.

## 🚀 Quick Start Options

### Option 1: Batch File (Simplest)
**File: `start-cyan.bat`**
- Double-click to run
- Automatically installs dependencies
- Starts server and opens Avast Secure Browser
- No additional setup required

### Option 2: PowerShell Script (Most Robust)
**File: `start-cyan.ps1`**
- Right-click → "Run with PowerShell"
- Better error handling and status messages
- Colored output and progress indicators
- Automatic browser detection

### Option 3: Standalone Executable
**Files: `launcher.js` + `build-exe.bat`**

#### To Create the Executable:
1. Run `build-exe.bat` (installs pkg and builds the exe)
2. This creates `cyan-orchestrator.exe`
3. Distribute the `.exe` file anywhere you want

#### To Use the Executable:
- Double-click `cyan-orchestrator.exe`
- Works without Node.js installed locally (bundles Node.js runtime)
- Portable - can be moved to any Windows computer

## 🔧 What These Launchers Do

All launchers perform the same sequence:

1. **Check Prerequisites**
   - Verify Node.js is installed
   - Check if project dependencies exist

2. **Install Dependencies**
   - Run `npm install` if `node_modules` folder is missing
   - Show progress and handle errors

3. **Start Development Server**
   - Run `npm run dev` to start Next.js server
   - Server starts on `http://localhost:8000`

4. **Open Browser**
   - First tries to find and open Avast Secure Browser
   - Falls back to default browser if Avast not found
   - Automatically navigates to `http://localhost:8000`

5. **Keep Running**
   - Shows status messages
   - Keeps server running until window is closed
   - Handles cleanup on exit

## 🌐 Browser Detection

The launchers look for Avast Secure Browser in these locations:
- `C:\Program Files\AVAST Software\Browser\Application\AvastBrowser.exe`
- `C:\Program Files (x86)\AVAST Software\Browser\Application\AvastBrowser.exe`
- `%LOCALAPPDATA%\AVAST Software\Browser\Application\AvastBrowser.exe`

If not found, opens in your default browser.

## 📝 Customization

### Change Port
Edit the launcher files and change `8000` to your preferred port.

### Change Browser
Modify the browser detection logic to use a different browser executable.

### Skip Browser Opening
For the PowerShell version, use: `.\start-cyan.ps1 -SkipBrowser`

## 🛠️ Troubleshooting

### "Node.js not found"
- Install Node.js from https://nodejs.org/
- Make sure it's added to your system PATH

### "Permission denied" (PowerShell)
- Run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
- Then try running the PowerShell script again

### "Dependencies failed to install"
- Make sure you have internet connection
- Try running `npm install` manually
- Check if you have proper permissions in the directory

### "Port already in use"
- Close any other applications using port 8000
- Or edit the launcher to use a different port

## 🎯 Recommended Usage

- **For daily use**: Use `start-cyan.bat` (simplest)
- **For development**: Use `start-cyan.ps1` (better feedback)
- **For distribution**: Create the `.exe` file (most portable)

## 📂 File Structure

```
/
├── start-cyan.bat          # Simple batch launcher
├── start-cyan.ps1          # PowerShell launcher
├── launcher.js             # Node.js launcher script
├── build-exe.bat          # Build script for executable
├── launcher-package.json   # Package config for exe build
└── LAUNCHER-README.md      # This file
```

## 🔐 Security Note

These launchers run local development commands. They don't expose your application to the internet - everything runs locally on your computer.
