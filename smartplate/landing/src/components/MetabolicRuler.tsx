// MetabolicRuler.tsx
"use client";

import { motion } from "framer-motion";
import { useRef } from "react";

interface MetabolicRulerProps {
  value: number;
  onChange: (val: number) => void;
  unit: string;
  min?: number;
  max?: number;
  step?: number;
}

export default function MetabolicRuler({
  value,
  onChange,
  unit,
  min = 0,
  max = 1000,
  step = 1,
}: MetabolicRulerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Total number of major intervals (e.g., 0, 100, 200...)
  const majorIntervals = 10; 
  const totalTicks = 100; // Small marks
  const ticks = Array.from({ length: totalTicks + 1 }, (_, i) => i);

  // Calculate percentage for the needle (0 to 100)
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="relative w-full py-6 group select-none">
      {/* Header Info */}
      <div className="flex justify-between items-end mb-4 px-2">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500/40">Metabolic HUD</span>
          <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest mt-1">Precision scroll tracking active</span>
        </div>
        <div className="flex items-baseline gap-2">
          <motion.span 
            className="text-4xl font-black italic tracking-tighter text-white"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {value}
          </motion.span>
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{unit}</span>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="relative h-24 bg-gradient-to-b from-white/[0.03] to-transparent border border-white/10 rounded-2xl overflow-hidden flex items-center shadow-2xl backdrop-blur-xl"
      >
        {/* Progress Background Fill */}
        <motion.div 
          className="absolute inset-y-0 left-0 bg-emerald-500/5 border-r border-emerald-500/10 pointer-events-none"
          animate={{ width: `${percentage}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />

        {/* Static Scale / Ticks */}
        <div className="absolute inset-0 flex justify-between items-center px-8 md:px-12 pointer-events-none opacity-40">
          {ticks.map((t) => {
            const isMajor = t % 10 === 0;
            const isMid = t % 5 === 0;
            return (
              <div key={t} className="flex flex-col items-center">
                <div 
                  className={`w-[1px] transition-colors duration-500 ${
                    isMajor ? 'h-8 bg-white/60' : isMid ? 'h-5 bg-white/30' : 'h-3 bg-white/10'
                  }`} 
                />
                {isMajor && (
                  <span className="text-[8px] font-bold text-white/20 absolute -bottom-6">
                    {Math.round((t / totalTicks) * max)}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <motion.div 
          className="absolute inset-y-0 z-30 pointer-events-none flex flex-col items-center justify-center"
          style={{ width: "2px" }}
          // Mapping percentage to the actual scale area (between padding)
          animate={{ left: `calc(3rem + (${percentage}% * (100% - 6rem)) / 100)` }} 
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Needle Graphic */}
          <div className="w-[2px] h-12 bg-emerald-500 rounded-full shadow-[0_0_20px_rgba(16,185,129,1)] relative">
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-emerald-500 rounded-full blur-[4px]" />
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-emerald-500 rounded-full blur-[4px]" />
            
            {/* Value Tooltip attached to needle */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-emerald-500 text-black text-[9px] font-black px-2 py-1 rounded-sm whitespace-nowrap">
               {value} {unit}
            </div>
          </div>
          
          {/* Dynamic Glow */}
          <div className="absolute inset-0 w-8 h-full -left-3 bg-emerald-500/20 blur-xl opacity-50" />
        </motion.div>

        {/* HUD UI Elements */}
        <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-base-dark to-transparent z-10 pointer-events-none md:block hidden" />
        <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-base-dark to-transparent z-10 pointer-events-none md:block hidden" />
        
        {/* Interaction Scrubbing Layer */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-full opacity-0 absolute inset-0 z-40 cursor-ew-resize"
        />
      </div>
      
      {/* Footer Markers */}
      <div className="flex justify-between mt-8 px-2">
        <span className="text-[8px] font-black text-white/10 uppercase tracking-[0.4em]">Baseline Vector</span>
        <div className="flex gap-6">
           <div className="flex items-center gap-2">
             <div className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" />
             <span className="text-[8px] font-black text-emerald-500/40 uppercase tracking-widest">Active Stream</span>
           </div>
           <span className="text-[8px] font-black text-white/10 uppercase tracking-[0.4em]">Capacity Max</span>
        </div>
      </div>
    </div>
  );
}
