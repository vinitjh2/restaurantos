const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("dineSutraDesktopAPI", {
  isDesktopApp: true,
  platform: process.platform,
  version: "1.0.0",

  // Window Controls
  minimizeWindow: () => ipcRenderer.send("window-minimize"),
  maximizeWindow: () => ipcRenderer.send("window-maximize"),
  closeWindow: () => ipcRenderer.send("window-close"),
  toggleFullscreen: () => ipcRenderer.send("toggle-fullscreen"),

  // Direct Thermal Printing (ESC/POS Kitchen KOT & Bills)
  getPrinters: () => ipcRenderer.invoke("get-printers"),
  printKOT: (kotData) => ipcRenderer.invoke("print-kot", kotData),

  // Offline & Cloud Sync
  getNetworkStatus: () => ipcRenderer.invoke("get-network-status"),
  triggerCloudSync: () => ipcRenderer.invoke("trigger-cloud-sync"),
  onSyncStatus: (callback) => {
    ipcRenderer.on("sync-status-changed", (_, status) => callback(status));
  },
});
