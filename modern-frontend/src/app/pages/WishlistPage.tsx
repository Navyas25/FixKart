import { Link } from "react-router";
import { Heart, ArrowRight } from "lucide-react";
import { useWishlist } from "../../lib/wishlist";
import { ProductCard } from "../components/ProductCard";
import { WishlistHeart } from "../components/WishlistHeart";
import { PageHeader, EmptyState } from "../components/PageHeader";
import { formatINR } from "../../lib/format";

export default function WishlistPage() {
  const { items } = useWishlist();
  const products = items.filter((item) => item.type === "product");
  const services = items.filter((item) => item.type === "service");
  const total = items.length;

  return (
    <>
      <PageHeader
        eyebrow="Saved Items"
        title="My Wishlist"
        subtitle="Products, services and professionals you've saved. Tap the heart anywhere to add or remove them."
      />

      <section className="py-10 lg:py-14 bg-[#F8FAFC] dark:bg-[#0B1220] min-h-[50vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {total === 0 ? (
            <EmptyState
              icon="❤️"
              title="Your wishlist is empty"
              message="Tap the heart icon on any product, service or professional to save it here for later."
            />
          ) : (
            <>
              <p className="text-sm font-bold text-[#64748B] dark:text-slate-400 mb-5">
                {total} saved item{total === 1 ? "" : "s"}
              </p>

              {products.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-lg font-extrabold text-[#0F172A] dark:text-white mb-4">
                    Saved Products ({products.length})
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {products.map((item) => (
                      <ProductCard
                        key={item.id}
                        product={{
                          id: item.id,
                          name: item.name,
                          category: item.category,
                          price: item.price,
                          image_url: item.image_url,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {services.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-lg font-extrabold text-[#0F172A] dark:text-white mb-4">
                    Saved Services & Professionals ({services.length})
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {services.map((item) => (
                      <div
                        key={item.id}
                        className="relative bg-white dark:bg-[#111827] rounded-2xl p-6 border border-gray-100 dark:border-white/10 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                      >
                        <WishlistHeart className="absolute top-3 right-3" size="sm" item={item} />
                        {item.category && (
                          <span className="inline-block bg-[#EFF6FF] dark:bg-[#2563EB]/20 text-[#2563EB] text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-full mb-3">
                            {item.category}
                          </span>
                        )}
                        <h3 className="font-extrabold text-[#0F172A] dark:text-white text-base mb-2 pr-8">
                          {item.name}
                        </h3>
                        <p className="text-sm font-bold text-[#64748B] dark:text-slate-400 mb-5">
                          {item.price > 0 ? `From ${formatINR(item.price)}` : "Book on demand"}
                        </p>
                        <Link
                          to={`/booking?service_id=${item.id}`}
                          className="inline-flex items-center gap-1.5 bg-[#2563EB] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-blue-500 active:scale-95 transition-all"
                        >
                          Book Now
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 bg-[#2563EB] text-white font-bold text-sm px-8 py-3.5 rounded-2xl hover:bg-blue-500 transition-colors"
                >
                  <Heart className="w-4 h-4" />
                  Discover more products
                </Link>
                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 border-2 border-[#2563EB] text-[#2563EB] font-bold text-sm px-8 py-3.5 rounded-2xl hover:bg-[#2563EB]/5 transition-colors"
                >
                  Browse services
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
