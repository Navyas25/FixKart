import { Link } from "react-router";
import { Plus, Check, Heart } from "lucide-react";
import { useState } from "react";
import { useCart } from "../../lib/cart";
import { useWishlist } from "../../lib/wishlist";
import { formatINR, PLACEHOLDER_IMG } from "../../lib/format";

export interface ProductCardData {
  id: string;
  name: string;
  category?: string;
  price: number;
  image_url?: string;
  stock?: number;
  /** Discounted selling price (lower than `price`, which is the MRP). */
  discount_price?: number | null;
  featured?: boolean;
}

const discountPercent = (product: ProductCardData) => {
  const mrp = Number(product.price) || 0;
  const sale = Number(product.discount_price) || 0;
  if (sale <= 0 || sale >= mrp) return 0;
  return Math.round(((mrp - sale) / mrp) * 100);
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const { addToCart } = useCart();
  const { isSaved, toggle } = useWishlist();
  const [added, setAdded] = useState(false);
  const out = Number(product.stock) <= 0;
  const pct = discountPercent(product);
  const saved = isSaved(product.id);
  const sellingPrice = pct > 0 ? Number(product.discount_price) : Number(product.price);

  const handleAdd = () => {
    if (out) return;
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="group bg-white dark:bg-[#111827] rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-white/10 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className="relative">
        <Link to={`/product/${product.id}`} className="block">
          <div className="aspect-[4/3] overflow-hidden bg-slate-100">
            <img
              src={product.image_url || PLACEHOLDER_IMG}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </Link>
        {/* Discount badge */}
        {pct > 0 && (
          <span className="absolute top-2.5 left-2.5 bg-[#DC2626] text-white text-[10px] font-extrabold uppercase tracking-wide px-2 py-1 rounded-lg shadow">
            {pct}% OFF
          </span>
        )}
        {product.featured && pct === 0 && (
          <span className="absolute top-2.5 left-2.5 bg-[#2563EB] text-white text-[10px] font-extrabold uppercase tracking-wide px-2 py-1 rounded-lg shadow">
            Featured
          </span>
        )}
        {/* Wishlist heart */}
        <button
          type="button"
          onClick={() =>
            toggle({
              id: product.id,
              type: "product",
              name: product.name,
              price: sellingPrice,
              image_url: product.image_url,
              category: product.category,
            })
          }
          aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
          title={saved ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur transition-all active:scale-90 ${
            saved
              ? "bg-[#DC2626] text-white shadow-lg shadow-red-600/30"
              : "bg-white/90 text-[#64748B] hover:text-[#DC2626] hover:bg-white"
          }`}
        >
          <Heart className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
        </button>
      </div>
      <div className="p-4">
        <span className="text-[10px] text-[#2563EB] font-extrabold uppercase tracking-wide">
          {product.category || "Hardware"}
        </span>
        <Link to={`/product/${product.id}`}>
          <h3 className="font-bold text-[#0F172A] dark:text-slate-100 text-sm mt-0.5 mb-2 line-clamp-2 min-h-[2.5rem] leading-snug">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span className="text-lg font-extrabold text-[#0F172A] dark:text-white">
              {formatINR(sellingPrice)}
            </span>
            {pct > 0 && (
              <span className="text-xs text-[#64748B] dark:text-slate-400 line-through">
                {formatINR(product.price)}
              </span>
            )}
          </div>
          <button
            type="button"
            disabled={out}
            onClick={handleAdd}
            className={`text-xs font-bold px-3 py-2 rounded-xl active:scale-95 transition-all flex items-center gap-1 ${
              added
                ? "bg-[#16A34A] text-white"
                : "bg-[#0F172A] dark:bg-white dark:text-[#0F172A] text-white hover:bg-[#2563EB]"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {added ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {added ? "Added" : out ? "Out of stock" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
