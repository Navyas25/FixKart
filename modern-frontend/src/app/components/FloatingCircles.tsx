import { useEffect, useRef } from "react";

/**
 * Decorative glowing circles that drift 100px to the right with a stagger on
 * mount (Web Animations API). Each circle commits its final translate when
 * its animation finishes, so the layout stays put afterwards.
 */
export function FloatingCircles({
  count = 6,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const circles =
      containerRef.current?.querySelectorAll<HTMLElement>(".circle");
    circles?.forEach(($el, i) => {
      $el.animate(
        {
          translate: "100px",
        },
        {
          duration: 1000,
          delay: i * 100,
          easing: "ease-out",
        }
      ).finished.then(() => {
        $el.style.translate = "100px";
      });
    });
  }, []);

  return (
    <div ref={containerRef} className={className} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="circle block w-9 h-9 sm:w-11 sm:h-11 rounded-full"
          style={{
            backgroundColor: i % 2 === 0 ? "#F59E0B" : "#2563EB",
            opacity: 0.35,
            boxShadow: `0 0 24px ${
              i % 2 === 0 ? "rgba(245,158,11,0.5)" : "rgba(37,99,235,0.5)"
            }`,
          }}
        />
      ))}
    </div>
  );
}
