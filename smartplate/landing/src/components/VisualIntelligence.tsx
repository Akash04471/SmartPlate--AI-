"use client";

import { useRef, useState, useEffect } from "react";
import { useScroll, useTransform, motion, useSpring } from "framer-motion";
import Image from "next/image";
import AIVisionOverlay from "./AIVisionOverlay";
import GlassTilt from "./GlassTilt";

export default function VisualIntelligence() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Smooth scroll progress for animations
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Animation values derived from scroll
  const imageOpacity = useTransform(smoothProgress, [0, 0.2], [0, 1]);
  const imageScale = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0.95, 1, 1, 1.05]);
  
  // Scan line progress (0 to 1 during the middle part of the scroll)
  const scanLinePos = useTransform(smoothProgress, [0.2, 0.6], [0, 1]);
  
  // Control boolean states for sub-animations
  const [showDetection, setShowDetection] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);

  useEffect(() => {
    const unsub = smoothProgress.on("change", (v) => {
      setCurrentProgress(v);
      setShowDetection(v > 0.55);
      setShowAnalysis(v > 0.75);
    });
    return unsub;
  }, [smoothProgress]);

  return (
    <section ref={sectionRef} className="relative h-[300vh] bg-base-dark">
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        {/* Background Accents */}
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] rounded-full" 
          style={{ background: "radial-gradient(circle, rgba(16,185,129,0.03) 0%, transparent 70%)" }} />

        <div className="max-w-[1400px] mx-auto px-10 w-full grid lg:grid-cols-2 gap-20 items-center z-10">
          
          {/* Left: Text Content */}
          <div className="max-w-xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-[10px] text-white/30 tracking-[0.3em] font-semibold uppercase block mb-6" style={{ fontFamily: 'var(--font-label)' }}>
                Visual Intelligence
              </span>
              <h2 className="heading-display text-5xl md:text-7xl text-white mb-8 leading-[1.1]">
                Beyond the<br />
                <span className="text-emerald-400">Surface.</span>
              </h2>
              
              <div className="relative h-20 mb-8 overflow-hidden">
                <motion.p 
                  className="body-refined text-white/40 text-lg absolute inset-0"
                  animate={{ 
                    opacity: currentProgress < 0.2 ? 1 : 0,
                    y: currentProgress < 0.2 ? 0 : -20
                  }}
                >
                  Your camera is the gateway to metabolic truth. Describe nothing, capture everything.
                </motion.p>
                <motion.p 
                  className="body-refined text-white/40 text-lg absolute inset-0"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: currentProgress >= 0.2 && currentProgress < 0.6 ? 1 : 0,
                    y: currentProgress >= 0.2 && currentProgress < 0.6 ? 0 : currentProgress >= 0.6 ? -20 : 20
                  }}
                >
                  Neural networks decompose the image into molecular components in real-time.
                </motion.p>
                <motion.p 
                  className="body-refined text-white/40 text-lg absolute inset-0"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: currentProgress >= 0.6 ? 1 : 0,
                    y: currentProgress >= 0.6 ? 0 : 20
                  }}
                >
                  Macro-distribution and caloric density calculated with clinical precision.
                </motion.p>
              </div>

              {/* Progress Indicators */}
              <div className="flex flex-col gap-6 pt-10 border-t border-white/5">
                {[
                  { label: "IMAGE RECEPTION", threshold: 0.1 },
                  { label: "SEGMENTATION & OCR", threshold: 0.4 },
                  { label: "NUTRITIONAL MAPPING", threshold: 0.75 },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="h-[1px] flex-1 bg-white/10 relative overflow-hidden">
                      <motion.div 
                        className="absolute inset-0 bg-emerald-500"
                        style={{ x: "-100%" }}
                        animate={{ x: currentProgress > step.threshold ? "0%" : "-100%" }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <span className={`text-[9px] font-bold tracking-widest uppercase transition-colors duration-500 ${currentProgress > step.threshold ? "text-emerald-400" : "text-white/20"}`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right: Visual Showcase */}
          <div className="relative flex justify-center items-center">
            <GlassTilt className="w-full max-w-[500px]" intensity={15}>
              <motion.div 
                className="relative w-full aspect-square rounded-[3rem] overflow-hidden shadow-2xl border border-white/10 group"
                style={{
                  opacity: imageOpacity,
                  scale: imageScale,
                }}
              >
                <Image 
                  src="/images/ai-vision-meal.png" 
                  alt="AI Vision Meal Analysis" 
                  fill 
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  priority
                />
                
                {/* Animated HUD Overlays */}
                <AIVisionOverlay 
                  scanProgress={currentProgress > 0.2 && currentProgress < 0.7 ? (currentProgress - 0.2) / 0.5 : 0} 
                  showDetection={showDetection}
                  showAnalysis={showAnalysis}
                />
                
                {/* Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-base-dark/60 to-transparent pointer-events-none" />
                
                {/* Scan Flare */}
                <motion.div 
                  className="absolute inset-x-0 h-40 bg-emerald-500/10 blur-[100px] z-10 pointer-events-none"
                  style={{ top: useTransform(smoothProgress, [0.2, 0.6], ["-20%", "100%"]) }}
                />
              </motion.div>
            </GlassTilt>

            {/* Floating Data Decorators */}
            <motion.div
              className="absolute -top-10 -right-10 w-32 h-32 rounded-full border border-white/[0.03] flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
               <div className="w-20 h-20 rounded-full border border-dashed border-emerald-500/20" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
