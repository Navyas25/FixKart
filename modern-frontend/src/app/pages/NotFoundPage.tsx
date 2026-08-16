import { Link } from "react-router";
import { Wrench, ArrowRight } from "lucide-react";
import { PageHeader } from "../components/PageHeader";

export default function NotFoundPage() {
  return (
    <>
      <PageHeader eyebrow="Error 404" title="Page Not Found" subtitle="The page you're looking for doesn't exist or has moved." />
      <section className="py-16 bg-[#F8FAFC] dark:bg-[#0B1220] min-h-[40vh]">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="text-6xl font-extrabold text-[#F59E0B] mb-4">404</div>
          <p className="text-[#64748B] dark:text-slate-400 mb-8">
            Let's get you back on track — head home or browse the catalog.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="flex items-center justify-center gap-2 bg-[#0F172A] dark:bg-white dark:text-[#0F172A] text-white font-bold text-sm px-8 py-3.5 rounded-2xl hover:bg-[#2563EB] transition-colors"
            >
              <Wrench className="w-4 h-4" /> Back to Home
            </Link>
            <Link
              to="/products"
              className="flex items-center justify-center gap-2 bg-[#F59E0B] text-[#0F172A] font-bold text-sm px-8 py-3.5 rounded-2xl hover:bg-amber-400 transition-colors"
            >
              Shop Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
