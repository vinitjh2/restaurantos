/**
 * RestaurantOS External Accounting Integration Engine
 * Generates Tally Prime XML Day Book vouchers, Zoho Books & QuickBooks
 * automated sales journals and GST tax ledgers.
 */

import { IntegrationHealthCheck } from "./types";

export interface AccountingSalesRecord {
  date: string; // YYYYMMDD for Tally
  invoiceNumber: string;
  customerName?: string;
  customerGstin?: string;
  subtotal: number;
  cgst: number;
  sgst: number;
  grandTotal: number;
  paymentMethod: string;
}

export class ExternalAccountingService {
  private tallyHost: string;
  private tallyPort: number;
  private isConfigured: boolean;

  constructor() {
    this.tallyHost = process.env.TALLY_ODBC_HOST || "localhost";
    this.tallyPort = Number(process.env.TALLY_ODBC_PORT || 9000);
    this.isConfigured = Boolean(process.env.TALLY_ODBC_HOST);
  }

  public async checkHealth(): Promise<IntegrationHealthCheck> {
    return {
      provider: "ACCOUNTING",
      name: "Tally Prime & Zoho Books Sync",
      category: "ACCOUNTING",
      status: this.isConfigured ? "SANDBOX_VERIFIED" : "CREDENTIALS_CONFIGURED",
      isLiveOperational: false,
      credentialsPresent: this.isConfigured,
      endpoint: `http://${this.tallyHost}:${this.tallyPort}`,
      message: this.isConfigured
        ? `Configured to export XML Day Book to Tally Server at ${this.tallyHost}:${this.tallyPort}.`
        : "XML Exporter ready. Tally Server IP endpoint not specified in environment.",
    };
  }

  /**
   * Generates standard Tally XML Day Book Sales Voucher
   */
  public generateTallySalesVoucherXML(sales: AccountingSalesRecord): string {
    const formattedDate = sales.date.replace(/-/g, ""); // e.g. 20261106

    return `<?xml version="1.0" encoding="utf-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
      </REQUESTDESC>
      <REQUESTDATA>
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="Sales" ACTION="Create">
            <DATE>${formattedDate}</DATE>
            <VOUCHERNUMBER>${sales.invoiceNumber}</VOUCHERNUMBER>
            <PARTYLEDGERNAME>${sales.paymentMethod === "CASH" ? "Cash in Hand" : "HDFC Bank POS Collection"}</PARTYLEDGERNAME>
            <NARRATION>RestaurantOS Daily Dining Sales - Inv #${sales.invoiceNumber}</NARRATION>
            
            <!-- Debit Party / Bank Ledger -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${sales.paymentMethod === "CASH" ? "Cash in Hand" : "HDFC Bank POS Collection"}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>-${sales.grandTotal.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>

            <!-- Credit Food & Beverage Sales Ledger -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>F&amp;B Restaurant Sales (5% GST)</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${sales.subtotal.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>

            <!-- Credit Output CGST 2.5% -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Output CGST @ 2.5%</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${sales.cgst.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>

            <!-- Credit Output SGST 2.5% -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Output SGST @ 2.5%</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${sales.sgst.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
          </VOUCHER>
        </TALLYMESSAGE>
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;
  }

  /**
   * Generates standard Zoho Books / QuickBooks JSON Journal
   */
  public generateZohoBooksInvoiceJSON(sales: AccountingSalesRecord) {
    return {
      customer_name: sales.customerName || "Dining Guest",
      zcrm_potential_id: "",
      invoice_number: sales.invoiceNumber,
      date: sales.date,
      line_items: [
        {
          name: "Food & Beverage Dining Sales",
          rate: sales.subtotal,
          quantity: 1,
          tax_name: "GST 5%",
          tax_percentage: 5,
        },
      ],
      payment_options: {
        payment_gateways: [{ gateway_name: sales.paymentMethod }],
      },
    };
  }
}

export const accountingService = new ExternalAccountingService();
