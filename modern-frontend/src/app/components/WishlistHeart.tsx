import { Heart } from "lucide-react";
import { useWishlist, type WishlistItem } from "../../lib/wishlist";

/**
 * Heart button that toggles an item (product / service / professional) in the
 * device-local wishlist. Stops event propagation so it can live inside cards
 * that navigate on click.
 */
export function WishlistHeart({
  item,
  size = "md",
  className = "",
}: {
  item: WishlistItem;
  size?: "sm" | "md";
  className?: string;
}) {
  const { isSaved, toggle } = useWishlist();
  const saved = isSaved(item.id);
  const box = size === "sm" ? "w-7 h-7" : "w-8 h-8";
  const icon = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(item);
      }}
      aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
      title={saved ? "Remove from wishlist" : "Add to wishlist"}
      className={`${box} rounded-full flex items-center justify-center backdrop-blur transition-all active:scale-90 ${
        saved
          ? "bg-[#DC2626] text-white shadow-lg shadow-red-600/30"
          : "bg-white/90 text-[#64748B] hover:text-[#DC2626] hover:bg-white shadow-sm border border-gray-100"
      } ${className}`}
    >
      <Heart className={`${icon} ${saved ? "fill-current" : ""}`} />
    </button>
  );
}
