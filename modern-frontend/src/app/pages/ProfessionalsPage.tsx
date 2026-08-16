import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router";
import { Search, Star, MapPin, CheckCircle, ArrowRight } from "lucide-react";
import { apiGet } from "../../lib/api";
import { PLACEHOLDER_IMG } from "../../lib/format";
import { PageHeader, EmptyState } from "../components/PageHeader";

interface ProRow {
  id: string;
  experience_years?: number;
  rating?: number;
  bio?: string;
  profile?: { full_name?: string; avatar_url?: string; phone?: string };
}

export default function ProfessionalsPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";

  const [pros, setPros] = useState<ProRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState(q);

  useEffect(() => setSearchInput(q), [q]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    const query = new URLSearchParams();
    if (q) query.set("q", q);
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
  }, [q]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const merged = new URLSearchParams(params);
    if (searchInput.trim()) merged.set("q", searchInput.trim());
    else merged.delete("q");
    setParams(merged);
  };

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
          <div className="text-right text-sm font-bold text-[#64748B] dark:text-slate-400 mb-8">
            {loading ? "Loading…" : `${pros.length} professional${pros.length === 1 ? "" : "s"} available`}
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
            <EmptyState
              title="No professionals found"
              message="We couldn't find any professionals matching your search. Try a different term or check back soon."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {pros.map((pro) => {
                const name = pro.profile?.full_name || "FixKart Professional";
                return (
                  <div
                    key={pro.id}
                    className="bg-white dark:bg-[#111827] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-white/10 hover:shadow-md transition-all duration-300"
                  >
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
