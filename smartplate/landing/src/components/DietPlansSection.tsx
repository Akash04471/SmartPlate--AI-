"use client";

import { motion } from "framer-motion";
import { dietTypes } from "@/data/smartplateContent";
import { ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function DietPlansSection() {
  return (
    <section id="diets" className="py-24 md:py-32 bg-base-dark relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(16,185,129,0.05)_0%,transparent_50%)]" />
      
      <div className="max-w-[1400px] mx-auto px-10 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-2xl">
            <span className="text-[10px] text-emerald-400/40 tracking-[0.4em] font-black uppercase mb-4 block">Protocols</span>
            <h2 className="heading-display text-5xl md:text-7xl text-white mb-6">
              Precision coded.<br />
              <span className="text-emerald-400 italic">Personalized for life.</span>
            </h2>
            <p className="body-refined text-white/30 text-lg">
              SmartPlate doesn&apos;t do generic. Choose a foundation and watch the AI calibrate 
              every macro to your specific metabolic signature.
            </p>
          </div>
          <Link href="/auth/signup" className="group flex items-center gap-4 text-white hover:text-emerald-400 transition-colors">
            <span className="text-[11px] font-black uppercase tracking-widest">View all protocols</span>
            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-emerald-500/30 transition-all">
              <ChevronRight size={16} />
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dietTypes.map((diet, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="obsidian-card p-10 group hover:bg-white/[0.03] transition-all duration-500"
            >
              <div className="text-4xl mb-8 group-hover:scale-110 transition-transform duration-500 origin-left">
                {diet.emoji}
              </div>
              <div className="flex items-center gap-3 mb-4">
                <h3 className="heading-display text-2xl text-white group-hover:text-emerald-400 transition-colors">
                  {diet.name}
                </h3>
              </div>
              <p className="body-refined text-white/30 text-sm leading-relaxed mb-8">
                {diet.description}
              </p>
              <div className="flex items-center gap-2">
                <Sparkles size={12} className="text-emerald-500" />
                <span className="text-[9px] text-white/40 font-black uppercase tracking-widest">
                  {diet.tag}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
