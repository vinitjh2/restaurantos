# RestaurantOS — Customer Installation & Onboarding Handover Package

**Release Package Version:** `1.4.0-PROD`  
**Deployment Target:** Standalone Customer Onboarding Package  
**Jurisdiction:** India F&B (Central & State GST 5.0% Compliant)  
**Distribution Channel:** Turnkey Delivery to Restaurant Owners, General Managers & IT Integrators  

---

## 1. Package Contents & Purpose

This handover directory contains the complete set of deployment guides, operational manuals, data gathering templates, and customer sign-off certificates required to onboard a new restaurant onto the RestaurantOS SaaS platform:

```
release/customer-onboarding/
│
├── 📄 RestaurantOS_Installation_Guide.pdf          (Technical Multi-Platform Deployment Guide)
├── 📄 RestaurantOS_New_Restaurant_Onboarding.pdf    (15-Point Onboarding Checklist & Sign-Off Form)
├── 📊 RestaurantOS_Restaurant_Setup_Template.xlsx   (10-Sheet Pre-Onboarding Data Template)
├── 📘 RestaurantOS_Owner_Setup_Guide.pdf           (Administrator Configuration & System Settings)
├── 📗 RestaurantOS_Cashier_POS_Manual.pdf           (Cashier Touch Billing & Payment Settlement)
├── 📙 RestaurantOS_Kitchen_Staff_Manual.pdf         (KDS Ticket Progression & Rush Hour Timers)
├── 📕 RestaurantOS_Manager_Inventory_Manual.pdf     (Recipe BOM, Procurement, P&L & Auditing)
├── 📓 RestaurantOS_Troubleshooting_Guide.pdf        (Rapid Problem Solving & Error Reference)
└── 📋 README.md                                    (Handover Package Index & Instructions)
```

---

## 2. Onboarding Workflow: The 5-Step Process

```
[ STEP 1: PRE-ONBOARDING ]
Customer populates "RestaurantOS_Restaurant_Setup_Template.xlsx" with dishes, prices, tables & staff.
       │
       ▼
[ STEP 2: ACCOUNT PROVISIONING ]
Engineer creates tenant organization, sets subscription plan, enters GSTIN & branch codes.
       │
       ▼
[ STEP 3: TERMINAL & HARDWARE INSTALLATION ]
Install PWA or Windows/Android app, pair 80mm thermal receipt printer & connect cash drawer RJ12 cable.
       │
       ▼
[ STEP 4: VERIFICATION & STAFF TRAINING ]
Follow "RestaurantOS_New_Restaurant_Onboarding.pdf" checklist, punch test orders, verify KDS & settle bills.
       │
       ▼
[ STEP 5: HANDOVER & ACCEPTANCE SIGN-OFF ]
Deliver all 5 User Manuals and have authorized customer sign the Handover Certificate.
```

---

## 3. Quick Reference for Manuals Distribution

| Role in Restaurant | Deliverable Documents | Key Responsibilities |
| :--- | :--- | :--- |
| **Restaurant Owner / Franchisee** | • `RestaurantOS_Owner_Setup_Guide.pdf`<br/>• `RestaurantOS_New_Restaurant_Onboarding.pdf`<br/>• `RestaurantOS_Restaurant_Setup_Template.xlsx` | Legal business setup, 2.5% CGST + 2.5% SGST tax configuration, branch quotas, owner mobile analytics, subscription management, and final acceptance sign-off. |
| **General Manager / Shift Lead** | • `RestaurantOS_Manager_Inventory_Manual.pdf`<br/>• `RestaurantOS_Troubleshooting_Guide.pdf` | Recipe BOM costing, inventory par levels, supplier purchase orders (GRN), wastage logs, multi-branch stock transfers, staff scheduling, and shift closing variance. |
| **Cashier / Counter Billing Clerk** | • `RestaurantOS_Cashier_POS_Manual.pdf`<br/>• `RestaurantOS_Troubleshooting_Guide.pdf` | Opening cash register float, table orders, sending KOTs, split payments (Cash + UPI), entering 12-digit Bank UTRs, printing receipts, and daily shift cash counting. |
| **Head Chef / Kitchen Line Cooks** | • `RestaurantOS_Kitchen_Staff_Manual.pdf` | KDS touch screen operation, reading bold quantities and yellow allergy notes, advancing order stages (`NEW` → `ACCEPTED` → `PREPARING` → `READY`), and station routing. |
| **Store IT / Maintenance Lead** | • `RestaurantOS_Installation_Guide.pdf`<br/>• `RestaurantOS_Troubleshooting_Guide.pdf` | Network printer static LAN IPs, firewall ports (3000/9100), PWA taskbar shortcuts, Android permissions, and offline sync queue monitoring. |

---

## 4. Multi-Tenant SaaS Security & Data Separation Rules

1. **Strict Tenant Data Isolation:** Every restaurant operates under an isolated `Organization` tenant ID. Staff from one restaurant can never view, query, or mutate another restaurant's menu, pricing, inventory, sales reports, or customer lists.
2. **Branch Confinement:** Branch managers and cashiers are strictly confined to their assigned branch outlet. Attempts to query out-of-scope branch orders are rejected with HTTP 403 `AuthorizationError`.
3. **Zero Credentials in Handover Packages:** This package contains blank configuration templates and sample data only. Real customer passwords, bank UPI MPINs, and private payment gateway secret keys are never stored or distributed in handover files.
4. **Statutory Invoice Protection:** Settled invoices are immutable and protected by tamper-proof idempotency keys. Duplicate offline network replays are automatically deduplicated without double billing.

---

## 5. Support & Escalation Directory

- **Technical Support Helpdesk:** `support@restaurantos.io`
- **Customer Success & Onboarding:** `onboarding@restaurantos.io`
- **Emergency In-Store Support:** Refer to the contact directory on Page 8 of the `RestaurantOS_Troubleshooting_Guide.pdf`.
