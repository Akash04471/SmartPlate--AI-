"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useScroll, useTransform, motion, type MotionValue, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Brain, ScanLine, TrendingUp, Trophy, ArrowRight, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import SmartPlateScrollCanvas from "@/components/SmartPlateScrollCanvas";
import SmartPlateExperienceHUD from "@/components/SmartPlateExperienceHUD";
import FoodParticles from "@/components/FoodParticles";
import Magnetic from "@/components/Magnetic";
import LoadingScreen from "@/components/LoadingScreen";
import MetabolicRuler from "@/components/MetabolicRuler";
import HorizontalProtocol from "@/components/HorizontalProtocol";
import {
  features,
  testimonials,
  stats,
} from "@/data/smartplateContent";

const LUCIDE_MAP: Record<string, React.ElementType> = {
  Brain,
  ScanLine,
  TrendingUp,
  Trophy,
};

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const sequenceRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sequenceRef,
    offset: ["start start", "end end"],
  });

  const canvasProgress = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <>
      <AnimatePresence>
        {isLoading && <LoadingScreen onComplete={handleLoadingComplete} />}
      </AnimatePresence>
      
      {!isLoading && <MetabolicRuler />}

      <main className={`bg-base-dark min-h-screen ${isLoading ? "overflow-hidden h-screen" : ""}`}>
        <Navbar />

        {/* ─── HERO SECTION (integrated with scrollytelling) ────────── */}
        <section ref={sequenceRef} className="scroll-sequence relative">
          <div className="scroll-sequence-sticky grid-bg overflow-hidden">
            <CanvasBridge progress={canvasProgress} />
            <SmartPlateExperienceHUD scrollYProgress={scrollYProgress} />
            
            <motion.div 
              style={{ 
                opacity: useTransform(scrollYProgress, [0, 0.08], [1, 0]),
                scale: useTransform(scrollYProgress, [0, 0.1], [1, 1.05])
              }}
              className="absolute inset-0 flex flex-col items-center justify-center z-10 text-center px-6 pointer-events-none"
            >
              <div className="flex items-center gap-6 mb-12">
                <span className="text-[11px] tracking-wider font-semibold text-white/40" style={{ fontFamily: 'var(--font-label)' }}>EST. 2026</span>
                <span className="h-[1px] w-12 bg-white/10" />
                <span className="text-[11px] tracking-wider font-semibold text-white/40" style={{ fontFamily: 'var(--font-label)' }}>VERSION 1.0.42</span>
              </div>
              
              <h1 className="heading-display text-[15vw] md:text-[10vw] mb-12 leading-[0.85] text-liquid">
                {Array.from("Intelligent").map((char, i) => (
                  <span key={i} style={{ animationDelay: `${i * 0.05}s` }}>{char}</span>
                ))}
                <br/>
                <span className="pl-[5vw]">
                  {Array.from("Nutrition").map((char, i) => (
                    <span key={i} style={{ animationDelay: `${0.5 + i * 0.05}s` }}>{char}</span>
                  ))}
                </span>
              </h1>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1.5 }}
                className="pointer-events-auto flex flex-col items-center gap-10"
              >
                <Magnetic>
                  <Link href="/auth/signup">
                    <button className="obsidian-btn text-lg px-20 py-5 bg-white text-black border-white hover:bg-transparent hover:text-white transition-all font-bold tracking-tight rounded-full">
                      Start Your Journey
                    </button>
                  </Link>
                </Magnetic>
                <p className="text-xs text-white/30 tracking-[0.2em] font-medium" style={{ fontFamily: 'var(--font-label)' }}>Scroll to discover the system</p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ─── POST CONTENT ─────────────────────────────────────── */}
        <section className="relative z-20 bg-base-dark">
          <FoodParticles count={8} />

          {/* Stats Bar */}
          <div className="py-32 border-y border-white/5 bg-base-dark2/50 backdrop-blur-3xl">
            <div className="max-w-[1400px] mx-auto px-10">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 gap-8">
                  <div>
                    <span className="text-xs text-white/40 tracking-wider font-semibold uppercase block mb-4" style={{ fontFamily: 'var(--font-label)' }}>The Intelligence</span>
                    <h2 className="heading-display text-5xl md:text-6xl text-white">Metabolic Truths</h2>
                  </div>
                  <span className="text-xs text-white/20 font-medium tracking-wide" style={{ fontFamily: 'var(--font-label)' }}>System Architecture v1.4.2</span>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                {stats.map((stat, i) => (
                  <AnimatedStat key={i} stat={stat} delay={i * 0.1} />
                ))}
              </div>
            </div>
          </div>

          {/* Horizontal Protocol Section */}
          <HorizontalProtocol />

          {/* Features - Asymmetrical Grid */}
          <div id="features" className="py-48 md:py-64 relative border-t border-white/5">
            <div className="max-w-[1400px] mx-auto px-10">
              <div className="flex flex-col lg:flex-row gap-32 items-start mb-48">
                 <div className="flex-1">
                    <span className="tech-tag mb-8">Architectural_Logic</span>
                    <h2 className="heading-display text-7xl md:text-9xl text-white mb-12">A Legacy formed by<br/>Science.</h2>
                    <p className="body-refined text-text-secondary text-xl max-w-xl">
                      SmartPlate is not an application. It is a biosynthetic coordination system 
                      designed to optimize your unique chemical signature.
                    </p>
                 </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feat, i) => {
                  const Icon = LUCIDE_MAP[feat.iconName];
                  return (
                    <motion.div
                      key={i}
                      className="obsidian-card p-12 group min-h-[450px]"
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                    >
                      {/* Section Aura */}
                      <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/[0.03] rounded-full blur-[80px] group-hover:bg-white/[0.06] transition-all duration-700" />
                      
                      <div className="flex flex-col h-full justify-between relative z-10">
                        <div>
                          <div className="flex justify-between items-start mb-20">
                            <div className="text-white/40 group-hover:text-white transition-colors">
                               {Icon && <Icon size={40} strokeWidth={1} />}
                            </div>
                            <span className="text-[11px] text-white/20 tracking-wider font-semibold uppercase" style={{ fontFamily: 'var(--font-label)' }}>{feat.tag}</span>
                          </div>
                          <h3 className="heading-display text-4xl mb-8">{feat.title}</h3>
                          <p className="body-refined text-white/40 group-hover:text-white/70 transition-colors text-lg leading-relaxed mb-12 max-w-md">
                            {feat.description}
                          </p>
                        </div>
                        <div className="pt-8 flex justify-between items-center border-t border-white/5">
                           <span className="text-[11px] text-white/15 font-medium tracking-wide uppercase" style={{ fontFamily: 'var(--font-label)' }}>Protocol_{i+1}</span>
                           <ArrowRight className="text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all" size={20} />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Testimonials */}
          <div id="testimonials" className="py-48 md:py-64 bg-base-dark2/30 border-y border-white/5">
            <div className="max-w-[1400px] mx-auto px-10">
              <div className="text-center mb-48">
                <span className="text-xs text-white/40 tracking-wider font-semibold uppercase block mb-8" style={{ fontFamily: 'var(--font-label)' }}>Verified Results</span>
                <h2 className="heading-display text-8xl md:text-[10vw] text-white">Proven impact.</h2>
              </div>

              <div className="grid lg:grid-cols-3 gap-16">
                {testimonials.map((t, i) => (
                  <motion.div
                    key={i}
                    className="flex flex-col justify-between"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2, duration: 1 }}
                  >
                    <div>
                      <div className="flex gap-1 mb-12 opacity-30">
                        {[1, 2, 3, 4, 5].map(star => <Star key={star} size={10} fill="currentColor" />)}
                      </div>
                      <p className="heading-display text-3xl mb-16 italic text-white/90 leading-tight">
                        &ldquo;{t.text}&rdquo;
                      </p>
                    </div>
                    <div className="pt-12 border-t border-white/5 flex items-center gap-8">
                      <span className="text-5xl opacity-40 grayscale group-hover:grayscale-0 transition-all">{t.avatar}</span>
                      <div>
                        <div className="text-2xl text-white font-bold" style={{ fontFamily: 'var(--font-display)' }}>{t.name}</div>
                        <div className="text-[11px] text-white/30 font-semibold tracking-wider uppercase" style={{ fontFamily: 'var(--font-label)' }}>{t.role}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div id="cta" className="py-64 md:py-[30vh] text-center relative overflow-hidden">
            {/* Ambient Aura */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] bg-white/[0.02] rounded-full blur-[150px] pointer-events-none" />
            
            <motion.div
              className="max-w-5xl mx-auto px-6 relative z-10"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 2 }}
            >
              <h2 className="heading-display text-[15vw] md:text-[12vw] mb-20 leading-none text-liquid">
                {Array.from("Assemble.").map((char, i) => (
                  <span key={i} style={{ animationDelay: `${i * 0.05}s` }}>{char}</span>
                ))}
              </h2>
              <p className="body-refined text-text-secondary text-2xl mb-24 max-w-2xl mx-auto italic opacity-60">
                The most sophisticated nutrition logic ever formed. 
                Waiting for your unique signature.
              </p>
              <div className="flex flex-col items-center gap-12">
                <Magnetic>
                  <Link href="/auth/signup">
                    <button className="obsidian-btn text-xl px-24 py-6 bg-white text-black border-white hover:bg-transparent hover:text-white transition-all font-bold tracking-tight rounded-full">
                      Start Your Transformation
                    </button>
                  </Link>
                </Magnetic>
                <div className="flex flex-col items-center gap-2">
                   <span className="text-[11px] text-white/20 tracking-widest font-semibold uppercase" style={{ fontFamily: 'var(--font-label)' }}>Status: Fully Operational</span>
                   <span className="text-[10px] text-white/10 tracking-widest font-medium" style={{ fontFamily: 'var(--font-label)' }}>Response Time: 0.003ms</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer */}
          <footer className="py-48 bg-base-dark border-t border-white/5">
            <div className="max-w-[1400px] mx-auto px-10">
               <div className="grid lg:grid-cols-12 gap-32 pb-48 mb-24">
                  <div className="lg:col-span-6">
                    <h2 className="heading-display text-5xl mb-12 italic">SmartPlate</h2>
                    <p className="body-refined text-text-secondary text-xl max-w-lg mb-16">
                      A discrete exploration into the mechanics of human performance through 
                      biosynthetic coordination and precise data analysis.
                    </p>
                    <div className="flex gap-12 opacity-30 mt-12">
                       {["X", "IG", "LI"].map(l => (
                        <span key={l} className="text-xs font-semibold hover:text-white transition-colors cursor-pointer tracking-widest" style={{ fontFamily: 'var(--font-label)' }}>{l}</span>
                       ))}
                    </div>
                  </div>
                  <div className="lg:col-span-3">
                    <h4 className="mono-detail text-white/40 mb-10">Assembly</h4>
                    <ul className="flex flex-col gap-6 text-[11px] uppercase tracking-widest text-text-secondary">
                      <li><a href="#" className="hover:text-white transition-colors">Core_Protocol</a></li>
                      <li><a href="#" className="hover:text-white transition-colors">Library</a></li>
                      <li><a href="#" className="hover:text-white transition-colors">Interface</a></li>
                    </ul>
                  </div>
                  <div className="lg:col-span-3">
                    <h4 className="mono-detail text-white/40 mb-10">Security</h4>
                    <ul className="flex flex-col gap-6 text-[11px] uppercase tracking-widest text-text-secondary">
                      <li><a href="#" className="hover:text-white transition-colors">Privacy_v2</a></li>
                      <li><a href="#" className="hover:text-white transition-colors">Terms_v1</a></li>
                      <li><a href="#" className="hover:text-white transition-colors">Discretion</a></li>
                    </ul>
                  </div>
               </div>
               
               <div className="flex flex-col md:flex-row justify-between items-center gap-12 pt-24 border-t border-white/5">
                  <p className="mono-detail text-[9px] text-white/20">© 2026 SMARTPLATE — PRODUCTION_V1.0.42</p>
                  <p className="mono-detail text-[8px] text-white/10 tracking-[0.6em]">EAT SMART. ACHIEVE GOALS.</p>
               </div>
            </div>
          </footer>
        </section>
      </main>
    </>
  );
}

// ─── CANVAS BRIDGE ──────────────────────────────────────────────────
function CanvasBridge({ progress }: { progress: MotionValue<number> }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const unsub = progress.on("change", (v) => setValue(v));
    return unsub;
  }, [progress]);

  return <SmartPlateScrollCanvas progress={value} />;
}

// ─── ANIMATED STAT ──────────────────────────────────────────────────
function AnimatedStat({
  stat,
  delay,
}: {
  stat: (typeof stats)[number];
  delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState("0");
  const [hasAnimated, setHasAnimated] = useState(false);

  const animateCounter = useCallback(() => {
    if (hasAnimated) return;
    setHasAnimated(true);

    const target = stat.numericTarget;
    const duration = 2500;
    const start = performance.now();
    const isDecimal = target % 1 !== 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 5); // Clean expo ease
      const current = target * eased;

      if (isDecimal) {
        setCount(current.toFixed(1));
      } else if (target >= 1000) {
        setCount(Math.round(current).toLocaleString());
      } else {
        setCount(Math.round(current).toString());
      }

      if (progress < 1) requestAnimationFrame(tick);
      else {
        if (isDecimal) setCount(target.toFixed(1));
        else if (target >= 1000) setCount(target.toLocaleString());
        else setCount(target.toString());
      }
    };

    requestAnimationFrame(tick);
  }, [hasAnimated, stat.numericTarget]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(animateCounter, delay * 1000);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [animateCounter, delay]);

  return (
    <motion.div
      ref={ref}
      className="py-12 border-l border-white/5 pl-10 group"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay }}
    >
      <div className="flex justify-between items-center mb-8">
        <span className="text-[11px] text-white/20 group-hover:text-white/40 transition-colors font-semibold uppercase tracking-wider" style={{ fontFamily: 'var(--font-label)' }}>Metric_{delay.toFixed(1)}</span>
        <div className="h-1 w-1 bg-white/20" />
      </div>
      <div className="text-6xl text-white mb-6 tracking-tighter leading-none font-bold" style={{ fontFamily: 'var(--font-display)' }}>
        {count}
        <span className="text-2xl text-white/20 ml-2">{stat.suffix}</span>
      </div>
      <div className="text-xs text-white/30 group-hover:text-white transition-colors duration-500 font-medium tracking-wide" style={{ fontFamily: 'var(--font-label)' }}>
        {stat.label}
      </div>
    </motion.div>
  );
}
