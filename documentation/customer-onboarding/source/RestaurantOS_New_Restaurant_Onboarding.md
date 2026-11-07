# RestaurantOS — New Restaurant Onboarding & Deployment Protocol

**Document:** `RestaurantOS_New_Restaurant_Onboarding.md`  
**Audience:** System Integrators, Onboarding Engineers, Customer Success Leads, Franchise IT  
**Applicable Version:** RestaurantOS Enterprise v1.4.0+  
**Target:** Standardized, repeatable onboarding process for any new restaurant customer.  

---

## 1. Pre-Onboarding Information Gathering

Before arriving at the restaurant or initiating account provisioning, deliver the **`RestaurantOS_Restaurant_Setup_Template.xlsx`** spreadsheet to the restaurant owner. Ensure they populate:
- Restaurant legal business name, brand name, and registered street address.
- State GSTIN and 14-digit FSSAI number.
- Menu categories, dish names, portion variants, modifier add-ons, and selling prices.
- Dining table numbers, seating capacities, and room sections.
- Staff list (names, assigned roles, and preferred 4-digit quick POS PINs).
- Printer hardware models (USB/LAN IP) and merchant UPI VPA.

---

## 2. Step-by-Step Technical Onboarding Checklist

Complete each task in sequence and check the box upon successful verification:

### Phase 1: Account & Profile Provisioning
- [ ] **1.1 Create Restaurant Tenant Account:**  
      Navigate to `/register` or Platform Super Admin (`/platform-admin`). Create legal organization entity with clean URL slug (e.g., `bawarchi-royale`).
- [ ] **1.2 Assign SaaS Subscription Plan:**  
      Under `/platform-admin`, assign the requested plan tier (**Starter**, **Growth**, **Pro**, or **Enterprise**) with branch and staff quotas.
- [ ] **1.3 Configure Restaurant Profile & FSSAI:**  
      Under `/settings`, verify legal name, contact phone, business email, FSSAI number, and upload high-resolution restaurant logo.
- [ ] **1.4 Configure Statutory Indian GST & Invoicing:**  
      Under `/branches`, enter the 15-character GSTIN. Confirm split 2.5% CGST and 2.5% SGST rates. Set branch invoice prefix (e.g., `IND/2026-27/00001`).

### Phase 2: Outlet Floorplan & Menu Architecture
- [ ] **2.1 Configure Outlets & Branches:**  
      Create flagship outlet and any secondary commissary kitchens or satellite outlets under `/branches`.
- [ ] **2.2 Configure Dining Tables & QR Tent Cards:**  
      Under `/tables`, register all physical dining tables with capacity counts. Generate and download printable Table QR tent cards for customer self-ordering.
- [ ] **2.3 Create Food Categories & Routing:**  
      Under `/menu`, create categories (Starters, Curries, Biryani, Breads, Beverages, Desserts). Map each category to its designated kitchen station (`MAIN_KITCHEN`, `BAR`, `BAKERY`, `BEVERAGE`).
- [ ] **2.4 Import / Enter Menu Dishes & Prices:**  
      Populate dishes with dietary dots (Veg/Non-Veg), portion variants (Half/Full), modifier add-ons (Extra Butter, Extra Cheese), and cooking notes.

### Phase 3: Staffing, Permissions & Hardware
- [ ] **3.1 Create Staff Accounts & Quick PINs:**  
      Under `/staff`, create individual staff profiles (Manager, Cashier, Waiter, Line Cook). Assign secure 4-digit POS quick PINs. Verify Cashier is restricted from P&L reports.
- [ ] **3.2 Configure Payment Gateways & Counter UPI:**  
      Under `/settings/integrations`, enter merchant UPI VPA (e.g., `restaurant@icici`). Verify dynamic QR code generates with exact payable amounts.
- [ ] **3.3 Connect 80mm Billing Thermal Printer:**  
      Under `/settings`, pair 80mm billing thermal printer via USB Spooler or LAN IP (`Port 9100`). Execute test print.
- [ ] **3.4 Test Electronic Cash Drawer Kick Pulse:**  
      Connect RJ12 cable from drawer to printer DK port. Settle mock bill to verify solenoid kick pulse.
- [ ] **3.5 Configure Kitchen Display Stations (KDS):**  
      Mount kitchen tablet or monitor. Open `/kitchen` in fullscreen kiosk mode. Test audio chime notifications.

### Phase 4: Operational Verification & Training
- [ ] **4.1 Test Dine-In Order Lifecycle:**  
      Punch an order on Table `T-01`. Send KOT. Verify ticket appears on KDS with correct items, portion size, and yellow allergy note.
- [ ] **4.2 Test Kitchen Status Progression:**  
      Advance ticket on KDS: `NEW` → `ACCEPTED` → `PREPARING` → `READY`. Verify server receives ready notification.
- [ ] **4.3 Test Bill Settlement & Split Payment:**  
      Settle bill using Split Tender (Cash + UPI). Verify 50-paise statutory round-off, enter 12-digit Bank UTR, verify thermal receipt prints, and cash drawer opens.
- [ ] **4.4 Test Offline Billing & Sync:**  
      Disconnect Wi-Fi on billing terminal. Punch order. Reconnect Wi-Fi. Verify order syncs to server without duplication.
- [ ] **4.5 Train Restaurant Owner & Staff:**  
      Conduct 45-minute hands-on walkthrough with cashier, kitchen cooks, and store manager.
- [ ] **4.6 Deliver Customer Handover Package:**  
      Provide printed/PDF copies of the 5 User Manuals and the configuration workbook.

---

## 3. Customer Handover & Formal Acceptance Sign-Off

This document certifies that the RestaurantOS system has been installed, configured, tested, and handed over to the customer's satisfaction.

### Customer & Installation Record

```
+---------------------------------------------------------------------------------------+
| RESTAURANT INFORMATION:                                                               |
| Legal Business Name:   ______________________________________________________________ |
| Brand / Trade Name:    ______________________________________________________________ |
| Primary Branch Outlet: ______________________________________________________________ |
| Installation Address:  ______________________________________________________________ |
+---------------------------------------------------------------------------------------+
| SYSTEM SPECIFICATIONS:                                                                |
| Primary Administrator: ___________________________ Email: ___________________________ |
| Subscription Plan:     [ ] Starter   [ ] Growth   [ ] Pro   [ ] Enterprise            |
| Terminals Deployed:    ___ Billing POS   ___ Kitchen KDS   ___ Waiter Tablets         |
| Software Version:      RestaurantOS Enterprise v1.4.0-PROD                             |
+---------------------------------------------------------------------------------------+
| ONBOARDING COMPLETION:                                                                |
| Setup Completed Date:  _____ / _____ / 2026                                           |
| Certified Engineer:    ___________________________ Signature: _______________________ |
+---------------------------------------------------------------------------------------+
| CUSTOMER ACCEPTANCE STATEMENT:                                                        |
| "I, the undersigned authorized representative, certify that the RestaurantOS system   |
| has been fully configured and tested in our establishment. Our staff has received    |
| operational training on POS billing, kitchen KDS, inventory deduction, and shift      |
| closing. All official user manuals and setup spreadsheets have been delivered."       |
|                                                                                       |
| Authorized Customer Name: ___________________________________________________________ |
| Official Designation:     ___________________________________________________________ |
| Customer Signature:       ___________________________ Date: _____ / _____ / 2026      |
| Official Restaurant Seal:                                                             |
+---------------------------------------------------------------------------------------+
```
