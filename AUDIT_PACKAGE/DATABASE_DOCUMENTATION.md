# RestaurantOS — Database Architecture & Schema Documentation

**Document:** `AUDIT_PACKAGE/DATABASE_DOCUMENTATION.md`  
**ORM:** Prisma Client v6.4.1  
**Engines:** SQLite (`dev.db`) for Embedded Edge / PostgreSQL 16 for Enterprise Cloud  
**Total Models:** 51 Prisma Models  
**Explicit Custom Indexes:** 27 Configured Performance Indexes  
**Integrity Status:** Clean (`PRAGMA foreign_key_check` = 0 violations, `PRAGMA integrity_check` = ok)  

---

## 1. Multi-Tenant Organization & Access Models

```
Organization (1) ──< Branch (N) ──< TableSeat (N)
     │                 │
     ├──< UserAccount  ├──< User (Staff)
     │                 ├──< Order (N) ──< OrderItem (N) ──< OrderItemModifier (N)
     └──< TenantSubscription             └──< Invoice (1) ──< Payment (N)
```

### 1.1 `model Organization`
- **Purpose:** Primary tenant partition representing a restaurant business entity.
- **Key Fields:** `id` (UUID), `name`, `slug` (Unique), `businessType`, `currency` (INR), `status` (`ACTIVE` / `SUSPENDED`), `subscriptionPlan`.
- **Tenant Isolation:** Every operational table references `organizationId` directly or through `branchId`.

### 1.2 `model Branch`
- **Purpose:** Physical restaurant outlet, franchise, or cloud kitchen facility.
- **Key Fields:** `id` (UUID), `organizationId`, `name`, `code` (e.g. `IND`, `KOR`), `gstin` (15-char), `cgstRate` (2.5), `sgstRate` (2.5), `igstRate` (5.0), `currentFiscalYr` (`2026-27`), `nextInvoiceSeq` (Autoincrementing statutory sequence).

### 1.3 `model UserAccount` & `model User`
- **Purpose:** `UserAccount` holds tenant-level login credentials; `User` holds in-store staff profiles with branch assignments.
- **Key Fields:** `email` (Unique), `passwordHash` (Bcrypt), `role` (`TENANT_OWNER`, `ADMINISTRATOR`, `MANAGER`, `CASHIER`, `WAITER`, `KITCHEN_STAFF`, `INVENTORY_MANAGER`, `ACCOUNTANT`), `pinCode` (4-digit quick POS PIN).

---

## 2. Catalog, Menu & Pricing Models

- **`model MenuItem`:** `id`, `name`, `code`, `category`, `dietaryType` (`VEG` / `NON_VEG` / `EGG`), `basePrice`, `isAvailable`, `station` (`MAIN_KITCHEN`, `BAR`, `BAKERY`, `BEVERAGE`).
- **`model MenuItemVariant`:** `id`, `menuItemId`, `name` (Half / Full / Regular / Large), `price`.
- **`model ModifierGroup` & `model ModifierOption`:** Add-ons and choices (e.g., *Extra Butter +₹20*, *Spice Level*).
- **`model BranchMenuPrice`:** Outlet-specific price overrides allowing different pricing between flagship and airport outlets.

---

## 3. Order Processing, Kitchen & Billing Models

### 3.1 `model Order` & `model OrderItem`
- **Key Fields:** `id`, `orderNumber` (e.g. `ORD-IND-0291`), `orderType` (`DINE_IN`, `TAKEAWAY`, `DELIVERY`), `status` (`OPEN`, `PAID`, `CANCELLED`), `branchId`, `tableNumber`, `subtotal`, `taxAmount`, `grandTotal`, `idempotencyKey` (Unique).

### 3.2 `model KOT` & `model KOTItem`
- **Purpose:** Kitchen Order Tickets routed to line cooks and baristas.
- **Key Fields:** `id`, `kotNumber` (e.g. `KOT-IND-0142`), `orderId`, `branchId`, `orderType`, `station`, `status` (`NEW`, `ACCEPTED`, `PREPARING`, `READY`, `SERVED`).

### 3.3 `model Invoice`, `model Payment`, `model Refund`
- **Purpose:** Statutory Indian GST billing ledger and audit trail.
- **Key Fields:** `invoiceNumber` (Unique, e.g. `IND/2026-27/00290`), `fiscalYear`, `orderId`, `branchId`, `taxableAmount`, `cgstRate`, `cgstAmount`, `sgstRate`, `sgstAmount`, `roundOff`, `grandTotal`, `paidAmount`, `balanceDue`, `paymentMethod` (`CASH`, `UPI`, `CARD`, `SPLIT`).
- **`Payment`:** Records individual tender lines (`method`, `amount`, `transactionRef` / 12-digit Bank UTR).
- **`Refund`:** Records supervisor-authorized refunds with reason and manager reference.

---

## 4. Inventory, Recipe BOM & Procurement Models

- **`model Ingredient`:** Raw materials catalog with `baseUom` (`KG`, `GRAM`, `LITRE`, `ML`, `PIECE`), current physical balance, and par level reorder threshold.
- **`model Recipe` & `model RecipeIngredient`:** Bill of Materials (BOM) linking dishes/variants to exact ingredient consumption quantities.
- **`model StockMovement`:** Immutable inventory audit ledger recording stock decrements on bill settlement, additions on GRN, and adjustments.
- **`model Supplier`, `model PurchaseOrder`, `model GoodsReceivedNote` (GRN):** Vendor procurement and vendor payables tracking.
- **`model StockAdjustment`:** Kitchen wastage and spoilage logging with classified loss reasons.
- **`model BranchTransfer` & `model BranchTransferItem`:** Inter-branch commissary stock transfer dispatch and receipt tracking.

---

## 5. Workforce, Attendance & Accounting Models

- **`model Staff`:** Employee HR profile, hourly wage or basic monthly salary.
- **`model ShiftSchedule` & `model AttendanceRecord`:** Clock-in / clock-out timestamps and late arrival tracking.
- **`model PayrollRun` & `model StaffPayroll`:** Monthly salary calculations with overtime and deductions.
- **`model Expense`:** Categorized operating expenses (Rent, Utilities, Kitchen LPG, Packaging, Marketing, Maintenance).
- **`model CashRegisterShift`:** Cash drawer opening float, closing physical count, and variance auditing.

---

## 6. Customer CRM & SaaS Subscription Models

- **`model Customer`:** Customer profile, contact details, total lifetime spend, visit count.
- **`model LoyaltyTransaction`:** Earned and redeemed points with tier assignment (`Bronze`, `Silver`, `Gold`, `Platinum`).
- **`model Coupon` & `model GiftVoucher`:** Promotional discounts with usage limits.
- **`model SubscriptionPlan`, `model TenantSubscription`, `model SubscriptionInvoice`:** Platform SaaS plans (Starter, Growth, Pro, Enterprise), monthly/annual pricing, branch and staff limits.
- **`model WebhookEvent`:** Idempotency ledger for incoming Razorpay payment webhooks to prevent duplicate processing.
- **`model SyncOperation`:** Persistent offline operation queue recording operations during network disconnects.

---

## 7. Database Indexes & Integrity Constraints

The schema defines 27 explicit performance indexes across high-traffic lookup columns:

| Model | Index Fields | Purpose |
| :--- | :--- | :--- |
| `Organization` | `@@index([slug])`, `@@index([status])` | Rapid tenant subdomain/slug resolution. |
| `Branch` | `@@index([organizationId])`, `@@index([code])` | Scoped branch lookups within a tenant. |
| `Order` | `@@index([branchId])`, `@@index([orderNumber])`, `@@index([idempotencyKey])` | POS order searching & offline sync deduplication. |
| `KOT` | `@@index([branchId])`, `@@index([orderId])`, `@@index([station, status])` | High-speed KDS ticket queries. |
| `Invoice` | `@@unique([invoiceNumber])`, `@@index([branchId])`, `@@index([fiscalYear])` | Statutory invoice uniqueness & tax audits. |
| `Ingredient` | `@@index([category])`, `@@index([name])` | Inventory catalog and low-stock filters. |
| `StockMovement` | `@@index([ingredientId])`, `@@index([branchId])` | Real-time ingredient balance calculations. |
| `AttendanceRecord` | `@@index([staffId])`, `@@index([date])` | Monthly payroll aggregation queries. |
| `SyncOperation` | `@@unique([idempotencyKey])`, `@@index([status])` | Offline queue dispatch & conflict prevention. |
| `WebhookEvent` | `@@unique([eventId])` | Razorpay webhook duplicate protection. |

---

## 8. Database Migrations & Multi-Tenant Isolation

### Migration Commands:
- Development / Embedded SQLite: `npx prisma db push`
- Production PostgreSQL Migration: `npx prisma migrate deploy`

### Multi-Tenant Authorization Rules:
1. **Logical Separation:** Every protected database entity contains either `organizationId` or `branchId`.
2. **Server-Side Enforcement:** Route handlers extract the authenticated `organizationId` directly from the validated JWT token (`verifyJwtToken`).
3. **Zero Cross-Tenant Leakage:** Queries enforce `where: { organizationId: session.organizationId }`. Attempting to access an entity belonging to another tenant fails with an authorization error.
