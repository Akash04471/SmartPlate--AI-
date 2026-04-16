"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface DetectionZone {
  id: string;
  top: string;
  left: string;
  width: string;
  height: string;
  label: string;
  macros: { p: string; f: string; c: string };
  calories: string;
  color: string;
}

const detections: DetectionZone[] = [
  {
    id: "egg",
    top: "35%",
    left: "38%",
    width: "25%",
    height: "25%",
    label: "Poached Egg",
    macros: { p: "6g", f: "5g", c: "0g" },
    calories: "72 kcal",
    color: "#f59e0b",
  },
  {
    id: "avocado",
    top: "30%",
    left: "25%",
    width: "50%",
    height: "50%",
    label: "Hass Avocado",
    macros: { p: "4g", f: "22g", c: "12g" },
    calories: "240 kcal",
    color: "#22c55e",
  },
  {
    id: "sourdough",
    top: "25%",
    left: "22%",
    width: "56%",
    height: "60%",
    label: "Sourdough Toast",
    macros: { p: "5g", f: "1g", c: "24g" },
    calories: "120 kcal",
    color: "#38bdf8",
  },
];

const flickerVariants = {
  flicker: {
    opacity: [1, 0.8, 1, 0.9, 1],
    transition: {
      duration: 0.2,
      repeat: Infinity,
      repeatType: "mirror" as const,
    },
  },
};

export default function AIVisionOverlay({ 
  scanProgress, 
  showDetection, 
  showAnalysis 
}: { 
  scanProgress: number; 
  showDetection: boolean; 
  showAnalysis: boolean;
}) {
  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
      {/* Background Holographic Mesh */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />

      {/* Primary Scan Line */}
      <motion.div
        className="absolute left-0 right-0 h-[1px] bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,1)] z-30"
        style={{ top: `${scanProgress * 100}%` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: scanProgress > 0 && scanProgress < 1 ? 1 : 0 }}
      />
      
      {/* Secondary Trailing Scan Lines */}
      {[0.05, 0.1, 0.15].map((offset, i) => (
        <motion.div
          key={i}
          className="absolute left-0 right-0 h-[1px] bg-emerald-400/20 z-20"
          style={{ top: `${(scanProgress - offset) * 100}%` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: (scanProgress > offset && scanProgress < 1 + offset) ? 0.3 / (i + 1) : 0 }}
        />
      ))}

      {/* Detections */}
      {detections.map((d, i) => (
        <div key={d.id} className="absolute" style={{ top: d.top, left: d.left, width: d.width, height: d.height }}>
          {/* Bounding Box with Flicker */}
          <motion.div
            className="absolute inset-0 border-[0.5px] rounded-lg shadow-[inset_0_0_15px_rgba(255,255,255,0.05)]"
            style={{ borderColor: `${d.color}60` }}
            variants={flickerVariants}
            animate={showDetection ? "flicker" : { opacity: 0 }}
            initial={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          >
            {/* Corner Accents */}
            <div className="absolute top-[-1px] left-[-1px] w-3 h-3 border-t-2 border-l-2" style={{ borderColor: d.color }} />
            <div className="absolute top-[-1px] right-[-1px] w-3 h-3 border-t-2 border-r-2" style={{ borderColor: d.color }} />
            <div className="absolute bottom-[-1px] left-[-1px] w-3 h-3 border-b-2 border-l-2" style={{ borderColor: d.color }} />
            <div className="absolute bottom-[-1px] right-[-1px] w-3 h-3 border-b-2 border-r-2" style={{ borderColor: d.color }} />
          </motion.div>

          {/* Labels & Macros with Premium Typography */}
          <motion.div
            className="absolute top-0 left-full ml-6 whitespace-nowrap"
            initial={{ opacity: 0, x: -20, filter: "blur(5px)" }}
            animate={{ 
              opacity: showAnalysis ? 1 : 0,
              x: showAnalysis ? 0 : -20,
              filter: showAnalysis ? "blur(0px)" : "blur(5px)"
            }}
            transition={{ delay: i * 0.15 + 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="bg-black/40 backdrop-blur-md p-4 border border-white/10 rounded-2xl">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: d.color, boxShadow: `0 0 10px ${d.color}` }} />
                  <span className="text-white font-black italic text-sm tracking-tighter uppercase" style={{ fontFamily: 'var(--font-display)' }}>{d.label}</span>
                  <span className="text-[9px] text-white/30 font-black uppercase tracking-[0.2em]">{d.calories}</span>
                </div>
                <div className="h-[1px] w-full bg-white/5 my-1" />
                <div className="flex gap-4 text-[9px] text-white/40 font-black tracking-widest uppercase">
                  <span>P: <span className="text-white/60">{d.macros.p}</span></span>
                  <span>F: <span className="text-white/60">{d.macros.f}</span></span>
                  <span>C: <span className="text-white/60">{d.macros.c}</span></span>
                </div>
              </div>
            </div>
            
            {/* Connector Line with Origin Animation */}
            <motion.div 
              className="absolute right-full top-6 w-6 h-[1px] bg-white/20 origin-right" 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: showAnalysis ? 1 : 0 }}
              transition={{ delay: i * 0.15 + 0.5 }}
            />
          </motion.div>
        </div>
      ))}

      {/* AI HUD Elements with Telemetry Feel */}
      <motion.div
        className="absolute top-10 left-10 p-6 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/5"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: showDetection ? 1 : 0, x: showDetection ? 0 : -20 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <Sparkles size={14} className="text-emerald-400 animate-spin-slow" />
          <span className="text-[9px] text-white/40 font-black tracking-[0.4em] uppercase">NEURAL_DECODER_v2.6</span>
        </div>
        <div className="text-[10px] space-y-2">
            {[
                { k: "RECOGNITION", v: "0.994", c: "text-emerald-400" },
                { k: "CONFIDENCE", v: "CRITICAL", c: "text-white" },
                { k: "SAMPLING", v: "512_LAYERS", c: "text-white/40" }
            ].map((stat, i) => (
                <div key={i} className="flex justify-between gap-6 font-black italic tracking-tighter uppercase">
                    <span className="text-white/20 not-italic tracking-widest">{stat.k}</span>
                    <span className={stat.c}>{stat.v}</span>
                </div>
            ))}
        </div>
      </motion.div>
    </div>
  );
}

