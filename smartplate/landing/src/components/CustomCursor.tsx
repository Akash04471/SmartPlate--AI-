"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

export default function CustomCursor() {
    const [isVisible, setIsVisible] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // SLOW & LIQUID SPRING PHYSICS
    const springConfig = { damping: 40, stiffness: 100 }; 
    const cursorX = useSpring(mouseX, springConfig);
    const cursorY = useSpring(mouseY, springConfig);

    useEffect(() => {
        const moveMouse = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
            if (!isVisible) setIsVisible(true);
        };

        const handleHover = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const isClickable = target.closest("button, a, input, [role='button'], .clickable");
            setIsHovering(!!isClickable);
        };

        window.addEventListener("mousemove", moveMouse, { passive: true });
        window.addEventListener("mouseover", handleHover);

        return () => {
            window.removeEventListener("mousemove", moveMouse);
            window.removeEventListener("mouseover", handleHover);
        };
    }, [isVisible, mouseX, mouseY]);

    if (!isVisible) return null;

    return (
        <>
            <motion.div
                className="fixed top-0 left-0 w-12 h-12 rounded-full border border-emerald-500/20 pointer-events-none z-[9999] flex items-center justify-center backdrop-blur-[2px]"
                style={{
                    x: cursorX,
                    y: cursorY,
                    translateX: "-50%",
                    translateY: "-50%",
                }}
                animate={{
                    scale: isHovering ? 1.5 : 1,
                    backgroundColor: isHovering ? "rgba(16, 185, 129, 0.05)" : "rgba(16, 185, 129, 0)",
                    borderColor: isHovering ? "rgba(16, 185, 129, 0.5)" : "rgba(16, 185, 129, 0.2)",
                }}
                transition={{ type: "spring", damping: 30, stiffness: 150 }}
            >
                <motion.div 
                    animate={{ scale: isHovering ? 0.5 : 1 }}
                    className="w-1 h-1 bg-emerald-400 rounded-full" 
                />
            </motion.div>
            
            {/* TRAILING SAP AURA */}
            <motion.div
                className="fixed top-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none z-[9998]"
                style={{
                    x: cursorX,
                    y: cursorY,
                    translateX: "-50%",
                    translateY: "-50%",
                }}
            />
        </>
    );
}

