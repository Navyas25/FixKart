import { useEffect, useRef } from "react";
import { createLayout, stagger } from "animejs";
import {
  Truck, BadgeCheck, ShieldCheck, MapPin, Star, Headphones, Package, RotateCcw,
} from "lucide-react";

const tiles = [
  { Icon: Truck, label: "Same-day delivery", bg: "#F59E0B", color: "#0F172A" },
  { Icon: BadgeCheck, label: "Verified professionals", bg: "#2563EB", color: "#FFFFFF" },
  { Icon: ShieldCheck, label: "Secure payments", bg: "rgba(255,255,255,0.08)", color: "#E2E8F0", border: "rgba(255,255,255,0.14)" },
  { Icon: MapPin, label: "Real-time tracking", bg: "#334155", color: "#F1F5F9" },
  { Icon: Star, label: "Ratings & reviews", bg: "#F59E0B", color: "#0F172A" },
  { Icon: Headphones, label: "24/7 support", bg: "#2563EB", color: "#FFFFFF" },
  { Icon: Package, label: "Easy ordering", bg: "rgba(255,255,255,0.08)", color: "#E2E8F0", border: "rgba(255,255,255,0.14)" },
  { Icon: RotateCcw, label: "Easy returns", bg: "#334155", color: "#F1F5F9" },
];

/**
 * Anime.js layout animation: cycles the grid container through four
 * data-grid variants (1→4) every second with a 150ms stagger, looping
 * forever. See the CSS variants in src/styles/globals.css.
 */
export function LayoutGridAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const layout = createLayout(container);
    let i = 0;
    let current: ReturnType<typeof layout.update> | null = null;

    function animateLayout() {
      current = layout.update(
        ({ root }) => {
          root.dataset.grid = (++i % 4) + 1;
        },
        {
          duration: 1000,
          delay: stagger(150),
          onComplete: () => animateLayout(),
        }
      );
    }

    animateLayout();

    return () => {
      current?.cancel?.();
    };
  }, []);

  return (
    <div ref={containerRef} className="layout-container" data-grid="1">
      {tiles.map(({ Icon, label, bg, color, border }) => (
        <div
          key={label}
          className="layout-item"
          style={{
            background: bg,
            color,
            border: border ? `1px solid ${border}` : "none",
          }}
        >
          <Icon className="w-6 h-6" />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
