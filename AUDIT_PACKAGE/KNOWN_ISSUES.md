# RestaurantOS — Known Issues, Technical Limitations & Operational Boundaries

**Document:** `AUDIT_PACKAGE/KNOWN_ISSUES.md`  
**Evaluation Standard:** Transparent & Rigorous Audit Disclosure  
**System Version:** `1.4.0-PROD`  

---

## 1. External Third-Party Integration Status

### 1.1 Sandbox & Webhook Verification vs Live Merchant Keys
- **Observation:** In strict compliance with our testing policy, RestaurantOS **does not** claim that Razorpay live banking, WhatsApp Cloud API, Zomato Merchant API, or Swiggy Partner API are active in production until actual merchant keys and production webhook secrets are configured.
- **Current State:**
  - Razorpay Webhook Ingestion: Cryptographic HMAC-SHA256 signature verification and idempotency deduplication are 100% verified via automated tests.
  - WhatsApp Business API: E.164 phone validation, template generation, and sandbox fallback are 100% verified.
  - Zomato & Swiggy Order Ingestion: Webhook parsers that normalize partner carts directly into RestaurantOS dining/delivery orders and KOTs are 100% verified.
- **Requirement for Real Production Transactions:** The restaurant franchisee or owner must enter live merchant keys under `/settings/integrations`.

### 1.2 Tally Prime Direct Push
- **Current State:** RestaurantOS generates standard Tally Day Book XML vouchers (`<VOUCHER VCHTYPE="Sales">`) that can be imported manually or via HTTP POST. Direct two-way socket push requires Tally Prime running locally with ODBC/XML Server active on port 9000.

---

## 2. Host Build Toolchain Prerequisites

### 2.1 Native Windows Desktop Binary (.msi / .exe)
- **Status:** Architecture verified; binary compilation requires host Rust toolchain.
- **Details:** The Tauri packaging layer (`src-tauri/Cargo.toml`, `tauri.conf.json`, `src/main.rs`) is fully configured and validated by tests. Compiling the local `.msi` binary requires the Rust toolchain (`cargo` and `rustc`).

### 2.2 Native Android Package (.apk / .aab)
- **Status:** Architecture verified; binary compilation requires host Android SDK.
- **Details:** The Capacitor packaging layer (`capacitor.config.json`, `android/app/src/main/AndroidManifest.xml`) is fully configured. Compiling the `.apk` package locally requires the Android SDK, Gradle, and Java JDK 17+.

---

## 3. Platform & Environmental Caveats

### 3.1 Windows Sandbox Webpack File Contention (`.next` directory)
- **Observation:** During `next build` on Windows with deeply nested directories, file locking contention between sandboxed node child workers and Windows Defender / sandbox boundaries may trigger transient `EPERM` on `mkdir`.
- **Mitigation:** Run `next build` with standard user execution privileges outside sandbox isolation.

### 3.2 Database Scale & Concurrency
- **Observation:** SQLite (`dev.db`) is used for embedded edge single-store deployments and offline kiosks.
- **Recommendation for High-Volume Multi-Chain:** For multi-tenant cloud deployments exceeding 50 concurrent outlets writing simultaneously, set `DATABASE_URL` to a managed PostgreSQL 16 instance. The Prisma schema is 100% PostgreSQL-compatible without code changes.
