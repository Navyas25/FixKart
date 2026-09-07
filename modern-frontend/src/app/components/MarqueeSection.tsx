import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

export default function MarqueeSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const lineA = useTransform(scrollYProgress, [0, 1], ["0%", "-42%"]);
  const lineB = useTransform(scrollYProgress, [0, 1], ["-42%", "0%"]);

  const text = "FIXKART • HARDWARE & HOME SERVICES • FIXED FAST • ";

  return (
    <section ref={ref} className="bg-[#0F172A] border-y border-white/10 overflow-hidden py-8 select-none">
      <motion.div
        style={{ x: lineA }}
        className="whitespace-nowrap text-3xl sm:text-5xl font-extrabold tracking-tight text-white/90"
      >
        {text.repeat(6)}
      </motion.div>
      <motion.div
        style={{ x: lineB }}
        className="whitespace-nowrap text-3xl sm:text-5xl font-extrabold tracking-tight text-[#F59E0B]"
      >
        {text.repeat(6)}
      </motion.div>
    </section>
  );
}
