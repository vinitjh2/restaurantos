import { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { PageFooter } from "@/components/PageFooter";

export const metadata: Metadata = {
  title: "Privacy Policy — SutraUniverse",
  description:
    "Privacy Policy for SutraUniverse and its cloud operating systems, compliant with India's Digital Personal Data Protection Act (DPDP Act 2023).",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <PageHeader />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 shadow-xs prose prose-slate max-w-none text-xs sm:text-sm">
          <div className="border-b border-slate-200 pb-6 mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-1">
              Data Protection &amp; Trust
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight mb-2">
              Privacy Policy &amp; Data Safeguards
            </h1>
            <p className="text-xs text-slate-500 m-0">
              Compliant with the Digital Personal Data Protection Act (DPDP Act 2023) • Effective Date: November 17, 2026
            </p>
          </div>

          <section className="space-y-6 text-slate-700 leading-relaxed">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-950 mb-2">1. Introduction</h2>
              <p>
                SutraUniverse (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is deeply committed to safeguarding the privacy and digital sovereignty of merchants and consumers across India. This Privacy Policy details the types of personal data we collect, how it is processed, and your rights under India&apos;s <em>Digital Personal Data Protection Act (DPDP Act 2023)</em> and the <em>Information Technology Act, 2000</em>.
              </p>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-950 mb-2">2. Information We Collect</h2>
              <p>We only collect data strictly necessary to deliver high-speed cloud POS and QR order operations:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Merchant Account Data:</strong> Stall/business name, merchant contact name, phone number, email address, physical stall location/city, and UPI VPA ID (for direct customer payment routing).</li>
                <li><strong>End-Customer Order Data:</strong> Customer mobile number (collected strictly for digital order tokens and kitchen pickup notification via WhatsApp/SMS), customer name, item preferences, and token numbers.</li>
                <li><strong>Technical Telemetry:</strong> Anonymized browser type, IP address (masked via Cloudflare), operating device parameters, and session error logs to guarantee 99.9% application uptime.</li>
              </ul>
            </div>

            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4">
              <h3 className="text-sm font-bold text-amber-950 mb-1">Payment Security &amp; Zero PIN Storage</h3>
              <p className="text-xs text-amber-900 leading-relaxed m-0">
                <strong>We NEVER collect, transmit, or store UPI PINs, Net Banking passwords, or Debit/Credit Card CVVs.</strong> All peer-to-peer customer food payments are initiated directly through NPCI-authorized UPI apps (such as Google Pay, PhonePe, and Paytm). Subscription fees are processed through RBI-authorized payment aggregators utilizing end-to-end tokenized e-mandates.
              </p>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-950 mb-2">3. How We Use Collected Data</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Generating instantaneous digital order tokens for kitchen queues (FIFO ordering).</li>
                <li>Transmitting automated kitchen order chime notifications to cook displays.</li>
                <li>Providing owners with itemized daily sales analytics and sold-out dish tracking.</li>
                <li>Authenticating subscription e-mandates and generating GST-compliant tax invoices.</li>
                <li>Delivering critical service status alerts and technical customer support.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-950 mb-2">4. Third-Party Sharing &amp; Data Transfers</h2>
              <p>
                <strong>We do NOT sell, lease, or monetize customer or merchant databases to third-party advertisers or data brokers.</strong> Data is shared only with strictly vetted infrastructure providers under non-disclosure agreements:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Cloud Infrastructure:</strong> Cloudflare Inc. (DDoS defense, edge routing, SSL encryption) and Contabo Cloud (isolated, encrypted databases).</li>
                <li><strong>Payment Aggregators:</strong> RBI-licensed payment aggregators (e.g. Cashfree/Razorpay) strictly for processing recurring subscription e-mandates.</li>
                <li><strong>Law Enforcement:</strong> Only when strictly mandated under statutory orders by Indian courts or cybercrime authorities.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-950 mb-2">5. Data Retention &amp; User Rights</h2>
              <p>
                In compliance with the DPDP Act 2023, you have the right to request access to your personal data, rectify inaccuracies, or demand account erasure (&quot;Right to be Forgotten&quot;). Upon subscription cancellation, merchant transaction logs are archived in an encrypted state for legal tax audits as required by Indian GST law, after which they are permanently expunged.
              </p>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-950 mb-2">6. Grievance Redressal Officer</h2>
              <p>
                In accordance with the Information Technology Act 2000 and the Digital Personal Data Protection Act 2023, the details of our designated Grievance Officer are:
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-medium space-y-1 mt-2">
                <p><strong>Grievance Officer:</strong> Vinit Kumar Jha</p>
                <p><strong>Trade Organization:</strong> SutraUniverse</p>
                <p><strong>Email:</strong> support@sutrauniverse.com</p>
                <p><strong>Phone / WhatsApp:</strong> +91 6289450230</p>
                <p><strong>Location:</strong> Kolkata, West Bengal, India</p>
                <p><strong>Acknowledgment Timeframe:</strong> Within 24 hours • Resolution within 15 working days</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <PageFooter />
    </div>
  );
}
