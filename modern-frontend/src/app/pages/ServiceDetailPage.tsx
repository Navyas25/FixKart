import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import {
  ArrowRight, Calendar, Star, ShieldCheck, Clock, BadgeCheck, Wrench,
} from "lucide-react";
import { apiGet } from "../../lib/api";
import { formatINR } from "../../lib/format";
import { PageHeader } from "../components/PageHeader";
import { ReviewsSection } from "../components/ReviewsSection";

interface ServiceRow {
  id: string;
  name: string;
  category: string;
  description?: string;
  base_price: number;
}

export default function ServiceDetailPage() {
  const { id } = useParams();
  const [service, setService] = useState<ServiceRow | null>(null);
  const [related, setRelated] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError("");

    apiGet<{ service: any }>(`/services/${id}`)
      .then((data) => {
        if (!cancelled && data.service) {
          setService({
            id: data.service.id,
            name: data.service.name || "Service",
            category: data.service.category || "",
            description: data.service.description || "",
            base_price: Number(data.service.base_price) || 0,
          });
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Could not load service.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Related services from the same category (recommendations below the page).
  useEffect(() => {
    if (!service?.category) return;
    let cancelled = false;
    apiGet<{ services: any[] }>(
      `/services?category=${encodeURIComponent(service.category)}&limit=6`
    )
      .then((data) => {
        if (!cancelled) {
          setRelated(
            (data.services || [])
              .filter((s) => s.id !== id)
              .slice(0, 3)
              .map((s) => ({
                id: s.id,
                name: s.name || "Service",
                category: s.category || "",
                description: s.description || "",
                base_price: Number(s.base_price) || 0,
              }))
          );
        }
      })
      .catch(() => {
        // Related services are optional.
      });
    return () => {
      cancelled = true;
    };
  }, [service?.category, id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1220] pt-28">
        <div className="max-w-3xl mx-auto px-4 animate-pulse space-y-4">
          <div className="h-5 bg-slate-200 rounded-full w-1/3" />
          <div className="h-10 bg-slate-200 rounded-full w-2/3" />
          <div className="h-28 bg-slate-200 rounded-2xl" />
          <div className="h-12 bg-slate-200 rounded-2xl w-48" />
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <>
        <PageHeader eyebrow="Home Services" title="Service" subtitle="Book verified professionals" />
        <div className="py-16 text-center text-[#64748B] dark:text-slate-400">{error || "Service not found."}</div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="On-Demand Home Service"
        title={service.name}
        subtitle={service.description || "Verified professional service, booked online in minutes."}
      />

      <section className="py-10 lg:py-16 bg-[#F8FAFC] dark:bg-[#0B1220] min-h-[40vh]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-[#111827] rounded-3xl p-8 lg:p-10 border border-gray-100 dark:border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
              <div>
                <span className="inline-block bg-[#EFF6FF] dark:bg-[#2563EB]/20 text-[#2563EB] text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
                  {service.category || "Service"}
                </span>
                <div className="flex items-center gap-4 text-sm text-[#64748B] dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" /> 4.8 average rating
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BadgeCheck className="w-4 h-4 text-[#16A34A]" /> Verified pros only
                  </span>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs text-[#64748B] dark:text-slate-400 font-medium mb-0.5">Starting at</p>
                <p className="text-4xl font-extrabold text-[#0F172A] dark:text-white">{formatINR(service.base_price)}</p>
              </div>
            </div>

            {service.description && (
              <p className="text-[#64748B] dark:text-slate-400 leading-relaxed mb-8">{service.description}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
              {[
                { Icon: Clock, label: "Arrives in < 60 min" },
                { Icon: ShieldCheck, label: "100% satisfaction" },
                { Icon: Wrench, label: "Certified experts" },
              ].map(({ Icon, label }) => (
                <div key={label} className="flex items-center gap-2.5 bg-[#F8FAFC] dark:bg-white/5 rounded-xl px-3.5 py-3">
                  <Icon className="w-4 h-4 text-[#2563EB] flex-shrink-0" />
                  <span className="text-xs font-bold text-[#0F172A] dark:text-slate-200">{label}</span>
                </div>
              ))}
            </div>

            <Link
              to={`/booking?service_id=${service.id}`}
              className="inline-flex items-center justify-center gap-2.5 bg-[#2563EB] text-white font-extrabold text-base px-9 py-4 rounded-2xl hover:bg-blue-500 active:scale-95 transition-all shadow-lg shadow-blue-600/25"
            >
              <Calendar className="w-5 h-5" />
              Book This Service
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Reviews */}
          {id && <ReviewsSection itemType="service" itemId={id} />}

          {/* Related services */}
          {related.length > 0 && (
            <div className="mt-16">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-extrabold text-[#0F172A] dark:text-white">You might also like</h2>
                <Link
                  to={`/services?category=${encodeURIComponent(service.category)}`}
                  className="flex items-center gap-1 text-sm font-bold text-[#2563EB] hover:text-blue-600 transition-colors"
                >
                  More in {service.category} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {related.map((svc) => (
                  <div key={svc.id} className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-gray-100 dark:border-white/10 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <span className="inline-block bg-[#EFF6FF] dark:bg-[#2563EB]/20 text-[#2563EB] text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-full mb-3">
                      {svc.category}
                    </span>
                    <h3 className="font-bold text-[#0F172A] dark:text-slate-100 text-sm mb-1">{svc.name}</h3>
                    <p className="text-[#64748B] dark:text-slate-400 text-xs leading-relaxed mb-4 line-clamp-2">
                      {svc.description}
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-extrabold text-[#0F172A] dark:text-white">
                        From {formatINR(svc.base_price)}
                      </span>
                      <Link
                        to={`/booking?service_id=${svc.id}`}
                        className="bg-[#2563EB] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-blue-500 active:scale-95 transition-all"
                      >
                        Book
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-center mt-10">
            <Link to="/services" className="text-sm font-bold text-[#2563EB] hover:text-blue-600 transition-colors">
              ← Back to all services
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
