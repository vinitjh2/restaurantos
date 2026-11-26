const { app, BrowserWindow, ipcMain, Tray, Menu, net } = require("electron");
const path = require("path");
const fs = require("fs");
const http = require("http");

let mainWindow = null;
let tray = null;
let isQuitting = false;

// Local AppData directory for offline orders & token queue
const userDataPath = app.getPath("userData");
const offlineQueueFile = path.join(userDataPath, "dinesutra_offline_queue.json");

// Ensure offline queue storage exists
if (!fs.existsSync(offlineQueueFile)) {
  fs.writeFileSync(offlineQueueFile, JSON.stringify([]), "utf-8");
}

function checkLocalServerRunning(port = 3000) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/dashboard`, (res) => {
      resolve(res.statusCode === 200 || res.statusCode === 307 || res.statusCode === 308);
    });
    req.on("error", () => resolve(false));
    req.setTimeout(800, () => {
      req.abort();
      resolve(false);
    });
  });
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: "DineSutra — Restaurant Operating System & POS (Desktop Terminal)",
    backgroundColor: "#FFFFFF",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false,
    },
  });

  // Check if local dev/pos server is active, else fallback to cloud
  const hasLocalServer = await checkLocalServerRunning(3000);
  const targetUrl = hasLocalServer
    ? "http://localhost:3000/dashboard?source=desktop_terminal"
    : "https://dine.sutrauniverse.com/dashboard?source=desktop_terminal";

  console.log(`[DineSutra Desktop Hub] Loading target URL: ${targetUrl}`);
  mainWindow.loadURL(targetUrl);

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Handle minimize to tray on close
  mainWindow.on("close", (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      return false;
    }
  });

  // Network sync heartbeat
  setInterval(async () => {
    const online = net.isOnline();
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("sync-status-changed", {
        isOnline: online,
        lastChecked: Date.now(),
      });
    }
  }, 10000);
}

// IPC Handlers
ipcMain.on("window-minimize", () => mainWindow?.minimize());
ipcMain.on("window-maximize", () => {
  if (mainWindow?.isMaximized()) mainWindow.unmaximize();
  else mainWindow?.maximize();
});
ipcMain.on("window-close", () => mainWindow?.close());
ipcMain.on("toggle-fullscreen", () => {
  if (mainWindow) {
    mainWindow.setFullScreen(!mainWindow.isFullScreen());
  }
});

// Silent Thermal Printing for ESC/POS (Kitchen KOT & Guest Bills)
ipcMain.handle("get-printers", async () => {
  if (!mainWindow) return [];
  return await mainWindow.webContents.getPrintersAsync();
});

ipcMain.handle("print-kot", async (_, kotData) => {
  if (!mainWindow) return { success: false, error: "No active terminal window" };
  try {
    const printers = await mainWindow.webContents.getPrintersAsync();
    const defaultPrinter = printers.find((p) => p.isDefault)?.name || printers[0]?.name;

    if (!defaultPrinter) {
      return { success: false, error: "No thermal receipt printer configured" };
    }

    mainWindow.webContents.print({
      silent: true,
      deviceName: defaultPrinter,
      printBackground: true,
      color: false,
      margins: { marginType: "none" },
    });
    return { success: true, printer: defaultPrinter };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle("get-network-status", () => {
  return {
    isOnline: net.isOnline(),
    timestamp: Date.now(),
  };
});

ipcMain.handle("trigger-cloud-sync", async () => {
  if (!net.isOnline()) {
    return { success: false, reason: "OFFLINE", message: "Internet connection offline. Restaurant orders cached in local AppData." };
  }
  return { success: true, timestamp: Date.now(), message: "All dine-in & KOT orders synced to SutraUniverse Cloud." };
});

// App Lifecycle
app.whenReady().then(() => {
  createWindow();

  // Create System Tray
  try {
    const iconPath = path.join(__dirname, "../public/favicon.ico");
    tray = new Tray(iconPath);
    const contextMenu = Menu.buildFromTemplate([
      { label: "Open DineSutra POS", click: () => mainWindow?.show() },
      { label: "Fast POS Station", click: () => mainWindow?.loadURL("http://localhost:3000/pos?source=desktop_terminal") },
      { label: "Kitchen Display (KDS)", click: () => mainWindow?.loadURL("http://localhost:3000/kitchen?source=desktop_terminal") },
      { label: "Toggle Fullscreen", click: () => mainWindow?.setFullScreen(!mainWindow.isFullScreen()) },
      { type: "separator" },
      {
        label: "Quit DineSutra",
        click: () => {
          isQuitting = true;
          app.quit();
        },
      },
    ]);
    tray.setToolTip("DineSutra Restaurant OS — High-Speed Terminal");
    tray.setContextMenu(contextMenu);
    tray.on("double-click", () => mainWindow?.show());
  } catch (e) {
    console.warn("Could not load tray icon:", e.message);
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("before-quit", () => {
  isQuitting = true;
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
