# RestaurantOS — Troubleshooting & Quick Reference Guide

**Document:** `RestaurantOS_Troubleshooting_Guide.md`  
**Audience:** All Restaurant Employees (Owners, Managers, Cashiers, Waiters, Kitchen Staff)  
**Applicable Version:** RestaurantOS Enterprise v1.4.0+  
**Format:** Symptom → Root Cause → Step-by-Step Fix → Escalation  

---

## ⚠️ Important Safety Rules Before You Begin

> [!CAUTION]
> 1. **NEVER** delete the database file (`dev.db` or `.db` files) or run arbitrary SQL deletion commands.
> 2. **NEVER** ask a customer to repeat a UPI payment before verifying their banking app transaction status or your bank soundbox/statement.
> 3. **NEVER** share supervisor PINs on counter sticky notes.

---

## Issue 1: Cannot Log In / "Invalid email or password"

### 1. What You See
A red error banner at the top of the login screen: *"Invalid email or password"*, or the Sign In button does nothing.

### 2. Possible Reasons
- Typo in email address (e.g., extra space at the end).
- Caps Lock is turned on while entering the password.
- Account has been deactivated or suspended by the restaurant owner.
- Local server service has stopped running.

### 3. Step-by-Step Solution
1. Verify that **Caps Lock** is turned off on your keyboard.
2. Carefully re-type your email address in lowercase (e.g., `cashier@bawarchiroyale.com`).
3. If using quick POS PIN login, ensure you are entering the correct 4-digit numeric PIN assigned to your staff profile.
4. Try refreshing the browser page (`Ctrl + F5` on Windows or `Cmd + Shift + R` on Mac).

### 4. When to Escalate
If credentials still fail, contact your **Restaurant General Manager**. The manager can open **Customers & Staff → Staff** (`/staff`), check if your account is active, and reset your password or PIN in 10 seconds.

---

## Issue 2: Forgot Password or Staff POS PIN

### 1. What You See
Employee is locked out and cannot remember their 4-digit quick PIN or account password.

### 2. Possible Reasons
- User forgot PIN after shift rotation or PIN change.

### 3. Step-by-Step Solution
1. Do **not** attempt multiple random password guesses (this will lock the account for 15 minutes).
2. Ask your **Shift Supervisor or Manager** to log into their account.
3. The Manager navigates to **Customers & Staff → Staff** (`/staff`).
4. Finds the employee's name and clicks **Edit**.
5. Types a new 4-digit PIN in the **Quick POS PIN** box (e.g., `4567`).
6. Clicks **Save Changes**.
7. The employee can now immediately sign in with the new PIN.

---

## Issue 3: POS Screen Not Loading / Blank White Page

### 1. What You See
Opening `/pos` displays a blank white screen, or an infinite loading spinner.

### 2. Possible Reasons
- Outdated browser cache after a system update.
- Local server process has not started yet.

### 3. Step-by-Step Solution
1. **Force Refresh Browser Cache:** Press `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac).
2. **Check Server Status:** Open a new tab and check if `http://localhost:3000` is accessible.
3. **If running local on-premise server:** Ensure the Node.js terminal or service is running (`npm run start`).
4. **PWA Standalone App:** Close the standalone window completely, re-open Google Chrome, and launch RestaurantOS again.

### 4. When to Escalate
If the page remains white and browser console shows network errors, notify your IT lead or RestaurantOS support.

---

## Issue 4: Order Not Appearing in the Kitchen Display (KDS)

### 1. What You See
Cashier or waiter punched an order on Table `T-02`, but the kitchen staff says no ticket appears on their screen.

### 2. Possible Reasons
- The order was saved as a **Draft** or **Held Order** and was not sent to the kitchen.
- The KDS screen is filtered to a different station (e.g., the screen is set to *Bar* and the order contains only *Tandoori Chicken*).
- Kitchen tablet lost Wi-Fi connection.

### 3. Step-by-Step Solution
1. **On POS / Waiter App:** Check if you clicked the green **Send to Kitchen (KOT)** button. If you only clicked *Hold Order*, open *Held Orders* and dispatch the KOT.
2. **On Kitchen Screen (`/kitchen`):** Look at the top station filter pills. Tap **ALL STATIONS** to ensure you are not viewing an isolated station filter.
3. **Check Kitchen Network:** Check the Wi-Fi icon on the kitchen tablet. If disconnected, reconnect to the restaurant's local Wi-Fi.

---

## Issue 5: Printer Not Printing Thermal Receipts

### 1. What You See
Bill is settled on screen, but the 80mm or 58mm thermal printer remains silent and does not produce a paper receipt.

### 2. Possible Reasons
- Thermal paper roll is upside down (very common).
- Paper roll is empty (red line on paper or empty hopper).
- Printer power is off, or USB / LAN cable is loose.
- Windows Print Spooler service is paused.

### 3. Step-by-Step Solution
1. **Check Power & Paper:**
   - Ensure the printer power light is solid blue/green.
   - Open the printer lid. Ensure thermal paper is loaded such that paper feeds from the **bottom** and the smooth heat-sensitive side faces the thermal head.
   - If paper was inserted backwards, it will feed blank white paper without any ink!
2. **Check Cables:**
   - Verify the USB cable is firmly plugged into the POS terminal, or the Ethernet cable has flashing green/amber link lights.
3. **Execute Test Print:**
   - In RestaurantOS, go to **Settings → Printers** and click **Test Print**.
4. **Reprint Receipt:**
   - Once the printer is ready, go to **Main → Orders** (`/orders`), find the invoice, and click **Reprint Receipt**.

---

## Issue 6: Incorrect Bill Amount / Missing Discount

### 1. What You See
The bill total is higher or lower than expected, or a discount is not reflecting.

### 2. Possible Reasons
- Extra modifiers were selected (e.g., *Extra Butter +₹20*).
- Packaging charge or delivery fee was added automatically for takeaway orders.
- Discount reason was not selected, causing the discount input to be ignored.
- GST rate mismatch (e.g., item set to 18% instead of standard F&B 5%).

### 3. Step-by-Step Solution
1. Inspect the cart breakdown line by line. Modifiers appear indented in blue under each dish.
2. Check the order type: Takeaway parcels may carry statutory container charges.
3. If applying a discount, enter the percentage AND select a valid reason from the dropdown, then have the manager authorize the discount PIN.
4. Verify statutory rounding: RestaurantOS automatically applies standard 50-paise round-off (+₹0.10 to +₹0.50) to produce clean rupee totals.

---

## Issue 7: UPI Payment Not Confirmed / Customer Says Money Left Account

### 1. What You See
Patron scanned the counter UPI QR code and shows a green checkmark screen on their mobile phone, but the cashier did not receive soundbox confirmation.

### 2. Possible Reasons
- Customer showed a screenshot of a past payment or a fake payment simulator app.
- Bank network delay between customer's bank and restaurant merchant account.

### 3. Step-by-Step Solution
1. **DO NOT** blindly complete the bill without verification.
2. Check your restaurant counter **Soundbox** (e.g., Paytm / PhonePe / BharatPe soundbox).
3. If no soundbox announcement occurred, ask the patron:
   > *"Sir/Madam, could you please tap on the transaction in your Google Pay / PhonePe so I can note the 12-digit UPI UTR number?"*
4. Locate the **12-digit UTR** (e.g., `431298012345`).
5. Check your merchant business app on the counter mobile phone. If the UTR appears in your incoming transaction list, type the 12-digit UTR into RestaurantOS and click **Verify & Settle**.
6. If the transaction does not appear anywhere in merchant records within 2 minutes:
   - Ask the customer to pay via Cash or Card.
   - Note their name and phone number.
   - Inform them that if their bank auto-debited in error, RBI UPI regulations guarantee automatic refund to their bank account within 24 hours.

---

## Issue 8: Internet Disconnected / Network Drop

### 1. What You See
A banner at the top of the screen displays: `⚠️ Offline Mode — Internet Disconnected. Billing continues locally.`

### 2. What Happens
RestaurantOS is an **offline-first** architecture. The POS terminals, cart calculation, receipt printing, and local order numbering continue functioning normally without internet.

### 3. Step-by-Step Solution
1. **Do not panic.** Continue serving dining guests and counter orders.
2. Orders will be saved into the secure local persistent queue (IndexedDB / SQLite).
3. Check your router: restart your in-store Wi-Fi router if optical/fiber light is red.
4. When internet connectivity returns, the top banner will turn green: `🟢 Online — Synchronizing Orders...`
5. All offline orders and inventory deductions synchronize with the central cloud server automatically.

---

## Issue 9: Offline Orders Not Synchronizing Upon Reconnection

### 1. What You See
Internet has returned, but offline orders still show as "Pending Sync" in the status bar.

### 2. Step-by-Step Solution
1. Navigate to **Administration → Sync Monitor** (`/sync-monitor`).
2. Review the sync queue: you will see the list of pending offline orders.
3. Click the blue **Trigger Sync Now** button.
4. The system will dispatch the operations sequentially with exponential backoff handling.
5. Once complete, queue size will show `0 pending operations`.

---

## Issue 10: Duplicate Order or Double Billing Concern

### 1. What You See
Cashier pressed "Settle Bill" twice during a slow network response and worries the customer was charged twice.

### 2. Why RestaurantOS Protects You
- Every offline and online order is generated with a unique, cryptographically random **UUID Idempotency Key**.
- Even if a network glitch re-sends the same payment payload twice, the server detects the identical key, returns `ALREADY_SYNCED`, and **strictly forbids** duplicate invoice generation or double inventory deduction.
- **Verification:** Open **Main → Orders** (`/orders`). Search by table or customer name. You will observe that only one unique statutory invoice was created.

---

## Issue 11: Menu Item Not Visible on POS or Waiter App

### 1. What You See
A dish exists in the menu, but waitstaff cannot find it on their touch screen.

### 2. Possible Reasons
- Item was toggled "Out of Stock" (86'd) during previous shift.
- Item is not assigned to any category.
- Item is disabled specifically for this branch under multi-branch settings.

### 3. Step-by-Step Solution
1. Go to **Catalog & Inventory → Menu** (`/menu`).
2. Search for the missing dish name.
3. Ensure the **Is Available** toggle is turned **ON** (Green).
4. Verify that a valid category (e.g., *Main Course*) is selected.
5. Click **Save**. The dish will reappear on all ordering terminals within 5 seconds.

---

## Issue 12: Employee Locked Out / "Access Denied (HTTP 403)"

### 1. What You See
When clicking a navigation link (e.g., *Reports* or *Settings*), the screen shows: `403 Forbidden: Insufficient permissions for your role.`

### 2. Why This Happens
RestaurantOS enforces strict Role-Based Access Control (RBAC). Cashiers and Waiters are deliberately restricted from viewing financial Profit & Loss reports or changing restaurant GSTIN settings.

### 3. Step-by-Step Solution
1. If the employee genuinely requires access to that screen as part of their job duties:
2. The Restaurant Owner or General Manager logs into `/staff`.
3. Edits the employee's role from *Cashier* to *Manager* or *Administrator*.
4. The employee logs out and logs back in. Access is immediately granted.

---

## Quick Reference Escalation Contacts

| Role | Name | Phone / WhatsApp | Escalation Scope |
|---|---|---|---|
| **Shift Supervisor** | On-Duty Manager | Store Intercom Ext 1 | Bill voids, discounts, PIN reset, cash float |
| **General Manager** | Store Operations Lead | Store Intercom Ext 9 | Staff roles, supplier issues, tax config |
| **Hardware Vendor** | Local POS Technician | *(Record local number)* | Physical printer repairs, cash drawer wiring |
| **RestaurantOS Support** | Official Helpdesk | `support@restaurantos.io` | Software bugs, cloud sync, plan upgrades |
