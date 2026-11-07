# RestaurantOS — Developer Setup & Build Instructions

**Document:** `AUDIT_PACKAGE/SETUP_AND_BUILD.md`  
**Target:** AI Code Reviewers, Security Auditors, DevOps & Systems Engineers  
**System Version:** `1.4.0-PROD`  
**Prerequisites:** Node.js v20+, npm v10+, Python 3 (optional, for template generation)  

---

## 1. Local Environment Setup

### 1.1 Clone & Install Dependencies
```bash
# Navigate to web application directory
cd apps/web

# Install dependencies exactly as locked in package-lock.json
npm ci
# Alternatively:
npm install
```

### 1.2 Environment Variable Configuration
Copy the provided `.env.example` file to create your local `.env`:
```bash
cp .env.example .env
```
Key configuration parameters:
- `PORT=3000`: Application HTTP port.
- `DATABASE_URL`: Set to `"file:./dev.db"` for SQLite development, or PostgreSQL connection string for production.
- `APP_SECRET`: 64-character random string used for signing HMAC-SHA256 JWT sessions.
- `DEFAULT_CGST_RATE=2.5`, `DEFAULT_SGST_RATE=2.5`: Default Indian GST tax rates.
- `UPI_PAYEE_VPA`: Counter UPI Virtual Payment Address (e.g., `restaurant@icici`).

---

## 2. Database Synchronization & Seeding

RestaurantOS uses Prisma ORM with 51 defined models.

```bash
# Generate Prisma Client
npx prisma generate

# Validate schema integrity
npx prisma validate

# Push schema directly to SQLite dev.db (or PostgreSQL target)
npx prisma db push

# (Optional) Seed initial restaurant, outlets, menu, and workforce accounts
npx tsx prisma/seed.ts
```

---

## 3. Running the Application

### 3.1 Development Mode (Hot Reloading)
```bash
cd apps/web
npm run dev
```
The server will start at: `http://localhost:3000`.

### 3.2 Production Mode
```bash
# 1. Compile Next.js production build
npm run build

# 2. Start production server
npm run start
```

---

## 4. Running the Automated Test Suites

RestaurantOS includes an extensive suite of 56 automated test scenarios verifying all modules:

```bash
cd apps/web

# 1. Database Integrity & Foreign Key Audit
npx tsx scripts/audit-db-integrity.ts

# 2. Core POS, GST, Split Tender & Inventory BOM Suite (12 Scenarios)
npx tsx scripts/test-master-suite.ts

# 3. Multi-Tenant Security & Privilege Escalation Barrier (8 Scenarios)
npx tsx scripts/test-multi-tenant-security.ts

# 4. SaaS Super Admin & Subscription MRR/ARR Engine (7 Scenarios)
npx tsx scripts/test-platform-admin-system.ts

# 5. Offline-First Resilience & Idempotency Queue Sync (7 Scenarios)
npx tsx scripts/test-offline-sync-suite.ts

# 6. Hardware Thermal Printer & Cash Drawer Solenoid Suite (7 Scenarios)
npx tsx scripts/test-hardware-printer-suite.ts

# 7. Cross-Platform Packaging Architecture Suite (7 Scenarios)
npx tsx scripts/test-cross-platform-suite.ts

# 8. Advanced Features & Modular Integrations Suite (8 Scenarios)
npx tsx scripts/test-advanced-features-suite.ts

# Execute Complete 56-Scenario Production Readiness Master Audit
npx tsx scripts/run-production-readiness-audit.ts
```

---

## 5. Type Checking & Code Quality

```bash
cd apps/web

# Run strict TypeScript compiler verification (0 errors expected)
npx tsc --noEmit
```

---

## 6. Docker Container Deployment

A production-ready `Dockerfile` and `docker-compose.yml` are provided in the repository root:

```bash
# From repository root
docker compose up -d --build
```
This deploys:
1. `web`: Next.js production container (Port 3000).
2. `postgres`: PostgreSQL 16 database.
3. `redis`: Redis cluster for KDS event streaming and queue caching.
