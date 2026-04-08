"use client";

import { useEffect, useState } from "react";
import { useScroll, useSpring, motion } from "framer-motion";

export default function MetabolicRuler() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const [coordinate, setCoordinate] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => {
      setCoordinate({
        x: Math.round(window.scrollX),
        y: Math.round(window.scrollY),
      });
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full z-[100] h-16 pointer-events-none">
      {/* Horizontal Line */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-white/5" />
      
      {/* Animated Progress Line */}
      <motion.div 
        style={{ scaleX }}
        className="absolute top-0 left-0 w-full h-[0.5px] bg-white origin-left"
      />

      {/* Ruler Marks */}
      <div className="absolute top-0 left-0 w-full flex justify-between px-6 pt-1">
        {[...Array(31)].map((_, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className={`w-[0.5px] bg-white/10 ${i % 5 === 0 ? 'h-3' : 'h-1.5'}`} />
            {i % 5 === 0 && (
              <span className="text-[9px] text-white/20 mt-1 uppercase tracking-tighter font-medium" style={{ fontFamily: 'var(--font-label)' }}>
                {(i * 3.3).toFixed(0).padStart(3, '0')}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Coordinate HUD */}
      <div className="absolute top-10 left-8 flex gap-12">
        <div className="flex flex-col">
          <span className="text-[9px] text-white/20 font-bold uppercase tracking-wider" style={{ fontFamily: 'var(--font-label)' }}>Nutrient Data</span>
          <span className="text-[11px] text-white/60 font-medium" style={{ fontFamily: 'var(--font-label)' }}>
            [ X:{coordinate.x.toString().padStart(4, '0')} - Y:{coordinate.y.toString().padStart(4, '0')} ]
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] text-white/20 font-bold uppercase tracking-wider" style={{ fontFamily: 'var(--font-label)' }}>System Status</span>
          <span className="text-[11px] text-white/60 font-medium" style={{ fontFamily: 'var(--font-label)' }}>STATUS: OPERATIONAL</span>
        </div>
      </div>
    </div>
  );
}
