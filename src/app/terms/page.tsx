import { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { PageFooter } from "@/components/PageFooter";

export const metadata: Metadata = {
  title: "Terms of Service — SutraUniverse",
  description:
    "Terms of service and subscription agreement for SutraUniverse and its cloud operating systems suite (KioskSutra, DineSutra, RankSutra).",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <PageHeader />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 shadow-xs prose prose-slate max-w-none text-xs sm:text-sm">
          <div className="border-b border-slate-200 pb-6 mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-1">
              Legal Agreement
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight mb-2">
              Terms of Service &amp; Subscription Agreement
            </h1>
            <p className="text-xs text-slate-500 m-0">
              Last Updated: November 17, 2026 • Effective Date: November 17, 2026
            </p>
          </div>

          <section className="space-y-6 text-slate-700 leading-relaxed">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-950 mb-2">1. Acceptance of Terms</h2>
              <p>
                By accessing, browsing, registering an account, or subscribing to any software-as-a-service (SaaS) application provided by <strong>SutraUniverse</strong> (including but not limited to <em>KioskSutra</em>, <em>DineSutra</em>, and <em>RankSutra</em>), you (&quot;Subscriber&quot;, &quot;Merchant&quot;, or &quot;User&quot;) agree to be legally bound by these Terms of Service. If you do not agree with any part of these terms, you must discontinue use immediately.
              </p>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-950 mb-2">2. Nature of Software &amp; Platform Role</h2>
              <p>
                SutraUniverse provides cloud-hosted operational software, digital QR menus, Kitchen Display Systems (KDS), counter Point of Sale (POS), and local discovery engines. 
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>No Aggregator Intermediation:</strong> SutraUniverse is a software technology provider, NOT a food delivery aggregator, payment gateway, or food vendor.</li>
                <li><strong>0% Platform Commission:</strong> Customer payments made via UPI QR codes flow directly from the end-customer to the Merchant&apos;s designated bank account/UPI VPA. SutraUniverse does not hold, escrow, or deduct commission from food order revenues.</li>
                <li><strong>Merchant Operational Autonomy:</strong> The Merchant retains 100% legal responsibility for menu pricing, food hygiene, allergen disclosures, FSSAI compliance, and physical order delivery.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-950 mb-2">3. Subscription, 14-Day Free Trial &amp; ₹1 E-Mandate</h2>
              <p>
                To provide an uninterrupted, risk-free onboarding experience for Indian micro-merchants:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>14-Day Free Evaluation Period:</strong> New merchant signups receive a 14-day free trial granting full access to the subscriber features.</li>
                <li><strong>₹1 Refundable Authorization Mandate:</strong> During onboarding, a nominal ₹1 authorization charge is authenticated via NPCI UPI Autopay / e-mandate to verify bank account authenticity. This ₹1 fee is automatically refunded to your originating account within 24 to 48 hours.</li>
                <li><strong>No Lock-In Cancellation:</strong> Subscribers may cancel their subscription at any time during the 14-day evaluation period via the in-app account portal or by emailing support@sutrauniverse.com without being charged the monthly recurring subscription fee.</li>
                <li><strong>Recurring Billing:</strong> Upon completion of the 14-day free trial, the monthly subscription (e.g. ₹799/month for KioskSutra Starter) will automatically bill to the authenticated UPI mandate at the beginning of each billing cycle until cancelled.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-950 mb-2">4. User Account &amp; Stall Security</h2>
              <p>
                Merchants are responsible for maintaining the confidentiality of their manager and owner login pins and API access keys. Any transactions, menu item modifications, or token operations conducted through your account credentials are presumed authorized by you.
              </p>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-950 mb-2">5. Intellectual Property Rights</h2>
              <p>
                All software algorithms, user interface designs, logos, proprietary trademarks (including &quot;SutraUniverse&quot;, &quot;KioskSutra&quot;, &quot;DineSutra&quot;, &quot;RankSutra&quot;), and cloud infrastructure are the exclusive intellectual property of SutraUniverse. Subscribers are granted a revocable, non-exclusive, non-transferable license to access the web application solely for business operations.
              </p>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-950 mb-2">6. Limitation of Liability</h2>
              <p>
                SutraUniverse operates with an industry-grade 99.9% uptime target. However, SutraUniverse shall not be liable for indirect, incidental, or consequential damages resulting from telecommunications network outages, UPI bank-server downtime, or improper hardware handling at merchant stalls. In all circumstances, SutraUniverse&apos;s aggregate liability shall not exceed the subscription fees paid by the merchant in the preceding single calendar month.
              </p>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-950 mb-2">7. Governing Law &amp; Dispute Resolution</h2>
              <p>
                These Terms are governed by and construed in accordance with the laws of the Republic of India. Any legal dispute, arbitration, or proceeding arising under this agreement shall be subject to the exclusive jurisdiction of the competent courts located in <strong>Kolkata, West Bengal, India</strong>.
              </p>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-950 mb-2">8. Contact &amp; Grievance Redressal</h2>
              <p>
                For any questions or legal inquiries regarding these terms, please contact:
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-medium space-y-1 mt-2">
                <p><strong>Legal Entity / Proprietor:</strong> Vinit Kumar Jha</p>
                <p><strong>Trade Name:</strong> SutraUniverse</p>
                <p><strong>Email:</strong> support@sutrauniverse.com</p>
                <p><strong>Phone / WhatsApp:</strong> +91 6289450230</p>
                <p><strong>Address:</strong> Kolkata, West Bengal, India</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <PageFooter />
    </div>
  );
}
