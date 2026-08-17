import { createContext, useContext, useEffect, useMemo, useState } from "react";

// Device-local wishlist (same pattern as the cart). Saved items survive
// refresh, and the heart buttons on product cards toggle them instantly.
const WISHLIST_KEY = "fixkart_wishlist";

export interface WishlistItem {
  id: string;
  type: "product" | "service";
  name: string;
  price: number;
  image_url?: string;
  category?: string;
}

interface WishlistContextValue {
  items: WishlistItem[];
  count: number;
  isSaved: (id: string) => boolean;
  toggle: (item: WishlistItem) => void;
  remove: (id: string) => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

const readWishlist = (): WishlistItem[] => {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    const items = raw ? JSON.parse(raw) : [];
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
};

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>(readWishlist);

  useEffect(() => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<WishlistContextValue>(
    () => ({
      items,
      count: items.length,
      isSaved: (id) => items.some((item) => item.id === id),
      toggle: (item) => {
        setItems((prev) =>
          prev.some((existing) => existing.id === item.id)
            ? prev.filter((existing) => existing.id !== item.id)
            : [...prev, item]
        );
      },
      remove: (id) => setItems((prev) => prev.filter((item) => item.id !== id)),
    }),
    [items]
  );

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within <WishlistProvider>");
  return ctx;
}
