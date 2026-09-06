import { Link } from "react-router";
import { Shield, ArrowLeft } from "lucide-react";
import { PageHeader } from "../components/PageHeader";

const sections = [
  { id: "info-we-collect", title: "Information We Collect" },
  { id: "how-we-use", title: "How We Use Your Information" },
  { id: "sharing", title: "Information Sharing" },
  { id: "cookies", title: "Cookies & Tracking" },
  { id: "data-security", title: "Data Security" },
  { id: "your-rights", title: "Your Rights" },
  { id: "retention", title: "Data Retention" },
  { id: "children", title: "Children's Privacy" },
  { id: "changes", title: "Changes to This Policy" },
  { id: "contact", title: "Contact Us" },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        subtitle="How FixKart collects, uses, and protects your personal information."
      />

      <section className="py-12 lg:py-16 bg-[#F8FAFC] dark:bg-[#0B1220] min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Sidebar TOC */}
            <aside className="lg:w-64 flex-shrink-0">
              <div className="lg:sticky lg:top-28 space-y-1">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-[#F59E0B]" />
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
                  FixKart Technologies Pvt. Ltd. ("FixKart," "we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, mobile application, and services (collectively, the "Platform").
                </p>

                <div id="info-we-collect" className="scroll-mt-28">
                  <h2 className="text-lg font-bold text-[#0F172A] dark:text-white mb-3">1. Information We Collect</h2>
                  <div className="space-y-3 text-[#334155] dark:text-slate-300 leading-relaxed text-sm">
                    <p><strong className="text-[#0F172A] dark:text-white">Personal Information:</strong> When you register, book a service, or make a purchase, we may collect your name, email address, phone number, delivery address, payment information, and government-issued identification (for professional verification).</p>
                    <p><strong className="text-[#0F172A] dark:text-white">Usage Data:</strong> We automatically collect information about how you interact with the Platform, including your IP address, browser type, device information, pages viewed, time spent, and referring URLs.</p>
                    <p><strong className="text-[#0F172A] dark:text-white">Location Data:</strong> With your consent, we collect your precise location to match you with nearby professionals, calculate delivery distances, and provide location-based services.</p>
                    <p><strong className="text-[#0F172A] dark:text-white">Communication Data:</strong> Messages sent through the Platform's chat feature, support tickets, and customer service interactions are stored to provide and improve our services.</p>
                    <p><strong className="text-[#0F172A] dark:text-white">Professional Information:</strong> Professionals and vendors provide additional information including business registration, certifications, skills, service areas, bank details, and GST information for verification and payment processing.</p>
                  </div>
                </div>

                <div id="how-we-use" className="scroll-mt-28">
                  <h2 className="text-lg font-bold text-[#0F172A] dark:text-white mb-3">2. How We Use Your Information</h2>
                  <ul className="space-y-2 text-[#334155] dark:text-slate-300 text-sm">
                    <li className="flex gap-2"><span className="text-[#F59E0B] mt-1">•</span>Provide, maintain, and improve the Platform and our services</li>
                    <li className="flex gap-2"><span className="text-[#F59E0B] mt-1">•</span>Process transactions and send related information (confirmations, invoices, receipts)</li>
                    <li className="flex gap-2"><span className="text-[#F59E0B] mt-1">•</span>Match customers with appropriate professionals and vendors</li>
                    <li className="flex gap-2"><span className="text-[#F59E0B] mt-1">•</span>Verify professional and vendor identities and qualifications</li>
                    <li className="flex gap-2"><span className="text-[#F59E0B] mt-1">•</span>Send administrative notifications (booking updates, service alerts, security notices)</li>
                    <li className="flex gap-2"><span className="text-[#F59E0B] mt-1">•</span>Personalize your experience and provide relevant recommendations</li>
                    <li className="flex gap-2"><span className="text-[#F59E0B] mt-1">•</span>Detect, prevent, and address fraud, abuse, and technical issues</li>
                    <li className="flex gap-2"><span className="text-[#F59E0B] mt-1">•</span>Comply with legal obligations and enforce our terms</li>
                  </ul>
                </div>

                <div id="sharing" className="scroll-mt-28">
                  <h2 className="text-lg font-bold text-[#0F172A] dark:text-white mb-3">3. Information Sharing</h2>
                  <div className="space-y-3 text-[#334155] dark:text-slate-300 text-sm leading-relaxed">
                    <p>We do not sell your personal information. We may share your information only in the following circumstances:</p>
                    <p><strong className="text-[#0F172A] dark:text-white">With Professionals/Vendors:</strong> When you book a service or make a purchase, we share necessary information (name, address, contact details) with the assigned professional or vendor to fulfil your request.</p>
                    <p><strong className="text-[#0F172A] dark:text-white">Service Providers:</strong> We share data with trusted third-party service providers who assist in operating the Platform (payment processors, hosting providers, analytics services), bound by contractual obligations to protect your information.</p>
                    <p><strong className="text-[#0F172A] dark:text-white">Legal Requirements:</strong> We may disclose information if required by law, court order, or governmental authority, or to protect the rights, property, or safety of FixKart, our users, or the public.</p>
                    <p><strong className="text-[#0F172A] dark:text-white">Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction, subject to the same privacy protections.</p>
                  </div>
                </div>

                <div id="cookies" className="scroll-mt-28">
                  <h2 className="text-lg font-bold text-[#0F172A] dark:text-white mb-3">4. Cookies & Tracking</h2>
                  <div className="space-y-3 text-[#334155] dark:text-slate-300 text-sm leading-relaxed">
                    <p>We use cookies and similar tracking technologies to enhance your experience on the Platform. For full details, please refer to our <Link to="/cookie-policy" className="text-[#2563EB] dark:text-blue-400 hover:underline">Cookie Policy</Link>.</p>
                    <p><strong className="text-[#0F172A] dark:text-white">Essential Cookies:</strong> Required for core functionality such as authentication, session management, and security.</p>
                    <p><strong className="text-[#0F172A] dark:text-white">Analytics Cookies:</strong> Help us understand how users interact with the Platform to improve our services.</p>
                    <p><strong className="text-[#0F172A] dark:text-white">Marketing Cookies:</strong> Used to deliver relevant advertisements and measure campaign effectiveness.</p>
                  </div>
                </div>

                <div id="data-security" className="scroll-mt-28">
                  <h2 className="text-lg font-bold text-[#0F172A] dark:text-white mb-3">5. Data Security</h2>
                  <p className="text-[#334155] dark:text-slate-300 text-sm leading-relaxed">
                    We implement industry-standard security measures including SSL/TLS encryption, encrypted data storage, access controls, regular security audits, and secure payment processing (PCI DSS compliant). While no method of transmission or storage is 100% secure, we strive to use commercially acceptable means to protect your personal information.
                  </p>
                </div>

                <div id="your-rights" className="scroll-mt-28">
                  <h2 className="text-lg font-bold text-[#0F172A] dark:text-white mb-3">6. Your Rights</h2>
                  <div className="space-y-3 text-[#334155] dark:text-slate-300 text-sm leading-relaxed">
                    <p>Depending on your jurisdiction, you may have the following rights:</p>
                    <ul className="space-y-2 ml-4">
                      <li className="flex gap-2"><span className="text-[#F59E0B]">•</span><strong className="text-[#0F172A] dark:text-white">Access:</strong> Request a copy of the personal data we hold about you</li>
                      <li className="flex gap-2"><span className="text-[#F59E0B]">•</span><strong className="text-[#0F172A] dark:text-white">Correction:</strong> Request correction of inaccurate or incomplete data</li>
                      <li className="flex gap-2"><span className="text-[#F59E0B]">•</span><strong className="text-[#0F172A] dark:text-white">Deletion:</strong> Request deletion of your personal data (subject to legal retention requirements)</li>
                      <li className="flex gap-2"><span className="text-[#F59E0B]">•</span><strong className="text-[#0F172A] dark:text-white">Portability:</strong> Request a machine-readable copy of your data</li>
                      <li className="flex gap-2"><span className="text-[#F59E0B]">•</span><strong className="text-[#0F172A] dark:text-white">Opt-out:</strong> Opt out of marketing communications at any time</li>
                    </ul>
                    <p>To exercise any of these rights, contact us at <a href="mailto:privacy@fixkart.dev" className="text-[#2563EB] dark:text-blue-400 hover:underline">privacy@fixkart.dev</a>.</p>
                  </div>
                </div>

                <div id="retention" className="scroll-mt-28">
                  <h2 className="text-lg font-bold text-[#0F172A] dark:text-white mb-3">7. Data Retention</h2>
                  <p className="text-[#334155] dark:text-slate-300 text-sm leading-relaxed">
                    We retain your personal information for as long as your account is active or as needed to provide you with services. We may retain certain information as necessary to comply with legal obligations, resolve disputes, and enforce our agreements. When data is no longer needed, it is securely deleted or anonymized.
                  </p>
                </div>

                <div id="children" className="scroll-mt-28">
                  <h2 className="text-lg font-bold text-[#0F172A] dark:text-white mb-3">8. Children's Privacy</h2>
                  <p className="text-[#334155] dark:text-slate-300 text-sm leading-relaxed">
                    The Platform is not intended for children under the age of 18. We do not knowingly collect personal information from children under 18. If we become aware that we have collected personal information from a child under 18, we will take steps to delete such information promptly.
                  </p>
                </div>

                <div id="changes" className="scroll-mt-28">
                  <h2 className="text-lg font-bold text-[#0F172A] dark:text-white mb-3">9. Changes to This Policy</h2>
                  <p className="text-[#334155] dark:text-slate-300 text-sm leading-relaxed">
                    We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date. Your continued use of the Platform after any changes constitutes acceptance of the updated policy.
                  </p>
                </div>

                <div id="contact" className="scroll-mt-28">
                  <h2 className="text-lg font-bold text-[#0F172A] dark:text-white mb-3">10. Contact Us</h2>
                  <div className="text-[#334155] dark:text-slate-300 text-sm leading-relaxed space-y-1">
                    <p>If you have questions about this Privacy Policy, please contact:</p>
                    <p><strong className="text-[#0F172A] dark:text-white">FixKart Technologies Pvt. Ltd.</strong></p>
                    <p>Email: <a href="mailto:privacy@fixkart.dev" className="text-[#2563EB] dark:text-blue-400 hover:underline">privacy@fixkart.dev</a></p>
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
