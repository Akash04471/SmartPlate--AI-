"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function BiometricScan({ active = false }: { active?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const lines = 12;
    const lineElements: HTMLDivElement[] = [];

    // Create lines
    for (let i = 0; i < lines; i++) {
      const line = document.createElement("div");
      line.className = "biometric-line absolute w-full h-[0.5px] bg-white/5 pointer-events-none";
      line.style.top = `${(i / lines) * 100}%`;
      container.appendChild(line);
      lineElements.push(line);
    }

    // Animate scanning beam
    const beam = document.createElement("div");
    beam.className = "absolute w-full h-[1px] bg-white/20 pointer-events-none z-10";
    container.appendChild(beam);

    const tl = gsap.timeline({ repeat: -1 });
    tl.fromTo(beam, 
      { top: "-5%", opacity: 0 }, 
      { top: "105%", opacity: 0.4, duration: 6, ease: "power1.inOut" }
    );

    // Initial passive pulse
    lineElements.forEach((line, i) => {
      gsap.to(line, {
        opacity: 0.3,
        duration: 1 + Math.random(),
        repeat: -1,
        yoyo: true,
        delay: i * 0.1
      });
    });

    return () => {
      tl.kill();
      container.innerHTML = "";
    };
  }, []);

  // Reactive pulse when active (focused)
  useEffect(() => {
    if (active) {
      gsap.to(".biometric-line", {
        backgroundColor: "rgba(16, 185, 129, 0.4)",
        duration: 0.3,
        stagger: 0.05
      });
    } else {
      gsap.to(".biometric-line", {
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        duration: 0.6
      });
    }
  }, [active]);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 pointer-events-none overflow-hidden"
    />
  );
}
