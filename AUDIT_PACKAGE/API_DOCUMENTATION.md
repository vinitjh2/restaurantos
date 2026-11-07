# RestaurantOS — API Architecture & Endpoint Reference

**Document:** `AUDIT_PACKAGE/API_DOCUMENTATION.md`  
**API Architecture:** Next.js 14 App Router Dynamic Server Route Handlers  
**Total Endpoints:** 62 Documented Endpoints  
**Data Exchange:** JSON (`Content-Type: application/json`)  
**Security Standard:** Strict Server-Side Validation & Tenant Scoping  

---

## 1. Authentication & Security Policy

1. **Session Delivery:** Authenticated requests supply the JWT token either in the secure HTTP-only cookie `restaurantos_session` or in the `Authorization: Bearer <token>` header.
2. **Error Standards:**
   - `400 Bad Request`: Missing required fields, invalid quantity, or malformed JSON.
   - `401 Unauthorized`: Unauthenticated request or expired session token.
   - `403 Forbidden`: Authenticated user lacks required role or is attempting cross-tenant access (`AuthorizationError`).
   - `409 Conflict`: Duplicate operation or attempt to overwrite an immutable statutory invoice.
   - `500 Internal Server Error`: Unhandled server exception.

---

## 2. API Endpoint Directory by Module

### 2.1 Authentication & Profile APIs
| Method | Route | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/auth/register` | Public | Register new restaurant tenant organization, flagship branch, and owner account. |
| `POST` | `/api/auth/login` | Public | Authenticate with email and password; issues secure JWT session cookie. |
| `POST` | `/api/auth/logout` | Session | Revoke session and clear HTTP-only session cookie. |
| `GET` | `/api/auth/me` | Session | Retrieve profile details of currently authenticated staff/owner. |
| `POST` | `/api/auth/pin-verify` | Public/Branch | Verify 4-digit quick staff PIN for high-speed POS terminal switching. |

### 2.2 Point of Sale & Billing APIs
| Method | Route | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/pos/calculate` | Session | Authoritative calculation of item discounts, bill discounts, 2.5% CGST, 2.5% SGST, round-off, and grand total. |
| `POST` | `/api/pos/orders/settle` | Session | Atomically create paid order, generate sequential statutory invoice, record split payments, and trigger recipe stock deductions. |
| `POST` | `/api/pos/orders/hold` | Session | Temporarily hold an active order cart with customer note. |
| `POST` | `/api/pos/orders/cancel` | Manager | Void an open order with mandatory supervisor reason. |
| `POST` | `/api/pos/orders/refund` | Manager | Process authorized refund on a settled bill with audit trail. |
| `POST` | `/api/pos/orders/transfer` | Session | Transfer an active order from one dining table to another. |
| `POST` | `/api/pos/orders/kot` | Session | Dispatch Kitchen Order Ticket (KOT) to line cook stations. |
| `GET` | `/api/pos/menu` | Session | Fetch active menu catalog with branch pricing overrides. |
| `GET` | `/api/pos/tables` | Session | Retrieve live dining table states (Available, Occupied, Billed). |
| `POST` | `/api/pos/sync` | Session | Batch synchronization endpoint for offline orders with idempotency deduplication. |
| `GET` | `/api/pos/sync/monitor` | Session | Health and queue status monitor for pending offline operations. |

### 2.3 QR Self-Ordering APIs
| Method | Route | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/qr-order/submit` | Public / Table | Customer digital menu submission route. Atomically creates dining order and dispatches KOT to kitchen. Supports `PAY_LATER` and `PAY_ONLINE`. |

### 2.4 Kitchen Display System (KDS) APIs
| Method | Route | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/kds/tickets` | Kitchen/Session | Retrieve active kitchen tickets filtered by branch and station. |
| `POST` | `/api/kds/status` | Kitchen/Session | Transition KOT ticket stage: `NEW` → `ACCEPTED` → `PREPARING` → `READY` → `SERVED`. |
| `GET` | `/api/kds/events` | Kitchen/Session | Server-Sent Events (SSE) / WebSocket stream for real-time ticket arrival. |
| `POST` | `/api/kds/reprint` | Kitchen/Session | Trigger physical thermal re-print of a damaged kitchen slip. |

### 2.5 Inventory & Recipe Costing APIs
| Method | Route | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `GET`, `POST` | `/api/inventory/items` | Inventory/Mgr | List and register raw material ingredients with UOM definitions. |
| `POST` | `/api/inventory/adjust` | Inventory/Mgr | Record kitchen wastage, spills, spoilage, and stock adjustments. |
| `GET`, `POST` | `/api/inventory/recipes`| Inventory/Mgr | Formulate Bill of Materials (BOM) recipes with food cost % calculations. |
| `GET` | `/api/inventory/movements`| Inventory/Mgr | Audit log of all stock movements (GRN, sales deduction, wastage). |
| `GET` | `/api/inventory/reports` | Inventory/Mgr | Low-stock par level warning alerts and inventory valuation. |

### 2.6 Procurement & Supplier APIs
| Method | Route | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `GET`, `POST` | `/api/procurement/suppliers` | Inventory/Mgr | Vendor directory, contact details, and outstanding balances. |
| `GET`, `POST` | `/api/procurement/purchase-orders` | Inventory/Mgr | Create and track vendor purchase orders. |
| `POST` | `/api/procurement/grn` | Inventory/Mgr | Goods Received Note: records incoming deliveries and updates stock. |
| `POST` | `/api/procurement/payments` | Inventory/Mgr | Log payments made against vendor invoices. |

### 2.7 Workforce, Attendance & CRM APIs
| Method | Route | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `GET`, `POST` | `/api/staff` | Admin/Manager | Staff directory, role assignments, hourly wages, and PIN resets. |
| `GET` | `/api/attendance` | Manager | Attendance records and late arrival tracking. |
| `POST` | `/api/attendance/clock` | Staff/PIN | Clock-in and clock-out timestamp punch. |
| `POST` | `/api/attendance/leaves`| Manager | Submit and approve/reject staff leave requests. |
| `GET`, `POST` | `/api/payroll` | Manager/Acct | Generate monthly payroll runs with overtime calculations. |
| `GET`, `POST` | `/api/crm/customers` | Session | Customer profiles, lifetime spend, and loyalty points. |
| `GET`, `POST` | `/api/crm/coupons` | Manager | Promotional coupon codes and discount limits. |
| `GET`, `POST` | `/api/crm/vouchers` | Manager | Gift voucher creation and redemption. |

### 2.8 Accounting, Reports & Multi-Branch APIs
| Method | Route | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `GET`, `POST` | `/api/accounting/expenses` | Manager/Acct | Log and audit categorized operating expenses. |
| `GET`, `POST` | `/api/accounting/cash-register` | Cashier/Mgr | Open shift, record physical cash count, and calculate variance. |
| `GET` | `/api/reports/analytics` | Manager/Acct | Comprehensive P&L, sales summaries, and tax breakdown. |
| `GET` | `/api/reports/export` | Manager/Acct | Generate publication-grade PDF and CSV sales reports. |
| `GET`, `POST` | `/api/branches` | Owner/Admin | List and create restaurant branches and outlets. |
| `POST` | `/api/branches/[id]/menu-prices` | Owner/Admin | Configure branch-specific menu price overrides. |
| `GET`, `POST` | `/api/branches/transfers` | Manager | Inter-branch commissary stock transfer dispatch and receipt. |

### 2.9 SaaS Platform Super Admin APIs
| Method | Route | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/platform-admin/overview` | Super Admin | Platform telemetry: total restaurants, active MRR/ARR, churn. |
| `GET` | `/api/platform-admin/restaurants`| Super Admin | Directory of all registered restaurant tenants. |
| `GET`, `PUT` | `/api/platform-admin/restaurants/[id]` | Super Admin | Inspect profile, suspend, or reactivate restaurant account. |
| `GET`, `POST`| `/api/platform-admin/plans` | Super Admin | Configure subscription plan prices (Starter, Growth, Pro, Enterprise). |
| `GET` | `/api/platform-admin/invoices` | Super Admin | Platform SaaS subscription billing invoices. |

### 2.10 Hardware, Integrations & Webhooks
| Method | Route | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/hardware/print` | Session | Dispatch ESC/POS print job to thermal network/USB printer. |
| `POST` | `/api/payments/verify-upi` | Session | Verify 12-digit Bank UTR for UPI payments before invoice settlement. |
| `GET` | `/api/integrations/status` | Admin | Health check and strict verification status of third-party gateways. |
| `POST` | `/api/webhooks/razorpay` | Public/HMAC | Webhook receiver for Razorpay payments with HMAC-SHA256 signature verification and idempotency ledger. |
| `POST` | `/api/webhooks/zomato` | Public/Partner | Normalizes Zomato partner delivery orders into RestaurantOS orders & KOTs. |
| `POST` | `/api/webhooks/swiggy` | Public/Partner | Normalizes Swiggy partner delivery orders into RestaurantOS orders & KOTs. |

---

## 3. Sample API Contract: Settle Order

### Request: `POST /api/pos/orders/settle`
```json
{
  "orderType": "DINE_IN",
  "tableNumber": "T-01",
  "customerName": "Vikram Malhotra",
  "customerPhone": "+91 98765 43210",
  "items": [
    {
      "menuItemId": "item-biryani-01",
      "name": "Murgh Dum Biryani",
      "quantity": 1,
      "unitPrice": 350.00,
      "cookingNotes": "Extra spicy"
    },
    {
      "menuItemId": "item-paneer-02",
      "name": "Paneer Butter Masala",
      "quantity": 1,
      "unitPrice": 320.00,
      "modifiers": [
        { "name": "Extra Butter", "price": 20.00 }
      ]
    }
  ],
  "payments": [
    { "method": "CASH", "amount": 300.00 },
    { "method": "UPI", "amount": 425.00, "transactionRef": "431298012345" }
  ]
}
```

### Response: `200 OK`
```json
{
  "success": true,
  "orderId": "ord_8849201a_ind",
  "orderNumber": "ORD-IND-0291",
  "invoiceNumber": "IND/2026-27/00290",
  "subtotal": 690.00,
  "cgstAmount": 17.25,
  "sgstAmount": 17.25,
  "roundOff": 0.50,
  "grandTotal": 725.00,
  "paidAmount": 725.00,
  "balanceDue": 0.00,
  "status": "PAID"
}
```
