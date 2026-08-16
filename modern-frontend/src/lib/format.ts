// Small shared formatting + fallback helpers for the FixKart React app.

export const formatINR = (amount: number | string | undefined) =>
  `₹${Number(amount || 0).toLocaleString("en-IN")}`;

export const PLACEHOLDER_IMG =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRjFmNUY5Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCxzc2FuLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSIjOTRBM0IzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Rml4S2FydDwvdGV4dD48L3N2Zz4=";

export const shortId = (id: string | undefined) =>
  id ? `#FK-${String(id).slice(0, 8).toUpperCase()}` : "";

export const formatDate = (iso: string | undefined | null) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};

export const formatDateTime = (iso: string | undefined | null) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
};
