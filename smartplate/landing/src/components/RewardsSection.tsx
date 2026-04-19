"use client";

import { motion } from "framer-motion";
import { Trophy, Star, Target, Flame, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function RewardsSection() {
  return (
    <section id="rewards" className="py-24 md:py-32 bg-base-dark relative overflow-hidden border-t border-white/5">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-[1400px] mx-auto px-10 relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <span className="text-[10px] text-emerald-400/40 tracking-[0.4em] font-black uppercase mb-4 block">Compounding Growth</span>
            <h2 className="heading-display text-5xl md:text-7xl text-white mb-8">
              Consistency is <br />
              <span className="text-emerald-400 italic">Rewarded.</span>
            </h2>
            <p className="body-refined text-white/30 text-lg max-w-lg mb-12">
              The SmartPlate engine tracks your adherence and unlocks unique metabolic badges, 
              expert protocols, and digital collectibles as you transform.
            </p>

            <div className="space-y-6 mb-12">
              {[
                { icon: Flame, title: "7-Day Metabolic Streak", desc: "Unlock 'High-Burn' protocol access", color: "#f59e0b" },
                { icon: Star, title: "Macro Precision Medal", desc: "Top 1% of global precision trackers", color: "#38bdf8" },
                { icon: Trophy, title: "90-Day Transformation", desc: "Expert coach consultation unlocked", color: "#a3e635" },
              ].map((reward, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  className="flex items-center gap-6 p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${reward.color}10` }}>
                    <reward.icon size={20} style={{ color: reward.color }} className="group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold tracking-tight">{reward.title}</h4>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">{reward.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Link href="/auth/signup">
                <button className="group px-10 py-4 bg-white text-black text-[11px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-3">
                  Start Your Streak <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </Link>
          </div>

          <div className="relative">
            <div className="obsidian-card p-12 aspect-square flex flex-col items-center justify-center relative overflow-hidden">
               {/* Progress UI Mockup */}
               <div className="absolute inset-x-0 top-0 h-1 bg-white/5">
                 <motion.div 
                   className="absolute inset-y-0 left-0 bg-emerald-500" 
                   initial={{ width: 0 }}
                   whileInView={{ width: "78%" }}
                   transition={{ duration: 1.5, ease: "circOut" }}
                 />
               </div>

               <div className="relative w-64 h-64 mb-10">
                 <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="2" />
                    <motion.circle 
                      cx="50" cy="50" r="45" fill="none" 
                      stroke="#10b981" strokeWidth="2" strokeLinecap="round"
                      strokeDasharray="283"
                      initial={{ strokeDashoffset: 283 }}
                      whileInView={{ strokeDashoffset: 283 * (1 - 0.78) }}
                      transition={{ duration: 2, ease: "circOut" }}
                    />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[10px] text-white/20 font-black uppercase tracking-widest mb-1">Weekly Streak</span>
                    <span className="text-7xl font-bold tracking-tighter text-white" style={{ fontFamily: 'var(--font-display)' }}>78</span>
                    <span className="text-[10px] text-white/20 font-black uppercase tracking-widest mt-1">XP / 100</span>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
                     <p className="text-[8px] text-white/20 font-black uppercase tracking-widest mb-2">Efficiency</p>
                     <p className="heading-display text-2xl text-emerald-400">92.4%</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
                     <p className="text-[8px] text-white/20 font-black uppercase tracking-widest mb-2">Focus Mode</p>
                     <p className="heading-display text-2xl text-blue-400">ACTIVE</p>
                  </div>
               </div>

               {/* Decorative Lines */}
               <div className="absolute bottom-6 right-6 opacity-10">
                  <div className="flex gap-1 items-end h-8">
                     {[20, 40, 60, 30, 80, 50].map((h, i) => (
                       <div key={i} className="w-[2px] bg-white" style={{ height: `${h}%` }} />
                     ))}
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
