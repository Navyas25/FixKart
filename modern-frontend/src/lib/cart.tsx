import { createContext, useContext, useEffect, useMemo, useState } from "react";

// Same key + item shape as the classic site's js/cart.js, so the two frontends
// share one cart.
const CART_KEY = "fixkart_cart";

export interface CartItem {
  product_id: string;
  quantity: number;
  name: string;
  price: number;
  image_url?: string;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  addToCart: (product: { id?: string; name?: string; price?: number; image_url?: string }, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const readCart = (): CartItem[] => {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const items = raw ? JSON.parse(raw) : [];
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readCart);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const addToCart = (product, quantity = 1) => {
      setItems((prev) => {
        const existing = prev.find((item) => item.product_id === product.id);
        if (existing) {
          return prev.map((item) =>
            item.product_id === product.id
              ? { ...item, quantity: item.quantity + (Number(quantity) || 1) }
              : item
          );
        }
        return [
          ...prev,
          {
            product_id: product.id!,
            quantity: Number(quantity) || 1,
            name: product.name || "",
            price: Number(product.price) || 0,
            image_url: product.image_url || "",
          },
        ];
      });
    };

    const updateQuantity = (productId, quantity) => {
      setItems((prev) =>
        quantity <= 0
          ? prev.filter((item) => item.product_id !== productId)
          : prev.map((item) =>
              item.product_id === productId ? { ...item, quantity } : item
            )
      );
    };

    const removeFromCart = (productId) => {
      setItems((prev) => prev.filter((item) => item.product_id !== productId));
    };

    const clearCart = () => setItems([]);

    const count = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    const subtotal = items.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
      0
    );

    return { items, count, subtotal, addToCart, updateQuantity, removeFromCart, clearCart };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}
