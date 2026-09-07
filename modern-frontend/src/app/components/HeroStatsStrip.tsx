export default function HeroStatsStrip() {
  const stats = [
    { val: "50+", label: "Product Categories" },
    { val: "100%", label: "Verified Professionals" },
    { val: "24/7", label: "Customer Support" },
    { val: "Same Day", label: "Service Booking" },
  ];

  return (
    <section className="bg-[#0F172A] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {stats.map((s) => (
          <div key={s.label}>
            <div className="text-2xl lg:text-3xl font-extrabold text-white">
              {s.val}
            </div>
            <div className="text-white/40 text-sm mt-0.5 font-medium">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
