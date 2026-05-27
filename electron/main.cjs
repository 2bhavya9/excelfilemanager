'use strict';

const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

// In development, app.isPackaged is false; in production (after electron-builder), it is true.
const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'Excel File Manager',
    webPreferences: {
      // Keep the renderer isolated — no direct Node access from React code
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (isDev) {
    // Development: load from Vite dev server
    win.loadURL('http://localhost:5173');
    // Open DevTools automatically in dev mode
    win.webContents.openDevTools();
  } else {
    // Production: load the built index.html
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Open external links in the system browser instead of Electron
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// Create window once Electron is ready
app.whenReady().then(() => {
  createWindow();

  // macOS: re-create the window when the dock icon is clicked and no windows are open
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit on all windows closed (except macOS — apps stay open until Cmd+Q)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
