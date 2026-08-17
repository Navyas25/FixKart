import { Link } from "react-router";
import { Heart } from "lucide-react";
import { useWishlist } from "../../lib/wishlist";
import { ProductCard } from "../components/ProductCard";
import { PageHeader, EmptyState } from "../components/PageHeader";

export default function WishlistPage() {
  const { items } = useWishlist();
  const products = items.filter((item) => item.type === "product");

  return (
    <>
      <PageHeader
        eyebrow="Saved Items"
        title="My Wishlist"
        subtitle="Products you've saved to buy later. Tap the heart on any product to add or remove it."
      />

      <section className="py-10 lg:py-14 bg-[#F8FAFC] dark:bg-[#0B1220] min-h-[50vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {products.length === 0 ? (
            <EmptyState
              icon="❤️"
              title="Your wishlist is empty"
              message="Tap the heart icon on any product to save it here for later."
            />
          ) : (
            <>
              <p className="text-sm font-bold text-[#64748B] dark:text-slate-400 mb-5">
                {products.length} saved product{products.length === 1 ? "" : "s"}
              </p>
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
              <div className="text-center mt-10">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 bg-[#2563EB] text-white font-bold text-sm px-8 py-3.5 rounded-2xl hover:bg-blue-500 transition-colors"
                >
                  <Heart className="w-4 h-4" />
                  Discover more products
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
