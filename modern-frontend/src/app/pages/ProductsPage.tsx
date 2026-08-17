import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router";
import { Search } from "lucide-react";
import { apiGet } from "../../lib/api";
import { DEMO_PRODUCTS } from "../../lib/demoData";
import { PageHeader, LoadingGrid, EmptyState } from "../components/PageHeader";
import { ProductCard, type ProductCardData } from "../components/ProductCard";
import { DemoNotice, DemoProductGrid } from "../components/DemoCards";

const PRICE_FILTERS = [
  { label: "Any Price", value: "" },
  { label: "Under ₹500", value: "500" },
  { label: "Under ₹1,000", value: "1000" },
  { label: "Under ₹2,500", value: "2500" },
  { label: "Under ₹5,000", value: "5000" },
];

const SORTS = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low to High", value: "price-low" },
  { label: "Price: High to Low", value: "price-high" },
  { label: "Name", value: "name" },
];

const FALLBACK_CATEGORIES = [
  "Tools & Equipment",
  "Hand Tools",
  "Electrical",
  "Plumbing",
  "Paint & Decor",
  "Automotive",
  "Hardware & Fasteners",
  "Safety & Protection",
];

const toProduct = (p: any): ProductCardData => ({
  id: p.id,
  name: p.name || "Hardware product",
  category: p.category?.name || p.category || "Hardware",
  price: Number(p.price) || 0,
  image_url: p.image_url || "",
  stock: p.stock,
  discount_price: p.discount_price != null ? Number(p.discount_price) : undefined,
  featured: Boolean(p.featured),
});

export default function ProductsPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const category = params.get("category") || "";
  const maxPrice = params.get("max_price") || "";
  const sort = params.get("sort") || "featured";
  const page = Math.max(Number(params.get("page") || 1), 1);

  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState(q);
  const [allCategories, setAllCategories] = useState<string[]>(FALLBACK_CATEGORIES);

  // Real category list from the API so the filter dropdown always matches the
  // database (falls back to the seeded list if the endpoint is unavailable).
  useEffect(() => {
    let cancelled = false;
    apiGet<{ categories: { id: string; name: string; product_count: number }[] }>(
      "/categories"
    )
      .then((data) => {
        if (cancelled) return;
        const names = (data.categories || [])
          .map((c) => c.name)
          .filter(Boolean) as string[];
        if (names.length) setAllCategories(names);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setSearchInput(q);
  }, [q]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    const query = new URLSearchParams();
    if (q) query.set("q", q);
    if (category) query.set("category", category);
    if (maxPrice) query.set("max_price", maxPrice);
    if (sort !== "featured") query.set("sort", sort);
    query.set("limit", "12");
    query.set("page", String(page));

    apiGet<{ products: any[]; total: number }>(`/products?${query.toString()}`)
      .then((data) => {
        if (cancelled) return;
        setProducts((data.products || []).map(toProduct));
        setTotal(data.total || 0);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Could not load products.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [q, category, maxPrice, sort, page]);

  const update = (next: Record<string, string>) => {
    const merged = new URLSearchParams(params);
    Object.entries(next).forEach(([key, value]) => {
      if (value) merged.set(key, value);
      else merged.delete(key);
    });
    merged.delete("page");
    setParams(merged, { replace: false });
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    update({ q: searchInput.trim() });
  };

  // Show sample data only when the catalog is empty AND no filters/search are
  // active - filtered empty results stay honest.
  const hasFilters = Boolean(q || category || maxPrice);
  const showingDemo = !loading && !error && products.length === 0 && !hasFilters;

  const categories = [
    ...new Set([...allCategories, ...products.map((p) => p.category).filter(Boolean) as string[]]),
  ];

  const selectClass =
    "bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/15 text-[#0F172A] dark:text-white text-sm font-semibold px-3.5 py-2.5 rounded-xl outline-none focus:border-[#2563EB]";

  return (
    <>
      <PageHeader
        eyebrow="Hardware Marketplace"
        title="Products"
        subtitle="Find the tools, supplies, and hardware you need for home repairs, maintenance, and professional work."
      >
        <form
          onSubmit={submitSearch}
          className="mt-8 max-w-xl mx-auto flex items-center gap-2 bg-white/10 border border-white/15 rounded-2xl px-4 py-2.5 focus-within:border-[#F59E0B]/60 transition-colors"
        >
          <Search className="w-5 h-5 text-white/40 flex-shrink-0" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products…"
            className="bg-transparent outline-none text-sm text-white w-full placeholder-white/35"
          />
          <button
            type="submit"
            className="bg-[#2563EB] text-white text-sm font-bold px-5 py-2 rounded-xl hover:bg-blue-500 transition-colors flex-shrink-0"
          >
            Search
          </button>
        </form>
      </PageHeader>

      <section className="py-10 lg:py-14 bg-[#F8FAFC] dark:bg-[#0B1220] min-h-[50vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="flex flex-wrap items-end gap-3 mb-8">
            <div>
              <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => update({ category: e.target.value })}
                className={selectClass}
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                Maximum Price
              </label>
              <select
                value={maxPrice}
                onChange={(e) => update({ max_price: e.target.value })}
                className={selectClass}
              >
                {PRICE_FILTERS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                Sort By
              </label>
              <select
                value={sort}
                onChange={(e) => update({ sort: e.target.value })}
                className={selectClass}
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            {(q || category || maxPrice) && (
              <button
                onClick={() => setParams(new URLSearchParams())}
                className="text-sm font-bold text-[#2563EB] hover:text-blue-600 transition-colors py-2.5"
              >
                Clear filters
              </button>
            )}
            <div className="ml-auto text-sm font-bold text-[#64748B] dark:text-slate-400">
              {loading
                ? "Loading…"
                : showingDemo
                ? `Showing ${DEMO_PRODUCTS.length} sample products`
                : `${total} product${total === 1 ? "" : "s"} available`}
            </div>
          </div>

          {error ? (
            <EmptyState
              icon="⚠️"
              title="Couldn't load products"
              message={error}
            />
          ) : loading ? (
            <LoadingGrid />
          ) : products.length === 0 ? (
            showingDemo ? (
              <>
                <DemoNotice kind="products" />
                <DemoProductGrid />
              </>
            ) : (
              <EmptyState
                title="No products found"
                message="We couldn't find any products matching your filters. Try clearing the filters or check back soon."
              />
            )
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {total > page * 12 && (
                <div className="text-center mt-10">
                  <button
                    onClick={() => update({ page: String(page + 1) })}
                    className="bg-[#0F172A] dark:bg-white dark:text-[#0F172A] text-white text-sm font-bold px-8 py-3.5 rounded-2xl hover:bg-[#2563EB] active:scale-95 transition-all"
                  >
                    Load more products
                  </button>
                </div>
              )}
            </>
          )}

          <div className="text-center mt-10">
            <Link
              to="/services"
              className="text-sm font-bold text-[#2563EB] hover:text-blue-600 transition-colors"
            >
              Need a professional instead? Browse services →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
