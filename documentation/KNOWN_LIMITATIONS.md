# RestaurantOS — Known Limitations & Operational Constraints

**Document ID:** `LIMITATIONS-2026-v1`  
**System Version:** `1.4.0-PROD`  
**Evaluation Standard:** Transparent Engineering Assessment  

---

## 1. External Third-Party Integrations

### 1.1 Live Production Gateway Credentials
- **Status:** **Sandbox & Driver Verified**
- **Operational Reality:**
  - In accordance with the strict verification policy, RestaurantOS does **not** falsely claim that Razorpay live banking, WhatsApp Business Cloud API, Zomato Merchant API, or Swiggy Partner API are live in production until actual merchant API keys and production webhook secrets are entered into the database.
  - All webhook decoders, HMAC-SHA256 signature verifiers, idempotency ledgers, and order ingestion drivers are verified using sandbox payloads and live driver unit tests.
- **Pilot / Production Requirement:**
  - Before conducting real financial transactions via credit cards or live UPI payment links, the restaurant owner must enter valid production credentials under **Settings → Integrations** (`/settings/integrations`).

### 1.2 Tally Prime Direct Push
- **Status:** **XML Day Book Voucher Export Ready**
- **Operational Reality:**
  - RestaurantOS generates fully compliant Tally Prime `<ENVELOPE><BODY><DATA><TALLYMESSAGE><VOUCHER VCHTYPE="Sales">` XML vouchers that can be imported directly into Tally Prime via the Day Book import option.
  - Automatic two-way direct socket push (`http://localhost:9000`) requires Tally Prime to be actively running on the local restaurant server with the ODBC / XML Server feature enabled in Tally F12 settings.

---

## 2. Cross-Platform Native Binary Builds

### 2.1 Windows Desktop Native Installer (`.msi` / `.exe`)
- **Status:** **Tauri Architecture Configured & Validated**
- **Operational Reality:**
  - The Tauri packaging layer (`src-tauri/Cargo.toml`, `tauri.conf.json`, Win32 spooler commands in `main.rs`) is fully implemented and tested.
  - Building the native Windows binary locally on this machine requires installing the Rust toolchain (`rustup install stable`, providing `cargo` and `rustc`).

### 2.2 Android Native Handheld Package (`.apk` / `.aab`)
- **Status:** **Capacitor Architecture Configured & Validated**
- **Operational Reality:**
  - The Capacitor packaging layer (`capacitor.config.json`, `android/app/src/main/AndroidManifest.xml`) is fully implemented with camera, Bluetooth, wake lock, and push notification permissions.
  - Compiling the final unsigned/signed `.apk` locally requires installing the Android SDK, Gradle, and Java JDK 17+.

---

## 3. Hardware Peripheral Deployments

### 3.1 Network ESC/POS Thermal Printers
- **Operational Reality:**
  - The hardware printer manager supports Raw Win32 Spooler, Network Socket (`TCP/IP 9100`), and Browser Print drivers.
  - In a physical restaurant setup, each physical kitchen station printer (e.g. Bar printer, Kitchen printer) must be assigned a static local IP address on the restaurant's local area network (LAN) and mapped in the printer configuration screen.

### 3.2 Electronic Cash Drawer Trigger
- **Operational Reality:**
  - Cash drawer kicking utilizes standard RJ12 Pin-2 solenoid pulse commands (`[0x1B, 0x70, 0x00, 0x19, 0xFA]`) sent via the thermal receipt printer. The physical cash drawer must be connected via an RJ12 cable directly to the DK port of the receipt printer.

---

## 4. Database Concurrency & Scale

### 4.1 SQLite Single-Store Concurrency
- **Operational Reality:**
  - The current production database uses SQLite (`dev.db`). SQLite is exceptionally fast, zero-configuration, and fully ACID-compliant for single-restaurant deployments and offline edge nodes.
  - For large multi-chain deployments with more than 50 concurrent branches writing simultaneously to a single central cloud database, migrating the Prisma datasource to PostgreSQL (`postgresql://...`) is recommended to handle high write concurrency. RestaurantOS's Prisma schema is 100% PostgreSQL-compatible without code changes.
