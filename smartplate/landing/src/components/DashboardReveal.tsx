"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";

interface DashboardRevealProps {
    scrollYProgress: MotionValue<number>;
}

const statCards = [
    { icon: "🔥", value: "1,580", label: "Calories Today", color: "#a3e635" },
    { icon: "🎯", value: "78%", label: "Goal Progress", color: "#22c55e" },
    { icon: "💪", value: "142g", label: "Protein", color: "#38bdf8" },
    { icon: "🔥", value: "7", label: "Day Streak", color: "#ef4444" },
];

const mealItems = [
    { emoji: "🥗", name: "Quinoa Bowl", cal: "420 kcal", time: "8:30 AM" },
    { emoji: "🍗", name: "Grilled Chicken", cal: "520 kcal", time: "1:00 PM" },
    { emoji: "🐟", name: "Salmon Fillet", cal: "480 kcal", time: "7:30 PM" },
];

export default function DashboardReveal({ scrollYProgress }: DashboardRevealProps) {
    const opacity = useTransform(scrollYProgress, [0.85, 0.92], [0, 1]);
    const scale = useTransform(scrollYProgress, [0.85, 0.95], [0.92, 1]);
    const y = useTransform(scrollYProgress, [0.85, 0.95], [60, 0]);

    return (
        <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-5"
            style={{ opacity, scale, y }}
        >
            <div className="w-[90%] max-w-[850px] obsidian-card p-8 backdrop-blur-3xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 pb-8 border-b border-white/5">
                    <div>
                        <p className="mono-detail text-[9px] mb-2 uppercase text-white/20">System_Interface_042</p>
                        <h3 className="heading-display text-2xl italic tracking-tight text-white">
                            Session: Arjun
                        </h3>
                    </div>
                    <div className="flex gap-4">
                        {["SYS", "CFG", "NOT"].map((label, i) => (
                            <div
                                key={i}
                                className="px-3 py-1 border border-white/5 flex items-center justify-center text-[10px] mono-detail text-white/40"
                            >
                                {label}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-4 gap-px bg-white/5 border border-white/5 mb-8">
                    {statCards.map((card, i) => (
                        <div
                            key={i}
                            className="bg-base-dark p-6 text-center"
                        >
                            <div className="heading-display text-3xl mb-4 text-white">
                                {card.value}
                                <span className="text-xs text-white/20 ml-1 italic font-sans">{card.label.split(' ')[0][0]}</span>
                            </div>
                            <div className="mono-detail text-[8px] text-white/40">{card.label}</div>
                        </div>
                    ))}
                </div>

                {/* Progress + Meals */}
                <div className="grid grid-cols-2 gap-8">
                    {/* Calorie Ring */}
                    <div className="p-8 border border-white/5 relative overflow-hidden group">
                        <p className="mono-detail text-[8px] text-white/20 mb-8 uppercase">Metabolic_Load</p>
                        <div className="flex items-center justify-center pb-4">
                            <svg width="140" height="140" viewBox="0 0 120 120">
                                <circle
                                    cx="60" cy="60" r="54"
                                    fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"
                                />
                                <circle
                                    cx="60" cy="60" r="54"
                                    fill="none" stroke="white" strokeWidth="1"
                                    strokeLinecap="square"
                                    strokeDasharray={`${(1580 / 2200) * 339} 339`}
                                    transform="rotate(-90 60 60)"
                                />
                                <text x="60" y="62" textAnchor="middle" fill="white" fontSize="24" className="heading-display italic">
                                    1.5k
                                </text>
                            </svg>
                        </div>
                        <div className="absolute bottom-4 right-4 mono-detail text-[7px] text-white/10 uppercase">v1.4.2</div>
                    </div>

                    {/* Meal List */}
                    <div className="p-8 border border-white/5">
                        <p className="mono-detail text-[8px] text-white/20 mb-8 uppercase">Sequence_Registry</p>
                        <div className="flex flex-col gap-6">
                            {mealItems.map((meal, i) => (
                                <div key={i} className="flex items-center gap-6 border-b border-white/5 pb-4 last:border-0 last:pb-0">
                                    <div className="mono-detail text-[9px] text-white/20">{meal.time}</div>
                                    <div className="flex-1">
                                        <div className="heading-display text-lg text-white/80">{meal.name}</div>
                                    </div>
                                    <span className="mono-detail text-[10px] text-white/40 italic">
                                        {meal.cal}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
