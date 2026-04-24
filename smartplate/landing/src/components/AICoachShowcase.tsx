"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { MessageSquare, Sparkles, Brain, Zap, ShieldCheck, Cpu } from "lucide-react";

export default function AICoachShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section ref={containerRef} className="py-32 md:py-48 relative overflow-hidden bg-base-dark">
      {/* Top Shroud to clear floating ruler */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-base-dark to-transparent z-20 pointer-events-none" />
      
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-[1400px] mx-auto px-10 relative z-10">
        <div className="grid lg:grid-cols-2 gap-24 items-center">
          
          {/* Left: Content */}
          <div className="space-y-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                  <Brain size={12} className="text-emerald-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Neural Intelligence</span>
                </div>
              </div>
              
              <h2 className="heading-display text-5xl md:text-7xl lg:text-8xl text-white leading-[0.9] mb-8">
                YOUR 24/7 <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">METABOLIC</span> <br />
                COMMANDER.
              </h2>
              
              <p className="body-refined text-white/40 text-lg md:text-xl max-w-xl leading-relaxed">
                SmartPlate is not just a tracker. It&apos;s an advanced AI Coach that analyzes your metabolic trends, identifies nutritional gaps, and provides instant guidance to keep you on track.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-8">
              {[
                { icon: <MessageSquare size={20} />, title: "Real-time Chat", desc: "Get instant answers to any nutritional query, from macro splits to meal timings." },
                { icon: <Zap size={20} />, title: "Instant Synthesis", desc: "Our AI processes your historical data to predict your success trajectory." },
                { icon: <ShieldCheck size={20} />, title: "Protocol Guard", desc: "Stay within your active health protocols with automated warnings and tips." },
                { icon: <Cpu size={20} />, title: "Neural Grounding", desc: "Powered by the latest LLMs and grounded in clinical nutrition science." }
              ].map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 + 0.3 }}
                  className="space-y-4 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform duration-500">
                    {f.icon}
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-white/80">{f.title}</h3>
                  <p className="text-xs text-white/30 leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
              className="pt-8"
            >
              <button className="px-10 py-4 bg-white text-black text-xs font-black uppercase tracking-widest rounded-full hover:bg-emerald-400 transition-all duration-300">
                Meet Your Coach
              </button>
            </motion.div>
          </div>

          {/* Right: Visual */}
          <div className="relative">
            <motion.div 
              style={{ y: y1, opacity }}
              className="relative aspect-[4/5] rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(16,185,129,0.15)] bg-[#0a0a0a]"
            >
              <Image 
                src="/ai_coach_visual_landing_1777056498771.png" 
                alt="AI Coach Neural Interface"
                fill
                className="object-cover opacity-80"
              />
              
              {/* Overlay HUD Elements */}
              <div className="absolute inset-0 p-12 flex flex-col justify-between pointer-events-none">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black tracking-[0.4em] text-emerald-400 uppercase">System Status</span>
                    <span className="text-[8px] font-bold text-white/20 uppercase">Neural Link Established</span>
                  </div>
                  <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center backdrop-blur-xl">
                    <Sparkles size={16} className="text-white/40" />
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="p-6 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-3xl">
                     <div className="flex items-center gap-3 mb-4">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] font-black text-white/60 tracking-widest uppercase">Coach Insight</span>
                     </div>
                     <p className="text-sm text-white/80 leading-relaxed font-medium italic">
                        &quot;Based on your 7-day adherence, increasing morning protein by 12g will stabilize your glucose levels for the afternoon workout.&quot;
                     </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                        <span className="text-[8px] font-bold text-white/20 uppercase block mb-1">Adherence</span>
                        <span className="text-xl font-bold text-emerald-400">98.4%</span>
                     </div>
                     <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                        <span className="text-[8px] font-bold text-white/20 uppercase block mb-1">Projected Goal</span>
                        <span className="text-xl font-bold text-blue-400">14 Days</span>
                     </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Floating Element */}
            <motion.div
              style={{ y: y2 }}
              className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-[40px] pointer-events-none"
            />
          </div>

        </div>
      </div>
    </section>
  );
}
