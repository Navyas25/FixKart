// Client-side privacy & preference settings, persisted in localStorage.
//
// These are device-local preferences (like cookies) and don't require the
// backend. If a server-side settings table is added later, this module is
// the single place to swap the storage layer.

export interface PrivacySettings {
  shareUsageData: boolean;
  marketingEmails: boolean;
  showProfilePublicly: boolean;
  locationForBookings: boolean;
  keepSignedIn: boolean;
}

const STORAGE_KEY = "fixkart_settings";

export const SETTINGS_DEFAULTS: PrivacySettings = {
  shareUsageData: true,
  marketingEmails: false,
  showProfilePublicly: false,
  locationForBookings: true,
  keepSignedIn: true,
};

export function getSettings(): PrivacySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...SETTINGS_DEFAULTS };
    const parsed = JSON.parse(raw);
    return { ...SETTINGS_DEFAULTS, ...parsed };
  } catch {
    return { ...SETTINGS_DEFAULTS };
  }
}

export function setSetting<K extends keyof PrivacySettings>(
  key: K,
  value: PrivacySettings[K]
): PrivacySettings {
  const next = { ...getSettings(), [key]: value };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function resetSettings(): PrivacySettings {
  localStorage.removeItem(STORAGE_KEY);
  return { ...SETTINGS_DEFAULTS };
}
