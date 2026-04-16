"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Flame, Zap, Target, Activity } from "lucide-react";

export default function InteractiveMacroProfiler() {
  const [macros, setMacros] = useState({
    calories: 2200,
    protein: 160,
    carbs: 240,
    fats: 65,
  });

  const updateMacro = (key: keyof typeof macros, val: number) => {
    setMacros((prev) => ({ ...prev, [key]: val }));
  };

  const macroTypes = [
    { key: "calories", label: "Energy Balance", unit: "kcal", icon: Flame, color: "#10b981", range: [1200, 4000] },
    { key: "protein", label: "Muscle Repair", unit: "g", icon: Zap, color: "#3b82f6", range: [50, 300] },
    { key: "carbs", label: "Fuel Reserve", unit: "g", icon: Activity, color: "#f59e0b", range: [50, 500] },
    { key: "fats", label: "Hormonal Health", unit: "g", icon: Target, color: "#ef4444", range: [20, 150] },
  ];

  return (
    <section className="py-40 relative overflow-hidden bg-base-dark">
      <div className="max-w-[1400px] mx-auto px-10">
        <div className="flex flex-col lg:flex-row gap-20 items-center">
          <div className="flex-1">
            <span className="text-[10px] text-emerald-400/40 tracking-[0.4em] font-black uppercase mb-6 block">Interactive Experience</span>
            <h2 className="heading-display text-5xl md:text-7xl text-white mb-8">
              Dial in your <br />
              <span className="text-emerald-400 italic">Metabolic Identity.</span>
            </h2>
            <p className="body-refined text-white/30 text-lg max-w-lg mb-12">
              The architecture of your transformation begins with precise alignment. 
              Use the profiler to visualize your target physiological state.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {macroTypes.map((type) => (
                <div key={type.key} className="p-6 rounded-3xl border border-white/5 bg-white/[0.02]">
                  <p className="text-[9px] text-white/20 font-black uppercase tracking-widest mb-1">{type.label}</p>
                  <p className="text-2xl font-black italic tracking-tighter text-white">
                    {macros[type.key as keyof typeof macros]} <span className="text-xs font-normal opacity-30 not-italic ml-1">{type.unit}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 w-full max-w-2xl">
            <div className="p-12 md:p-16 rounded-[4rem] border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent backdrop-blur-3xl relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-grain opacity-20" />
              
              <div className="space-y-12 relative z-10">
                {macroTypes.map((type) => {
                  const Icon = type.icon;
                  const current = macros[type.key as keyof typeof macros];
                  const percentage = ((current - type.range[0]) / (type.range[1] - type.range[0])) * 100;

                  return (
                    <div key={type.key} className="space-y-4">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                        <div className="flex items-center gap-3">
                          <Icon size={14} style={{ color: type.color }} />
                          <span className="text-white/40">{type.key}</span>
                        </div>
                        <span style={{ color: type.color }}>{current}{type.unit}</span>
                      </div>
                      <div className="relative h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          className="absolute inset-y-0 left-0 rounded-full"
                          style={{ backgroundColor: type.color }}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${percentage}%` }}
                          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                        />
                        <input 
                          type="range"
                          min={type.range[0]}
                          max={type.range[1]}
                          value={current}
                          onChange={(e) => updateMacro(type.key as any, parseInt(e.target.value))}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-16 pt-12 border-t border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-[9px] text-white/20 font-black uppercase tracking-widest mb-2">Simulated Outcome</p>
                  <p className="text-xl font-black italic tracking-tighter text-emerald-400">OPTIMAL ADAPTATION</p>
                </div>
                <div className="w-16 h-16 rounded-full border border-emerald-400/20 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full border border-emerald-400/40 animate-pulse bg-emerald-400/10 flex items-center justify-center">
                    <Target size={16} className="text-emerald-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
