import { Link } from "react-router";
import { Cookie, ArrowLeft } from "lucide-react";
import { PageHeader } from "../components/PageHeader";

const sections = [
  { id: "what-are", title: "What Are Cookies" },
  { id: "how-we-use", title: "How We Use Cookies" },
  { id: "types", title: "Types of Cookies" },
  { id: "third-party", title: "Third-Party Cookies" },
  { id: "manage", title: "Managing Cookies" },
  { id: "impact", title: "Impact of Disabling Cookies" },
  { id: "updates", title: "Updates to This Policy" },
  { id: "contact", title: "Contact Us" },
];

const cookieTable = [
  {
    name: "session_id",
    type: "Essential",
    purpose: "Maintains your authenticated session across pages",
    duration: "Session",
  },
  {
    name: "auth_token",
    type: "Essential",
    purpose: "Stores your JWT for API authentication",
    duration: "7 days",
  },
  {
    name: "cart_data",
    type: "Essential",
    purpose: "Persists shopping cart contents",
    duration: "30 days",
  },
  {
    name: "_ga / _gid",
    type: "Analytics",
    purpose: "Google Analytics — tracks page views and user behavior",
    duration: "2 years / 24 hours",
  },
  {
    name: "theme_pref",
    type: "Functional",
    purpose: "Remembers your dark/light mode preference",
    duration: "1 year",
  },
  {
    name: "location",
    type: "Functional",
    purpose: "Stores your selected delivery/service location",
    duration: "30 days",
  },
  {
    name: "_fbp",
    type: "Marketing",
    purpose: "Facebook Pixel — measures ad campaign effectiveness",
    duration: "90 days",
  },
];

export default function CookiePolicyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Cookie Policy"
        subtitle="How FixKart uses cookies and similar technologies on our platform."
      />

      <section className="py-12 lg:py-16 bg-[#F8FAFC] dark:bg-[#0B1220] min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Sidebar TOC */}
            <aside className="lg:w-64 flex-shrink-0">
              <div className="lg:sticky lg:top-28 space-y-1">
                <div className="flex items-center gap-2 mb-4">
                  <Cookie className="w-5 h-5 text-[#F59E0B]" />
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
                  FixKart Technologies Pvt. Ltd. ("FixKart," "we," "us," or "our") uses cookies and similar tracking technologies to improve your experience on our platform. This Cookie Policy explains what cookies are, how we use them, and how you can manage your preferences.
                </p>

                <div id="what-are" className="scroll-mt-28">
                  <h2 className="text-lg font-bold text-[#0F172A] dark:text-white mb-3">1. What Are Cookies</h2>
                  <div className="text-[#334155] dark:text-slate-300 text-sm leading-relaxed space-y-2">
                    <p>Cookies are small text files placed on your device (computer, tablet, or mobile) when you visit a website. They are widely used to make websites work efficiently, provide a better user experience, and supply information to site owners.</p>
                    <p>Similar technologies include web beacons, pixel tags, local storage, and device fingerprinting, which serve comparable purposes.</p>
                  </div>
                </div>

                <div id="how-we-use" className="scroll-mt-28">
                  <h2 className="text-lg font-bold text-[#0F172A] dark:text-white mb-3">2. How We Use Cookies</h2>
                  <div className="text-[#334155] dark:text-slate-300 text-sm leading-relaxed space-y-2">
                    <p>We use cookies to:</p>
                    <ul className="space-y-1 ml-4">
                      <li className="flex gap-2"><span className="text-[#F59E0B]">•</span>Keep you signed in as you navigate between pages</li>
                      <li className="flex gap-2"><span className="text-[#F59E0B]">•</span>Remember your preferences (language, theme, location)</li>
                      <li className="flex gap-2"><span className="text-[#F59E0B]">•</span>Maintain your shopping cart and wishlist</li>
                      <li className="flex gap-2"><span className="text-[#F59E0B]">•</span>Analyze how visitors use the Platform to improve performance</li>
                      <li className="flex gap-2"><span className="text-[#F59E0B]">•</span>Deliver relevant advertisements and measure campaign effectiveness</li>
                      <li className="flex gap-2"><span className="text-[#F59E0B]">•</span>Detect and prevent fraud and security threats</li>
                      <li className="flex gap-2"><span className="text-[#F59E0B]">•</span>Comply with legal obligations</li>
                    </ul>
                  </div>
                </div>

                <div id="types" className="scroll-mt-28">
                  <h2 className="text-lg font-bold text-[#0F172A] dark:text-white mb-3">3. Types of Cookies We Use</h2>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">Essential Cookies</h3>
                      <p className="text-[#334155] dark:text-slate-300 text-sm leading-relaxed">
                        Required for the Platform to function. These enable core features like authentication, security, and navigation. Without these, the Platform cannot work properly. They cannot be disabled.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">Analytics Cookies</h3>
                      <p className="text-[#334155] dark:text-slate-300 text-sm leading-relaxed">
                        Help us understand how visitors interact with the Platform by collecting anonymous usage data. This helps us improve the Platform, fix bugs, and optimize performance.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">Functional Cookies</h3>
                      <p className="text-[#334155] dark:text-slate-300 text-sm leading-relaxed">
                        Enable enhanced functionality and personalization, such as remembering your preferences and providing a customized experience.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">Marketing Cookies</h3>
                      <p className="text-[#334155] dark:text-slate-300 text-sm leading-relaxed">
                        Used to track visitors across websites for advertising purposes. These cookies are used to display relevant ads and measure the effectiveness of advertising campaigns.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="scroll-mt-28">
                  <h2 className="text-lg font-bold text-[#0F172A] dark:text-white mb-4">Cookies We Use</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-[#E2E8F0] dark:border-white/10">
                          <th className="text-left py-3 px-3 text-[#0F172A] dark:text-white font-bold">Cookie</th>
                          <th className="text-left py-3 px-3 text-[#0F172A] dark:text-white font-bold">Type</th>
                          <th className="text-left py-3 px-3 text-[#0F172A] dark:text-white font-bold">Purpose</th>
                          <th className="text-left py-3 px-3 text-[#0F172A] dark:text-white font-bold">Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cookieTable.map((c) => (
                          <tr key={c.name} className="border-b border-[#F1F5F9] dark:border-white/5">
                            <td className="py-3 px-3 font-mono text-xs text-[#F59E0B]">{c.name}</td>
                            <td className="py-3 px-3">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                                c.type === "Essential" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                                c.type === "Analytics" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                                c.type === "Functional" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" :
                                "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                              }`}>
                                {c.type}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-[#64748B] dark:text-slate-400">{c.purpose}</td>
                            <td className="py-3 px-3 text-[#64748B] dark:text-slate-400">{c.duration}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div id="third-party" className="scroll-mt-28">
                  <h2 className="text-lg font-bold text-[#0F172A] dark:text-white mb-3">4. Third-Party Cookies</h2>
                  <div className="text-[#334155] dark:text-slate-300 text-sm leading-relaxed space-y-2">
                    <p>Some cookies are placed by third-party services that appear on our Platform. We do not control these third-party cookies. Key third parties include:</p>
                    <ul className="space-y-1 ml-4">
                      <li className="flex gap-2"><span className="text-[#F59E0B]">•</span><strong className="text-[#0F172A] dark:text-white">Google Analytics:</strong> Website usage analytics</li>
                      <li className="flex gap-2"><span className="text-[#F59E0B]">•</span><strong className="text-[#0F172A] dark:text-white">Supabase:</strong> Authentication and database services</li>
                      <li className="flex gap-2"><span className="text-[#F59E0B]">•</span><strong className="text-[#0F172A] dark:text-white">Payment processors:</strong> Secure payment handling</li>
                    </ul>
                    <p>Please refer to each third party's own privacy policy for more information about their cookie usage.</p>
                  </div>
                </div>

                <div id="manage" className="scroll-mt-28">
                  <h2 className="text-lg font-bold text-[#0F172A] dark:text-white mb-3">5. Managing Cookies</h2>
                  <div className="text-[#334155] dark:text-slate-300 text-sm leading-relaxed space-y-2">
                    <p>You can manage cookie preferences through:</p>
                    <ul className="space-y-1 ml-4">
                      <li className="flex gap-2"><span className="text-[#F59E0B]">•</span><strong className="text-[#0F172A] dark:text-white">Browser Settings:</strong> Most browsers allow you to block or delete cookies. Check your browser's help documentation for instructions.</li>
                      <li className="flex gap-2"><span className="text-[#F59E0B]">•</span><strong className="text-[#0F172A] dark:text-white">Opt-Out Links:</strong> Google Analytics provides a <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-[#2563EB] dark:text-blue-400 hover:underline">browser add-on</a> to opt out.</li>
                      <li className="flex gap-2"><span className="text-[#F59E0B]">•</span><strong className="text-[#0F172A] dark:text-white">Mobile Devices:</strong> Adjust advertising identifiers in your device settings (iOS: Settings → Privacy → Tracking; Android: Settings → Privacy → Ads).</li>
                    </ul>
                  </div>
                </div>

                <div id="impact" className="scroll-mt-28">
                  <h2 className="text-lg font-bold text-[#0F172A] dark:text-white mb-3">6. Impact of Disabling Cookies</h2>
                  <div className="text-[#334155] dark:text-slate-300 text-sm leading-relaxed space-y-2">
                    <p>If you disable or block cookies:</p>
                    <ul className="space-y-1 ml-4">
                      <li className="flex gap-2"><span className="text-[#F59E0B]">•</span>The Platform may not function correctly (login, cart, bookings)</li>
                      <li className="flex gap-2"><span className="text-[#F59E0B]">•</span>Your preferences will not be saved</li>
                      <li className="flex gap-2"><span className="text-[#F59E0B]">•</span>Some features may be unavailable or degraded</li>
                      <li className="flex gap-2"><span className="text-[#F59E0B]">•</span>We will not be able to recognize your device or session</li>
                    </ul>
                  </div>
                </div>

                <div id="updates" className="scroll-mt-28">
                  <h2 className="text-lg font-bold text-[#0F172A] dark:text-white mb-3">7. Updates to This Policy</h2>
                  <p className="text-[#334155] dark:text-slate-300 text-sm leading-relaxed">
                    We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our practices. The "Last updated" date at the top indicates when this policy was last revised.
                  </p>
                </div>

                <div id="contact" className="scroll-mt-28">
                  <h2 className="text-lg font-bold text-[#0F172A] dark:text-white mb-3">8. Contact Us</h2>
                  <div className="text-[#334155] dark:text-slate-300 text-sm leading-relaxed space-y-1">
                    <p>If you have questions about our use of cookies:</p>
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
