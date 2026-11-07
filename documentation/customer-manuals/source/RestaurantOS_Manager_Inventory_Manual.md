# RestaurantOS — Inventory & Manager Operations Manual

**Document:** `RestaurantOS_Manager_Inventory_Manual.md`  
**Audience:** Restaurant General Managers, Operations Leads, Inventory Controllers, Head Chefs  
**Applicable Version:** RestaurantOS Enterprise v1.4.0+  
**Target Environments:** Desktop Browser, Laptop, or Tablet  

---

## 1. Manager Dashboard & Executive Pulse

As a restaurant manager, your primary command center is the **Main Dashboard** (`/`) and the **Owner Mobile Dashboard** (`/mobile/owner`).

### Key Telemetry Indicators:
- **Live Gross Revenue:** Real-time invoiced revenue for the current business day.
- **Order Velocity:** Total number of settled bills and active open tables.
- **Average Order Value (AOV):** Calculated as `Gross Sales / Total Bills`.
- **Net Operating Margin (%):** Live pulse calculating gross sales minus Cost of Goods Sold (COGS), labor, and prorated operating expenses.
- **Urgent Action Alerts:**
  - Red Badge: Ingredients with stock levels below reorder points.
  - Yellow Badge: Ingredients nearing their expiration date.

---

## 2. Sales & Business Analytics Reporting

Navigate to **Finance & Insights → Reports** (`/reports`).

### 2.1 Available Operational Reports
1. **Daily Sales Summary:** Detailed breakdown of gross revenue, discounts, taxable value, and tax collections.
2. **GST Filing Report:** Clean breakdown of 2.5% CGST and 2.5% SGST collected, matching GSTR-1 criteria.
3. **Payment Reconciliation:** Volume split across Cash, UPI, Credit/Debit Cards, and Loyalty Redemptions.
4. **Item Velocity & Dish Ranking:** Volume and rupee contribution of every menu dish, categorized into high-profit bestsellers vs low-velocity items.
5. **Profit & Loss Statement (P&L):** Exact financial accounting report computing:
   $$\text{Net Operating Profit} = (\text{Gross Sales} - \text{Discounts}) - \text{COGS} - \text{OpEx} - \text{Labor}$$

### 2.2 Date & Branch Filters
- Use the **Date Range Selector** to filter by *Today*, *Yesterday*, *This Week*, *This Month*, or *Custom Range*.
- If managing multiple outlets, use the **Branch Filter** to isolate performance for Indiranagar (`IND`), Koramangala (`KOR`), or Whitefield (`WHF`).
- Click **Export PDF** or **Export CSV** to download audit-ready spreadsheets.

---

## 3. Menu Engineering & Daily Availability

Navigate to **Catalog & Inventory → Menu** (`/menu`).

### 3.1 Marking Items Out of Stock (86'ing an Item)
When the kitchen runs out of fresh ingredients (e.g., fresh mutton for biryani):
1. Find the item in the menu list.
2. Toggle the **Is Available** switch to **OFF**.
3. The item immediately turns grey and is disabled on the Touch POS, Handheld Waiter App, and Customer QR Menus. Staff cannot punch orders for unavailable dishes.

### 3.2 Modifying Base Prices & Portions
1. Click **Edit** on any dish.
2. Update the **Base Selling Price** (e.g., update from ₹320 to ₹340).
3. If portion sizes exist, update the specific variant price (Half/Full).
4. Click **Save Changes**. The new price applies immediately to all new orders.

---

## 4. Inventory Setup: Ingredients & Units of Measure (UOM)

Navigate to **Catalog & Inventory → Inventory** (`/inventory`).

### 4.1 Creating Raw Material Ingredients
Every raw material used in cooking must be registered:
1. Click **Add Ingredient**.
2. Enter ingredient details:
   - **Name:** e.g., *Paneer (Malai)*, *Basmati Rice (Daawat)*, *Amul Butter*, *Cooking Oil*.
   - **Category:** *Dairy*, *Meat & Poultry*, *Grains & Pulses*, *Produce*, *Spices*, *Beverages*, *Packaging*.
   - **Base Unit of Measure (UOM):** The standard unit in which stock is tracked (`KG`, `GRAM`, `LITRE`, `ML`, `PIECE`, `PACKET`).
   - **Current Stock on Hand:** Initial physical stock balance.
   - **Minimum Reorder Threshold (Par Level):** Minimum safety stock before an alert is triggered (e.g., alert when Basmati Rice drops below 25 KG).
   - **Average Purchase Cost:** Cost per base unit (e.g., ₹420 per KG).
3. Click **Save Ingredient**.

---

## 5. Recipe Formulation & Bill of Materials (BOM) Costing

RestaurantOS uses transactional recipes to calculate food cost percentages and automatically deduct stock.

### 5.1 Creating a Recipe Card
1. Go to **Catalog & Inventory → Inventory → Recipes**.
2. Click **Create Recipe BOM**.
3. Select the menu item: e.g., **Paneer Butter Masala (1 Serving)**.
4. Set **Selling Price:** ₹320.00.
5. Add Ingredients:
   - *Paneer:* Quantity: `200` | UOM: `GRAM` (Base: KG @ ₹420/kg -> ₹84.00)
   - *Amul Butter:* Quantity: `30` | UOM: `GRAM` (Base: KG @ ₹520/kg -> ₹15.60)
   - *Tomato Puree:* Quantity: `100` | UOM: `GRAM` (Base: KG @ ₹45/kg -> ₹4.50)
   - *Fresh Cream:* Quantity: `40` | UOM: `ML` (Base: LITRE @ ₹220/L -> ₹8.80)
6. **Financial Metrics Calculated Automatically:**
   - **Total Recipe Food Cost:** ₹112.90
   - **Gross Profit per Serving:** ₹207.10
   - **Food Cost Percentage:** `35.28%`
   - **Gross Profit Margin:** `64.72%`
7. Click **Save Recipe**.

---

## 6. Automated Stock Deduction Mechanics

- When an order is punched, ingredients are staged.
- When the cashier marks the bill **PAID** (`/pos`), the transactional engine executes `deductStockForOrder()`.
- The system checks for variant BOMs first, then parent item BOMs.
- In our example, settling 2 servings of Paneer Butter Masala automatically decrements:
  - 400g Paneer
  - 60g Butter
  - 200g Tomato Puree
  - 80ml Cream
- This eliminates manual end-of-day stock deduction spreadsheets.

---

## 7. Purchase Entries & Goods Received Notes (GRN)

Navigate to **Catalog & Inventory → Purchases** (`/purchases`).

### 7.1 Recording a Vendor Delivery (GRN)
When a supplier delivers raw materials to the restaurant:
1. Click **New Purchase Entry (GRN)**.
2. Select the **Supplier** from the dropdown (or click *Add Supplier*).
3. Enter the vendor's physical **Invoice Number** and **Invoice Date**.
4. Select the items received:
   - *Basmati Rice:* Quantity received: `50 KG` @ Purchase Price: `₹110/KG`.
   - *Amul Butter:* Quantity received: `20 KG` @ Purchase Price: `₹510/KG`.
5. Enter payment terms: *Credit (Pay later)*, *Paid via Bank Transfer*, or *Paid via Cash*.
6. Click **Confirm Goods Receipt**.
7. Physical stock balances update immediately, and a payable entry is created under accounting.

---

## 8. Suppliers & Vendor Management

Navigate to **Catalog & Inventory → Suppliers** (`/suppliers`).

1. View all active vendors (e.g., *Heritage Dairy Supplies*, *Metro Cash & Carry*, *Indira Poultry Farm*).
2. Monitor **Total Purchases**, **Amount Paid**, and **Outstanding Supplier Dues**.
3. Click **Record Supplier Payment** to log payments made against vendor invoices.

---

## 9. Wastage Tracking & Stock Adjustments

Navigate to **Catalog & Inventory → Inventory → Adjustments**.

### 9.1 Logging Spoilage, Spills & Kitchen Loss
1. Click **Log Stock Wastage**.
2. Select the ingredient: e.g., *Fresh Cream*.
3. Enter quantity lost: `2 LITRE`.
4. Select the **Wastage Reason**:
   - *Expired / Spoiled*
   - *Kitchen Spillage / Accident*
   - *Burnt / Prep Error*
   - *Trimming Loss*
5. Click **Record Wastage**.
6. The system reduces physical stock and posts the financial cost to the P&L as a direct COGS loss.

---

## 10. Multi-Branch Stock Transfers

If your business operates a central commissary kitchen supplying satellite outlets:

1. Navigate to **Administration → Branches → Stock Transfers**.
2. Click **Create Stock Transfer**.
3. Select **Source Branch** (e.g., `IND - Indiranagar Flagship`) and **Destination Branch** (e.g., `KOR - Koramangala Hub`).
4. Select ingredients and transfer quantities (e.g., `25 KG Marinated Chicken Tikka`).
5. Click **Dispatch Transfer**.
   - Source branch inventory is immediately decremented.
   - Transfer status marked as `IN_TRANSIT`.
6. When the delivery vehicle arrives at the destination branch:
   - Koramangala manager inspects the items and clicks **Receive & Accept Transfer**.
   - Destination branch inventory is incremented.

---

## 11. Staff Scheduling, Attendance & Payroll

Navigate to **Customers & Staff → Attendance** (`/attendance`).

1. **Daily Clock In/Out Logs:**
   - View exact timestamps when staff punched in or out on the POS terminal.
   - Review late arrivals and overtime hours.
2. **Leave Management:**
   - Approve or reject sick leaves and casual leaves requested by staff.
3. **Payroll Runs:**
   - At month-end, click **Generate Payroll Run** (`/payroll`).
   - The engine automatically calculates:
     $$\text{Gross Salary} = \text{Basic Wage} + \text{Overtime Pay} + \text{Bonuses} - \text{Unpaid Absences} - \text{Advances}$$

---

## 12. Daily Shift Closing & Cash Reconciliation

Before locking the restaurant doors:

1. **Verify Open Tables:** Ensure all dining tables are settled and no KOTs remain active on the KDS.
2. **Review Cash Discrepancies:**
   - Open `/accounting/cash-register`.
   - Compare physical cash in drawer against POS recorded collections.
   - Any variance exceeding ₹100 must be investigated.
3. **Run Daily Sales Export:** Download the Daily Sales Summary PDF and archive it for the owner and accountant.

---

## 13. Avoiding Common Operational Mistakes

| Mistake | Operational Consequence | Correct Procedure |
|---|---|---|
| **Pinching without KOT** | Food cooked without kitchen record; inventory not tracked | Always punch orders on POS or Waiter App before verbal kitchen calls. |
| **Trusting Fake UPI Screenshots** | Fraudulent zero-rupee payment; unrecoverable cash loss | Always verify counter Soundbox or enter the 12-digit Bank UTR. |
| **Delaying GRN Entry** | Real stock differs from system; false low-stock alerts | Enter supplier delivery invoices into `/purchases` on the day received. |
| **Ignoring Par Level Alerts** | Kitchen 86's popular dishes during Friday dinner rush | Review low-stock warning badges every morning at 11:00 AM. |
| **Sharing Manager PIN** | Unauthorized discounts and refunds applied without audit | Keep your 4-digit supervisor PIN private. Never write it on counter tape. |
