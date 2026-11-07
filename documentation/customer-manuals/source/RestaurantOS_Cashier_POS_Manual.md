# RestaurantOS — Cashier & POS Operator Manual

**Document:** `RestaurantOS_Cashier_POS_Manual.md`  
**Audience:** Cashiers, Billing Operators, Shift Supervisors, Front-of-House Staff  
**Applicable Version:** RestaurantOS Enterprise v1.4.0+  
**Recommended Screen:** Touchscreen Monitor, Desktop PC, or Handheld POS Tablet  

---

## 1. Starting Your Shift: Opening the Cash Register

Before taking your first order of the day, you must open your cash register shift to record the starting cash float.

1. Navigate to the POS screen (`/pos`).
2. If no register is active, a dialog will prompt: **Open Cash Register Shift**.
3. Count the physical cash in the drawer (e.g., small currency notes and coins).
4. Enter the **Starting Cash Float** (e.g., `₹2,000.00`).
5. Click **Open Register Shift**.
6. Your shift is now active and all subsequent cash collections will be tracked against this opening balance.

---

## 2. Navigating the POS Screen

The POS screen is organized into five functional zones designed for touch speed:

```
+---------------------------------------------------------------------------------------+
| TOP BAR: [Branch: IND] [Active Table / Mode] [Register Balance: ₹2,000] [Operator PIN]|
+------------------------------------+--------------------------------------------------+
| CATEGORIES BAR:                    | CART SUMMARY PANEL:                              |
| [All] [Starters] [Biryani] [Curry] | Table: T-01 | Guest Count: 3                     |
+------------------------------------+--------------------------------------------------+
| DISH SELECTION GRID:               | Line Items:                                      |
| +--------------------------------+ | • 1x Murgh Dum Biryani ............... ₹350.00   |
| | Murgh Dum Biryani     ₹350.00  | | • 1x Paneer Butter Masala ........... ₹320.00   |
| | [NON-VEG]             [ADD]    | |    - Extra Butter (+₹20.00)                      |
| +--------------------------------+ |                                                  |
| | Paneer Butter Masala  ₹320.00  | | Subtotal: ........................... ₹690.00   |
| | [VEG]                 [ADD]    | | CGST (2.5%): ......................... ₹17.25   |
| +--------------------------------+ | SGST (2.5%): ......................... ₹17.25   |
| | Garlic Naan            ₹60.00  | | Round-off: ........................... +₹0.50   |
| | [VEG]                 [ADD]    | | GRAND TOTAL: ........................ ₹725.00   |
| +--------------------------------+ +--------------------------------------------------+
|                                    | ACTIONS: [KOT] [Hold] [Discount] [SETTLE BILL]   |
+------------------------------------+--------------------------------------------------+
```

---

## 3. Order Types & Table Selection

### 3.1 Dine-In Orders
1. Tap the **Dine-In** tab.
2. The table selector bar displays all tables for your branch:
   - **Green Badge:** Available table.
   - **Amber Badge:** Occupied / active dining table.
   - **Blue Badge:** Billed / awaiting payment.
3. Tap an available table (e.g., **T-01**).
4. The cart header updates to show `Table: T-01`.

### 3.2 Takeaway Orders
1. Tap the **Takeaway** tab.
2. Table selection is automatically bypassed.
3. Optionally enter the patron's name and mobile phone number for receipt SMS/WhatsApp dispatch.
4. Packaging charges (if configured) will be automatically applied.

### 3.3 Delivery Orders
1. Tap the **Delivery** tab.
2. Enter the customer's delivery address, phone number, and delivery partner reference.

---

## 4. Adding Items, Changing Quantities & Modifiers

### 4.1 Adding Food Items
- **Tap Dish Card:** Tap any item in the grid to add 1 unit to the cart.
- **Search Bar:** Type the first 2 letters of a dish name (e.g., `bi` for Biryani) to filter instantly.
- **Dietary Filter:** Tap **Veg Only** (Green badge) to filter out non-vegetarian items during fasting periods or for vegetarian guests.

### 4.2 Changing Item Quantities
- In the cart panel, tap **`+`** to increment quantity or **`-`** to decrement.
- To remove an item completely before KOT dispatch, tap the **Trash** icon.

### 4.3 Adding Modifiers & Add-ons
1. Tap the item name in the cart to open the **Item Customization** modal.
2. Select portion size if variants exist (e.g., *Half* vs *Full*).
3. Select modifier add-ons:
   - *Extra Butter (+₹20.00)*
   - *Extra Cheese (+₹40.00)*
4. Select cooking preferences:
   - *Mild Spice / Medium Spice / Extra Spicy*
5. Click **Apply Changes**.

### 4.4 Special Cooking Instructions
1. In the item customization modal, locate the **Chef Notes** input box.
2. Type clear instructions (e.g., *"Jain prep, no onion no garlic"*, *"Crispy naan"*, *"Gluten allergy"*).
3. These instructions will be highlighted in yellow/red on the Kitchen Display System (KDS).

---

## 5. Sending Orders to Kitchen (KOT)

1. Once all guest selections are in the cart, click **Send to Kitchen (KOT)**.
2. The system executes the following automatically:
   - Assigns a sequential KOT ticket number (e.g., `KOT-IND-0142`).
   - Automatically routes items to their respective stations (`MAIN_KITCHEN`, `BAR`, `BAKERY`, `BEVERAGE`).
   - The table badge turns **Amber (Occupied)** on all staff terminals.
   - The kitchen preparation stopwatch begins.
3. The cart resets, ready to take orders for the next table.

---

## 6. Holding and Resuming Orders

If a customer steps away or wants to review the menu further:

1. Click **Hold Order**.
2. Enter a brief note or guest name (e.g., *"Mr. Sharma Table 4"*).
3. The cart is cleared so you can serve other guests.
4. To resume, click **Held Orders** in the top toolbar, find the ticket, and click **Resume**.

---

## 7. Applying Discounts & Coupons

*Note: Cashiers can apply pre-configured promotional coupons. Discretionary percentage or rupee discounts require Manager or Supervisor PIN authorization.*

1. In the cart panel, click **Discount / Coupon**.
2. **Promotional Coupon:** Enter an active coupon code (e.g., `WELCOME50` or `FLAT10`) and click **Apply**.
3. **Manual Percentage Discount:**
   - Enter discount percentage (e.g., `10%`).
   - Select reason from dropdown: *Management Courtesy*, *Staff Welfare*, *Customer Dissatisfaction*.
   - If prompted, have your shift supervisor enter their 4-digit PIN.
4. The discount is calculated on the subtotal *before* GST is applied.

---

## 8. Generating the Bill & GST Calculations

1. When guests request the check, select their occupied table (e.g., **T-01**).
2. The current active order loads into the cart.
3. Review the statutory tax breakdown:
   - **Subtotal:** Sum of all food items and modifiers.
   - **Bill Discount:** Deducted from taxable subtotal.
   - **CGST (2.5%):** Central tax.
   - **SGST (2.5%):** State tax.
   - **Round-off:** Statutory rounding to the nearest rupee (+₹0.10 to +₹0.50 or -₹0.10 to -₹0.50).
   - **Grand Total:** Exact integer rupee amount payable.
4. Click **Print Estimate / Pre-Bill** if the guest requests a bill presentation folder before payment.

---

## 9. Accepting Payments

Click the green **Settle Bill** button to open the settlement drawer.

### 9.1 Cash Settlement
1. Select **Cash**.
2. The required amount is pre-filled.
3. In the **Tendered Amount** box, enter the physical cash handed over by the patron (e.g., enter `₹1,000.00` for a ₹725 bill).
4. The screen highlights the **Change to Return** in bold green (e.g., `₹275.00`).
5. Hand the exact change to the patron.
6. Click **Confirm Payment**.
7. The cash drawer kicks open automatically via the printer solenoid.

### 9.2 UPI QR Payment (Strict Verification Workflow)
1. Select **UPI QR**.
2. The screen generates a dynamic UPI QR code encoded with the exact payable amount and your restaurant's merchant VPA.
3. Ask the patron to scan with Google Pay, PhonePe, Paytm, or any BHIM UPI app.
4. **CRITICAL SECURITY REQUIREMENT:**
   > [!WARNING]
   > Do **NOT** tap confirm just because the customer shows their phone screen.
   > 1. Check your counter soundbox or SMS/merchant notification.
   > 2. Ask for the **12-digit Bank UTR / Reference Number** (e.g., `431298012345`).
   > 3. Enter the 12-digit UTR into the verification box.
   > 4. Click **Verify & Settle**.

### 9.3 Card Payment
1. Select **Card / EDC**.
2. Swipe or tap the patron's credit/debit card on your bank EDC terminal.
3. Once the EDC slip prints approval, enter the last 4 digits of the card or the Bank Approval Code.
4. Click **Confirm Payment**.

---

## 10. Split Tender Billing (Multi-Method Payments)

If a group wants to pay part of the bill in Cash and part via UPI:

1. Click **Split Payment**.
2. For Payment 1: Select **Cash**, enter `₹300.00`.
3. The remaining balance automatically displays: `Balance Due: ₹425.00`.
4. For Payment 2: Select **UPI**, amount pre-fills to `₹425.00`.
5. Enter the Bank UTR for the UPI portion.
6. Verify that `Remaining Balance = ₹0.00`.
7. Click **Complete Settlement**.
8. Both payments are recorded in the transaction ledger and printed on the invoice.

---

## 11. Printing & Reprinting Invoices

1. Upon settlement, the 80mm thermal billing printer automatically prints the tax invoice.
2. **Reprinting a Bill:**
   - In the sidebar, click **Main → Orders** (`/orders`).
   - Locate the order by Invoice Number, Table, or Customer Name.
   - Click **Reprint Receipt**.
   - The printer prints a copy with a clear watermark header: `*** DUPLICATE INVOICE ***`.

---

## 12. Voids, Cancellations & Refunds

- **Voiding Items Before KOT:** Simply tap the trash icon in the cart. No supervisor approval needed.
- **Voiding Items After KOT Sent to Kitchen:**
  1. Open the order, select the item, and click **Void Item**.
  2. Select the void reason (*Kitchen delay*, *Wrong punch*, *Guest changed mind*).
  3. Enter Supervisor PIN.
  4. An alert sounds on the KDS crossing out the voided dish.
- **Refunds on Settled Bills:**
  1. Open `/orders`, find the settled invoice, and click **Process Refund**.
  2. Enter refund amount, reason, and Supervisor PIN.
  3. An immutable audit record is logged.

---

## 13. End of Shift: Closing Register & Cash Reconciliation

At the end of your shift:

1. Click **Close Register Shift** in the top navigation bar.
2. The screen shows **Expected Cash in Drawer**:
   $$\text{Starting Float} + \text{Total Cash Collected} - \text{Cash Refunds/Payouts}$$
3. Count all physical cash in your drawer.
4. Enter the **Actual Cash Counted**.
5. The system calculates the **Variance**:
   - `₹0.00`: Perfect match.
   - Negative (Red): Shortage.
   - Positive (Blue): Excess.
6. Enter shift handover notes.
7. Click **Close Register & Print Summary**.
8. Hand the cash drawer and the printed shift summary to the incoming cashier or manager.

---

## 14. Sample Order Calculation Walkthrough

Here is a realistic example of how RestaurantOS computes an order:

```
Table: T-04 | Guests: 2 | Order Type: DINE-IN

Item 1: 1x Paneer Butter Masala (Full) ............ ₹320.00
Item 2: 2x Butter Naan @ ₹50 each ................. ₹100.00
Item 3: 1x Fresh Lime Soda (Sweet) ................  ₹90.00
------------------------------------------------------------
Item Subtotal: .................................... ₹510.00
Bill Discount (10% Courtesy Discount): ............ -₹51.00
------------------------------------------------------------
Net Taxable Amount: ............................... ₹459.00
CGST @ 2.5%: ......................................  ₹11.48
SGST @ 2.5%: ......................................  ₹11.48
------------------------------------------------------------
Subtotal with Tax: ................................ ₹481.96
Statutory Round-off: ..............................  +₹0.04
============================================================
TOTAL PAYABLE: .................................... ₹482.00
============================================================
Payment: Split Tender
  • Cash Tendered: ................................ ₹200.00
  • UPI (Bank UTR #431298012345): ................. ₹282.00
  • Balance Remaining: ............................   ₹0.00
Status: PAID | Invoice Issued: IND/2026-27/00295
```

---

## 15. Cashier Shift Checklist

- [ ] Log in with your personal 4-digit PIN.
- [ ] Count starting float and open register shift.
- [ ] Ensure 80mm thermal printer has adequate paper roll.
- [ ] Verify test print and cash drawer solenoid kick.
- [ ] Confirm table selection before punching items.
- [ ] Double-check cooking notes and allergy warnings with guests.
- [ ] Verify all UPI transactions via Soundbox or 12-digit Bank UTR before completing bill.
- [ ] Count cash carefully and print closing summary at end of shift.
