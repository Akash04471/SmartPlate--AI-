"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import Link from "next/link";
import { Utensils, Zap, Shield, Target } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const PROTOCOLS = [
  {
    step: "01",
    title: "Metabolic Primer",
    desc: "A focused 48-hour protocol to optimize insulin sensitivity and prepare your physiological state for efficient nutrient utilization.",
    icon: <Zap />,
    accent: "emerald"
  },
  {
    step: "02",
    title: "Macronutrient Alignment",
    desc: "Strategic protein, lipid, and carbohydrate distribution calibrated to your specific physiological data and activity profile.",
    icon: <Utensils />,
    accent: "lime-accent"
  },
  {
    step: "03",
    title: "Chrononutrition",
    desc: "Precision calibration of nutritional windows to synchronize with your circadian rhythm and peak energy expenditure.",
    icon: <Shield />,
    accent: "emerald"
  },
  {
    step: "04",
    title: "Precision Bio-Metrics",
    desc: "Continuous refinement of micronutrient density to support cognitive function and long-term metabolic vitality.",
    icon: <Target />,
    accent: "lime-accent"
  }
];

export default function HorizontalProtocol() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const container = containerRef.current;

    if (!section || !container) return;

    const totalWidth = container.scrollWidth - window.innerWidth;

    const ctx = gsap.context(() => {
      gsap.to(container, {
        x: -totalWidth,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          pin: true,
          scrub: 1,
          end: () => `+=${totalWidth}`,
          invalidateOnRefresh: true,
        }
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-base-dark border-b border-white/5">
      <div className="absolute top-16 left-16 z-10">
        <p className="text-xs text-white/30 mb-4 uppercase tracking-[4px] font-semibold" style={{ fontFamily: 'var(--font-label)' }}>Nutrient Intelligence</p>
        <h2 className="heading-display text-5xl md:text-7xl leading-tight">Your Dietary Roadmap</h2>
      </div>

      <div ref={containerRef} className="flex gap-24 px-[15vw] items-center h-screen w-max">
        {PROTOCOLS.map((p, i) => (
          <div key={i} className="w-[500px] flex-shrink-0 group">
            <div className="obsidian-card p-16 hover:border-white/20 transition-all duration-700">
              <div className="flex justify-between items-start mb-16">
                <div className="text-white/20 group-hover:text-white transition-all transform group-hover:scale-110 duration-500">
                  {p.icon}
                </div>
                <span className="text-6xl text-white/5 group-hover:text-white/10 transition-colors font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                   {p.step}
                </span>
              </div>
              <h3 className="heading-display text-4xl mb-8 text-white">
                {p.title}
              </h3>
              <p className="body-refined text-text-secondary text-lg leading-relaxed mb-12">
                {p.desc}
              </p>
              <div className="pt-10 border-t border-white/5 flex justify-between items-center">
                 <span className="text-[11px] text-white/20 font-medium uppercase tracking-wider" style={{ fontFamily: 'var(--font-label)' }}>SP_Protocol_{p.step}</span>
                 <span className="text-[10px] text-white/30 font-bold tracking-widest uppercase px-3 py-1 bg-white/5 rounded-full" style={{ fontFamily: 'var(--font-label)' }}>Optimal</span>
              </div>
            </div>
          </div>
        ))}

        {/* Ending Section */}
        <div className="w-[600px] flex-shrink-0 flex flex-col justify-center pl-24">
           <h2 className="heading-display !text-[120px] opacity-10 leading-[0.85] mb-12 uppercase">
             Human.<br/>Results.
           </h2>
           <div className="flex flex-col items-start gap-12">
              <Link href="/auth/signup" className="px-12 py-5 bg-white text-black text-sm font-bold uppercase tracking-wider rounded-full hover:bg-transparent hover:text-white border border-white transition-all duration-300" style={{ fontFamily: 'var(--font-label)' }}>
                Get Started Now
              </Link>
              <p className="text-[11px] text-white/20 max-w-[400px] leading-relaxed font-semibold uppercase tracking-widest" style={{ fontFamily: 'var(--font-label)' }}>
                SECURE DATA TRANSFORMATION ACTIVE. 
                PRIVACY PROTOCOLS INITIATED.
              </p>
           </div>
        </div>
      </div>
    </section>
  );
}
