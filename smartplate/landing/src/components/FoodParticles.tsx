import { useEffect, useState, useRef } from "react";
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
    left: number;
    top: number;
    depth: number;
    rotation: number;
}

export default function FoodParticles({ count = 6 }: { count?: number }) {
    const [particles, setParticles] = useState<ParticleData[]>([]);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springX = useSpring(mouseX, { stiffness: 30, damping: 25 });
    const springY = useSpring(mouseY, { stiffness: 30, damping: 25 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX - window.innerWidth / 2);
            mouseY.set(e.clientY - window.innerHeight / 2);
        };
        window.addEventListener("mousemove", handleMouseMove);
        
        const newParticles = Array.from({ length: count }).map((_, i) => ({
            id: i,
            asset: assets[i % assets.length],
            size: 100 + Math.random() * 200,
            left: Math.random() * 100,
            top: Math.random() * 100,
            depth: 0.05 + Math.random() * 0.15,
            rotation: Math.random() * 360,
        }));
        setParticles(newParticles);
        
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [count, mouseX, mouseY]);

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-40">
            {particles.map((p) => (
                <ParticleComponent key={p.id} p={p} springX={springX} springY={springY} />
            ))}
        </div>
    );
}

function ParticleComponent({ p, springX, springY }: { p: ParticleData; springX: MotionValue<number>; springY: MotionValue<number> }) {
    const x = useTransform(springX, (val: number) => val * p.depth);
    const y = useTransform(springY, (val: number) => val * p.depth);
    
    // Floating animation handled by framer-motion animate prop for better performance


    return (
        <motion.div
            className="absolute flex items-center justify-center"
            style={{
                left: `${p.left}%`,
                top: `${p.top}%`,
                width: p.size,
                height: p.size,
                x,
                y,
                rotate: p.rotation,
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.6, scale: 1 }}
            transition={{ duration: 3, delay: p.id * 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
            <motion.div 
                className="relative w-full h-full"
                animate={{ 
                    y: [0, -20, 0],
                    rotate: [p.rotation, p.rotation + 5, p.rotation] 
                }}
                transition={{ 
                    duration: 4 + Math.random() * 2, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                }}
            >
                {/* Ambient Aura (Optimized: Lower blur) */}
                <div 
                    className="absolute inset-0 blur-[60px] opacity-10"
                    style={{ backgroundColor: `rgb(${p.asset.color})` }}
                />
                {/* Food Image (Optimized: Lower blur) */}
                <img 
                    src={p.asset.src} 
                    alt="food" 
                    className="w-full h-full object-contain filter grayscale-[0.3] brightness-90 contrast-110 blur-[1px] transition-all duration-1000 hover:blur-0"

                    style={{ 
                        maskImage: 'radial-gradient(circle, black, transparent 70%)',
                        transform: `rotate(${p.rotation}deg)`
                    }}
                />
            </motion.div>
        </motion.div>
    );
}

