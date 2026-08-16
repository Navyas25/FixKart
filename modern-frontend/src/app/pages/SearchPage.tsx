import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router";
import { Search, ArrowRight } from "lucide-react";
import { apiGet } from "../../lib/api";
import { PageHeader, EmptyState, LoadingGrid } from "../components/PageHeader";
import { ProductCard, type ProductCardData } from "../components/ProductCard";
import { formatINR } from "../../lib/format";

const toProduct = (p: any): ProductCardData => ({
  id: p.id,
  name: p.name || "Hardware product",
  category: p.category?.name || p.category || "Hardware",
  price: Number(p.price) || 0,
  image_url: p.image_url || "",
  stock: p.stock,
});

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = (params.get("q") || "").trim();

  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [pros, setPros] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(q);

  useEffect(() => setSearchInput(q), [q]);

  useEffect(() => {
    if (!q) return;
    let cancelled = false;
    setLoading(true);

    const encoded = encodeURIComponent(q);
    Promise.allSettled([
      apiGet<{ products: any[] }>(`/products?q=${encoded}&limit=8`),
      apiGet<{ services: any[] }>(`/services?q=${encoded}&limit=8`),
      apiGet<{ professionals: any[] }>(`/professionals?q=${encoded}&limit=6`),
    ]).then(([productsRes, servicesRes, prosRes]) => {
      if (cancelled) return;
      if (productsRes.status === "fulfilled") {
        setProducts((productsRes.value.products || []).map(toProduct));
      }
      if (servicesRes.status === "fulfilled") {
        setServices(servicesRes.value.services || []);
      }
      if (prosRes.status === "fulfilled") {
        setPros(prosRes.value.professionals || []);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [q]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) setParams({ q: searchInput.trim() });
  };

  const total = products.length + services.length + pros.length;

  return (
    <>
      <PageHeader
        eyebrow="Search FixKart"
        title="Search Products & Services"
        subtitle="One search across hardware products, home services, and verified professionals."
      >
        <form
          onSubmit={submitSearch}
          className="mt-8 max-w-xl mx-auto flex items-center gap-2 bg-white/10 border border-white/15 rounded-2xl px-4 py-2.5 focus-within:border-[#F59E0B]/60 transition-colors"
        >
          <Search className="w-5 h-5 text-white/40 flex-shrink-0" />
          <input
            type="search"
            autoFocus
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products, services, professionals…"
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
          {!q ? (
            <EmptyState
              icon="🔍"
              title="Type something to search"
              message="Search for a product like 'pipe wrench', a service like 'electrician', or a professional's specialty."
            />
          ) : loading ? (
            <>
              <p className="text-sm font-bold text-[#64748B] dark:text-slate-400 mb-6">
                Searching for “{q}”…
              </p>
              <LoadingGrid />
            </>
          ) : total === 0 ? (
            <EmptyState
              title={`No results for “${q}”`}
              message="We couldn't find anything matching your search. Try a different term, or browse the full catalog."
            />
          ) : (
            <div className="space-y-12">
              <p className="text-sm font-bold text-[#64748B] dark:text-slate-400">
                {total} result{total === 1 ? "" : "s"} for “{q}”
              </p>

              {products.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-extrabold text-[#0F172A] dark:text-white">Products</h2>
                    <Link to={`/products?q=${encodeURIComponent(q)}`} className="flex items-center gap-1 text-sm font-bold text-[#2563EB] hover:text-blue-600 transition-colors">
                      View all <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {products.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                </section>
              )}

              {services.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-extrabold text-[#0F172A] dark:text-white">Services</h2>
                    <Link to={`/services?q=${encodeURIComponent(q)}`} className="flex items-center gap-1 text-sm font-bold text-[#2563EB] hover:text-blue-600 transition-colors">
                      View all <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {services.map((svc) => (
                      <Link
                        key={svc.id}
                        to={`/service/${svc.id}`}
                        className="group bg-white dark:bg-[#111827] rounded-2xl p-5 border border-gray-100 dark:border-white/10 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                      >
                        <h3 className="font-extrabold text-[#0F172A] dark:text-white text-sm mb-1">{svc.name}</h3>
                        <p className="text-xs text-[#2563EB] font-bold uppercase tracking-wide mb-3">
                          {svc.category || "Service"}
                        </p>
                        <p className="text-sm text-[#64748B] dark:text-slate-400 line-clamp-2 mb-3">
                          {svc.description || "Verified professional service."}
                        </p>
                        <p className="text-lg font-extrabold text-[#0F172A] dark:text-white">
                          {formatINR(svc.base_price)}
                        </p>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {pros.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-extrabold text-[#0F172A] dark:text-white">Professionals</h2>
                    <Link to={`/professionals?q=${encodeURIComponent(q)}`} className="flex items-center gap-1 text-sm font-bold text-[#2563EB] hover:text-blue-600 transition-colors">
                      View all <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {pros.map((pro) => (
                      <div
                        key={pro.id}
                        className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-gray-100 dark:border-white/10 hover:shadow-lg transition-all duration-300"
                      >
                        <h3 className="font-extrabold text-[#0F172A] dark:text-white text-sm mb-1">
                          {pro.profile?.full_name || "FixKart Professional"}
                        </h3>
                        <p className="text-xs text-[#64748B] dark:text-slate-400 line-clamp-2 mb-3">
                          {pro.bio || "Verified home service professional"}
                        </p>
                        <div className="flex gap-2">
                          <Link
                            to={`/booking?professional_id=${pro.id}`}
                            className="flex-1 bg-[#2563EB] text-white text-xs font-bold py-2 rounded-lg hover:bg-blue-500 transition-colors text-center"
                          >
                            Book
                          </Link>
                          <Link
                            to={`/professional/${pro.id}`}
                            className="px-3 border border-gray-200 dark:border-white/15 text-[#64748B] dark:text-slate-300 text-xs font-semibold py-2 rounded-lg hover:border-gray-300 transition-colors"
                          >
                            Profile
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
