import { Link } from "react-router";
import { Plus, Check } from "lucide-react";
import { useState } from "react";
import { useCart } from "../../lib/cart";
import { formatINR, PLACEHOLDER_IMG } from "../../lib/format";

export interface ProductCardData {
  id: string;
  name: string;
  category?: string;
  price: number;
  image_url?: string;
  stock?: number;
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const out = Number(product.stock) <= 0;

  const handleAdd = () => {
    if (out) return;
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="group bg-white dark:bg-[#111827] rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-white/10 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
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
          <span className="text-lg font-extrabold text-[#0F172A] dark:text-white">
            {formatINR(product.price)}
          </span>
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
