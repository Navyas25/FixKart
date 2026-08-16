import { Wrench } from "lucide-react";

// A circular badge whose text runs along an SVG arc and slowly rotates around
// a center icon. Used as an accent piece in the hero and final CTA.
export function RotatingCurvedText({
  text = "FIX KART • HARDWARE & HOME SERVICES • EST. 2026 • ",
  size = 148,
  icon = Wrench,
  iconColor = "#F59E0B",
  textColor = "#ffffff",
  className = "",
  duration = 22,
}: {
  text?: string;
  size?: number;
  icon?: typeof Wrench;
  iconColor?: string;
  textColor?: string;
  className?: string;
  duration?: number;
}) {
  const id = `fixkart-curve-${text.length}-${size}`.replace(/[^a-zA-Z0-9-]/g, "");
  const radius = 62; // circle radius in the SVG viewBox (viewBox 0 0 160 160)

  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 160 160" width={size} height={size} className="absolute inset-0">
        <defs>
          <path
            id={id}
            d={`M 80,80 m -${radius},0 a ${radius},${radius} 0 1,1 ${radius * 2},0 a ${radius},${radius} 0 1,1 -${radius * 2},0`}
          />
        </defs>
        <g style={{ transformOrigin: "80px 80px" }}>
          <text
            fill={textColor}
            fontSize="13.5"
            fontWeight="800"
            letterSpacing="2.5"
            style={{
              animation: `fixkart-spin ${duration}s linear infinite`,
              transformOrigin: "80px 80px",
            }}
          >
            <textPath href={`#${id}`}>{text}</textPath>
          </text>
        </g>
      </svg>
      {/* Center icon chip */}
      <div
        className="rounded-full flex items-center justify-center"
        style={{
          width: size * 0.3,
          height: size * 0.3,
          background: `${iconColor}1f`,
          border: `1.5px solid ${iconColor}55`,
          boxShadow: `0 4px 18px ${iconColor}33`,
        }}
      >
        <Wrench className="w-[38%] h-[38%]" style={{ color: iconColor }} strokeWidth={2.2} />
      </div>
      <style>{`
        @keyframes fixkart-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
