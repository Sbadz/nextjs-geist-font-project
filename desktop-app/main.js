const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { exec } = require('child_process');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, 'icon.png'),
  });

  // Load your web app URL or local build
  mainWindow.loadURL('http://localhost:8000');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Handle TTS requests from renderer process
ipcMain.handle('tts-speak', async (event, text) => {
  // Example: invoke local TTS engine executable with text argument
  // Adjust command and args as per your TTS engine CLI
  return new Promise((resolve, reject) => {
    exec(`tts_engine.exe --voice justin1 --text "${text.replace(/"/g, '\\"')}"`, (error, stdout, stderr) => {
      if (error) {
        console.error('TTS error:', error);
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});
