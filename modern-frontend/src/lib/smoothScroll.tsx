import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

// Single Lenis instance shared across the app. Created once on mount by
// <SmoothScroll>, used by ScrollToTop for instant jumps on route change.
let lenis: Lenis | null = null;

export function getLenis() {
  return lenis;
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Recommended sensible defaults for a SPA (mirrors the no-code recipe):
    // autoRaf for the rAF loop, anchors for in-page links, nested scroll for
    // scrollable elements, and stopInertiaOnNavigate so page changes don't
    // drift after clicking a router link.
    lenis = new Lenis({
      autoRaf: true,
      autoToggle: true,
      anchors: true,
      allowNestedScroll: true,
      stopInertiaOnNavigate: true,
    });

    return () => {
      lenis?.destroy();
      lenis = null;
    };
  }, []);

  return <>{children}</>;
}

// Instant jump to the top - used on route change (replaces window.scrollTo,
// which fights Lenis's animated scroll).
export function scrollToTop() {
  if (lenis) {
    lenis.scrollTo(0, { immediate: true });
  } else {
    window.scrollTo(0, 0);
  }
}
