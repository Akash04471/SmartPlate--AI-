"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useScroll, useTransform, motion, type MotionValue, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Brain, ScanLine, TrendingUp, Trophy, ArrowRight, Star, Camera, Utensils, BarChart3, MessageCircle, Sparkles, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";
import FoodParticles from "@/components/FoodParticles";
import SmartPlateExperienceHUD from "@/components/SmartPlateExperienceHUD";
import SmartPlateScrollCanvas from "@/components/SmartPlateScrollCanvas";
import NeuralDataStream from "@/components/NeuralDataStream";
import DashboardReveal from "@/components/DashboardReveal";
import Magnetic from "@/components/Magnetic";
import LoadingScreen from "@/components/LoadingScreen";
import MetabolicRuler from "@/components/MetabolicRuler";
import HorizontalProtocol from "@/components/HorizontalProtocol";
import VisualIntelligence from "@/components/VisualIntelligence";
import InteractiveMacroProfiler from "@/components/InteractiveMacroProfiler";
import DietPlansSection from "@/components/DietPlansSection";
import RewardsSection from "@/components/RewardsSection";
import AICoachShowcase from "@/components/AICoachShowcase";
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

// ─── WORD REVEAL COMPONENT ──────────────────────────────────────────
function WordReveal({ text, className = "", delay = 0 }: { text: string; className?: string; delay?: number }) {
  return (
    <motion.span
      className={`inline-flex flex-wrap gap-x-[0.3em] ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
    >
      {text.split(" ").map((word, i) => (
        <span key={i} className="overflow-hidden inline-block">
          <motion.span
            className="inline-block"
            variants={{
              hidden: { y: "120%", opacity: 0, rotateX: 40 },
              visible: {
                y: "0%",
                opacity: 1,
                rotateX: 0,
                transition: {
                  duration: 0.7,
                  delay: delay + i * 0.06,
                  ease: [0.16, 1, 0.3, 1],
                },
              },
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

// ─── TEXT VELOCITY MARQUEE ──────────────────────────────────────────
function TextVelocityMarquee() {
  const items = "MEAL TRACKING • AI COACHING • MACRO ANALYSIS • CALORIE VISION • DIET PLANS • PROGRESS INSIGHTS • ";
  const repeated = items.repeat(4);
  return (
    <div className="py-24 overflow-hidden border-y border-white/[0.05] bg-base-dark2/40 relative">
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#031810] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#031810] to-transparent z-10 pointer-events-none" />
      <div className="marquee-track px-4">
        <span className="text-[12vw] sm:text-[10vw] md:text-[6vw] font-black tracking-tighter text-emerald-400/[0.08] whitespace-nowrap uppercase italic" style={{ fontFamily: 'var(--font-display)', filter: 'blur(1px)' }}>
          {repeated}
        </span>
        <span className="text-[12vw] sm:text-[10vw] md:text-[6vw] font-black tracking-tighter text-white/[0.12] whitespace-nowrap uppercase italic ml-20" style={{ fontFamily: 'var(--font-display)' }}>
          {repeated}
        </span>
      </div>
    </div>
  );
}

// ─── SCROLL-LINKED NUTRITION RING ───────────────────────────────────
function NutritionRing({ value, max, label, color, delay }: { value: number; max: number; label: string; color: string; delay: number }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const percentage = value / max;

  return (
    <motion.div
      className="flex flex-col items-center gap-4"
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="4" />
          <motion.circle
            cx="50" cy="50" r={radius} fill="none"
            stroke={color} strokeWidth="4" strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            whileInView={{ strokeDashoffset: circumference * (1 - percentage) }}
            viewport={{ once: true }}
            transition={{ delay: delay + 0.3, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-white/80" style={{ fontFamily: 'var(--font-display)' }}>{value}</span>
        </div>
      </div>
      <span className="text-[10px] text-white/40 font-semibold tracking-widest uppercase" style={{ fontFamily: 'var(--font-label)' }}>{label}</span>
    </motion.div>
  );
}

// ─── DASHBOARD FEATURE SHOWCASE (Scrollytelling) ────────────────────
const dashboardFeatures = [
  {
    icon: Camera,
    title: "Snap & Track",
    subtitle: "AI Calorie Vision",
    description: "Photograph your meal — SmartPlate identifies every ingredient, estimates portions, and logs macros in under 3 seconds. No manual entry needed.",
    metric: "3s",
    metricLabel: "Average scan time",
    color: "#a3e635",
  },
  {
    icon: Utensils,
    title: "Personalized Meal Plans",
    subtitle: "Adaptive Diet Engine",
    description: "AI-generated weekly meal plans tailored to your metabolic profile, dietary preferences, and fitness goals. Plans evolve as your body composition changes.",
    metric: "1,200+",
    metricLabel: "Diet plans generated",
    color: "#22c55e",
  },
  {
    icon: BarChart3,
    title: "Deep Progress Analytics",
    subtitle: "Body Composition Trends",
    description: "Track weight, muscle mass, body fat percentage, and macronutrient adherence with beautiful charts. Predictive timelines show when you'll reach your goals.",
    metric: "98.2%",
    metricLabel: "Goal achievement rate",
    color: "#38bdf8",
  },
  {
    icon: MessageCircle,
    title: "AI Nutrition Coach",
    subtitle: "24/7 Smart Assistant",
    description: "Ask anything about nutrition, get personalized meal suggestions, or troubleshoot your diet. Your AI coach learns your preferences over time for smarter recommendations.",
    metric: "24/7",
    metricLabel: "Always available",
    color: "#f59e0b",
  },
];

function DashboardShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Map scroll progress to active feature index
  const activeIndex = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], [0, 0, 1, 2, 3]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const unsub = activeIndex.on("change", (v) => setCurrentIndex(Math.round(v)));
    return unsub;
  }, [activeIndex]);

  return (
    <section ref={sectionRef} className="relative" style={{ height: "400vh" }}>
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-10 w-full">
          {/* Section Header */}
          <div className="mb-12 md:mb-16">
            <span className="text-[10px] text-white/30 tracking-[0.3em] font-semibold uppercase block mb-4" style={{ fontFamily: 'var(--font-label)' }}>
              Dashboard Features
            </span>
            <h2 className="heading-display text-4xl md:text-5xl lg:text-7xl text-white">
              <WordReveal text="Your nutrition cockpit." />
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Left: Feature Cards Stack */}
            <div className="relative">
              <AnimatePresence mode="wait">
                {dashboardFeatures.map((feat, i) => {
                  if (i !== currentIndex) return null;
                  const Icon = feat.icon;
                  return (
                    <motion.div
                      key={i}
                      className="obsidian-card p-10 md:p-14"
                      initial={{ opacity: 0, y: 40, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -30, scale: 0.96 }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="flex items-center gap-5 mb-8 md:mb-10">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${feat.color}15`, border: `1px solid ${feat.color}30` }}>
                          <Icon size={22} style={{ color: feat.color }} />
                        </div>
                        <div>
                          <div className="text-[10px] text-white/30 tracking-widest font-semibold uppercase" style={{ fontFamily: 'var(--font-label)' }}>{feat.subtitle}</div>
                          <h3 className="heading-display text-2xl md:text-3xl text-white">{feat.title}</h3>
                        </div>
                      </div>
                      <p className="body-refined text-white/50 text-base md:text-lg leading-relaxed mb-10 md:mb-12">
                        {feat.description}
                      </p>
                      <div className="flex items-end gap-3 pt-8 border-t border-white/5">
                        <span className="text-4xl md:text-5xl font-bold tracking-tighter" style={{ fontFamily: 'var(--font-display)', color: feat.color }}>{feat.metric}</span>
                        <span className="text-[10px] text-white/30 font-semibold tracking-wider uppercase pb-2" style={{ fontFamily: 'var(--font-label)' }}>{feat.metricLabel}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Right: Dashboard Preview (Simulated Phone/App UI) */}
            <div className="relative hidden lg:flex flex-col items-center">
              {/* App Frame */}
              <motion.div
                className="w-[320px] rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent p-6 shadow-2xl relative overflow-hidden"
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Status Bar */}
                <div className="flex justify-between items-center mb-6 text-[9px] text-white/30" style={{ fontFamily: 'var(--font-label)' }}>
                  <span>9:41 AM</span>
                  <span className="flex gap-1">
                    <span>●●●</span>
                    <span>◗</span>
                  </span>
                </div>

                {/* App Header */}
                <div className="mb-6">
                  <h4 className="text-white/60 text-xs" style={{ fontFamily: 'var(--font-label)' }}>Good morning</h4>
                  <h3 className="text-white text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Dashboard</h3>
                </div>

                {/* Macro Rings */}
                <div className="grid grid-cols-4 gap-2 mb-6">
                  {[
                    { label: "Cal", value: 1847, max: 2100, color: "#a3e635" },
                    { label: "Protein", value: 168, max: 175, color: "#22c55e" },
                    { label: "Carbs", value: 195, max: 240, color: "#38bdf8" },
                    { label: "Fats", value: 62, max: 75, color: "#f59e0b" },
                  ].map((ring, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className="relative w-14 h-14">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 50 50">
                          <circle cx="25" cy="25" r="20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                          <motion.circle
                            cx="25" cy="25" r="20" fill="none"
                            stroke={ring.color} strokeWidth="3" strokeLinecap="round"
                            strokeDasharray={125.6}
                            initial={{ strokeDashoffset: 125.6 }}
                            whileInView={{ strokeDashoffset: 125.6 * (1 - ring.value / ring.max) }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2 + 0.5, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[8px] font-bold text-white/60">{Math.round(ring.value / ring.max * 100)}%</span>
                        </div>
                      </div>
                      <span className="text-[7px] text-white/30 mt-1 font-semibold" style={{ fontFamily: 'var(--font-label)' }}>{ring.label}</span>
                    </div>
                  ))}
                </div>

                {/* Recent Meals */}
                <div className="mb-4">
                  <div className="text-[9px] text-white/30 mb-3 font-semibold tracking-wider" style={{ fontFamily: 'var(--font-label)' }}>TODAY&apos;S MEALS</div>
                  {[
                    { time: "8:30 AM", meal: "Oats + Banana", cal: "380 kcal", emoji: "🥣" },
                    { time: "1:00 PM", meal: "Grilled Chicken Salad", cal: "520 kcal", emoji: "🥗" },
                    { time: "4:30 PM", meal: "Protein Smoothie", cal: "280 kcal", emoji: "🥤" },
                  ].map((meal, i) => (
                    <motion.div
                      key={i}
                      className="flex items-center gap-3 py-3 border-b border-white/[0.03]"
                      initial={{ opacity: 0, x: 10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.15 + 0.8 }}
                    >
                      <span className="text-lg">{meal.emoji}</span>
                      <div className="flex-1">
                        <div className="text-xs text-white/70 font-medium">{meal.meal}</div>
                        <div className="text-[8px] text-white/25" style={{ fontFamily: 'var(--font-label)' }}>{meal.time}</div>
                      </div>
                      <span className="text-[9px] text-white/40 font-semibold" style={{ fontFamily: 'var(--font-label)' }}>{meal.cal}</span>
                    </motion.div>
                  ))}
                </div>

                {/* AI Insight */}
                <motion.div
                  className="rounded-xl p-4 mt-2"
                  style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(16,185,129,0.02) 100%)', border: '1px solid rgba(16,185,129,0.15)' }}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.5 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={10} className="text-emerald-400" />
                    <span className="text-[8px] text-emerald-400/80 font-bold tracking-wider" style={{ fontFamily: 'var(--font-label)' }}>AI INSIGHT</span>
                  </div>
                  <p className="text-[10px] text-white/50 leading-relaxed">
                  You&apos;re 32g short on protein today. Consider adding a chicken breast (165g) to your dinner for optimal muscle recovery.
                  </p>
                </motion.div>

                {/* Active Feature Indicator */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-1 rounded-full"
                  style={{ background: dashboardFeatures[currentIndex]?.color || "#22c55e" }}
                  layoutId="featureIndicator"
                  transition={{ duration: 0.4 }}
                />
              </motion.div>

              {/* Scroll Progress Dots */}
              <div className="flex gap-3 mt-10">
                {dashboardFeatures.map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full"
                    animate={{
                      background: i === currentIndex ? dashboardFeatures[i].color : "rgba(255,255,255,0.1)",
                      scale: i === currentIndex ? 1.4 : 1,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── HOW IT WORKS SECTION ───────────────────────────────────────────
const howItWorksSteps = [
  {
    step: "01",
    title: "Create Your Profile",
    description: "Tell us your age, weight, height, activity level, and dietary goals. Our AI builds your metabolic fingerprint in 90 seconds.",
    icon: Shield,
    detail: "270+ data points analyzed"
  },
  {
    step: "02",
    title: "Log Your Meals",
    description: "Snap a photo, type a description, or use voice input. SmartPlate's AI identifies ingredients and calculates macros instantly.",
    icon: Camera,
    detail: "3-second average scan"
  },
  {
    step: "03",
    title: "Get AI Recommendations",
    description: "Receive personalized meal suggestions, identify nutritional gaps, and get real-time coaching from your AI nutrition assistant.",
    icon: Sparkles,
    detail: "Adapts every 48 hours"
  },
  {
    step: "04",
    title: "Track Your Progress",
    description: "Watch your body composition change with predictive analytics, macro heatmaps, and milestone celebrations.",
    icon: TrendingUp,
    detail: "Visible results in 14 days"
  },
];

function HowItWorks() {
  return (
    <div className="py-16 md:py-24 relative border-t border-white/5">
      <div className="max-w-[1400px] mx-auto px-10">
        <div className="text-center mb-20 md:mb-28">
          <span className="text-[10px] text-white/30 tracking-[0.3em] font-semibold uppercase block mb-6" style={{ fontFamily: 'var(--font-label)' }}>
            How It Works
          </span>
          <h2 className="heading-display text-4xl md:text-5xl lg:text-7xl text-white mb-6">
            <WordReveal text="Four steps to" />
            <br />
            <WordReveal text="transformation." delay={0.25} />
          </h2>
          <motion.p
            className="body-refined text-white/35 text-lg md:text-xl max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            From signup to visible results in under two weeks. No guesswork, no calorie counting fatigue — just intelligent automation.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0">
          {howItWorksSteps.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                className="relative p-8 md:p-10 border border-white/[0.04] group hover:bg-white/[0.02] transition-all duration-700"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Step Number */}
                <span className="text-5xl md:text-7xl font-bold text-white/[0.03] absolute top-6 right-6" style={{ fontFamily: 'var(--font-display)' }}>
                  {item.step}
                </span>

                {/* Connecting Line */}
                {i < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-[1px] bg-white/10 z-10" />
                )}

                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-6 md:mb-8 group-hover:border-emerald-500/30 transition-colors duration-500">
                    <Icon size={20} className="text-white/40 group-hover:text-emerald-400 transition-colors duration-500" />
                  </div>
                  <h3 className="heading-display text-xl md:text-2xl mb-4 text-white">{item.title}</h3>
                  <p className="body-refined text-white/35 text-xs md:text-sm leading-relaxed mb-6 md:mb-8">
                    {item.description}
                  </p>
                  <span className="text-[9px] text-emerald-400/50 font-bold tracking-widest uppercase" style={{ fontFamily: 'var(--font-label)' }}>
                    {item.detail}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── INTERACTIVE FEATURE CARD ───────────────────────────────────────
function InteractiveFeatureCard({ feat, index }: { feat: (typeof features)[number]; index: number }) {
  const Icon = LUCIDE_MAP[feat.iconName];
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current?.style.setProperty("--mouse-x", `${x}px`);
    cardRef.current?.style.setProperty("--mouse-y", `${y}px`);
  }, []);

  const parallaxOffset = index % 3 === 1 ? 40 : index % 3 === 2 ? -20 : 0;

  return (
    <motion.div
      ref={cardRef}
      className="obsidian-card p-10 md:p-12 group min-h-[auto] md:min-h-[420px]"
      initial={{ opacity: 0, y: 40 + parallaxOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 1.2, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMouseMove}
    >
      {/* Radial Spotlight */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{
          background: "radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(16,185,129,0.08), transparent 40%)"
        }}
      />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/[0.02] rounded-full blur-[80px] group-hover:bg-white/[0.05] transition-all duration-1000" />
      
      <div className="flex flex-col h-full justify-between relative z-10">
        <div>
          <div className="flex justify-between items-start mb-16">
            <motion.div
              className="text-white/30 group-hover:text-emerald-400 transition-colors duration-700"
              whileHover={{ scale: 1.15, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {Icon && <Icon size={36} strokeWidth={1} />}
            </motion.div>
            <span className="text-[10px] text-white/15 tracking-wider font-semibold uppercase" style={{ fontFamily: 'var(--font-label)' }}>{feat.tag}</span>
          </div>
          <h3 className="heading-display text-3xl mb-6 text-white">{feat.title}</h3>
          <p className="body-refined text-white/35 group-hover:text-white/60 transition-colors duration-700 text-base leading-relaxed mb-10 max-w-md">
            {feat.description}
          </p>
        </div>
        <div className="pt-6 flex justify-between items-center border-t border-white/5">
          <span className="text-[10px] text-white/10 font-medium tracking-wide uppercase" style={{ fontFamily: 'var(--font-label)' }}>Feature_{index+1}</span>
          <ArrowRight className="text-white/15 group-hover:text-emerald-400 group-hover:translate-x-2 transition-all duration-500" size={18} />
        </div>
      </div>
    </motion.div>
  );
}

// ─── BENTO TESTIMONIAL CARD ─────────────────────────────────────────
function BentoTestimonialCard({ t, index, isLarge = false }: { t: (typeof testimonials)[number]; index: number; isLarge?: boolean }) {
  return (
    <motion.div
      className={`flex flex-col justify-between ${isLarge ? "p-14" : "p-10"} border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-1000 relative overflow-hidden group`}
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="absolute -top-20 -right-20 w-48 h-48 bg-emerald-500/[0.03] rounded-full blur-[60px] group-hover:bg-emerald-500/[0.06] transition-all duration-1000" />
      <div>
        <div className="flex gap-1 mb-8 opacity-20">
          {[1, 2, 3, 4, 5].map(star => <Star key={star} size={isLarge ? 11 : 9} fill="currentColor" />)}
        </div>
        <p className={`${isLarge ? "text-2xl md:text-3xl" : "text-lg md:text-xl"} mb-10 italic text-white/80 leading-relaxed`} style={{ fontFamily: 'var(--font-display)' }}>
          &ldquo;{t.text}&rdquo;
        </p>
      </div>
      <div className="pt-8 border-t border-white/5 flex items-center gap-5">
        <span className={`${isLarge ? "text-4xl" : "text-3xl"} opacity-30 grayscale group-hover:grayscale-0 transition-all duration-700`}>{t.avatar}</span>
        <div>
          <div className={`${isLarge ? "text-lg" : "text-base"} text-white font-bold`} style={{ fontFamily: 'var(--font-display)' }}>{t.name}</div>
          <div className="text-[9px] text-white/25 font-semibold tracking-wider uppercase" style={{ fontFamily: 'var(--font-label)' }}>{t.role}</div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── MAIN PAGE ──────────────────────────────────────────────────────
export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const sequenceRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sequenceRef,
    offset: ["start start", "end end"],
  });
  const { scrollYProgress: globalScroll } = useScroll();

  const canvasProgress = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const globalProgress = useTransform(globalScroll, [0, 1], [0, 1]);

  useEffect(() => {
    if (!isLoading) {
      (async () => {
        const LocomotiveScroll = (await import("locomotive-scroll")).default;
        new LocomotiveScroll();
      })();
    }
  }, [isLoading]);

  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <>
      <AnimatePresence>
        {isLoading && <LoadingScreen onComplete={handleLoadingComplete} />}
      </AnimatePresence>
      
      {!isLoading && (
        <div className="fixed top-16 left-0 right-0 z-[120] px-6 pointer-events-none">
          <div className="pointer-events-auto max-w-[1400px] mx-auto">
            <CanvasRuler progress={globalProgress} />
          </div>
        </div>
      )}

      <main className={`bg-base-dark min-h-screen ${isLoading ? "overflow-hidden h-screen" : ""}`}>
        <div className="z-[150] relative">
          <Navbar />
        </div>

        {/* ─── HERO SECTION ─────────────────────────────────────────── */}
        <section ref={sequenceRef} className="scroll-sequence relative">
          <div className="scroll-sequence-sticky grid-bg overflow-hidden">
            <CanvasBridge progress={canvasProgress} />
            <SmartPlateExperienceHUD scrollYProgress={scrollYProgress} />
            
            <motion.div 
              style={{ 
                opacity: useTransform(scrollYProgress, [0, 0.08], [1, 0]),
                scale: useTransform(scrollYProgress, [0, 0.1], [1, 1.05])
              }}
              className="absolute inset-0 flex flex-col items-center justify-center z-10 text-center px-6 pt-40 pb-12 pointer-events-none"
            >
              <NeuralDataStream />
              <FoodParticles count={8} />
              <div className="flex items-center gap-6 mb-12">
                <span className="text-[10px] tracking-wider font-semibold text-white/40" style={{ fontFamily: 'var(--font-label)' }}>AI-POWERED NUTRITION</span>
                <span className="h-[1px] w-12 bg-white/10" />
                <span className="text-[10px] tracking-wider font-semibold text-white/40" style={{ fontFamily: 'var(--font-label)' }}>EST. 2026</span>
              </div>
              
              <h1 className="heading-display !text-[clamp(1.8rem,8vw,12rem)] md:!text-[clamp(3.5rem,10vw,12rem)] mb-6 md:mb-8 leading-[0.85] text-liquid whitespace-normal sm:whitespace-nowrap px-4">
                {Array.from("Eat Smarter").map((char, i) => (
                    <span key={i} className="inline-block" style={{ animationDelay: `${i * 0.04}s` }}>{char === " " ? "\u00A0" : char}</span>
                ))}
              </h1>

              <motion.p
                className="body-refined text-white/40 text-lg md:text-xl mb-14 max-w-xl"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 1 }}
              >
                AI-powered meal tracking, personalized diet plans, and real-time nutrition coaching — all in one beautiful dashboard.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 1.5 }}
                className="pointer-events-auto flex flex-col items-center gap-8"
              >
                <Magnetic>
                  <Link href="/auth/signup">
                    <button className="group px-14 py-5 bg-emerald-500 text-black text-sm font-bold uppercase tracking-wider rounded-full hover:bg-emerald-400 transition-all duration-300 flex items-center gap-3" style={{ fontFamily: 'var(--font-label)' }}>
                      Start Free <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                </Magnetic>
                <p className="text-[10px] text-white/20 tracking-[0.2em] font-medium" style={{ fontFamily: 'var(--font-label)' }}>FREE FOREVER PLAN · NO CREDIT CARD</p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ─── POST CONTENT ─────────────────────────────────────── */}
        <section className="relative z-20 bg-base-dark">
          <FoodParticles count={8} />

          {/* Stats Bar */}
          <div className="pt-32 pb-20 border-y border-white/5 bg-base-dark2/50 backdrop-blur-3xl relative overflow-hidden">
            {/* Background Neural pulse */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.03] via-transparent to-emerald-500/[0.03] pointer-events-none" />
            <div className="max-w-[1400px] mx-auto px-10">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-8">
                  <div>
                    <span className="text-[10px] text-white/30 tracking-[0.3em] font-semibold uppercase block mb-3" style={{ fontFamily: 'var(--font-label)' }}>Proven Results</span>
                    <h2 className="heading-display text-4xl md:text-5xl text-white">
                      <WordReveal text="The numbers speak." />
                    </h2>
                  </div>
                 <span className="text-[10px] text-white/15 font-medium tracking-wider" style={{ fontFamily: 'var(--font-label)' }}>LIVE SYSTEM METRICS</span>
               </div>
               
               <div className="relative">
                 {/* Neural Bridge SVG */}
                 <svg className="absolute top-1/2 left-0 w-full h-px pointer-events-none overflow-visible hidden lg:block" style={{ transform: 'translateY(-50%)' }}>
                   <motion.path
                     d="M 0 0 H 1400"
                     stroke="rgba(16, 185, 129, 0.15)"
                     strokeWidth="1"
                     fill="none"
                     initial={{ pathLength: 0 }}
                     whileInView={{ pathLength: 1 }}
                     viewport={{ once: true }}
                     transition={{ duration: 2, ease: "easeInOut" }}
                   />
                   <motion.circle
                     r="2"
                     fill="#10b981"
                     initial={{ offsetDistance: "0%" }}
                     animate={{ offsetDistance: "100%" }}
                     transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                     style={{ offsetPath: "path('M 0 0 H 1400')", filter: 'blur(2px)' }}
                   />
                 </svg>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
                   {stats.map((stat, i) => (
                     <AnimatedStat key={i} stat={stat} delay={i * 0.15} />
                   ))}
                 </div>
               </div>
            </div>
          </div>

          {/* ─── TEXT VELOCITY MARQUEE ────────────────────────────── */}
          <TextVelocityMarquee />

          {/* ─── HOW IT WORKS ─────────────────────────────────────── */}
          <HowItWorks />

          {/* ─── INTERACTIVE EXPERIENCE ────────────────────────────── */}
          <InteractiveMacroProfiler />

          {/* ─── VISUAL INTELLIGENCE (Scrollytelling) ─────────────── */}
          <VisualIntelligence />

          {/* ─── DASHBOARD SHOWCASE (Scrollytelling) ──────────────── */}
          <div className="border-y border-white/5">
            <DashboardShowcase />
          </div>

          {/* ─── AI COACH SHOWCASE ─────────────────────────────────── */}
          <AICoachShowcase />

          {/* ─── DIET PLANS ────────────────────────────────────────── */}
          <DietPlansSection />

          {/* Horizontal Protocol Section */}
          <HorizontalProtocol />

          {/* ─── REWARDS ───────────────────────────────────────────── */}
          <RewardsSection />

          {/* Features Grid */}
          <div id="features" className="py-16 md:py-24 relative border-t border-white/5">
            <div className="max-w-[1400px] mx-auto px-10">
              <div className="flex flex-col lg:flex-row gap-24 items-start mb-32">
                 <div className="flex-1">
                    <motion.span
                      className="text-[10px] text-white/30 tracking-[0.3em] font-semibold uppercase block mb-6"
                      style={{ fontFamily: 'var(--font-label)' }}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8 }}
                    >
                      Core Features
                    </motion.span>
                    <h2 className="heading-display text-6xl md:text-8xl text-white mb-10">
                      <WordReveal text="Built for" />
                      <br/>
                      <WordReveal text="real results." delay={0.2} />
                    </h2>
                    <motion.p
                      className="body-refined text-white/35 text-lg max-w-xl"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5, duration: 1 }}
                    >
                      Every feature is designed to reduce friction, increase accuracy, and keep you motivated on your nutrition journey.
                    </motion.p>
                 </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {features.map((feat, i) => (
                  <InteractiveFeatureCard key={i} feat={feat} index={i} />
                ))}
              </div>
            </div>
          </div>

          {/* Macro Preview Section */}
          <div className="py-32 border-y border-white/5 bg-base-dark2/30">
            <div className="max-w-[1400px] mx-auto px-10">
              <div className="flex flex-col lg:flex-row items-center gap-20">
                <div className="flex-1">
                  <span className="text-[10px] text-white/30 tracking-[0.3em] font-semibold uppercase block mb-6" style={{ fontFamily: 'var(--font-label)' }}>
                    Live Dashboard Preview
                  </span>
                  <h2 className="heading-display text-5xl md:text-6xl text-white mb-8">
                    <WordReveal text="Real-time macro tracking." />
                  </h2>
                  <p className="body-refined text-white/35 text-lg max-w-lg mb-10">
                    Watch your daily calorie, protein, carbs, and fats intake update in real-time as you log meals. Beautiful circular progress rings give you instant visual feedback.
                  </p>
                  <div className="flex gap-8 text-[10px] text-white/25 uppercase tracking-widest" style={{ fontFamily: 'var(--font-label)' }}>
                    <span>Auto-calculated</span>
                    <span>•</span>
                    <span>Clinical-grade accuracy</span>
                  </div>
                </div>
                <div className="flex gap-8 md:gap-12">
                  <NutritionRing value={1847} max={2100} label="Calories" color="#a3e635" delay={0} />
                  <NutritionRing value={168} max={175} label="Protein" color="#22c55e" delay={0.15} />
                  <NutritionRing value={195} max={240} label="Carbs" color="#38bdf8" delay={0.3} />
                  <NutritionRing value={62} max={75} label="Fats" color="#f59e0b" delay={0.45} />
                </div>
              </div>
            </div>
          </div>

          {/* Testimonials — Bento Grid */}
          <div id="testimonials" className="py-24 md:py-32 border-b border-white/5">
            <div className="max-w-[1400px] mx-auto px-10">
              <div className="text-center mb-32">
                <motion.span
                  className="text-[10px] text-white/30 tracking-[0.3em] font-semibold uppercase block mb-6"
                  style={{ fontFamily: 'var(--font-label)' }}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                >
                  User Stories
                </motion.span>
                <h2 className="heading-display text-6xl md:text-8xl text-white">
                  <WordReveal text="Real people," />
                  <br />
                  <WordReveal text="real transformations." delay={0.2} />
                </h2>
              </div>

              <div className="bento-grid">
                {testimonials.map((t, i) => (
                  <BentoTestimonialCard key={i} t={t} index={i} isLarge={i === 0} />
                ))}
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div id="cta" className="py-48 md:py-[25vh] text-center relative overflow-hidden">
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 60%)" }}
              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            
            <motion.div
              className="max-w-4xl mx-auto px-6 relative z-10"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 2 }}
            >
              <h2 className="heading-display text-6xl md:text-8xl lg:text-9xl mb-8 leading-none whitespace-nowrap text-white">
                <WordReveal text="Start today." />
              </h2>
              <motion.p
                className="body-refined text-white/35 text-xl mb-16 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 1 }}
              >
                Join 2.4 million people who transformed their relationship with food.
                Your personalized nutrition plan is ready in 90 seconds.
              </motion.p>
              <div className="flex flex-col items-center gap-10">
                <Magnetic>
                  <Link href="/auth/signup">
                    <button className="group px-16 py-5 bg-emerald-500 text-black text-sm font-bold uppercase tracking-wider rounded-full hover:bg-emerald-400 transition-all duration-300 flex items-center gap-3" style={{ fontFamily: 'var(--font-label)' }}>
                      Create Free Account <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                </Magnetic>
                <div className="flex items-center gap-6 text-[10px] text-white/20 font-semibold tracking-wider" style={{ fontFamily: 'var(--font-label)' }}>
                   <span>✓ Free forever plan</span>
                   <span>✓ No credit card</span>
                   <span>✓ Cancel anytime</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer */}
          <footer className="py-32 bg-base-dark border-t border-white/5">
            <div className="max-w-[1400px] mx-auto px-10">
               <div className="grid lg:grid-cols-12 gap-24 pb-32 mb-16">
                 <div className="lg:col-span-5">
                   <Image 
                     src="/images/smartplate-logo.jpg" 
                     alt="SmartPlate Logo" 
                     width={180} 
                     height={60}
                     className="w-44 h-auto object-contain mb-8"
                   />
                   <p className="body-refined text-white/30 text-base max-w-md mb-12">
                     The intelligent nutrition platform that combines AI meal tracking, personalized diet plans, and real-time coaching to help you achieve your health goals.
                   </p>
                   <div className="flex gap-10 opacity-30">
                      {["X", "IG", "LI"].map(l => (
                       <span key={l} className="text-[10px] font-semibold hover:text-white transition-colors cursor-pointer tracking-widest" style={{ fontFamily: 'var(--font-label)' }}>{l}</span>
                      ))}
                   </div>
                 </div>
                 <div className="lg:col-span-2 lg:col-start-7">
                   <h4 className="text-[10px] text-white/40 font-semibold tracking-widest uppercase mb-8" style={{ fontFamily: 'var(--font-label)' }}>Product</h4>
                   <ul className="flex flex-col gap-5 text-[11px] text-white/25">
                     <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                     <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                     <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                   </ul>
                 </div>
                 <div className="lg:col-span-2">
                   <h4 className="text-[10px] text-white/40 font-semibold tracking-widest uppercase mb-8" style={{ fontFamily: 'var(--font-label)' }}>Company</h4>
                   <ul className="flex flex-col gap-5 text-[11px] text-white/25">
                     <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                     <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                     <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                   </ul>
                 </div>
                 <div className="lg:col-span-2">
                   <h4 className="text-[10px] text-white/40 font-semibold tracking-widest uppercase mb-8" style={{ fontFamily: 'var(--font-label)' }}>Legal</h4>
                   <ul className="flex flex-col gap-5 text-[11px] text-white/25">
                     <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                     <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                     <li><a href="#" className="hover:text-white transition-colors">HIPAA Compliance</a></li>
                   </ul>
                 </div>
               </div>
               
               <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-16 border-t border-white/5">
                 <p className="text-[10px] text-white/15 font-medium" style={{ fontFamily: 'var(--font-label)' }}>© 2026 SMARTPLATE · ALL RIGHTS RESERVED</p>
                 <p className="text-[9px] text-white/10 tracking-[0.4em] font-medium" style={{ fontFamily: 'var(--font-label)' }}>EAT SMART · ACHIEVE GOALS</p>
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

// ─── CANVAS RULER ───────────────────────────────────────────────────
function CanvasRuler({ progress }: { progress: MotionValue<number> }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const unsub = progress.on("change", (v) => setValue(v));
    return unsub;
  }, [progress]);

  return (
    <MetabolicRuler 
      value={Math.round(value * 1000)} 
      onChange={() => {}} 
      unit="CAL" 
    />
  );
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
      const eased = 1 - Math.pow(1 - progress, 5);
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
      className="py-10 border-l border-white/5 pl-10 group relative"
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
    >
      <div className="absolute left-[-1px] top-0 h-0 w-[1px] bg-emerald-500 group-hover:h-full transition-all duration-700 ease-in-out" />
      <div className="flex justify-between items-center mb-6">
        <span className="text-[10px] text-white/15 group-hover:text-white/40 transition-colors font-semibold uppercase tracking-wider" style={{ fontFamily: 'var(--font-label)' }}>{stat.subLabel}</span>
        <div className="h-1 w-1 bg-white/15 group-hover:bg-emerald-500 transition-colors animate-pulse" />
      </div>
      <div className="text-5xl text-white mb-4 tracking-tighter leading-none font-bold group-hover:text-emerald-400 transition-colors duration-500" style={{ fontFamily: 'var(--font-display)' }}>
        {count}
        <span className="text-xl text-white/20 ml-2 group-hover:text-emerald-500/40 transition-colors">{stat.suffix}</span>
      </div>
      <div className="text-xs text-white/30 group-hover:text-white/70 transition-colors duration-500 font-medium tracking-wide" style={{ fontFamily: 'var(--font-label)' }}>
        {stat.label}
      </div>
    </motion.div>
  );
}
