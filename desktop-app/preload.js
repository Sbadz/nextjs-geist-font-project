const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  ttsSpeak: (text) => ipcRenderer.invoke('tts-speak', text),
});
