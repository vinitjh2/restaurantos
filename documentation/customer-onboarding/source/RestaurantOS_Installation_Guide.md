# RestaurantOS — Multi-Platform Installation & Deployment Guide

**Document:** `RestaurantOS_Installation_Guide.md`  
**Audience:** Restaurant Owners, IT Technicians, System Integrators, Franchise Operations  
**Applicable Version:** RestaurantOS Enterprise v1.4.0+  
**Supported Platforms:** Web / PWA, Windows 10/11 Desktop, Android Handheld / Tablet  

---

## 1. System Overview & Deployment Architecture

RestaurantOS is built on a single unified codebase designed to operate flexibly across:
1. **Web / Progressive Web App (PWA):** Zero-installation, universal access on any computer or tablet.
2. **Windows Desktop Application (Tauri):** Dedicated workstation app with direct Win32 spooler hardware integration for fast counter billing and electronic cash drawers.
3. **Android Handheld Application (Capacitor):** Touch-optimized mobile app with camera QR scanning, Bluetooth thermal printing, and wake-lock screen retention for line cooks and waitstaff.

---

## 2. Platform 1: Web & Progressive Web App (PWA)

### 2.1 System & Browser Requirements
- **Operating Systems:** Windows 10/11, macOS (12+), Ubuntu/Debian Linux, ChromeOS, Android (10+), iPadOS (15+).
- **Supported Browsers:**
  - Google Chrome v100+ (Recommended for best thermal printing support).
  - Microsoft Edge v100+.
  - Safari v15+ (macOS / iPadOS).
- **Hardware Minimums:** 2.0 GHz Dual-Core CPU, 4 GB RAM, 1366x768 display resolution or higher.

### 2.2 Accessing the Hosted Application
1. Connect the computer or tablet to the restaurant's local Wi-Fi or wired network.
2. Open Google Chrome or Microsoft Edge.
3. Navigate to your restaurant's dedicated application URL:
   ```
   Local In-Store Server:  http://localhost:3000  (or http://192.168.1.100:3000)
   Cloud SaaS Instance:   https://app.restaurantos.io
   ```
4. Bookmark the URL for immediate one-click cashier access.

### 2.3 Installing RestaurantOS as a PWA
Installing as a Progressive Web App (PWA) provides an immersive, standalone window without browser navigation bars, tabs, or address bars:

1. In Google Chrome, observe the right side of the address bar.
2. Click the **Install RestaurantOS** icon (computer monitor with a down arrow).
3. In the confirmation dialog, click **Install**.
4. A standalone window opens immediately, styled with dark navy headers (`#0F172A`).
5. A desktop shortcut named **RestaurantOS** is created on your Windows/macOS desktop.
6. Right-click the shortcut and select **Pin to Taskbar** for high-speed cashier access.

---

## 3. Platform 2: Windows Desktop Application (Tauri)

### 3.1 Architecture & Packaging Status
- **Technology:** Built with Tauri v1.5 and Rust Win32 spooler integration (`winspool`, `wingdi`).
- **Packaging Specification:** Packaged as a standard Windows Installer (`.msi`) and NSIS setup (`.exe`).
- **Release Status:** The packaging architecture (`src-tauri/Cargo.toml`, `tauri.conf.json`, `src-tauri/src/main.rs`) is fully configured and validated. Native compilation on any build machine requires the Rust toolchain (`cargo` / `rustc`).

### 3.2 Downloading & Running the Official Installer
1. Download the official installer: `restaurantos-desktop_1.0.0_x64_en-US.msi`.
2. Double-click the `.msi` file to launch the **RestaurantOS Setup Wizard**.
3. Accept the End User License Agreement (EULA).
4. Choose the installation directory (Default: `C:\Program Files\RestaurantOS\`).
5. Select **Create Desktop Shortcut** and **Launch on Windows Startup** (recommended for dedicated billing counter PCs).
6. Click **Install**. Administrative elevation (UAC prompt) will request permission.
7. Click **Finish**. RestaurantOS launches automatically in full-screen desktop kiosk mode.

### 3.3 First Launch & Hardware Configuration
1. Upon initial launch, enter your restaurant login credentials.
2. Navigate to **Administration → Settings → Printers & Hardware**.
3. The desktop app leverages direct Win32 spooler access:
   - Select your billing counter printer from the detected local Windows printers list (e.g., *EPSON TM-T82III*, *TVS RP-3200*, *POS-80*).
   - Set paper width: **80mm** or **58mm**.
   - Click **Test Print & Cash Drawer Kick**.
4. The cash drawer connected to the printer's RJ12 port will pop open instantly.

### 3.4 Updating & Safe Uninstallation
- **Updates:** When a software update is published, the desktop app notifies the administrator upon startup. Click **Install Update & Restart** to update without data loss.
- **Uninstallation:** If moving to a new computer, open **Windows Settings → Apps → Installed apps**, locate **RestaurantOS**, and click **Uninstall**. Local database backups in `backups/` are preserved.

---

## 4. Platform 3: Android Handheld Application (Capacitor)

### 4.1 Target Devices & Requirements
- **Recommended Devices:** Android POS terminals (Sunmi, IMIN, Pax, Newland) or standard Android tablets/smartphones (Samsung Galaxy Tab A9, Lenovo Tab M10, Xiaomi).
- **Operating System:** Android 10.0 (API Level 29) or higher.
- **Hardware Minimums:** Quad-Core 2.0 GHz, 3 GB RAM, integrated rear camera (for QR scanning), Bluetooth 4.2+ (for wireless belt thermal printers).

### 4.2 Installing the Official APK
1. Download the release package: `RestaurantOS-v1.4.0.apk`.
2. Transfer the APK file to the Android device via USB cable, Google Drive, or local network.
3. Open the **Files** app on the Android tablet and tap `RestaurantOS-v1.4.0.apk`.
4. If prompted with *"For your security, your tablet is not allowed to install unknown apps from this source"*:
   - Tap **Settings**.
   - Toggle **Allow from this source** to **ON**.
   - Tap the Back button.
5. Tap **Install**. Once finished, tap **Open**.

### 4.3 Granting Essential Android Permissions
When RestaurantOS opens for the first time, grant the following permissions:
1. **Camera Permission:** Tap **While using the app** (required for scanning table QR codes and customer loyalty cards).
2. **Nearby Devices / Bluetooth Permission:** Tap **Allow** (required for communicating with wireless Bluetooth thermal belt printers).
3. **Notifications:** Tap **Allow** (required for instant audio/visual chimes when a KOT is marked ready for serving).
4. **Battery Optimization:** In Android Settings → Apps → RestaurantOS → Battery, select **Unrestricted** to prevent Android from sleeping the app during kitchen operation.

---

## 5. Network Firewall & Printer Port Configuration

To ensure seamless communication between counter POS PCs, kitchen displays, and network thermal printers on the restaurant's local network (LAN):

1. **Assign Static IP Addresses:**
   - Server PC: Assign static IP (e.g., `192.168.1.100`).
   - Main Kitchen Printer: Assign static IP (e.g., `192.168.1.150`).
   - Bar Printer: Assign static IP (e.g., `192.168.1.151`).
2. **Open Inbound Firewall Ports (Windows Defender Firewall):**
   - **Port 3000 (TCP):** Inbound web traffic for Waiter Apps and KDS tablets.
   - **Port 9100 (TCP):** Standard RAW ESC/POS network printing to thermal printers.
3. **Wi-Fi Recommendations:**
   - Set up a dedicated 5 GHz Wi-Fi SSID for restaurant staff and KDS tablets (e.g., `RestaurantOS-Staff`).
   - Keep customer guest Wi-Fi on a completely separated guest VLAN to prevent network congestion during peak dining hours.
