# RestaurantOS — Operations Manual & Standard Operating Procedures (SOP)

This manual provides instructions for restaurant managers, head cashiers, waitstaff, and kitchen captains operating RestaurantOS daily.

---

## 1. Morning Shift Opening SOP

### Step 1: Cash Register Till Opening
1. Go to **Expenses -> Cash Register**.
2. Click **Open New Register Shift**.
3. Count the physical cash float in the drawer (coins, ₹10, ₹20, ₹50, ₹100, ₹500 notes).
4. Enter the **Opening Float Amount** (e.g. ₹2,000.00).
5. Enter Cashier PIN and submit. The till shift is now open and system-tracked.

### Step 2: Menu & Inventory Check
1. Go to **Menu**.
2. Review dish availability based on morning prep and raw material stock.
3. Toggle dishes that are out-of-stock (86'd) to **Unavailable**; this immediately greys them out on POS terminals to prevent waitstaff from ringing unavailable items.

---

## 2. Point of Sale & Billing Workflow

### Order Types
- **Dine-In**: Select table from floor plan (e.g. `T-01`). Order links to table session.
- **Takeaway / Direct Counter**: Direct counter sale; packaging charges auto-applied.
- **Delivery**: Captures delivery address and customer contact; delivery fee auto-calculated.
- **Pickup**: Pre-order pickup by customer.

### Creating an Order
1. Search dish by name or enter short code (e.g. `PBM` for Paneer Butter Masala) or scan item barcode with USB scanner.
2. Select portion variants (Half, Full, Large) and optional add-ons or spice level modifiers.
3. Enter cooking instructions for the kitchen if required (e.g. "Less spicy, no coriander").
4. Click **Send KOT** to dispatch tickets to kitchen stations.

### Table Actions
- **Hold Order**: Pauses the current order to ring up another customer without losing cart state.
- **Resume Order**: Resumes any held order with full item selections intact.
- **Transfer Table**: Moves an active table order to another table with manager PIN override.
- **Split Bill**: Divides order items across multiple checks for split guest groups.

---

## 3. Payment Processing & GST Compliance

### Payment Methods
- **Cash**: Enter tendered cash. The POS computes exact customer change due and triggers cash drawer opening.
- **UPI QR**:
  - Displays dynamic UPI QR code encoded with restaurant VPA, invoice number, and exact payable amount down to the rupee.
  - **Strict Verification Rule**: Generating a QR code is NEVER proof of payment. Cashier must either inspect the customer's phone success screen or listen to soundbox audio confirmation, then enter the 12-digit bank UTR or tick the verification confirmation checkbox.
- **Credit / Debit Card**: Enter EDC POS slip approval / transaction reference.
- **Split Tender**: Combine cash and UPI amounts for total payment.

### Discounts & Cancellations
- **Discounts**: Item-level and bill-level discounts above 10% require manager 4-digit PIN authorization and a mandatory audit reason.
- **Order Cancellation**: Voiding an item or cancelling an open order requires supervisor PIN and logs an entry to the immutable `AuditLog`.

---

## 4. Kitchen Display System (KDS) Operations

Kitchen display screens update in real time without manual page refreshes:
1. **New Ticket**: Card flashes yellow with Web Audio chime sound alert.
2. **Accept**: Cook clicks **Accept** (timer starts tracking preparation time).
3. **Preparing**: Cook updates state to **Preparing** once cooking starts.
4. **Ready**: Cook marks **Ready** when dish is plated; expo station receives visual notification for runner pickup.
5. **Served**: Runner marks ticket **Served** once delivered to customer table.

### Urgency Color Tiers
- **Normal (Green)**: Under 10 minutes elapsed.
- **Warning (Orange)**: 10–20 minutes elapsed.
- **Critical Rush (Red)**: Over 20 minutes elapsed. Delayed orders are highlighted for priority intervention.

---

## 5. Offline Operation SOP (Broadband Interruptions)

If the restaurant's broadband connection is lost:
1. The POS displays an **Offline (X Queued)** status badge.
2. **Do not stop billing!** Cashiers continue adding items, modifying orders, applying discounts, and settling cash and card payments as usual.
3. Orders are saved safely to persistent local browser storage with unique client idempotency keys (`offlineSyncId`).
4. Tax invoices and receipts continue printing locally via ESC/POS printers.
5. When the internet connection restores, RestaurantOS automatically synchronizes all pending orders to the central server with exponential backoff and zero duplication. Cashier can also click **Sync Now** to reconcile immediately.

---

## 6. End-of-Day Shift Closing & Reconciliation

1. Go to **Expenses -> Cash Register**.
2. Click **Close Register Shift**.
3. Count all physical cash in the till:
   - System displays **Expected Cash** = Opening Float + Cash Sales - Cash Drops - Cash Refunds.
   - Enter **Actual Physical Cash Count**.
   - If there is any cash variance (surplus or shortage), enter a mandatory explanation note.
4. Record cash drops (cash transferred to main restaurant safe deposit).
5. Print the **Shift End Z-Report**.
6. Export the daily **GSTR-1 Tax Register** and **P&L Summary** from **Reports** in Excel/CSV for the accounts team.
