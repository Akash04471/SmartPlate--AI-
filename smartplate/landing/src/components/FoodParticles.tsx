"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useTransform, useMotionValue, MotionValue } from "framer-motion";

const assets = [
    { src: "/assets/avocado.png", color: "150, 200, 100" },
    { src: "/assets/salmon.png", color: "255, 100, 100" },
    { src: "/assets/berries.png", color: "200, 150, 255" },
];

interface ParticleData {
    id: number;
    asset: typeof assets[0];
    size: number;
    left: string;
    top: string;
    depth: number;
    rotation: number;
}

export default function FoodParticles({ count = 6 }: { count?: number }) {
    const [particles, setParticles] = useState<ParticleData[]>([]);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
    const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX - window.innerWidth / 2);
            mouseY.set(e.clientY - window.innerHeight / 2);
        };
        window.addEventListener("mousemove", handleMouseMove);
        
        const newParticles = Array.from({ length: count }).map((_, i) => ({
            id: i,
            asset: assets[i % assets.length],
            size: 150 + Math.random() * 250,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            depth: 0.1 + Math.random() * 0.4,
            rotation: Math.random() * 360,
        }));
        setParticles(newParticles);
        
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [count, mouseX, mouseY]);

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {particles.map((p) => (
                <ParticleComponent key={p.id} p={p} springX={springX} springY={springY} />
            ))}
        </div>
    );
}

function ParticleComponent({ p, springX, springY }: { p: ParticleData; springX: MotionValue<number>; springY: MotionValue<number> }) {
    const x = useTransform(springX, (val: number) => val * p.depth);
    const y = useTransform(springY, (val: number) => val * p.depth);

    return (
        <motion.div
            className="absolute flex items-center justify-center"
            style={{
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
                x,
                y,
                rotate: p.rotation,
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.4, scale: 1 }}
            transition={{ duration: 2, delay: p.id * 0.2 }}
        >
            {/* Ambient Aura */}
            <div 
                className="absolute inset-0 blur-[80px] opacity-20"
                style={{ backgroundColor: `rgb(${p.asset.color})` }}
            />
            {/* Food Image */}
            <img 
                src={p.asset.src} 
                alt="food" 
                className="w-full h-full object-contain filter grayscale-[0.2] brightness-75 contrast-125"
                style={{ maskImage: 'radial-gradient(circle, black, transparent 80%)' }}
            />
        </motion.div>
    );
}
