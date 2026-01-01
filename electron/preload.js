const { contextBridge, ipcRenderer } = require('electron');

// Expose API to renderer process
contextBridge.exposeInMainWorld('api', {
  // Function operations
  getFunctions: () => ipcRenderer.invoke('get-functions'),
  callFunction: (address, args) => ipcRenderer.invoke('call-function', address, args),

  // Data binding operations
  getBindings: () => ipcRenderer.invoke('get-bindings'),
  setBinding: (dataId, functionAddress) => ipcRenderer.invoke('set-binding', dataId, functionAddress),
  getData: (dataId) => ipcRenderer.invoke('get-data', dataId),

  // File ACL operations
  getFileACL: () => ipcRenderer.invoke('get-file-acl'),
  setFileACL: (filePath, operation, functionAddress) =>
    ipcRenderer.invoke('set-file-acl', filePath, operation, functionAddress),

  // Process mapping operations
  getProcessMappings: () => ipcRenderer.invoke('get-process-mappings'),
  setProcessMapping: (processName, functionAddress) =>
    ipcRenderer.invoke('set-process-mapping', processName, functionAddress),

  // Stats
  getStats: () => ipcRenderer.invoke('get-stats'),

  // License
  getLicenseInfo: () => ipcRenderer.invoke('get-license-info'),
  activateLicense: (licenseKey, licensee) => ipcRenderer.invoke('activate-license', licenseKey, licensee),

  // Telemetry
  sendTelemetry: (data) => ipcRenderer.invoke('send-telemetry', data),
});
