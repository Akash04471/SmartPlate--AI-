import { motion, useMotionValue, useTransform, useMotionValueEvent, type MotionValue } from "framer-motion";
import { useRef, useState } from "react";

interface MetabolicRulerProps {
  value: MotionValue<number> | number;
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
  
  // Ensure we have a MotionValue for calculations

  const internalMotionValue = useMotionValue(typeof value === 'number' ? value : (value?.get?.() ?? 0));
  
  // Choose which motion value to use (provided one or internal one)
  const motionValue = (typeof value === 'number' || !value) ? internalMotionValue : value;

  // Sync internal motion value if external number value changes
  if (typeof value === 'number') {
    motionValue.set(value);
  }



  // Use a sub-component for the value display to avoid re-rendering the entire ruler scale on every frame
  const ValueDisplay = ({ value, unit }: { value: MotionValue<number>, unit: string }) => {

    const [display, setDisplay] = useState(value.get());
    useMotionValueEvent(value, "change", (latest) => setDisplay(Math.round(latest)));
    return (
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-black italic tracking-tighter text-white" style={{ fontVariantNumeric: "tabular-nums" }}>
          {display}
        </span>
        <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest">{unit}</span>
      </div>
    );
  };

  const TooltipDisplay = ({ value, unit }: { value: MotionValue<number>, unit: string }) => {
    const [display, setDisplay] = useState(value.get());
    useMotionValueEvent(value, "change", (latest) => setDisplay(Math.round(latest)));
    return (
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-emerald-500 text-black text-[7px] font-black px-1.5 py-0.5 rounded-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
        {display} {unit}
      </div>
    );
  };


  // Total number of major intervals (e.g., 0, 100, 200...)
  const totalTicks = 100; // Small marks
  const ticks = Array.from({ length: totalTicks + 1 }, (_, i) => i);

  // Calculate percentage for the needle (0 to 100)
  const percentage = useTransform(motionValue, [min, max], ["0%", "100%"]);
  const needleLeft = useTransform(motionValue, [min, max], ["calc(3rem + (0% * (100% - 6rem)) / 100)", "calc(3rem + (100% * (100% - 6rem)) / 100)"]);



  return (
    <div className="relative w-full py-1 group select-none">
      {/* Header Info */}
      <div className="flex justify-between items-center mb-1 px-4">
        <ValueDisplay value={motionValue} unit={unit} />
        <div className="flex flex-col items-end">
          <span className="text-[7px] font-black uppercase text-white/20 tracking-widest leading-none mb-1">Precision Scaling</span>
          <div className="h-1.5 w-12 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-emerald-500/40"
              style={{ width: percentage }}
            />
          </div>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="relative h-12 bg-gradient-to-b from-white/[0.03] to-transparent border border-white/5 rounded-xl overflow-hidden flex items-center shadow-lg backdrop-blur-md"
      >
        {/* Progress Background Fill */}
        <motion.div 
          className="absolute inset-y-0 left-0 bg-emerald-500/5 border-r border-emerald-500/10 pointer-events-none"
          style={{ width: percentage }}
        />


        {/* Static Scale / Ticks */}
        <div className="absolute inset-0 flex justify-between items-center px-8 md:px-12 pointer-events-none opacity-30">
          {ticks.map((t) => {
            const isMajor = t % 10 === 0;
            const isMid = t % 5 === 0;
            return (
              <div key={t} className="flex flex-col items-center">
                <div 
                  className={`w-[1px] transition-colors duration-500 ${
                    isMajor ? 'h-6 bg-white/60' : isMid ? 'h-4 bg-white/30' : 'h-2 bg-white/10'
                  }`} 
                />
              </div>
            );
          })}
        </div>

        <motion.div 
          className="absolute inset-y-0 z-30 pointer-events-none flex flex-col items-center justify-center"
          style={{ width: "2px", left: needleLeft }}
        >

          {/* Needle Graphic */}
          <div className="w-[1px] h-8 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.8)] relative">
            <div className="absolute -top-0.5 left-1/2 -track-x-1/2 w-2 h-2 bg-emerald-500 rounded-full blur-[2px]" />
            <div className="absolute -bottom-0.5 left-1/2 -track-x-1/2 w-2 h-2 bg-emerald-500 rounded-full blur-[2px]" />
            
            {/* Value Tooltip attached to needle - smaller and more subtle */}
            <TooltipDisplay value={motionValue} unit={unit} />



          </div>
          
          {/* Dynamic Glow */}
          <div className="absolute inset-0 w-6 h-full -left-2.5 bg-emerald-500/10 blur-xl opacity-40" />
        </motion.div>

        {/* HUD UI Elements */}
        <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black/20 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-black/20 to-transparent z-10 pointer-events-none" />
        
        {/* Interaction Scrubbing Layer */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={motionValue.get()}

          onChange={(e) => onChange(parseFloat(e.target.value))}

          className="w-full h-full opacity-0 absolute inset-0 z-40 cursor-ew-resize"
        />

      </div>
    </div>
  );
}
