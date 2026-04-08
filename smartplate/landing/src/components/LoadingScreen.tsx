"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Utensils, Zap, Salad, ChefHat } from "lucide-react";

type AnimationStage =
    | "chopping"
    | "mixing"
    | "cooking"
    | "assembling"
    | "complete";

interface LoadingScreenProps {
    onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
    const [stage, setStage] = useState<AnimationStage>("chopping");
    const [progress, setProgress] = useState(0);
    const [loadingText, setLoadingText] = useState("Preparing your SmartPlate experience...");

    useEffect(() => {
        const sequence = async () => {
            // Stage 1: Chopping
            setLoadingText("Chopping fresh ingredients...");
            setProgress(20);
            await new Promise(r => setTimeout(r, 2000));
            
            // Stage 2: Mixing
            setStage("mixing");
            setLoadingText("Balancing macronutrients...");
            setProgress(45);
            await new Promise(r => setTimeout(r, 2000));
            
            // Stage 3: Cooking
            setStage("cooking");
            setLoadingText("Optimizing for your metabolism...");
            setProgress(70);
            await new Promise(r => setTimeout(r, 2000));
            
            // Stage 4: Assembling
            setStage("assembling");
            setLoadingText("Plating your personalized plan...");
            setProgress(90);
            await new Promise(r => setTimeout(r, 2000));
            
            // Complete
            setStage("complete");
            setProgress(100);
            onComplete();
        };

        sequence();
    }, [onComplete]);

    return (
        <AnimatePresence>
            {stage !== "complete" && (
                <motion.div
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-base-dark overflow-hidden"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                >
                    {/* Ambient Glow - Toned down */}
                    <div className="absolute inset-0 opacity-10">
                        <motion.div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white filter blur-[120px]"
                            animate={{
                                opacity: [0.1, 0.2, 0.1],
                            }}
                            transition={{ duration: 5, repeat: Infinity }}
                        />
                    </div>

                    <div className="relative z-10 flex flex-col items-center max-w-sm w-full px-6">
                        {/* Animation Container */}
                        <div className="h-48 w-full flex items-center justify-center mb-16 relative">
                            <AnimatePresence mode="wait">
                                {stage === "chopping" && (
                                    <motion.div
                                        key="chopping"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="text-white/40"
                                    >
                                        <motion.div
                                            animate={{ y: [0, -10, 0] }}
                                            transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                                        >
                                            <ChefHat size={60} strokeWidth={0.5} />
                                        </motion.div>
                                    </motion.div>
                                )}

                                {stage === "mixing" && (
                                    <motion.div
                                        key="mixing"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="text-white/40"
                                    >
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                        >
                                            <Salad size={60} strokeWidth={0.5} />
                                        </motion.div>
                                    </motion.div>
                                )}

                                {stage === "cooking" && (
                                    <motion.div
                                        key="cooking"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="text-white/40"
                                    >
                                        <motion.div
                                            animate={{ opacity: [0.4, 1, 0.4] }}
                                            transition={{ duration: 1, repeat: Infinity }}
                                        >
                                            <Zap size={60} strokeWidth={0.5} />
                                        </motion.div>
                                    </motion.div>
                                )}

                                {stage === "assembling" && (
                                    <motion.div
                                        key="assembling"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-white/40"
                                    >
                                        <Utensils size={60} strokeWidth={0.5} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Progress UI */}
                        <div className="text-center w-full">
                            <motion.h2
                                key={loadingText}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="heading-display text-2xl mb-12 italic text-white/80"
                            >
                                {loadingText}
                            </motion.h2>

                            <div className="w-full h-[1px] bg-white/10 overflow-hidden relative mb-6">
                                <motion.div
                                    className="h-full bg-white"
                                    initial={{ width: "0%" }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                />
                            </div>

                            <p className="mono-detail text-[9px] text-white/30 tracking-[0.4em]">
                                {progress}% CALIBRATED
                            </p>
                        </div>
                    </div>

                    {/* Edge Decor */}
                    <div className="absolute top-12 left-12 w-16 h-16 border-t border-l border-white/10" />
                    <div className="absolute bottom-12 right-12 w-16 h-16 border-b border-r border-white/10" />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
