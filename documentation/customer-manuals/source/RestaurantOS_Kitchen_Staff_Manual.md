# RestaurantOS — Kitchen Staff & KDS Operator Manual

**Document:** `RestaurantOS_Kitchen_Staff_Manual.md`  
**Audience:** Line Cooks, Kitchen Display Operators, Head Chefs, Baristas, Bartenders  
**Applicable Version:** RestaurantOS Enterprise v1.4.0+  
**Recommended Hardware:** Kitchen Wall Display, Water-Resistant Touch Tablet, or Counter KDS Monitor  

---

## 1. Kitchen Station Login & Setup

1. Turn on the kitchen display tablet or monitor.
2. Open the browser and navigate to: `http://localhost:3000/kitchen`.
3. Enter your kitchen staff PIN or login credentials.
4. Set the screen to **Full Screen Mode** (press `F11` on desktop or tap browser full screen).
5. Ensure the tablet volume is set to at least 70% so incoming ticket audio chimes are clearly audible above kitchen noise.

---

## 2. Navigating the Kitchen Display System (KDS)

The KDS screen arranges incoming orders as dynamic digital ticket cards in chronological order (oldest ticket first):

```
+---------------------------------------------------------------------------------------+
| TOP BAR: [RestaurantOS KDS] [Station: MAIN_KITCHEN] [Active Tickets: 4] [Sound: ON]  |
| Station Filter: [ALL STATIONS] [MAIN KITCHEN] [BAR] [BAKERY] [BEVERAGE]               |
+---------------------------------------------------------------------------------------+
| TICKET 1 (08m ago) [NORMAL]        | TICKET 2 (14m ago) [WARNING]                     |
| #KOT-0142 | Table: T-01            | #KOT-0143 | Takeaway #104                        |
| Server: Vikram | Dine-In           | Server: Pooja | Counter Parcel                   |
+------------------------------------+--------------------------------------------------+
| Items to Prepare:                  | Items to Prepare:                                |
| • 1x Murgh Dum Biryani (Full)      | • 2x Butter Chicken (Half)                       |
| • 1x Paneer Butter Masala          | • 4x Butter Naan                                 |
|    [MODIFIER: Extra Butter +₹20]   |                                                  |
|    [NOTE: Jain prep, no onion!]    | [STATUS: PREPARING (Cooking 6m)]                 |
|                                    |                                                  |
| [ACTION: ACCEPT ORDER]             | [ACTION: MARK READY]                             |
+------------------------------------+--------------------------------------------------+
```

---

## 3. Understanding a KDS Ticket Card

Each card contains essential preparation details:

1. **Header Block:**
   - **KOT Number:** Unique ticket identifier (e.g., `#KOT-0142`).
   - **Table Number / Order Type:** Table `T-01` for Dine-in, or `Takeaway #104`.
   - **Server Name:** The waiter or cashier who punched the order.
   - **Stopwatch Elapsed Timer:** Shows exactly how many minutes have passed since the order was punched.
2. **Items List:**
   - **Large Quantity Indicators:** Big bold numbers (e.g., **`2x`**, **`4x`**) to prevent cooking count errors during rush hours.
   - **Variant Portion:** Clearly specifies *Full* or *Half*.
   - **Modifiers (Blue Tag):** Extra toppings or custom preparations (e.g., `+Extra Cheese`).
   - **Chef Cooking Notes (Amber/Red Tag):** High-priority preparation instructions (e.g., `★ Jain prep, no onion no garlic`, `★ Extra crispy naan`).
3. **Action Button:**
   - Primary touch button to advance the ticket through its preparation lifecycle.

---

## 4. Audio & Visual Rush Alerts

RestaurantOS keeps kitchen staff informed without requiring them to stare continuously at the screen:

### 4.1 Audio Chimes
- **Single Bell Chime:** Rings when a new KOT ticket arrives from POS, Waiter App, or Table QR self-ordering.
- **Double Warning Chime:** Sounds if an order has been cancelled or an item was voided by a supervisor.

### 4.2 Rush Hour Stopwatch Color Codes
- 🟢 **Green / Dark Slate (`0 – 10 minutes`): Normal**  
  Order is fresh. Kitchen has adequate time for standard prep.
- 🟡 **Amber Pulse (`10 – 20 minutes`): Warning**  
  Order is approaching expected kitchen turnaround time. Expedite cooking.
- 🔴 **Flashing Red Alert (`> 20 minutes`): Critical Rush**  
  Order is delayed! Head chef must prioritize this ticket immediately to prevent customer dissatisfaction.

---

## 5. Order Status Lifecycle: Step-by-Step

Every kitchen ticket progresses through four standardized lifecycle states:

```
[ NEW ] --------> [ ACCEPTED ] --------> [ PREPARING ] --------> [ READY ]
(Unacknowledged)  (Cook has seen it)   (On the burner/pan)      (Ready to serve)
```

1. **Step 1: Accept the Order (`NEW` → `ACCEPTED`)**
   - When a new order card appears, tap **Accept Order**.
   - This notifies waitstaff that the kitchen has seen the ticket and started staging ingredients.
2. **Step 2: Start Cooking (`ACCEPTED` → `PREPARING`)**
   - When line cooks place the dish on the stove, tandoor, or wok, tap **Start Cooking**.
   - The card status turns to *PREPARING* and a live cooking stopwatch begins.
3. **Step 3: Mark Ready to Serve (`PREPARING` → `READY`)**
   - When plating is complete, garnish added, and the dish is placed on the pickup counter, tap **Mark Ready**.
   - The ticket disappears from the active cooking grid and moves to the completed tray.
   - An instant visual and audio notification is sent to the **Waiter App** and POS screen notifying servers that Table `T-01` is ready for pickup.

---

## 6. Station-Based Routing

In high-volume restaurants, different stations have dedicated KDS screens:

1. **Main Kitchen (`MAIN_KITCHEN`):** Receives hot appetizers, gravies, curries, tandoor, and rice dishes.
2. **Bar & Beverage (`BAR` & `BEVERAGE`):** Receives mocktails, cocktails, soft drinks, juices, shakes, and fresh lime sodas.
3. **Bakery & Desserts (`BAKERY`):** Receives cakes, ice creams, hot desserts, and baked goods.

### Switching Views:
- At the top of the KDS screen, tap the station pills:
  - Tap **Bar** to only view drink tickets.
  - Tap **All Stations** (used by Head Chef or Expediter) to view the entire floor's progress.

---

## 7. Handling Order Changes, Add-ons & Voids

- **Additional Items Added to an Active Table:**
  - If a guest orders extra breads or drinks, a **Supplementary KOT** arrives (e.g., `#KOT-0142-B`).
  - It clearly indicates: `SUPPLEMENTARY / ADD-ON` so cooks know not to re-cook the original items.
- **Voided / Cancelled Items:**
  - If a manager voids a dish, the ticket card plays an alert chime.
  - The voided dish is displayed with a **heavy strikethrough and a red VOID badge** (e.g., `~~1x Murgh Biryani~~ [VOIDED: Guest changed mind]`).
  - Do **not** prepare voided items!

---

## 8. Physical Kitchen Ticket Reprinting

If water, oil, or steam damages a physical paper slip printed at the kitchen station:

1. Locate the ticket card on the KDS screen.
2. Tap the small **Printer** icon in the top right corner of the card.
3. Tap **Reprint Slip**.
4. The station's thermal printer immediately prints a fresh copy marked `REPRINT`.

---

## 9. End of Shift Kitchen Routine

At closing:

1. Check the KDS screen to ensure **Active Tickets = 0**.
2. If any test or mock tickets remain open, mark them as **Completed**.
3. Wipe down the touch tablet with a dry microfiber cloth (ensure no degreaser gets into ports).
4. Tap **Log Out** to end your kitchen session.
