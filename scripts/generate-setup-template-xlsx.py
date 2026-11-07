#!/usr/bin/env python3
"""
RestaurantOS — Restaurant Setup Template XLSX Generator
Generates a 10-sheet professional Excel configuration template using standard Python library.
Outputs to:
  - release/customer-onboarding/RestaurantOS_Restaurant_Setup_Template.xlsx
  - apps/web/public/downloads/customer-onboarding/RestaurantOS_Restaurant_Setup_Template.xlsx
"""

import os
import zipfile
import xml.etree.ElementTree as ET

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
RELEASE_FILE = os.path.join(BASE_DIR, "release", "customer-onboarding", "RestaurantOS_Restaurant_Setup_Template.xlsx")
PUBLIC_FILE = os.path.join(BASE_DIR, "apps", "web", "public", "downloads", "customer-onboarding", "RestaurantOS_Restaurant_Setup_Template.xlsx")

sheets_data = [
    {
        "name": "1. Restaurant Info",
        "headers": ["Field Name", "Sample / Format", "Customer Input (Enter Here)", "Notes / Instructions"],
        "rows": [
            ["Legal Business Name", "Bawarchi Royale Hospitality Pvt Ltd", "", "Required for statutory invoices"],
            ["Brand / Trade Name", "Bawarchi Royale", "", "Displayed on customer receipts"],
            ["Business Entity Type", "Restaurant", "", "Restaurant / Cafe / Cloud Kitchen / Bakery / Multi-Chain"],
            ["Owner Full Name", "Vikram Malhotra", "", "Primary account owner"],
            ["Contact Phone Number", "+91 98765 43210", "", "For admin notifications & OTPs"],
            ["Primary Business Email", "owner@bawarchiroyale.com", "", "Login email for owner dashboard"],
            ["Registered Street Address", "12th Main Road, HAL 2nd Stage, Indiranagar", "", "Printed on tax invoice header"],
            ["City", "Bengaluru", "", ""],
            ["State", "Karnataka", "", "Required for State GST determination"],
            ["Postal PIN Code", "560038", "", ""],
            ["Base Currency", "INR", "", "Base billing currency (INR ₹)"],
            ["FSSAI License Number", "11223344000123", "", "14-digit FSSAI license (Statutory mandate)"],
            ["Official Website / Social", "https://bawarchiroyale.com", "", "Printed on bottom of customer receipts"],
        ]
    },
    {
        "name": "2. Branches",
        "headers": ["Branch Name", "Branch Code", "Address", "City", "State", "PIN", "Phone", "Assigned Manager", "Default Channels"],
        "rows": [
            ["Indiranagar Flagship", "IND", "12th Main Road, Indiranagar", "Bengaluru", "Karnataka", "560038", "+91 98765 43211", "Rohan Verma", "Dine-In, Takeaway, Delivery"],
            ["Koramangala Hub", "KOR", "4th Block, 80 Feet Road", "Bengaluru", "Karnataka", "560034", "+91 98765 43212", "Ananya Sharma", "Dine-In, Takeaway"],
            ["Whitefield Express", "WHF", "ITPL Main Road", "Bengaluru", "Karnataka", "560066", "+91 98765 43213", "Karthik Nair", "Takeaway, Delivery"],
        ]
    },
    {
        "name": "3. Dining Tables",
        "headers": ["Branch Code", "Table Number", "Section / Area", "Seating Capacity", "Priority Rank", "Has QR Tent Card?"],
        "rows": [
            ["IND", "T-01", "Ground Floor AC", "4", "1", "YES"],
            ["IND", "T-02", "Ground Floor AC", "4", "2", "YES"],
            ["IND", "T-03", "Ground Floor AC", "2", "3", "YES"],
            ["IND", "T-04", "Rooftop Garden", "6", "4", "YES"],
            ["IND", "T-05", "Rooftop Garden", "8", "5", "YES"],
            ["IND", "BAR-01", "Bar Lounge", "2", "6", "NO"],
            ["KOR", "K-01", "Main Dining", "4", "1", "YES"],
            ["KOR", "K-02", "Main Dining", "4", "2", "YES"],
        ]
    },
    {
        "name": "4. Menu Categories",
        "headers": ["Category Name", "Short Code", "Display Sequence", "Default Kitchen Station", "Is Active (YES/NO)"],
        "rows": [
            ["Starters & Appetizers", "START", "1", "MAIN_KITCHEN", "YES"],
            ["Tandoor & Kebabs", "TAND", "2", "MAIN_KITCHEN", "YES"],
            ["Main Course Curries", "CURRY", "3", "MAIN_KITCHEN", "YES"],
            ["Biryani & Rice", "RICE", "4", "MAIN_KITCHEN", "YES"],
            ["Indian Breads", "BREAD", "5", "MAIN_KITCHEN", "YES"],
            ["Beverages & Mocktails", "BEV", "6", "BEVERAGE", "YES"],
            ["Bar & Cocktails", "BAR", "7", "BAR", "YES"],
            ["Desserts & Sweets", "DES", "8", "BAKERY", "YES"],
        ]
    },
    {
        "name": "5. Menu Items & Prices",
        "headers": ["Category Name", "Dish Name", "Dietary Type", "Base Price (₹)", "Tax Mode", "Kitchen Station", "Description"],
        "rows": [
            ["Biryani & Rice", "Murgh Dum Biryani", "NON_VEG", "350.00", "Tax-Exclusive", "MAIN_KITCHEN", "Slow cooked saffron basmati rice with marinated chicken"],
            ["Main Course Curries", "Paneer Butter Masala", "VEG", "320.00", "Tax-Exclusive", "MAIN_KITCHEN", "Cottage cheese cubes simmered in rich butter tomato gravy"],
            ["Main Course Curries", "Dal Makhani Royale", "VEG", "260.00", "Tax-Exclusive", "MAIN_KITCHEN", "Black lentils slow cooked overnight with churned butter"],
            ["Tandoor & Kebabs", "Tandoori Chicken", "NON_VEG", "390.00", "Tax-Exclusive", "MAIN_KITCHEN", "Charcoal roasted spring chicken marinated in Kashmiri spices"],
            ["Indian Breads", "Garlic Butter Naan", "VEG", "65.00", "Tax-Exclusive", "MAIN_KITCHEN", "Clay oven flatbread infused with roasted garlic and butter"],
            ["Indian Breads", "Butter Roti", "VEG", "35.00", "Tax-Exclusive", "MAIN_KITCHEN", "Whole wheat tandoori roti with fresh butter"],
            ["Beverages & Mocktails", "Fresh Lime Soda", "VEG", "90.00", "Tax-Exclusive", "BEVERAGE", "Fresh squeezed lime with soda (Sweet, Salt, or Mixed)"],
            ["Beverages & Mocktails", "Mango Lassi", "VEG", "120.00", "Tax-Exclusive", "BEVERAGE", "Chilled whipped yogurt with Alphonso mango pulp"],
            ["Desserts & Sweets", "Gulab Jamun (2 Pcs)", "VEG", "110.00", "Tax-Exclusive", "BAKERY", "Warm milk solids fried and steeped in saffron rose syrup"],
        ]
    },
    {
        "name": "6. Variants & Modifiers",
        "headers": ["Parent Dish Name", "Group Type", "Option Name", "Additional Price (₹)", "Is Default?"],
        "rows": [
            ["Murgh Dum Biryani", "PORTION", "Half Portion (1 Pc)", "-120.00", "NO"],
            ["Murgh Dum Biryani", "PORTION", "Full Portion (2 Pcs)", "0.00", "YES"],
            ["Paneer Butter Masala", "MODIFIER", "Extra Butter", "20.00", "NO"],
            ["Paneer Butter Masala", "MODIFIER", "Extra Cheese", "40.00", "NO"],
            ["Paneer Butter Masala", "SPICE", "Mild (Low Spice)", "0.00", "NO"],
            ["Paneer Butter Masala", "SPICE", "Medium Regular", "0.00", "YES"],
            ["Paneer Butter Masala", "SPICE", "Extra Spicy", "0.00", "NO"],
            ["Fresh Lime Soda", "PREPARATION", "Sweet", "0.00", "NO"],
            ["Fresh Lime Soda", "PREPARATION", "Salted", "0.00", "NO"],
            ["Fresh Lime Soda", "PREPARATION", "Sweet & Salt Mixed", "0.00", "YES"],
        ]
    },
    {
        "name": "7. GST & Tax Setup",
        "headers": ["Branch Code", "Regime", "State Code", "GSTIN Number", "CGST Rate (%)", "SGST Rate (%)", "Invoice Prefix", "Start Serial"],
        "rows": [
            ["IND", "Regular F&B", "29 (Karnataka)", "29AABCU9603R1ZM", "2.5%", "2.5%", "IND/2026-27/", "1"],
            ["KOR", "Regular F&B", "29 (Karnataka)", "29AABCU9603R1ZM", "2.5%", "2.5%", "KOR/2026-27/", "1"],
            ["WHF", "Regular F&B", "29 (Karnataka)", "29AABCU9603R1ZM", "2.5%", "2.5%", "WHF/2026-27/", "1"],
        ]
    },
    {
        "name": "8. Staff & Roles",
        "headers": ["Full Name", "Login Email", "4-Digit POS PIN", "Assigned Role", "Branch Code", "Contact Phone"],
        "rows": [
            ["Rohan Verma", "rohan.manager@bawarchiroyale.com", "1122", "MANAGER", "IND", "+91 98765 00001"],
            ["Pooja Hegde", "pooja.cashier@bawarchiroyale.com", "3344", "CASHIER", "IND", "+91 98765 00002"],
            ["Suresh Kumar", "suresh.waiter@bawarchiroyale.com", "5566", "WAITER", "IND", "+91 98765 00003"],
            ["Chef Ram Singh", "ram.kitchen@bawarchiroyale.com", "7788", "KITCHEN_STAFF", "IND", "+91 98765 00004"],
            ["Deepak Gupta", "deepak.inv@bawarchiroyale.com", "9900", "INVENTORY_MANAGER", "IND", "+91 98765 00005"],
            ["Sunita Rao", "sunita.acct@bawarchiroyale.com", "1357", "ACCOUNTANT", "ALL", "+91 98765 00006"],
        ]
    },
    {
        "name": "9. Payment Methods",
        "headers": ["Method Name", "Method Type", "Merchant UPI VPA / Account", "Bank / Provider Name", "Auto Cash Drawer Kick?", "Is Enabled?"],
        "rows": [
            ["Cash Counter", "CASH", "Cash Drawer Float", "In-Store Cash Drawer", "YES", "YES"],
            ["Dynamic UPI QR", "UPI", "bawarchiroyale@icici", "ICICI Bank Bharat QR", "NO", "YES"],
            ["Counter EDC Terminal", "CARD", "Terminal ID #8849201", "HDFC Bank Merchant Services", "NO", "YES"],
            ["Online Customer QR", "GATEWAY", "rzp_live_xxxxxxxxxxxx", "Razorpay Payment Gateway", "NO", "OPTIONAL"],
        ]
    },
    {
        "name": "10. Printer Setup",
        "headers": ["Printer Purpose", "Location / Station", "Connection Type", "IP Address / Port", "USB Spooler Name", "Paper Width"],
        "rows": [
            ["Front Billing Receipt", "Main Cashier Counter", "USB Spooler", "N/A", "POS-80-Thermal", "80mm (48 Cols)"],
            ["Main Kitchen KOT", "Hot Kitchen Counter", "Network TCP/IP", "192.168.1.150:9100", "N/A", "80mm (48 Cols)"],
            ["Bar & Beverage KOT", "Bar Counter", "Network TCP/IP", "192.168.1.151:9100", "N/A", "80mm (48 Cols)"],
            ["Desserts / Bakery KOT", "Bakery Section", "Network TCP/IP", "192.168.1.152:9100", "N/A", "58mm (32 Cols)"],
        ]
    }
]

def escape_xml(s):
    return (str(s)
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace('"', "&quot;")
            .replace("'", "&apos;"))

def col_letter(col_idx):
    """0-indexed col to Excel column letter (0 -> A, 1 -> B, etc.)"""
    result = ""
    col_idx += 1
    while col_idx > 0:
        col_idx, remainder = divmod(col_idx - 1, 26)
        result = chr(65 + remainder) + result
    return result

def build_sheet_xml(sheet):
    headers = sheet["headers"]
    rows = sheet["rows"]
    
    lines = []
    lines.append('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>')
    lines.append('<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">')
    
    # Column widths
    lines.append('<cols>')
    for c_idx, h in enumerate(headers):
        w = max(len(h) + 4, 16)
        for r in rows:
            if c_idx < len(r):
                w = max(w, len(str(r[c_idx])) + 4)
        w = min(w, 45)
        lines.append(f'<col min="{c_idx+1}" max="{c_idx+1}" width="{w}" customWidth="1"/>')
    lines.append('</cols>')
    
    lines.append('<sheetData>')
    
    # Header row (Row 1, style 1 = header style)
    lines.append('<row r="1" ht="26" customHeight="1">')
    for c_idx, h in enumerate(headers):
        cell_ref = f"{col_letter(c_idx)}1"
        escaped = escape_xml(h)
        lines.append(f'<c r="{cell_ref}" t="inlineStr" s="1"><is><t>{escaped}</t></is></c>')
    lines.append('</row>')
    
    # Data rows (Row 2+, style 2 = even data style, style 3 = odd data style)
    for r_idx, row in enumerate(rows):
        row_num = r_idx + 2
        style_id = "2" if (r_idx % 2 == 0) else "3"
        lines.append(f'<row r="{row_num}" ht="20" customHeight="1">')
        for c_idx in range(len(headers)):
            cell_ref = f"{col_letter(c_idx)}{row_num}"
            val = row[c_idx] if c_idx < len(row) else ""
            escaped = escape_xml(val)
            lines.append(f'<c r="{cell_ref}" t="inlineStr" s="{style_id}"><is><t>{escaped}</t></is></c>')
        lines.append('</row>')
        
    lines.append('</sheetData>')
    lines.append('</worksheet>')
    return "\n".join(lines)

def build_styles_xml():
    return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2">
    <font><sz val="10"/><color rgb="FF1E293B"/><name val="Segoe UI"/></font>
    <font><b/><sz val="10.5"/><color rgb="FFFFFFFF"/><name val="Segoe UI"/></font>
  </fonts>
  <fills count="4">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF0F172A"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF8FAFC"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/></border>
    <border>
      <left style="thin"><color rgb="FFE2E8F0"/></left>
      <right style="thin"><color rgb="FFE2E8F0"/></right>
      <top style="thin"><color rgb="FFE2E8F0"/></top>
      <bottom style="thin"><color rgb="FFE2E8F0"/></bottom>
    </border>
  </borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="4">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <!-- Style 1: Header (Navy bg, white bold text, center align) -->
    <xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="center" vertical="center" wrapText="1"/>
    </xf>
    <!-- Style 2: Data Even (White bg, light border) -->
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1">
      <alignment vertical="center"/>
    </xf>
    <!-- Style 3: Data Odd (Slate-50 bg, light border) -->
    <xf numFmtId="0" fontId="0" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment vertical="center"/>
    </xf>
  </cellXfs>
</styleSheet>"""

def build_workbook_xml():
    lines = ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?>']
    lines.append('<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">')
    lines.append('<sheets>')
    for idx, s in enumerate(sheets_data):
        lines.append(f'<sheet name="{escape_xml(s["name"])}" sheetId="{idx+1}" r:id="rId{idx+1}"/>')
    lines.append('</sheets>')
    lines.append('</workbook>')
    return "\n".join(lines)

def build_workbook_rels():
    lines = ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?>']
    lines.append('<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">')
    for idx in range(len(sheets_data)):
        lines.append(f'<Relationship Id="rId{idx+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet{idx+1}.xml"/>')
    lines.append(f'<Relationship Id="rId{len(sheets_data)+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>')
    lines.append('</Relationships>')
    return "\n".join(lines)

def build_content_types():
    lines = ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?>']
    lines.append('<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">')
    lines.append('<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>')
    lines.append('<Default Extension="xml" ContentType="application/xml"/>')
    lines.append('<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>')
    lines.append('<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>')
    for idx in range(len(sheets_data)):
        lines.append(f'<Override PartName="/xl/worksheets/sheet{idx+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>')
    lines.append('</Types>')
    return "\n".join(lines)

def build_root_rels():
    return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>"""

def create_xlsx(target_path):
    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    with zipfile.ZipFile(target_path, 'w', zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", build_content_types())
        z.writestr("_rels/.rels", build_root_rels())
        z.writestr("xl/workbook.xml", build_workbook_xml())
        z.writestr("xl/_rels/workbook.xml.rels", build_workbook_rels())
        z.writestr("xl/styles.xml", build_styles_xml())
        for idx, s in enumerate(sheets_data):
            z.writestr(f"xl/worksheets/sheet{idx+1}.xml", build_sheet_xml(s))

if __name__ == "__main__":
    print(f">>> Generating: {RELEASE_FILE}...")
    create_xlsx(RELEASE_FILE)
    print(f">>> Mirroring to: {PUBLIC_FILE}...")
    create_xlsx(PUBLIC_FILE)
    
    size1 = os.path.getsize(RELEASE_FILE)
    size2 = os.path.getsize(PUBLIC_FILE)
    print(f"[SUCCESS] Restaurant Setup Template XLSX created cleanly ({size1} bytes).")
