import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { Minus, Plus, ShoppingCart, Check, Truck, ShieldCheck, RotateCcw, ArrowRight } from "lucide-react";
import { apiGet } from "../../lib/api";
import { formatINR, PLACEHOLDER_IMG } from "../../lib/format";
import { useCart } from "../../lib/cart";
import { PageHeader, EmptyState } from "../components/PageHeader";
import { ProductCard, type ProductCardData } from "../components/ProductCard";
import { ReviewsSection } from "../components/ReviewsSection";

const toProduct = (p: any): ProductCardData => ({
  id: p.id,
  name: p.name || "Hardware product",
  category: p.category?.name || p.category || "Hardware",
  price: Number(p.price) || 0,
  image_url: p.image_url || "",
  stock: p.stock,
});

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<ProductCardData | null>(null);
  const [description, setDescription] = useState("");
  const [unit, setUnit] = useState("");
  const [related, setRelated] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError("");

    apiGet<{ product: any }>(`/products/${id}`)
      .then((data) => {
        if (cancelled || !data.product) return;
        const p = data.product;
        setProduct(toProduct(p));
        setDescription(p.description || "");
        setUnit(p.unit || "");
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Could not load product.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Load a few related products from the same category.
  useEffect(() => {
    if (!product?.category) return;
    let cancelled = false;
    apiGet<{ products: any[] }>(`/products?category=${encodeURIComponent(product.category)}&limit=4`)
      .then((data) => {
        if (!cancelled) {
          setRelated(
            (data.products || []).filter((p) => p.id !== id).slice(0, 4).map(toProduct)
          );
        }
      })
      .catch(() => {
        // Related products are optional.
      });
    return () => {
      cancelled = true;
    };
  }, [product?.category, id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1220] pt-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="aspect-square rounded-3xl bg-slate-200" />
            <div className="space-y-4">
              <div className="h-4 bg-slate-200 rounded-full w-1/3" />
              <div className="h-8 bg-slate-200 rounded-full w-3/4" />
              <div className="h-6 bg-slate-200 rounded-full w-1/4" />
              <div className="h-24 bg-slate-200 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <PageHeader eyebrow="Hardware Marketplace" title="Product" subtitle="Browse our catalog" />
    );
  }

  const out = Number(product.stock) <= 0;

  const handleAdd = () => {
    if (out) return;
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <>
      <PageHeader eyebrow="Hardware Marketplace" title="Product Details" subtitle="Quality tools and supplies, delivered fast." />

      <section className="py-10 lg:py-16 bg-[#F8FAFC] dark:bg-[#0B1220] min-h-[50vh]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-xs font-semibold text-[#64748B] dark:text-slate-400 mb-8">
            <Link to="/products" className="hover:text-[#2563EB] transition-colors">Products</Link>
            {" / "}
            <span className="text-[#0F172A] dark:text-slate-200">{product.category}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
            {/* Image */}
            <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 lg:p-10 border border-gray-100 dark:border-white/10 flex items-center justify-center">
              <img
                src={product.image_url || PLACEHOLDER_IMG}
                alt={product.name}
                className="w-full max-h-[420px] object-contain"
              />
            </div>

            {/* Details */}
            <div>
              <span className="inline-block bg-[#EFF6FF] dark:bg-[#2563EB]/20 text-[#2563EB] text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                {product.category || "Hardware"}
              </span>
              <h1 className="text-2xl lg:text-4xl font-extrabold text-[#0F172A] dark:text-white leading-tight mb-4">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-4xl font-extrabold text-[#0F172A] dark:text-white">
                  {formatINR(product.price)}
                </span>
                {unit && <span className="text-sm text-[#64748B] dark:text-slate-400 font-medium">per {unit}</span>}
              </div>

              {out ? (
                <p className="inline-flex items-center gap-2 text-sm font-bold text-red-500 bg-red-50 dark:bg-red-500/10 px-4 py-2 rounded-xl mb-6">
                  Currently out of stock
                </p>
              ) : (
                <p className="inline-flex items-center gap-2 text-sm font-bold text-[#16A34A] bg-[#F0FDF4] dark:bg-[#16A34A]/10 px-4 py-2 rounded-xl mb-6">
                  In stock — ships same day
                </p>
              )}

              {description && (
                <p className="text-[#64748B] dark:text-slate-400 leading-relaxed mb-8">
                  {description}
                </p>
              )}

              {/* Quantity + Add */}
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <div className="flex items-center bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/15 rounded-2xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="p-3.5 text-[#64748B] hover:text-[#0F172A] dark:hover:text-white transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={qty}
                    onChange={(e) => setQty(Math.max(1, Math.floor(Number(e.target.value) || 1)))}
                    className="w-14 text-center bg-transparent outline-none font-extrabold text-[#0F172A] dark:text-white"
                    aria-label="Quantity"
                  />
                  <button
                    type="button"
                    onClick={() => setQty((q) => q + 1)}
                    className="p-3.5 text-[#64748B] hover:text-[#0F172A] dark:hover:text-white transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button
                  type="button"
                  disabled={out}
                  onClick={handleAdd}
                  className={`flex-1 min-w-[220px] flex items-center justify-center gap-2.5 text-white font-extrabold text-base px-8 py-4 rounded-2xl active:scale-95 transition-all shadow-lg ${
                    added ? "bg-[#16A34A]" : "bg-[#2563EB] hover:bg-blue-500 shadow-blue-600/25"
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  {added ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                  {added ? "Added to Cart" : out ? "Out of Stock" : "Add to Cart"}
                </button>
              </div>

              {/* Trust strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { Icon: Truck, label: "Same-day delivery" },
                  { Icon: ShieldCheck, label: "Quality assured" },
                  { Icon: RotateCcw, label: "Easy returns" },
                ].map(({ Icon, label }) => (
                  <div key={label} className="flex items-center gap-2.5 bg-white dark:bg-[#111827] border border-gray-100 dark:border-white/10 rounded-xl px-3.5 py-3">
                    <Icon className="w-4 h-4 text-[#2563EB] flex-shrink-0" />
                    <span className="text-xs font-bold text-[#0F172A] dark:text-slate-200">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews */}
          {id && <ReviewsSection itemType="product" itemId={id} />}

          {/* Related */}
          {related.length > 0 && (
            <div className="mt-16">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-extrabold text-[#0F172A] dark:text-white">You might also like</h2>
                <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="flex items-center gap-1 text-sm font-bold text-[#2563EB] hover:text-blue-600 transition-colors">
                  More in {product.category} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {related.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}

          <div className="text-center mt-14">
            <Link to="/cart" className="inline-flex items-center gap-2 text-sm font-bold text-[#2563EB] hover:text-blue-600 transition-colors">
              View cart <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
