const { app, BrowserWindow, ipcMain, shell, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow = null;
let backendProcess = null;

function startBackend() {
  const serverPath = path.join(__dirname, '../dist/server.cjs');
  if (fs.existsSync(serverPath)) {
    console.log('Starting backend server from:', serverPath);
    try {
      // Set production environment before requiring
      process.env.NODE_ENV = 'production';
      // Provide an override for the frontend API URL so it targets the local server
      process.env.CAOS_API_URL = 'http://localhost:3000';
      require(serverPath);
    } catch (err) {
      console.error('Failed to start backend server:', err);
    }
  } else {
    console.error('Backend server not found at:', serverPath);
  }
}

function stopBackend() {
  // Since the server runs in the main Electron process now, it will exit when the app exits.
  // We don't need to manually kill a child process.
}

function createWindow() {
  const iconPath = path.join(__dirname, '../public/mac_tech_logo.png');
  const hasIcon = fs.existsSync(iconPath);

  mainWindow = new BrowserWindow({
    width: 1360,
    height: 880,
    minWidth: 400,
    minHeight: 400,
    resizable: true,
    minimizable: true,
    maximizable: true,
    fullscreenable: true,
    title: 'CAOS - Client Acquisition & Outreach System',
    icon: hasIcon ? iconPath : undefined,
    backgroundColor: '#0c0a09',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webSecurity: true,
    },
  });

  // Load either dev server or production index.html
  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Graceful show on ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open external links in user's default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Application Lifecycle
app.whenReady().then(() => {
  startBackend();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  stopBackend();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Communication Handlers
ipcMain.handle('app:version', () => app.getVersion());
ipcMain.handle('app:platform', () => process.platform);
ipcMain.handle('app:getEnv', () => ({
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || '',
  API_URL: process.env.CAOS_API_URL || process.env.APP_URL || '',
  NODE_ENV: process.env.NODE_ENV || (app.isPackaged ? 'production' : 'development'),
}));
ipcMain.handle('window:isMaximized', () => {
  return mainWindow ? mainWindow.isMaximized() : false;
});
ipcMain.handle('window:minimize', () => {
  if (mainWindow) mainWindow.minimize();
});
ipcMain.handle('window:maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});
ipcMain.handle('window:close', () => {
  if (mainWindow) mainWindow.close();
});
