import { motion } from "motion/react";
import { Wrench, Hammer, Drill, HardHat, Cog, Settings } from "lucide-react";

// Branded loading screen inspired by the FixKart tools illustration:
// a spinning gear, floating tools, a striped progress bar and "Fixing Things…".
export default function LoadingScreen({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`${compact ? "py-16" : "fixed inset-0 z-[100] bg-[#060E1C] flex flex-col items-center justify-center"} overflow-hidden`}
      role="status"
      aria-label="Loading FixKart"
    >
      {/* Ambient glow - subtle, no gradient blobs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full bg-[#2563EB]/10 blur-[120px] pointer-events-none" />

      {/* Central spinning gear */}
      <div className="relative mb-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          className="w-24 h-24 flex items-center justify-center"
        >
          <Cog className="w-24 h-24 text-[#F59E0B]" strokeWidth={1.2} />
        </motion.div>
        {/* Floating tools around the gear */}
        <motion.div
          animate={{ y: [0, -10, 0], rotate: [0, 8, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-7 -left-9"
        >
          <Hammer className="w-8 h-8 text-white/80" strokeWidth={1.6} />
        </motion.div>
        <motion.div
          animate={{ y: [0, 12, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          className="absolute -top-8 -right-8"
        >
          <Wrench className="w-9 h-9 text-white/80" strokeWidth={1.6} />
        </motion.div>
        <motion.div
          animate={{ y: [0, -12, 0], rotate: [0, 14, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
          className="absolute -bottom-6 -left-10"
        >
          <Settings className="w-8 h-8 text-white/70" strokeWidth={1.6} />
        </motion.div>
        <motion.div
          animate={{ y: [0, 10, 0], rotate: [0, -12, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.9 }}
          className="absolute -bottom-8 -right-9"
        >
          <Drill className="w-9 h-9 text-white/80" strokeWidth={1.6} />
        </motion.div>
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1.1 }}
          className="absolute -top-10 left-1/2 -translate-x-1/2"
        >
          <HardHat className="w-7 h-7 text-[#F59E0B]" strokeWidth={1.8} />
        </motion.div>
      </div>

      {/* Wordmark */}
      <p className="text-white font-extrabold text-2xl tracking-tight mb-6">
        Fix<span className="text-[#F59E0B]">Kart</span>
      </p>

      {/* "Fixing Things…" */}
      <p className="text-white/60 font-semibold text-sm mb-3">
        Fixing Things
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        >
          …
        </motion.span>
      </p>

      {/* Striped progress bar */}
      <div className="w-56 h-3 rounded-full border border-white/20 overflow-hidden relative bg-white/5">
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-y-0 w-1/2"
          style={{
            background:
              "repeating-linear-gradient(45deg, #F59E0B 0 8px, #FBBF24 8px 16px)",
          }}
        />
      </div>
    </div>
  );
}
