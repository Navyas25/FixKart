import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router";
import { Search, Star, MapPin, CheckCircle, ArrowRight } from "lucide-react";
import { apiGet } from "../../lib/api";
import { PLACEHOLDER_IMG } from "../../lib/format";
import { DEMO_PROFESSIONALS } from "../../lib/demoData";
import { PageHeader, EmptyState } from "../components/PageHeader";
import { DemoNotice, DemoProGrid } from "../components/DemoCards";
import { WishlistHeart } from "../components/WishlistHeart";

interface ProRow {
  id: string;
  experience_years?: number;
  rating?: number;
  bio?: string;
  service_categories?: string[];
  profile?: { full_name?: string; avatar_url?: string; phone?: string };
}

// The seeded catalog stores display names - keep in sync with the
// service_categories values in the professionals table.
const SERVICE_CATEGORIES = [
  "Plumbing",
  "Electrical",
  "Carpentry",
  "Automotive",
  "Painting",
  "HVAC",
  "Appliances",
  "Cleaning",
];

export default function ProfessionalsPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const category = params.get("category") || "";

  const [pros, setPros] = useState<ProRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState(q);

  useEffect(() => setSearchInput(q), [q]);

  const update = (next: Record<string, string>) => {
    const merged = new URLSearchParams(params);
    Object.entries(next).forEach(([key, value]) => {
      if (value) merged.set(key, value);
      else merged.delete(key);
    });
    setParams(merged);
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    const query = new URLSearchParams();
    if (q) query.set("q", q);
    if (category) query.set("category", category);
    query.set("limit", "100");

    apiGet<{ professionals: any[] }>(`/professionals?${query.toString()}`)
      .then((data) => {
        if (!cancelled) setPros((data.professionals || []).filter(Boolean));
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Could not load professionals.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [q, category]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    update({ q: searchInput.trim() });
  };

  const hasFilters = Boolean(q || category);

  // Dropdown options = categories present in the loaded pros plus the full
  // seeded list, so every option matches real data.
  const loadedCategories = [
    ...new Set(
      pros.flatMap((p) => p.service_categories || []).filter(Boolean) as string[]
    ),
  ];
  const categories = [...new Set([...SERVICE_CATEGORIES, ...loadedCategories])].sort();
  const showingDemo = !loading && !error && pros.length === 0 && !hasFilters;

  return (
    <>
      <PageHeader
        eyebrow="Verified Professionals"
        title="Professionals"
        subtitle="Background-checked experts for plumbing, electrical, carpentry, automotive, painting and more."
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
            placeholder="Search professionals…"
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
          <div className="flex flex-wrap items-end gap-3 mb-8">
            <div>
              <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => update({ category: e.target.value })}
                className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/15 text-[#0F172A] dark:text-white text-sm font-semibold px-3.5 py-2.5 rounded-xl outline-none focus:border-[#2563EB]"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            {hasFilters && (
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
                ? `Showing ${DEMO_PROFESSIONALS.length} sample professionals`
                : `${pros.length} professional${pros.length === 1 ? "" : "s"} available`}
            </div>
          </div>

          {error ? (
            <EmptyState icon="⚠️" title="Couldn't load professionals" message={error} />
          ) : loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 p-5 animate-pulse">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-100 rounded-full w-2/3" />
                      <div className="h-3 bg-slate-100 rounded-full w-1/2" />
                    </div>
                  </div>
                  <div className="h-9 bg-slate-100 rounded-xl" />
                </div>
              ))}
            </div>
          ) : pros.length === 0 ? (
            showingDemo ? (
              <>
                <DemoNotice kind="professionals" />
                <DemoProGrid />
              </>
            ) : (
              <EmptyState
                title="No professionals found"
                message="We couldn't find any professionals matching your search. Try a different term or check back soon."
              />
            )
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {pros.map((pro) => {
                const name = pro.profile?.full_name || "FixKart Professional";
                return (
                  <div
                    key={pro.id}
                    className="relative bg-white dark:bg-[#111827] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-white/10 hover:shadow-md transition-all duration-300"
                  >
                    <WishlistHeart
                      className="absolute top-3 right-3"
                      size="sm"
                      item={{
                        id: pro.id,
                        type: "service",
                        name: name,
                        price: 0,
                        image_url: pro.profile?.avatar_url,
                        category: pro.service_categories?.[0],
                      }}
                    />
                    <div className="flex items-start gap-4">
                      <div className="relative flex-shrink-0">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100">
                          <img
                            src={pro.profile?.avatar_url || PLACEHOLDER_IMG}
                            alt={name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#16A34A] rounded-full border-2 border-white dark:border-[#111827] flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-white" strokeWidth={3} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-extrabold text-[#0F172A] dark:text-white text-sm truncate">{name}</h4>
                          <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#16A34A]/15 text-[#16A34A] flex-shrink-0">
                            Verified
                          </span>
                        </div>
                        <p className="text-xs text-[#64748B] dark:text-slate-400 font-medium mb-2.5 line-clamp-2">
                          {pro.bio || "Verified home service professional"}
                        </p>
                        {pro.service_categories?.length ? (
                          <div className="flex flex-wrap gap-1.5 mb-2.5">
                            {pro.service_categories.slice(0, 3).map((cat) => (
                              <span
                                key={cat}
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#2563EB]/10 text-[#2563EB] dark:text-blue-300"
                              >
                                {cat}
                              </span>
                            ))}
                          </div>
                        ) : null}
                        <div className="flex items-center gap-4 text-xs text-[#64748B] dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />
                            <strong className="text-[#111827] dark:text-slate-100">{Number(pro.rating || 0) || "—"}</strong>
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {pro.experience_years ? `${pro.experience_years} yrs exp` : "On demand"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2.5">
                      <Link
                        to={`/booking?professional_id=${pro.id}`}
                        className="flex-1 bg-[#2563EB] text-white text-sm font-bold py-2.5 rounded-xl hover:bg-blue-500 active:scale-95 transition-all text-center"
                      >
                        Book Now
                      </Link>
                      <Link
                        to={`/professional/${pro.id}`}
                        className="px-4 border border-gray-200 dark:border-white/15 text-[#64748B] dark:text-slate-300 text-sm font-semibold py-2.5 rounded-xl hover:border-gray-300 hover:text-[#0F172A] dark:hover:text-white transition-colors flex items-center gap-1"
                      >
                        View Profile <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
