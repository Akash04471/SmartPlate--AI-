"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingScreenProps {
  onComplete: () => void;
}

// ─── PARTICLE FIELD (Client-only to prevent SSR hydration mismatch) ──
function ParticleField() {
  const [particles, setParticles] = useState<Array<{
    id: number; orbitRadius: number; duration: number;
    delay: number; size: number; opacity: number;
  }>>([]);

  useEffect(() => {
    // Generate particles only on the client — zero SSR mismatch
    setParticles(
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        orbitRadius: 60 + Math.random() * 80,
        duration: 3 + Math.random() * 4,
        delay: Math.random() * 2,
        size: 1 + Math.random() * 2.5,
        opacity: 0.15 + Math.random() * 0.4,
      }))
    );
  }, []);

  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            width: p.size,
            height: p.size,
          }}
        >
          <div
            className="w-full h-full rounded-full bg-emerald-400"
            style={{
              opacity: p.opacity,
              animation: `orbitFloat ${p.duration.toFixed(1)}s linear ${p.delay.toFixed(1)}s infinite`,
              "--orbit-radius": `${Math.round(p.orbitRadius)}px`
            } as React.CSSProperties}
          />
        </div>
      ))}
    </div>
  );
}

// ─── MORPHING SHAPE ──────────────────────────────────────────────────
function MorphingShape({ progress }: { progress: number }) {
  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      {/* Outer Morphing Ring */}
      <motion.div
        className="absolute inset-0"
        style={{
          border: "1px solid rgba(16, 185, 129, 0.3)",
          animation: "morphPulse 4s ease-in-out infinite",
        }}
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Inner Morphing Ring (counter-rotate) */}
      <motion.div
        className="absolute inset-3"
        style={{
          border: "1px solid rgba(16, 185, 129, 0.15)",
          animation: "morphPulse 4s ease-in-out infinite reverse",
        }}
      />

      {/* Progress Arc (SVG) */}
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50" cy="50" r="45"
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth="0.5"
        />
        <motion.circle
          cx="50" cy="50" r="45"
          fill="none"
          stroke="url(#arcGradient)"
          strokeWidth="1"
          strokeLinecap="round"
          strokeDasharray={283}
          initial={{ strokeDashoffset: 283 }}
          animate={{ strokeDashoffset: 283 - (283 * progress) }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#11ff99" stopOpacity="0.2" />
          </linearGradient>
        </defs>
      </svg>

      {/* Center Counter */}
      <motion.span
        className="relative z-10 font-bold tracking-tighter text-white/80"
        style={{ fontFamily: "var(--font-display)", fontSize: "28px" }}
        key={Math.round(progress * 100)}
      >
        {Math.round(progress * 100)}
      </motion.span>
    </div>
  );
}

// ─── MAIN LOADING SCREEN ─────────────────────────────────────────────
export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);
  const [exiting, setExiting] = useState(false);

  const phases = [
    "Initializing metabolic engine",
    "Calibrating nutritional sensors",
    "Assembling your SmartPlate",
  ];

  useEffect(() => {
    const totalDuration = 1600; // 1.6 seconds
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const p = Math.min(elapsed / totalDuration, 1);
      // Exponential ease-out for snappy feel
      const eased = 1 - Math.pow(1 - p, 3);
      setProgress(eased);

      // Phase transitions
      if (p > 0.33 && phase < 1) setPhase(1);
      if (p > 0.66 && phase < 2) setPhase(2);

      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        setExiting(true);
        setTimeout(onComplete, 600);
      }
    };

    requestAnimationFrame(tick);
  }, [onComplete, phase]);

  // Staggered character reveal for "SMARTPLATE"
  const brandName = "SMARTPLATE";

  return (
    <AnimatePresence>
      {!exiting ? (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "radial-gradient(ellipse at center, #052015 0%, #031810 70%)" }}
          exit={{
            scale: 1.15,
            opacity: 0,
            filter: "blur(30px)",
          }}
          transition={{ duration: 0.6, ease: [0.6, 0.05, 0.01, 0.9] }}
        >
          {/* Ambient Radial Pulse */}
          <motion.div
            className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)",
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Particle Field */}
          <ParticleField />

          {/* Main Content */}
          <div className="relative z-10 flex flex-col items-center gap-12">
            {/* Morphing Shape + Progress Arc */}
            <MorphingShape progress={progress} />

            {/* Brand Name — Staggered Character Reveal */}
            <div className="flex gap-[3px] overflow-hidden">
              {brandName.split("").map((char, i) => (
                <motion.span
                  key={i}
                  className="text-[13px] font-bold tracking-[0.35em] text-white/70"
                  style={{ fontFamily: "var(--font-label)" }}
                  initial={{ y: 30, opacity: 0, filter: "blur(4px)" }}
                  animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                  transition={{
                    delay: 0.1 + i * 0.04,
                    duration: 0.5,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {char}
                </motion.span>
              ))}
            </div>

            {/* Phase Text */}
            <AnimatePresence mode="wait">
              <motion.p
                key={phase}
                className="text-[9px] text-white/25 tracking-[0.3em] uppercase font-medium"
                style={{ fontFamily: "var(--font-label)" }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                {phases[phase]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Corner Brackets */}
          <motion.div
            className="absolute top-8 left-8 w-12 h-12 border-t border-l border-white/[0.06]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          />
          <motion.div
            className="absolute top-8 right-8 w-12 h-12 border-t border-r border-white/[0.06]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          />
          <motion.div
            className="absolute bottom-8 left-8 w-12 h-12 border-b border-l border-white/[0.06]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          />
          <motion.div
            className="absolute bottom-8 right-8 w-12 h-12 border-b border-r border-white/[0.06]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          />
        </motion.div>
      ) : (
        /* Cinematic Exit — Scale + Blur Implosion */
        <motion.div
          className="fixed inset-0 z-[9999]"
          style={{ background: "radial-gradient(ellipse at center, #052015 0%, #031810 70%)" }}
          initial={{ opacity: 1, scale: 1 }}
          animate={{
            opacity: 0,
            scale: 1.2,
            filter: "blur(40px)",
          }}
          transition={{ duration: 0.6, ease: [0.6, 0.05, 0.01, 0.9] }}
        />
      )}
    </AnimatePresence>
  );
}
