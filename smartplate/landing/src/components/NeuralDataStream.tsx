"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

interface Packet {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

export default function NeuralDataStream() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [packets, setPackets] = useState<Packet[]>([]);
  const { scrollYProgress } = useScroll();
  
  // Accelerate data flow on scroll
  const flowVelocity = useTransform(scrollYProgress, [0, 1], [1, 5]);
  const smoothVelocity = useSpring(flowVelocity, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const newPackets = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 3,
      duration: 10 + Math.random() * 20,
      delay: Math.random() * -20,
      opacity: 0.1 + Math.random() * 0.4,
    }));
    setPackets(newPackets);
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-30">
      {packets.map((p) => (
        <DataPacket key={p.id} packet={p} velocity={smoothVelocity} />
      ))}
      
      {/* Structural Grid Lines */}
      <div className="absolute inset-0" 
        style={{ 
          backgroundImage: `linear-gradient(to right, rgba(16, 185, 129, 0.03) 1px, transparent 1px), 
                            linear-gradient(to bottom, rgba(16, 185, 129, 0.03) 1px, transparent 1px)`,
          backgroundSize: '80px 80px'
        }} 
      />
    </div>
  );
}

function DataPacket({ packet, velocity }: { packet: Packet; velocity: any }) {
  return (
    <motion.div
      className="absolute bg-emerald-400 rounded-full"
      style={{
        left: `${packet.x}%`,
        top: `${packet.y}%`,
        width: packet.size,
        height: packet.size,
        opacity: packet.opacity,
        boxShadow: `0 0 10px rgba(16, 185, 129, ${packet.opacity * 2})`,
      }}
      animate={{
        y: ["-10vh", "110vh"],
      }}
      transition={{
        duration: packet.duration,
        repeat: Infinity,
        delay: packet.delay,
        ease: "linear",
      }}
    />
  );
}
