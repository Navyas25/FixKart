import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Loader2, Wrench } from "lucide-react";
import { apiPost } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { PageHeader } from "../components/PageHeader";

function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <PageHeader eyebrow="FixKart Account" title={title} subtitle={subtitle} />
      <section className="py-10 lg:py-16 bg-[#F8FAFC] dark:bg-[#0B1220] min-h-[50vh]">
        <div className="max-w-md mx-auto px-4">{children}</div>
      </section>
    </>
  );
}

function Alert({ message, kind }: { message: string; kind: "error" | "success" }) {
  return (
    <div
      className={`mb-5 text-sm font-semibold rounded-xl px-4 py-3 ${
        kind === "error"
          ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10"
          : "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-500/10"
      }`}
    >
      {message}
    </div>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const inputClass =
    "w-full bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/15 text-[#0F172A] dark:text-white text-sm font-medium px-4 py-3 rounded-xl outline-none focus:border-[#2563EB] transition-colors placeholder-gray-400";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setSubmitting(true);
    try {
      const data = await apiPost<{ session: any }>("/auth/login", { email, password });
      if (!data.session) {
        setError("Login successful, but no session was returned. Please try again.");
        setSubmitting(false);
        return;
      }
      login(data.session);
      const next = params.get("next") || "/";
      navigate(next.startsWith("/") ? next : "/");
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <AuthShell title="Welcome Back" subtitle="Sign in to continue shopping and managing your bookings.">
      <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 lg:p-8 border border-gray-100 dark:border-white/10 shadow-sm">
        <div className="w-12 h-12 bg-[#F59E0B] rounded-2xl flex items-center justify-center mb-6">
          <Wrench className="w-6 h-6 text-[#0F172A]" strokeWidth={2.5} />
        </div>
        {error && <Alert message={error} kind="error" />}
        <form onSubmit={handleSubmit} className="space-y-4">
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
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={inputClass}
              autoComplete="current-password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-[#2563EB] text-white font-extrabold text-sm px-8 py-4 rounded-2xl hover:bg-blue-500 active:scale-95 transition-all shadow-lg shadow-blue-600/25 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Sign In
          </button>
        </form>
        <p className="text-center text-sm text-[#64748B] dark:text-slate-400 mt-6">
          New to FixKart?{" "}
          <Link to={`/register${params.get("next") ? `?next=${encodeURIComponent(params.get("next")!)}` : ""}`} className="font-bold text-[#2563EB] hover:text-blue-600 transition-colors">
            Create an account
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const inputClass =
    "w-full bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/15 text-[#0F172A] dark:text-white text-sm font-medium px-4 py-3 rounded-xl outline-none focus:border-[#2563EB] transition-colors placeholder-gray-400";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !password) {
      setError("Please fill in all the fields.");
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
      });
      if (data.session) {
        login(data.session);
        const next = params.get("next") || "/";
        navigate(next.startsWith("/") ? next : "/");
        return;
      }
      setError(
        "Registration successful! If email confirmation is enabled, check your inbox to activate your account."
      );
      setSubmitting(false);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <AuthShell title="Create Your Account" subtitle="Join FixKart for fast hardware delivery and on-demand home services.">
      <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 lg:p-8 border border-gray-100 dark:border-white/10 shadow-sm">
        <div className="w-12 h-12 bg-[#F59E0B] rounded-2xl flex items-center justify-center mb-6">
          <Wrench className="w-6 h-6 text-[#0F172A]" strokeWidth={2.5} />
        </div>
        {error && <Alert message={error} kind={error.includes("successful") ? "success" : "error"} />}
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-[#F59E0B] text-[#0F172A] font-extrabold text-sm px-8 py-4 rounded-2xl hover:bg-amber-400 active:scale-95 transition-all shadow-lg shadow-amber-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Create Account
          </button>
        </form>
        <p className="text-center text-sm text-[#64748B] dark:text-slate-400 mt-6">
          Already have an account?{" "}
          <Link to={`/login${params.get("next") ? `?next=${encodeURIComponent(params.get("next")!)}` : ""}`} className="font-bold text-[#2563EB] hover:text-blue-600 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
