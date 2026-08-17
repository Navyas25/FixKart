import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Loader2, Wrench, Upload, FileText, CheckCircle2 } from "lucide-react";
import { apiPost } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { PageHeader } from "../components/PageHeader";

const SERVICE_CATEGORIES = [
  "Plumbing",
  "Electrical",
  "Carpentry",
  "AC Repair",
  "Painting",
  "Automotive / Mechanic",
  "Home Appliances",
  "Cleaning",
];

const ALLOWED_EXT = ["pdf", "jpg", "jpeg", "png"];
const MAX_DOC_MB = 2;

export default function ProfessionalRegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [category, setCategory] = useState("");
  const [experience, setExperience] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [docName, setDocName] = useState("");
  const [docB64, setDocB64] = useState("");
  const [docMime, setDocMime] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const inputClass =
    "w-full bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/15 text-[#0F172A] dark:text-white text-sm font-medium px-4 py-3 rounded-xl outline-none focus:border-[#2563EB] transition-colors placeholder-gray-400";

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED_EXT.includes(ext)) {
      setError("Only PDF, JPG, JPEG or PNG documents are accepted.");
      setDocName("");
      return;
    }
    if (file.size > MAX_DOC_MB * 1024 * 1024) {
      setError(`Document must be ${MAX_DOC_MB} MB or smaller.`);
      setDocName("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = String(reader.result || "").split(",")[1] || "";
      setDocName(file.name);
      setDocB64(b64);
      setDocMime(file.type);
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !password || !category) {
      setError("Please fill in your name, email, password and service category.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setSubmitting(true);
    try {
      const data = await apiPost<{ session?: any; user?: any }>("/auth/register", {
        name,
        email,
        password,
        phone: phone || undefined,
        role: "professional",
        service_category: category,
        experience_years: experience ? parseInt(experience, 10) : undefined,
        service_location: location || undefined,
        bio: bio || undefined,
      });

      if (!data.session) {
        setError(
          "Application submitted! If email confirmation is enabled, check your inbox to activate your account."
        );
        setSubmitting(false);
        return;
      }

      login(data.session);

      // Upload the verification document right after the account exists.
      if (docB64) {
        try {
          await apiPost("/professionals/document", {
            document_b64: docB64,
            filename: docName,
            mime: docMime,
          });
        } catch (docErr: any) {
          // Non-fatal: the account is created; document can be added later
          // from the dashboard. Surface it but continue.
          setError(
            `Account created, but the document upload needs attention: ${
              docErr.message || "upload failed"
            }`
          );
          setSubmitting(false);
          navigate("/professional/dashboard");
          return;
        }
      }

      navigate("/professional/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="FixKart Pro"
        title="Apply as a Professional"
        subtitle="Earn by offering your services. Submit your details and get verified to start accepting jobs."
      />

      <section className="py-10 lg:py-16 bg-[#F8FAFC] dark:bg-[#0B1220] min-h-[50vh]">
        <div className="max-w-2xl mx-auto px-4">
          {error && (
            <div
              className={`mb-5 text-sm font-semibold rounded-xl px-4 py-3 ${
                error.includes("Account created")
                  ? "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10"
                  : "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10"
              }`}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 lg:p-8 border border-gray-100 dark:border-white/10 shadow-sm">
              <h2 className="text-lg font-extrabold text-[#0F172A] dark:text-white mb-5">
                Your details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                    Full name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className={inputClass}
                    autoComplete="name"
                    required
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className={inputClass}
                      autoComplete="email"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className={inputClass}
                      autoComplete="tel"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className={inputClass}
                      autoComplete="new-password"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                      Confirm password
                    </label>
                    <input
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Repeat your password"
                      className={inputClass}
                      autoComplete="new-password"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 lg:p-8 border border-gray-100 dark:border-white/10 shadow-sm">
              <h2 className="text-lg font-extrabold text-[#0F172A] dark:text-white mb-5">
                Your services
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                    Service category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={inputClass}
                    required
                  >
                    <option value="">Select a category…</option>
                    {SERVICE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                      Years of experience
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={60}
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      placeholder="e.g. 5"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                      Service location
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Bengaluru"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                    Short bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell customers about your experience and services…"
                    rows={3}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 lg:p-8 border border-gray-100 dark:border-white/10 shadow-sm">
              <h2 className="text-lg font-extrabold text-[#0F172A] dark:text-white mb-2">
                Verification document
              </h2>
              <p className="text-xs text-[#64748B] dark:text-slate-400 mb-5">
                Upload a government ID (Aadhaar, PAN, licence, certificate). PDF,
                JPG or PNG, up to {MAX_DOC_MB} MB. Our team reviews it before you
                can accept jobs.
              </p>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFile}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full flex items-center justify-center gap-3 border-2 border-dashed border-gray-200 dark:border-white/15 rounded-2xl px-6 py-8 hover:border-[#2563EB] hover:bg-[#2563EB]/5 transition-colors"
              >
                {docName ? (
                  <>
                    <CheckCircle2 className="w-6 h-6 text-[#16A34A]" />
                    <span className="text-sm font-bold text-[#0F172A] dark:text-white truncate">
                      {docName}
                    </span>
                  </>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-[#64748B] dark:text-slate-400" />
                    <span className="text-sm font-bold text-[#64748B] dark:text-slate-400">
                      Click to upload your ID document
                    </span>
                  </>
                )}
              </button>
              {docName && (
                <p className="flex items-center gap-1.5 text-xs text-[#16A34A] mt-3">
                  <FileText className="w-3.5 h-3.5" /> Ready to submit — it will
                  be reviewed by our team.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-[#2563EB] text-white font-extrabold text-sm px-8 py-4 rounded-2xl hover:bg-blue-500 active:scale-95 transition-all shadow-lg shadow-blue-600/25 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Submit Application
            </button>
          </form>

          <p className="text-center text-sm text-[#64748B] dark:text-slate-400 mt-6">
            Already a professional?{" "}
            <Link
              to="/login?next=/professional/dashboard"
              className="font-bold text-[#2563EB] hover:text-blue-600 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
