# RestaurantOS — Complete Dependency & Runtime Manifest

**Document:** `AUDIT_PACKAGE/DEPENDENCIES.md`  
**Application Target:** `@restaurantos/web` v1.0.0  
**Package Manager:** npm v10+  
**Runtime Requirement:** Node.js v20.x+ (LTS)  

---

## 1. Production Runtime Dependencies

| Package Name | Exact Version | Purpose / Architectural Role |
| :--- | :---: | :--- |
| `next` | `^14.2.23` | Core React full-stack framework (App Router, API routes, middleware, static generation). |
| `react` | `^18.3.1` | Core UI component rendering library. |
| `react-dom` | `^18.3.1` | React DOM bindings for web browsers. |
| `@prisma/client` | `^6.4.1` | Strongly typed Prisma ORM client for SQLite and PostgreSQL. |
| `@tanstack/react-query` | `^5.62.0` | Asynchronous state management, query caching, background polling. |
| `bcryptjs` | `^3.0.3` | Cryptographic password hashing (Bcrypt algorithm with salt rounds). |
| `jsonwebtoken` | `^9.0.3` | Cryptographic JSON Web Token (JWT) signing and verification (HMAC-SHA256). |
| `zustand` | `^5.0.2` | Minimalist client state store for POS cart, active table, and outlet context. |
| `lucide-react` | `^0.468.0` | High-contrast vector icon library for touch POS and KDS interfaces. |
| `pdfkit` | `^0.20.2` | Pure JavaScript PDF document generation engine for reports and user manuals. |
| `qrcode` | `^1.5.4` | High-contrast QR code generator for dynamic UPI payments and table tent cards. |
| `recharts` | `^2.13.3` | Composable SVG charting library for sales telemetry and analytics dashboards. |
| `socket.io` | `^4.8.4` | WebSocket server for real-time KDS ticket dispatch and rush notifications. |
| `socket.io-client` | `^4.8.4` | WebSocket client for live kitchen display terminal subscriptions. |
| `clsx` | `^2.1.1` | Utility for constructing conditional className strings. |
| `tailwind-merge` | `^2.5.5` | Merge Tailwind CSS classes safely without style conflicts. |
| `class-variance-authority` | `^0.7.1` | Component variant styling builder. |

---

## 2. Development & Build Tool Dependencies

| Package Name | Exact Version | Purpose / Architectural Role |
| :--- | :---: | :--- |
| `typescript` | `^5.7.2` | Strict TypeScript compiler for 100% type soundness. |
| `tsx` | `^4.23.15` | High-performance TypeScript execute runner for test suites and seeders. |
| `prisma` | `^6.4.1` | Prisma CLI for schema validation, migrations, and database introspection. |
| `tailwindcss` | `^3.4.16` | Utility-first CSS framework for responsive UI styling. |
| `autoprefixer` | `^10.4.20` | PostCSS plugin to parse CSS and add vendor prefixes automatically. |
| `postcss` | `^8.4.49` | Tool for transforming styles with JS plugins. |
| `@types/node` | `^20.17.10` | TypeScript type definitions for Node.js runtime. |
| `@types/react` | `^18.3.12` | TypeScript type definitions for React. |
| `@types/react-dom` | `^18.3.1` | TypeScript type definitions for React DOM. |
| `@types/bcryptjs` | `^2.4.6` | TypeScript definitions for bcryptjs. |
| `@types/jsonwebtoken` | `^9.0.10` | TypeScript definitions for jsonwebtoken. |
| `@types/pdfkit` | `^0.17.7` | TypeScript definitions for pdfkit. |
| `@types/qrcode` | `^1.5.5` | TypeScript definitions for qrcode. |

---

## 3. Required Runtimes & Native Build Tools

- **Node.js:** v20.x or v22.x LTS.
- **Python:** Python 3.10+ (Standard library used for generating customer setup spreadsheets).
- **Docker:** Docker Engine 24+ and Docker Compose v2+ (for containerized deployments).
- **Rust Toolchain (Optional for Windows Desktop build):** `rustc` and `cargo` (stable 1.75+).
- **Android SDK (Optional for Android APK build):** Android SDK Platform 34, Build-Tools 34.0.0, Java JDK 17+.
