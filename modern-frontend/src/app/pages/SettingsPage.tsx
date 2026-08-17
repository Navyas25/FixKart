import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  Shield,
  LogOut,
  RotateCcw,
  Check,
  Loader2,
  User,
  Bell,
  MapPin,
  Share2,
  Eye,
  KeyRound,
} from "lucide-react";
import { apiPost } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import {
  getSettings,
  setSetting,
  resetSettings,
  type PrivacySettings,
} from "../../lib/settings";
import { PageHeader } from "../components/PageHeader";

/* ─── Toggle row ─────────────────────────────────────────────────────────── */

function ToggleRow({
  icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div className="flex items-start gap-3.5 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] dark:bg-[#2563EB]/20 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-[#0F172A] dark:text-white">{title}</p>
          <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed mt-0.5">
            {description}
          </p>
        </div>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 mt-0.5 ${
          checked ? "bg-[#2563EB]" : "bg-[#CBD5E1] dark:bg-white/20"
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

/* ─── Settings page ──────────────────────────────────────────────────────── */

export default function SettingsPage() {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<PrivacySettings>(getSettings);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  // Change-password form state
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwMsg, setPwMsg] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [pwSubmitting, setPwSubmitting] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);
    if (!currentPw || !newPw) {
      setPwMsg({ kind: "error", text: "Please fill in all the fields." });
      return;
    }
    if (newPw.length < 8) {
      setPwMsg({ kind: "error", text: "New password must be at least 8 characters." });
      return;
    }
    if (newPw !== confirmPw) {
      setPwMsg({ kind: "error", text: "New passwords do not match." });
      return;
    }
    setPwSubmitting(true);
    try {
      await apiPost("/auth/change-password", {
        current_password: currentPw,
        new_password: newPw,
      });
      setPwMsg({
        kind: "success",
        text: "Password changed successfully. Other devices have been signed out.",
      });
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    } catch (err: any) {
      setPwMsg({
        kind: "error",
        text: err.message || "Could not change your password. Please try again.",
      });
    } finally {
      setPwSubmitting(false);
    }
  };

  const pwInputClass =
    "w-full bg-[#F8FAFC] dark:bg-[#0B1220] border border-gray-200 dark:border-white/15 text-[#0F172A] dark:text-white text-sm font-medium px-4 py-3 rounded-xl outline-none focus:border-[#2563EB] transition-colors placeholder-gray-400";

  const update = (key: keyof PrivacySettings, value: boolean) => {
    setSettings(setSetting(key, value));
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1600);
  };

  const handleLogout = async () => {
    if (!confirmLogout) {
      setConfirmLogout(true);
      return;
    }
    setLoggingOut(true);
    // Best-effort server-side sign-out (the endpoint is a no-op stub that
    // keeps the client API consistent); the real session is cleared locally.
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Offline or backend down — local logout still proceeds.
    }
    logout();
    navigate("/");
  };

  const handleReset = () => {
    setSettings(resetSettings());
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1600);
  };

  if (!isLoggedIn) {
    return (
      <>
        <PageHeader eyebrow="Settings" title="Account Settings" subtitle="Manage your privacy and account" />
        <section className="py-16 bg-[#F8FAFC] dark:bg-[#0B1220] min-h-[40vh]">
          <div className="max-w-md mx-auto px-4 text-center bg-white dark:bg-[#111827] rounded-3xl border border-gray-100 dark:border-white/10 py-12">
            <p className="text-[#64748B] dark:text-slate-400 mb-6">
              Sign in to manage your settings and privacy preferences.
            </p>
            <Link
              to="/login?next=/settings"
              className="inline-block bg-[#2563EB] text-white font-bold text-sm px-8 py-3.5 rounded-2xl hover:bg-blue-500 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </section>
      </>
    );
  }

  const rows: {
    key: keyof PrivacySettings;
    icon: React.ReactNode;
    title: string;
    description: string;
  }[] = [
    {
      key: "shareUsageData",
      icon: <Share2 className="w-4 h-4 text-[#2563EB]" />,
      title: "Share usage data",
      description:
        "Help improve FixKart by sharing anonymous usage statistics with our analytics.",
    },
    {
      key: "marketingEmails",
      icon: <Bell className="w-4 h-4 text-[#D97706]" />,
      title: "Marketing & offers emails",
      description:
        "Receive emails about deals, new products and service promotions.",
    },
    {
      key: "showProfilePublicly",
      icon: <Eye className="w-4 h-4 text-[#16A34A]" />,
      title: "Show my profile to others",
      description:
        "Allow professionals to see your name and rating history after a booking.",
    },
    {
      key: "locationForBookings",
      icon: <MapPin className="w-4 h-4 text-[#7C3AED]" />,
      title: "Use my location for bookings",
      description:
        "Use your detected location to suggest nearby professionals and service areas.",
    },
    {
      key: "keepSignedIn",
      icon: <User className="w-4 h-4 text-[#0EA5E9]" />,
      title: "Keep me signed in",
      description:
        "Stay signed in on this device. Turn off to be signed out when you close the browser.",
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Settings"
        title="Account Settings"
        subtitle="Manage your privacy preferences and account"
      />

      <section className="py-10 lg:py-14 bg-[#F8FAFC] dark:bg-[#0B1220] min-h-[50vh]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Saved flash */}
          {savedFlash && (
            <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-500/10 rounded-xl px-4 py-3">
              <Check className="w-4 h-4" /> Preferences saved on this device
            </div>
          )}

          {/* Privacy */}
          <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/10 mb-8">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-[#2563EB]" />
                <h2 className="text-lg font-extrabold text-[#0F172A] dark:text-white">
                  Privacy & Preferences
                </h2>
              </div>
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 text-xs font-bold text-[#64748B] dark:text-slate-400 hover:text-[#2563EB] transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset to defaults
              </button>
            </div>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mb-2">
              These preferences are stored only on this device.
            </p>

            <div className="divide-y divide-gray-100 dark:divide-white/10">
              {rows.map((row) => (
                <ToggleRow
                  key={row.key}
                  icon={row.icon}
                  title={row.title}
                  description={row.description}
                  checked={settings[row.key]}
                  onChange={(value) => update(row.key, value)}
                />
              ))}
            </div>
          </div>

          {/* Account */}
          <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/10">
            <h2 className="text-lg font-extrabold text-[#0F172A] dark:text-white mb-4">
              Account
            </h2>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-[#F59E0B] text-[#0F172A] flex items-center justify-center text-lg font-extrabold flex-shrink-0">
                  {(user?.email || "F").slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-extrabold text-[#0F172A] dark:text-white truncate">
                    {user?.email || "Signed in"}
                  </p>
                  <p className="text-xs text-[#64748B] dark:text-slate-400">
                    Signed in on this device
                  </p>
                </div>
              </div>

              {confirmLogout ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex items-center gap-2 bg-red-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-red-500 transition-colors disabled:opacity-60"
                  >
                    {loggingOut ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <LogOut className="w-4 h-4" />
                    )}
                    Confirm logout
                  </button>
                  <button
                    onClick={() => setConfirmLogout(false)}
                    className="text-sm font-bold text-[#64748B] dark:text-slate-400 px-4 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm font-bold text-red-500 hover:text-red-600 transition-colors border border-red-200 dark:border-red-500/30 px-5 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </button>
              )}
            </div>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-4">
              Logging out clears your FixKart session on this device. Your orders and
              bookings stay saved to your account.
            </p>

            {/* Change password */}
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/10">
              <div className="flex items-center gap-2.5 mb-1">
                <KeyRound className="w-4 h-4 text-[#2563EB]" />
                <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-white">
                  Change password
                </h3>
              </div>
              <p className="text-xs text-[#64748B] dark:text-slate-400 mb-4">
                You'll need your current password. Changing it signs out other devices.
              </p>
              {pwMsg && (
                <div
                  className={`mb-4 text-sm font-semibold rounded-xl px-4 py-3 ${
                    pwMsg.kind === "error"
                      ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10"
                      : "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-500/10"
                  }`}
                >
                  {pwMsg.text}
                </div>
              )}
              <form onSubmit={handleChangePassword} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                    Current password
                  </label>
                  <input
                    type="password"
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    placeholder="Your current password"
                    className={pwInputClass}
                    autoComplete="current-password"
                    required
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                      New password
                    </label>
                    <input
                      type="password"
                      value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                      placeholder="At least 8 characters"
                      className={pwInputClass}
                      autoComplete="new-password"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                      Confirm new password
                    </label>
                    <input
                      type="password"
                      value={confirmPw}
                      onChange={(e) => setConfirmPw(e.target.value)}
                      placeholder="Repeat your password"
                      className={pwInputClass}
                      autoComplete="new-password"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={pwSubmitting}
                  className="flex items-center gap-2 bg-[#2563EB] text-white text-sm font-bold px-5 py-3 rounded-xl hover:bg-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {pwSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Update Password
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
