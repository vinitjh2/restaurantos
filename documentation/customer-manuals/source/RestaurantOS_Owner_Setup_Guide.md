# RestaurantOS — Restaurant Owner Setup Guide

**Document:** `RestaurantOS_Owner_Setup_Guide.md`  
**Audience:** Restaurant Owners, General Managers, System Administrators  
**Applicable Version:** RestaurantOS Enterprise v1.4.0+  
**Target Environments:** Web Browser (Chrome/Edge/Safari), Windows Desktop, Android Tablet  

---

## 1. Welcome to RestaurantOS

RestaurantOS is an enterprise-grade restaurant operating system built specifically for modern food and beverage businesses in India. It unifies high-speed Point of Sale (POS), Kitchen Display System (KDS), Table Management, Recipe-based Inventory, Customer CRM, Workforce Management, Statutory Indian GST Billing, and Multi-Branch operations into a single platform.

### Key Capabilities
- **High-Speed Touch POS:** Rapid order entry for Dine-In, Takeaway, and Delivery.
- **Indian GST Compliance:** Automatic 2.5% CGST + 2.5% SGST calculation with statutory 50-paise mathematical round-off and sequential invoicing.
- **Multi-Station KDS:** Automatic routing of dishes to Kitchen, Bar, Bakery, or Beverage stations with elapsed rush timers.
- **Offline-First Resilience:** POS terminals continue billing during internet outages; orders synchronize automatically upon reconnection.
- **Recipe Bill of Materials (BOM):** Deducts raw ingredients from inventory automatically when an order is settled.
- **Multi-Branch & SaaS:** Centralized control over multiple restaurant outlets with isolated inventory, staff, and pricing.

---

## 2. Accessing the Application

RestaurantOS runs across any modern desktop, laptop, tablet, or smartphone.

1. **Web Browser:** Open Google Chrome, Microsoft Edge, or Safari and navigate to your restaurant's designated URL:
   ```
   http://localhost:3000 (Local In-Store Server)
   https://your-restaurant.restaurantos.io (Cloud Instance)
   ```
2. **Install as a Desktop/Mobile App (PWA):**
   - In Google Chrome, click the **Install RestaurantOS** icon in the address bar.
   - On Android tablets, tap the browser menu (three dots) and tap **Add to Home screen**.
   - RestaurantOS will launch in standalone full-screen mode without browser tabs or address bars.

---

## 3. Account Activation & Initial Login

### 3.1 Registering a New Restaurant Account
1. From the login page, click **Register Restaurant** (`/register`).
2. Fill in the onboarding form:
   - **Restaurant Name:** The legal trading name of your establishment (e.g., *Bawarchi Royale Hospitality*).
   - **Business Type:** Select from *Restaurant*, *Cafe*, *Cloud Kitchen*, *Bakery*, or *Multi-Chain*.
   - **Owner Name & Email:** Your personal name and primary administrative email.
   - **Password:** Create a secure password (minimum 8 characters).
   - **Flagship Outlet Name:** Name of your primary branch (e.g., *Indiranagar Flagship*).
   - **GSTIN & FSSAI Number:** Enter your 15-character GSTIN and 14-digit FSSAI license number.
3. Click **Create Restaurant Account**.
4. The system will atomically create your organization, flagship branch, default tables, master inventory categories, and start your 30-day trial subscription.

### 3.2 First-Time Login
1. Navigate to the login page (`/login`).
2. Enter your registered administrative email and password.
3. Click **Sign In**.
4. Upon successful authentication, a secure encrypted session cookie is established, and you are directed to the **Main Dashboard** (`/`).

---

## 4. Configuring Restaurant Profile & Branding

1. In the left sidebar, click **Administration → Settings** (`/settings`).
2. Under **General Information**:
   - Verify the **Business Name**, **Contact Phone**, and **Public Email**.
   - Enter your **FSSAI License Number** and **Official Registered Address**.
   - Select your base currency (**INR — Indian Rupee ₹**).
3. Under **Branding & Receipts**:
   - Upload your restaurant logo (square PNG or JPEG format, recommended 512x512 pixels).
   - Enter the **Receipt Header Text** (e.g., *"Bawarchi Royale — Pure Flavors since 2012"*).
   - Enter the **Receipt Footer Message** (e.g., *"Thank you for dining with us! FSSAI Lic #11223344000123. Visit again!"*).
4. Click **Save Settings**.

---

## 5. Configuring GSTIN, Taxes & Invoicing

Statutory tax settings must be configured correctly before opening the billing counter.

1. In the sidebar, click **Administration → Branches** (`/branches`).
2. Click **Edit Settings** on your flagship outlet.
3. Configure the tax parameters:
   - **GSTIN:** Enter your valid 15-character State GSTIN (e.g., `29AABCU9603R1ZM`).
   - **Tax Regime:** Standard F&B Composite or Regular GST.
   - **CGST Rate (%):** Set to `2.5%`.
   - **SGST Rate (%):** Set to `2.5%`.
   - **IGST Rate (%):** Set to `5.0%` (for interstate catering/supplies).
   - **Tax Inclusion:** Choose whether menu prices are entered *Tax-Exclusive* (tax added on top at billing) or *Tax-Inclusive* (tax calculated backwards from item price).
4. **Invoice Numbering Sequence:**
   - Configure your branch code (e.g., `IND`).
   - Configure the fiscal year (e.g., `2026-27`).
   - Set the next invoice starting serial number (e.g., `1` generates `IND/2026-27/00001`).
5. Click **Update Tax Configuration**.

---

## 6. Setting Up Outlets & Multiple Branches

If you operate multiple locations or cloud kitchens, RestaurantOS manages them all from one owner dashboard:

1. Navigate to **Administration → Branches** (`/branches`).
2. Click **Add New Branch**.
3. Fill in branch details:
   - **Branch Name:** e.g., *Koramangala Hub* or *Whitefield Express*.
   - **Unique Branch Code:** 3–4 letter uppercase abbreviation (e.g., `KOR`, `WHF`).
   - **Address, City, Pincode & Branch Phone Number**.
   - **Branch Specific GSTIN:** If different from the parent entity.
4. Click **Create Branch**.
5. Once created, you can switch active branches anytime from the top navigation bar outlet dropdown.

---

## 7. Creating Dining Tables & QR Tent Cards

1. In the sidebar, click **Main → Tables** (`/tables`).
2. Click **Add Table**:
   - **Table Number / Label:** e.g., `T-01`, `T-02`, `AC-01`, `Rooftop-4`.
   - **Seating Capacity:** 2, 4, 6, or 8 guests.
   - **Dining Section:** Ground Floor, AC Dining, Rooftop Garden, or Bar.
3. **Generating Customer QR Codes for Tables:**
   - Click the **QR Code** icon next to any table.
   - A high-resolution QR tent card is generated linking patrons directly to `/qr-order?branch=IND&table=T-01`.
   - Click **Print Tent Card** or **Download PDF** to print laminated QR cards for your tables.

---

## 8. Menu Setup: Categories & Dishes

1. In the sidebar, click **Catalog & Inventory → Menu** (`/menu`).
2. **Add Categories First:**
   - Click **Categories → Add Category**.
   - Examples: *Starters*, *Tandoor & Kebabs*, *Main Course*, *Biryani & Rice*, *Breads*, *Desserts*, *Beverages*.
   - Select default kitchen routing station: `MAIN_KITCHEN`, `BAR`, `BAKERY`, or `BEVERAGE`.
3. **Add Dishes / Menu Items:**
   - Click **Add Menu Item**.
   - Enter **Dish Name** (e.g., *Murgh Dum Biryani*, *Paneer Butter Masala*).
   - Select **Category**.
   - Set **Dietary Classification:** `VEG` (Green Dot), `NON_VEG` (Red Dot), or `EGG` (Yellow Dot).
   - Enter **Base Selling Price** (e.g., ₹320).
   - Enter a brief dish description.
4. **Portion Variants (Optional):**
   - If the dish is sold in sizes, click **Add Variant**:
     - *Half:* ₹190
     - *Full:* ₹340
5. **Add-ons & Modifiers (Optional):**
   - Click **Add Modifier Group**:
     - Group: *Choice of Spice* (Mild, Medium, Spicy).
     - Group: *Extra Toppings* (Extra Butter +₹20, Extra Cheese +₹40).
6. Click **Save Item**.

---

## 9. Creating Employee Accounts & Role Permissions

Never share your owner password with staff. Create individual accounts with role-based restrictions:

1. In the sidebar, click **Customers & Staff → Staff** (`/staff`).
2. Click **Add Employee**.
3. Fill in staff details:
   - **Full Name:** e.g., *Pooja Hegde*.
   - **Login Email & Password:** Used for administrative portal access.
   - **Quick POS PIN:** 4-digit numerical PIN (e.g., `1234`) for instant cashier screen switching.
   - **Assigned Branch:** Confine employee to a specific outlet or grant multi-branch access.
   - **Role:** Select the appropriate role:
     - **Administrator:** Full access excluding subscription billing.
     - **Manager:** Operational control, discounts, refunds, inventory, and staff roster.
     - **Cashier:** POS counter billing, payment settlements, cash drawer, and shift closing. *Restricted from P&L and Admin settings.*
     - **Waiter:** Mobile ordering app (`/mobile/waiter`), table assignment, and modifier selection.
     - **Kitchen Staff:** Multi-station KDS (`/kitchen`), marking cooking states and tickets ready.
     - **Inventory Manager:** Procurement, purchase orders, wastage logs, and supplier management.
     - **Accountant:** Read-only financial ledger, GST tax reports, Day Book, and expense auditing.
4. Click **Create Employee**.

---

## 10. Hardware Configuration: Printers & Cash Drawers

1. In the sidebar, click **Administration → Settings → Printers & Hardware**.
2. **Billing Counter Thermal Printer (80mm / 58mm):**
   - Select connection type: `USB Spooler`, `Network (TCP/IP)`, or `Browser Print`.
   - Enter Printer Name or IP Address (e.g., `192.168.1.150` on port `9100`).
   - Select Paper Width: **80mm (Standard 48 columns)** or **58mm (Compact 32 columns)**.
   - Click **Test Print** to verify paper alignment and font rendering.
3. **Electronic Cash Drawer:**
   - Connect the cash drawer's RJ12 cable to the printer's DK (Drawer Kick) port.
   - Toggle **Enable Electronic Cash Drawer Kick**.
   - The drawer will automatically pop open upon bill settlement.
4. **Kitchen Printers (KOT):**
   - Map individual kitchen stations (`MAIN_KITCHEN`, `BAR`) to dedicated thermal network printers.

---

## 11. Payment Gateways & UPI QR Configuration

1. In the sidebar, click **Administration → Integrations** (`/settings/integrations`).
2. **Dynamic UPI QR Payments:**
   - Enter your restaurant's **UPI VPA / ID** (e.g., `bawarchiroyale@icici`).
   - Enter your **Payee Merchant Name** (e.g., `Bawarchi Royale Hospitality`).
   - When a cashier settles a bill via UPI, the system displays a dynamic QR code for the exact rounded bill amount.
   - *Security Note:* Cashiers must verify payment on their counter phone or enter the 12-digit Bank UTR before marking the invoice as paid.
3. **Razorpay Online Payments (Optional):**
   - Enter your **Razorpay Key ID**, **Key Secret**, and **Webhook Secret**.
   - Enables customer digital payments for Table QR Self-Ordering.

---

## 12. Reviewing Reports & Daily Analytics

1. In the sidebar, click **Finance & Insights → Reports** (`/reports`).
2. Available Business Reports:
   - **Sales Summary:** Total invoiced volume, net sales, taxes collected, and bill count.
   - **Payment Breakdown:** Split across Cash, UPI, Card, and Customer Loyalty Points.
   - **GST Tax Report:** Detailed break-up of 2.5% CGST and 2.5% SGST for monthly GSTR-1 and GSTR-3B filing.
   - **Item-Wise Sales:** Top bestsellers by volume and revenue contribution.
   - **Profit & Loss Statement:** Revenue minus Cost of Goods Sold (COGS), operating expenses, and payroll.
3. Click **Export PDF** or **Export Excel (CSV)** to download monthly audit filings.

---

## 13. Managing SaaS Subscriptions & Quotas

1. In the sidebar, click **Administration → Subscription & Plan** (`/subscription`).
2. Review your active plan tier (**Starter**, **Growth**, **Pro**, or **Enterprise**).
3. Monitor your active quotas:
   - Number of active branches utilized.
   - Number of employee accounts created.
   - Storage usage and transaction volume.
4. Click **Upgrade Plan** or **Renew Subscription** to extend your billing cycle.

---

## 14. First-Day Opening Checklist

Before opening your doors on Day 1, complete this verification checklist:

| # | Setup Action Item | Verification Screen | Done? |
|---|---|---|:---:|
| 1 | Register restaurant profile, address, and contact numbers | `/settings` | [ ] |
| 2 | Enter valid 15-digit GSTIN and verify 2.5% CGST + 2.5% SGST | `/branches` | [ ] |
| 3 | Create dining tables and verify capacity counts | `/tables` | [ ] |
| 4 | Print and laminate Table QR Tent Cards for tables | `/tables` | [ ] |
| 5 | Create categories and populate active menu items | `/menu` | [ ] |
| 6 | Assign dish prices, portion sizes, and dietary tags | `/menu` | [ ] |
| 7 | Create staff accounts and assign secure 4-digit POS PINs | `/staff` | [ ] |
| 8 | Configure billing thermal printer and execute test print | `/settings` | [ ] |
| 9 | Verify cash drawer RJ12 kick pulse upon bill settlement | `/pos` | [ ] |
| 10 | Configure restaurant UPI ID and test ₹1 test QR code | `/settings/integrations` | [ ] |
| 11 | Punch test dine-in order and verify KOT appears on KDS | `/pos` & `/kitchen` | [ ] |
| 12 | Settle test bill via Cash and verify invoice serial numbering | `/pos` | [ ] |
| 13 | Void test order or process supervisor refund | `/orders` | [ ] |
| 14 | Open cash register shift and input starting cash float | `/pos` | [ ] |
| 15 | Ensure staff bookmarks app on mobile devices (`/mobile/waiter`) | Handheld | [ ] |

---

## 15. Glossary of Terms

- **BOM (Bill of Materials):** The list of raw ingredients and precise quantities required to prepare one serving of a dish.
- **CGST:** Central Goods and Services Tax (2.5% on standard restaurant dining).
- **SGST:** State Goods and Services Tax (2.5% on standard restaurant dining).
- **KDS:** Kitchen Display System — digital wall or counter screens replacing paper kitchen tickets.
- **KOT:** Kitchen Order Ticket — an instruction slip indicating which items to prepare for which table.
- **PWA:** Progressive Web App — software that runs in the browser but installs like a native app.
- **RBAC:** Role-Based Access Control — restricting user access based on job duties.
- **UTR:** Unique Transaction Reference — a 12-digit banking reference number proving a UPI transaction completed.
