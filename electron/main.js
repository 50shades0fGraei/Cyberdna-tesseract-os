const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const isDev = require('electron-is-dev');
const Store = require('electron-store');
const { PythonBridge } = require('./pythonBridge');

const store = new Store();
let mainWindow;
let pythonBridge;

// Enable auto-update in production
if (!isDev) {
  autoUpdater.checkForUpdatesAndNotify();
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
    icon: path.join(__dirname, '../assets/icon.ico'),
  });

  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`;

  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  return mainWindow;
}

// Initialization
app.on('ready', async () => {
  // Check for EULA acceptance
  const eulaAccepted = store.get('eulaAccepted', false);
  if (!eulaAccepted) {
    const { response } = await dialog.showMessageBox({
      type: 'info',
      title: 'CodemapOS - End User License Agreement',
      message:
        'You must accept the EULA to use CodemapOS. By clicking Accept, you agree to the terms of service.',
      buttons: ['Accept', 'Decline'],
      defaultId: 0,
      cancelId: 1,
    });

    if (response !== 0) {
      app.quit();
      return;
    }

    store.set('eulaAccepted', true);
  }

  // Initialize Python bridge
  pythonBridge = new PythonBridge();
  await pythonBridge.init();

  // Create main window
  createWindow();

  // Create menu
  createMenu();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Auto-updater events
autoUpdater.on('update-available', () => {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Update Available',
    message: 'A new version of CodemapOS is available. It will be downloaded in the background.',
  });
});

autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Update Ready',
    message: 'Update has been downloaded and will be installed on next restart.',
    buttons: ['Restart Now', 'Later'],
  }).then(({ response }) => {
    if (response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});

// IPC Handlers
ipcMain.handle('get-functions', async () => {
  return pythonBridge.callSync('get_functions');
});

ipcMain.handle('call-function', async (event, address, args) => {
  return pythonBridge.callSync('call_function', { address, args });
});

ipcMain.handle('get-bindings', async () => {
  return pythonBridge.callSync('get_bindings');
});

ipcMain.handle('set-binding', async (event, dataId, functionAddress) => {
  return pythonBridge.callSync('set_binding', { data_id: dataId, function_address: functionAddress });
});

ipcMain.handle('get-data', async (event, dataId) => {
  return pythonBridge.callSync('get_data', { data_id: dataId });
});

ipcMain.handle('get-file-acl', async () => {
  return pythonBridge.callSync('get_file_acl');
});

ipcMain.handle('set-file-acl', async (event, filePath, operation, functionAddress) => {
  return pythonBridge.callSync('set_file_acl', { file_path: filePath, operation, function_address: functionAddress });
});

ipcMain.handle('get-process-mappings', async () => {
  return pythonBridge.callSync('get_process_mappings');
});

ipcMain.handle('set-process-mapping', async (event, processName, functionAddress) => {
  return pythonBridge.callSync('set_process_mapping', { process_name: processName, function_address: functionAddress });
});

ipcMain.handle('get-stats', async () => {
  return pythonBridge.callSync('get_stats');
});

ipcMain.handle('get-license-info', () => {
  return {
    registered: store.get('licenseKey') ? true : false,
    licensee: store.get('licensee', 'Unregistered'),
    version: app.getVersion(),
  };
});

ipcMain.handle('activate-license', async (event, licenseKey, licensee) => {
  // Validate license key (implement your validation logic)
  store.set('licenseKey', licenseKey);
  store.set('licensee', licensee);
  return { success: true, message: 'License activated successfully' };
});

ipcMain.handle('send-telemetry', async (event, data) => {
  // Send telemetry to your server (implement your telemetry logic)
  console.log('Telemetry:', data);
  return { success: true };
});

// Menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About CodemapOS',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About CodemapOS',
              message: 'CodemapOS v' + app.getVersion(),
              detail: 'A function-driven operating system layer for device-specific function access and execution.',
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

module.exports = { mainWindow, pythonBridge };
