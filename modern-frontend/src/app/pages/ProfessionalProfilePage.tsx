import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { Star, MapPin, CheckCircle, Calendar, ArrowRight, Award, Briefcase } from "lucide-react";
import { apiGet } from "../../lib/api";
import { PLACEHOLDER_IMG } from "../../lib/format";
import { PageHeader } from "../components/PageHeader";

interface ProDetail {
  id: string;
  experience_years?: number;
  rating?: number;
  bio?: string;
  profile?: { full_name?: string; avatar_url?: string; phone?: string };
}

export default function ProfessionalProfilePage() {
  const { id } = useParams();
  const [pro, setPro] = useState<ProDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError("");

    apiGet<{ professional: any }>(`/professionals/${id}`)
      .then((data) => {
        if (!cancelled && data.professional) setPro(data.professional);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Could not load professional.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1220] pt-28">
        <div className="max-w-3xl mx-auto px-4 animate-pulse space-y-4">
          <div className="flex items-center gap-5">
            <div className="w-24 h-24 rounded-3xl bg-slate-200" />
            <div className="flex-1 space-y-2">
              <div className="h-6 bg-slate-200 rounded-full w-1/2" />
              <div className="h-4 bg-slate-200 rounded-full w-2/3" />
            </div>
          </div>
          <div className="h-28 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !pro) {
    return (
      <>
        <PageHeader eyebrow="Verified Professionals" title="Professional" subtitle="Book trusted experts" />
        <div className="py-16 text-center text-[#64748B] dark:text-slate-400">{error || "Professional not found."}</div>
      </>
    );
  }

  const name = pro.profile?.full_name || "FixKart Professional";
  const rating = Number(pro.rating || 0);

  return (
    <>
      <PageHeader eyebrow="Verified Professional" title={name} subtitle={pro.bio || "Verified home service professional."} />

      <section className="py-10 lg:py-16 bg-[#F8FAFC] dark:bg-[#0B1220] min-h-[40vh]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-[#111827] rounded-3xl p-8 lg:p-10 border border-gray-100 dark:border-white/10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 rounded-3xl overflow-hidden bg-slate-100">
                  <img
                    src={pro.profile?.avatar_url || PLACEHOLDER_IMG}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#16A34A] rounded-full border-[3px] border-white dark:border-[#111827] flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" strokeWidth={3} />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <h1 className="text-2xl font-extrabold text-[#0F172A] dark:text-white">{name}</h1>
                  <span className="bg-[#16A34A]/15 text-[#16A34A] text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full">
                    Verified
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-[#64748B] dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                    <strong className="text-[#111827] dark:text-slate-100">{rating || "—"}</strong> rating
                  </span>
                  {pro.experience_years ? (
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4" /> {pro.experience_years} yrs experience
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Award className="w-4 h-4" /> Certified professional
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> On-demand, your location
                  </span>
                </div>
              </div>
              <Link
                to={`/booking?professional_id=${pro.id}`}
                className="flex-shrink-0 inline-flex items-center justify-center gap-2 bg-[#2563EB] text-white font-extrabold text-sm px-7 py-3.5 rounded-2xl hover:bg-blue-500 active:scale-95 transition-all shadow-lg shadow-blue-600/25"
              >
                <Calendar className="w-4 h-4" />
                Book {name.split(" ")[0]}
              </Link>
            </div>

            {pro.bio && (
              <div className="mb-8">
                <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-white uppercase tracking-wide mb-2">
                  About
                </h3>
                <p className="text-[#64748B] dark:text-slate-400 leading-relaxed">{pro.bio}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                "Background verified",
                "On-time guarantee",
                "Transparent pricing",
              ].map((label) => (
                <div key={label} className="flex items-center gap-2.5 bg-[#F8FAFC] dark:bg-white/5 rounded-xl px-3.5 py-3">
                  <CheckCircle className="w-4 h-4 text-[#16A34A] flex-shrink-0" />
                  <span className="text-xs font-bold text-[#0F172A] dark:text-slate-200">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-10">
            <Link to="/professionals" className="text-sm font-bold text-[#2563EB] hover:text-blue-600 transition-colors">
              ← Back to all professionals
            </Link>
            <span className="mx-3 text-[#64748B]">·</span>
            <Link to="/services" className="text-sm font-bold text-[#2563EB] hover:text-blue-600 transition-colors">
              Browse services <ArrowRight className="w-3.5 h-3.5 inline" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
