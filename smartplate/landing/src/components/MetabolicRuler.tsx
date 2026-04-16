// MetabolicRuler.tsx
"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Simple horizontal slider for now but with a "ruler" aesthetic
  const ticks = Array.from({ length: 51 }, (_, i) => i);

  return (
    <div className="relative w-full py-8 group">
      <div className="flex justify-between items-end mb-4 px-2">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Precision HUD</span>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black italic tracking-tighter text-emerald-400">{value}</span>
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{unit}</span>
        </div>
      </div>

      <div className="relative h-12 bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden flex items-center px-4">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          className="w-full h-full opacity-0 absolute inset-0 z-20 cursor-ew-resize"
        />
        
        <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none">
          {ticks.map((t) => (
            <div 
              key={t} 
              className={`w-[1px] transition-all duration-300 ${
                t % 10 === 0 ? 'h-6 bg-white/20' : t % 5 === 0 ? 'h-4 bg-white/10' : 'h-2 bg-white/5'
              } ${Math.abs((value / max) * 50 - t) < 1 ? 'bg-emerald-400 h-8 opacity-100' : ''}`}
            />
          ))}
        </div>
        
        <motion.div 
          className="absolute top-0 bottom-0 w-1 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] z-10"
          style={{ left: `${(value / max) * 100}%` }}
          animate={{ scaleY: isDragging ? 1.2 : 1 }}
        />
      </div>
      
      <div className="flex justify-between mt-3 px-2">
        <span className="text-[8px] font-black text-white/10 uppercase tracking-widest">MIN: {min}</span>
        <span className="text-[8px] font-black text-white/10 uppercase tracking-widest">MAX: {max}</span>
      </div>
    </div>
  );
}
