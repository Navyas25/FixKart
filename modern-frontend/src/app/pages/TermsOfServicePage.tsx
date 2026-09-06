import { Link } from "react-router";
import { FileText, ArrowLeft } from "lucide-react";
import { PageHeader } from "../components/PageHeader";

const sections = [
  { id: "acceptance", title: "Acceptance of Terms" },
  { id: "eligibility", title: "Eligibility" },
  { id: "accounts", title: "Accounts & Registration" },
  { id: "platform-use", title: "Platform Use" },
  { id: "transactions", title: "Transactions & Payments" },
  { id: "professional-services", title: "Professional Services" },
  { id: "products", title: "Product Purchases" },
  { id: "cancellations", title: "Cancellations & Refunds" },
  { id: "intellectual-property", title: "Intellectual Property" },
  { id: "prohibited-conduct", title: "Prohibited Conduct" },
  { id: "liability", title: "Limitation of Liability" },
  { id: "indemnification", title: "Indemnification" },
  { id: "governing-law", title: "Governing Law" },
  { id: "changes", title: "Changes to Terms" },
  { id: "contact", title: "Contact Us" },
];

export default function TermsOfServicePage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Terms of Service"
        subtitle="Please read these terms carefully before using the FixKart platform."
      />

      <section className="py-12 lg:py-16 bg-[#F8FAFC] dark:bg-[#0B1220] min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Sidebar TOC */}
            <aside className="lg:w-64 flex-shrink-0">
              <div className="lg:sticky lg:top-28 space-y-1">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-[#F59E0B]" />
                  <span className="text-sm font-bold text-[#0F172A] dark:text-white">Contents</span>
                </div>
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="block text-sm text-[#64748B] dark:text-slate-400 hover:text-[#F59E0B] dark:hover:text-[#F59E0B] transition-colors py-1"
                  >
                    {s.title}
                  </a>
                ))}
              </div>
            </aside>

            {/* Content */}
            <div className="flex-1 max-w-3xl">
              <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E2E8F0] dark:border-white/10 p-6 sm:p-8 lg:p-10 space-y-10">
                <p className="text-sm text-[#64748B] dark:text-slate-400">
                  <strong>Last updated:</strong> September 6, 2026
                </p>

                <p className="text-[#334155] dark:text-slate-300 leading-relaxed">
                  Welcome to FixKart. These Terms of Service ("Terms") govern your access to and use of the FixKart platform, including our website, mobile applications, and all related services (collectively, the "Platform"). By accessing or using the Platform, you agree to be bound by these Terms.
                </p>

                <div id="acceptance" className="scroll-mt-28">
                  <h2 className="text-lg font-bold text-[#0F172A] dark:text-white mb-3">1. Acceptance of Terms</h2>
                  <p className="text-[#334155] dark:text-slate-300 text-sm leading-relaxed">
                    By creating an account or using the Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms and our <Link to="/privacy-policy" className="text-[#2563EB] dark:text-blue-400 hover:underline">Privacy Policy</Link>. If you do not agree, do not use the Platform.
                  </p>
                </div>

                <div id="eligibility" className="scroll-mt-28">
                  <h2 className="text-lg font-bold text-[#0F172A] dark:text-white mb-3">2. Eligibility</h2>
                  <div className="text-[#334155] dark:text-slate-300 text-sm leading-relaxed space-y-2">
                    <p>You must be at least 18 years of age to use the Platform. By using the Platform, you represent and warrant that you meet this age requirement and have the legal capacity to enter into these Terms.</p>
                    <p>Professionals and vendors must provide accurate identification and qualifications during registration. Providing false or misleading information may result in account termination.</p>
                  </div>
                </div>

                <div id="accounts" className="scroll-mt-28">
                  <h2 className="text-lg font-bold text-[#0F172A] dark:text-white mb-3">3. Accounts & Registration</h2>
                  <div className="text-[#334155] dark:text-slate-300 text-sm leading-relaxed space-y-2">
                    <p>To access certain features, you must create an account. You agree to:</p>
                    <ul className="space-y-1 ml-4">
                      <li className="flex gap-2"><span className="text-[#F59E0B]">•</span>Provide accurate, current, and complete information</li>
                      <li className="flex gap-2"><span className="text-[#F59E0B]">•</span>Maintain the security of your password and account</li>
                      <li className="flex gap-2"><span className="text-[#F59E0B]">•</span>Promptly update your account information if it changes</li>
                      <li className="flex gap-2"><span className="text-[#F59E0B]">•</span>Accept responsibility for all activities that occur under your account</li>
                    </ul>
                    <p>You must notify FixKart immediately if you suspect unauthorized use of your account.</p>
                  </div>
                </div>

                <div id="platform-use" className="scroll-mt-28">
                  <h2 className="text-lg font-bold text-[#0F172A] dark:text-white mb-3">4. Platform Use</h2>
                  <div className="text-[#334155] dark:text-slate-300 text-sm leading-relaxed space-y-2">
                    <p>FixKart is a technology platform that connects customers with independent professionals and product vendors. We are not a party to any agreement between customers, professionals, or vendors.</p>
                    <p><strong className="text-[#0F172A] dark:text-white">For Customers:</strong> You may browse products, book services, and communicate with professionals through the Platform. All service agreements are between you and the professional.</p>
                    <p><strong className="text-[#0F172A] dark:text-white">For Professionals:</strong> You are an independent service provider, not an employee of FixKart. You are responsible for your own taxes, insurance, and compliance with applicable laws.</p>
                    <p><strong className="text-[#0F172A] dark:text-white">For Vendors:</strong> You are responsible for product quality, accurate descriptions, inventory management, and compliance with applicable product safety regulations.</p>
                  </div>
                </div>

                <div id="transactions" className="scroll-mt-28">
                  <h2 className="text-lg font-bold text-[#0F172A] dark:text-white mb-3">5. Transactions & Payments</h2>
                  <div className="text-[#334155] dark:text-slate-300 text-sm leading-relaxed space-y-2">
                    <p>All payments are processed through our secure payment partners. FixKart charges a platform commission on completed transactions as disclosed to professionals and vendors.</p>
                    <p>Prices displayed on the Platform are set by vendors and professionals. FixKart is not responsible for pricing disputes between parties. Payment processing fees may apply as disclosed at checkout.</p>
                    <p><strong className="text-[#0F172A] dark:text-white">FixCoins</strong> are loyalty reward points and have no monetary value, are not transferable, and cannot be exchanged for cash.</p>
                  </div>
                </div>

                <div id="professional-services" className="scroll-mt-28">
                  <h2 className="text-lg font-bold text-[#0F172A] dark:text-white mb-3">6. Professional Services</h2>
                  <div className="text-[#334155] dark:text-slate-300 text-sm leading-relaxed space-y-2">
                    <p>FixKart facilitates connections between customers and verified professionals. While we verify professionals' identities and qualifications, we do not guarantee the quality, safety, or legality of services provided.</p>
                    <p>Professionals are independent contractors responsible for performing services in a professional and workmanlike manner. FixKart does not direct or control how professionals perform their work.</p>
                    <p>Customers should exercise reasonable judgment when booking services and report any concerns through the Platform.</p>
                  </div>
                </div>

                <div id="products" className="scroll-mt-28">
                  <h2 className="text-lg font-bold text-[#0F172A] dark:text-white mb-3">7. Product Purchases</h2>
                  <div className="text-[#334155] dark:text-slate-300 text-sm leading-relaxed space-y-2">
                    <p>Products sold through FixKart are offered by independent vendors. FixKart facilitates the transaction but is not the seller of record. Vendor-specific return and warranty policies may apply in addition to FixKart's policies.</p>
                    <p>Product descriptions, images, and specifications are provided by vendors. FixKart is not responsible for inaccuracies in vendor-provided product information.</p>
                  </div>
                </div>

                <div id="cancellations" className="scroll-mt-28">
                  <h2 className="text-lg font-bold text-[#0F172A] dark:text-white mb-3">8. Cancellations & Refunds</h2>
                  <div className="text-[#334155] dark:text-slate-300 text-sm leading-relaxed space-y-2">
                    <p><strong className="text-[#0F172A] dark:text-white">Service Bookings:</strong> Cancellations made at least 24 hours before the scheduled time receive a full refund. Late cancellations may be subject to a cancellation fee.</p>
                    <p><strong className="text-[#0F172A] dark:text-white">Product Orders:</strong> Returns are accepted within 14 days of delivery for unused items in original packaging. Refunds are processed within 5–7 business days after the return is received.</p>
                    <p>Disputes regarding service quality or product condition should be reported within 48 hours of completion/delivery through the Platform's support system.</p>
                  </div>
                </div>

                <div id="intellectual-property" className="scroll-mt-28">
                  <h2 className="text-lg font-bold text-[#0F172A] dark:text-white mb-3">9. Intellectual Property</h2>
                  <p className="text-[#334155] dark:text-slate-300 text-sm leading-relaxed">
                    All content on the Platform, including logos, text, graphics, software, and design elements, is the property of FixKart Technologies Pvt. Ltd. and protected by applicable intellectual property laws. You may not copy, modify, distribute, or reverse-engineer any part of the Platform without prior written consent.
                  </p>
                </div>

                <div id="prohibited-conduct" className="scroll-mt-28">
                  <h2 className="text-lg font-bold text-[#0F172A] dark:text-white mb-3">10. Prohibited Conduct</h2>
                  <div className="text-[#334155] dark:text-slate-300 text-sm leading-relaxed space-y-2">
                    <p>You agree not to:</p>
                    <ul className="space-y-1 ml-4">
                      <li className="flex gap-2"><span className="text-[#F59E0B]">•</span>Use the Platform for any unlawful purpose</li>
                      <li className="flex gap-2"><span className="text-[#F59E0B]">•</span>Attempt to circumvent the Platform to avoid service fees</li>
                      <li className="flex gap-2"><span className="text-[#F59E0B]">•</span>Provide false or misleading information</li>
                      <li className="flex gap-2"><span className="text-[#F59E0B]">•</span>Interfere with or disrupt the Platform's operation</li>
                      <li className="flex gap-2"><span className="text-[#F59E0B]">•</span>Harass, threaten, or abuse other users</li>
                      <li className="flex gap-2"><span className="text-[#F59E0B]">•</span>Scrape, crawl, or use automated tools to access the Platform</li>
                      <li className="flex gap-2"><span className="text-[#F59E0B]">•</span>Transmit malware or harmful code</li>
                    </ul>
                  </div>
                </div>

                <div id="liability" className="scroll-mt-28">
                  <h2 className="text-lg font-bold text-[#0F172A] dark:text-white mb-3">11. Limitation of Liability</h2>
                  <p className="text-[#334155] dark:text-slate-300 text-sm leading-relaxed">
                    To the maximum extent permitted by law, FixKart, its directors, employees, and partners shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or business opportunities, arising from your use of the Platform. Our total liability shall not exceed the amount of platform fees paid by you in the twelve months preceding the claim.
                  </p>
                </div>

                <div id="indemnification" className="scroll-mt-28">
                  <h2 className="text-lg font-bold text-[#0F172A] dark:text-white mb-3">12. Indemnification</h2>
                  <p className="text-[#334155] dark:text-slate-300 text-sm leading-relaxed">
                    You agree to indemnify, defend, and hold harmless FixKart Technologies Pvt. Ltd. and its officers, directors, employees, and agents from any claims, losses, damages, liabilities, costs, and expenses (including reasonable attorneys' fees) arising from your use of the Platform, violation of these Terms, or infringement of any third-party rights.
                  </p>
                </div>

                <div id="governing-law" className="scroll-mt-28">
                  <h2 className="text-lg font-bold text-[#0F172A] dark:text-white mb-3">13. Governing Law</h2>
                  <p className="text-[#334155] dark:text-slate-300 text-sm leading-relaxed">
                    These Terms are governed by and construed in accordance with the laws of India. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts in Chandigarh, India.
                  </p>
                </div>

                <div id="changes" className="scroll-mt-28">
                  <h2 className="text-lg font-bold text-[#0F172A] dark:text-white mb-3">14. Changes to Terms</h2>
                  <p className="text-[#334155] dark:text-slate-300 text-sm leading-relaxed">
                    We reserve the right to modify these Terms at any time. Material changes will be communicated via email or prominent notice on the Platform. Your continued use after changes take effect constitutes acceptance of the revised Terms.
                  </p>
                </div>

                <div id="contact" className="scroll-mt-28">
                  <h2 className="text-lg font-bold text-[#0F172A] dark:text-white mb-3">15. Contact Us</h2>
                  <div className="text-[#334155] dark:text-slate-300 text-sm leading-relaxed space-y-1">
                    <p>For questions about these Terms of Service:</p>
                    <p><strong className="text-[#0F172A] dark:text-white">FixKart Technologies Pvt. Ltd.</strong></p>
                    <p>Email: <a href="mailto:legal@fixkart.dev" className="text-[#2563EB] dark:text-blue-400 hover:underline">legal@fixkart.dev</a></p>
                    <p>Support: <a href="mailto:support@fixkart.dev" className="text-[#2563EB] dark:text-blue-400 hover:underline">support@fixkart.dev</a></p>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#64748B] dark:text-slate-400 hover:text-[#F59E0B] transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
