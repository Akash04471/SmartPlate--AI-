"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { phaseContent, dataStreamItems, phaseNames } from "@/data/smartplateContent";

interface HUDProps {
    scrollYProgress: MotionValue<number>;
}

export default function SmartPlateExperienceHUD({ scrollYProgress }: HUDProps) {
    // ─── PHASE OPACITIES ──────────────────────────────────────────
    const phase1Opacity = useTransform(scrollYProgress, [0, 0.04, 0.22, 0.28], [0, 1, 1, 0]);
    const phase2Opacity = useTransform(scrollYProgress, [0.28, 0.34, 0.48, 0.54], [0, 1, 1, 0]);
    const phase3Opacity = useTransform(scrollYProgress, [0.53, 0.58, 0.72, 0.78], [0, 1, 1, 0]);
    const phase4Opacity = useTransform(scrollYProgress, [0.78, 0.84, 1], [0, 1, 1]);

    // ─── SCROLL HINT ──────────────────────────────────────────────
    const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.03, 0.05], [1, 1, 0]);

    // ─── PHASE TAG (top center) ──────────────────────────────────
    const currentPhaseTag = useTransform(scrollYProgress, (v) => {
        if (v < 0.28) return phaseContent.ingredients.phaseTag;
        if (v < 0.54) return phaseContent.intelligence.phaseTag;
        if (v < 0.78) return phaseContent.transformation.phaseTag;
        return phaseContent.smartplate.phaseTag;
    });

    return (
        <div className="absolute inset-0 pointer-events-none z-10">
            {/* ─── SCANLINE ─────────────────────────────────────────── */}
            <motion.div
                className="hud-scanline"
                style={{
                    opacity: useTransform(scrollYProgress, [0, 0.03, 0.95, 1], [0, 0.6, 0.6, 0]),
                }}
            />

            {/* ─── CORNER BRACKETS ─────────────────────────────────── */}
            <motion.div style={{ opacity: useTransform(scrollYProgress, [0, 0.03, 0.92, 1], [0, 1, 1, 0]) }}>
                <div className="hud-corner hud-corner-tl" />
                <div className="hud-corner hud-corner-tr" />
                <div className="hud-corner hud-corner-bl" />
                <div className="hud-corner hud-corner-br" />
            </motion.div>

            {/* ─── PHASE TAG (top center) ───────────────────────────── */}
            <motion.div
                className="absolute top-8 left-1/2 -translate-x-1/2"
                style={{
                    opacity: useTransform(scrollYProgress, [0, 0.04, 0.95, 1], [0, 0.4, 0.4, 0]),
                }}
            >
                <motion.span className="text-[11px] text-white/40 font-semibold tracking-[0.2em] uppercase" style={{ fontFamily: 'var(--font-label)' }}>
                    {currentPhaseTag}
                </motion.span>
            </motion.div>

            {/* ─── SCROLL HINT ─────────────────────────────────────── */}
            <motion.div
                className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
                style={{ opacity: scrollHintOpacity }}
            >
                <span className="text-[11px] text-white/30 tracking-[0.3em] font-medium uppercase" style={{ fontFamily: 'var(--font-label)' }}>
                    Initiate Analysis
                </span>
                <span className="scroll-hint text-white/20 text-lg font-light">↓</span>
            </motion.div>

            {/* ─── VERTICAL PHASE NAV (right edge) ──────────────────── */}
            <motion.div
                className="fixed right-8 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-[200]"
                style={{
                    opacity: useTransform(scrollYProgress, [0, 0.03, 0.95, 1], [0, 1, 1, 0]),
                }}
            >
                {phaseNames.map((name, i) => {
                    const phaseStart = i * 0.25;
                    const isActive = useTransform(scrollYProgress, (v) =>
                        v >= phaseStart && v < phaseStart + 0.25 ? 1 : 0
                    );
                    const dotWidth = useTransform(scrollYProgress, (v) =>
                        v >= phaseStart && v < phaseStart + 0.25 ? 32 : 8
                    );
                    const labelOpacity = useTransform(scrollYProgress, (v) =>
                        v >= phaseStart && v < phaseStart + 0.25 ? 1 : 0
                    );
                    const dotOpacity = useTransform(scrollYProgress, (v) =>
                        v >= phaseStart && v < phaseStart + 0.25 ? 1 : 0.2
                    );

                    return (
                        <motion.div
                            key={name}
                            className="flex items-center gap-3 justify-end"
                            style={{ opacity: dotOpacity }}
                        >
                            <motion.span
                                className="text-[11px] text-white font-bold tracking-widest"
                                style={{
                                    fontFamily: 'var(--font-label)',
                                    opacity: labelOpacity,
                                    transition: "opacity 0.5s",
                                }}
                            >
                                {name}
                            </motion.span>
                            <motion.div
                                className="h-[1px] bg-white"
                                style={{ width: dotWidth, transition: "width 0.6s cubic-bezier(0.23, 1, 0.32, 1)" }}
                            />
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* ─── PHASE 1: INGREDIENTS ─────────────────────────────── */}
            <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
                style={{ opacity: phase1Opacity }}
            >
                <motion.p
                    className="mb-12 text-white/40 text-xs font-semibold tracking-[0.2em] uppercase"
                    style={{
                        fontFamily: 'var(--font-label)',
                        opacity: useTransform(scrollYProgress, [0.02, 0.06], [0, 1]),
                        y: useTransform(scrollYProgress, [0.02, 0.06], [10, 0]),
                    }}
                >
                    {phaseContent.ingredients.hudLabel}
                </motion.p>
                {phaseContent.ingredients.lines.map((line, i) => (
                    <motion.p
                        key={i}
                        className="heading-display !text-[8vw] md:!text-[6vw] mb-4"
                        style={{
                            opacity: useTransform(
                                scrollYProgress,
                                [0.04 + i * 0.05, 0.08 + i * 0.05, 0.2, 0.26],
                                [0, 1, 1, 0]
                            ),
                            y: useTransform(
                                scrollYProgress,
                                [0.04 + i * 0.05, 0.08 + i * 0.05],
                                [20, 0]
                            ),
                        }}
                    >
                        {line}
                    </motion.p>
                ))}
            </motion.div>

            {/* ─── PHASE 2: INTELLIGENCE ────────────────────────────── */}
            <motion.div
                className="absolute inset-0 flex flex-col justify-center px-6"
                style={{ opacity: phase2Opacity }}
            >
                <div className="max-w-6xl mx-auto w-full relative">
                    {/* Left diagnostics */}
                    <div className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 flex flex-col gap-4">
                        {phaseContent.intelligence.leftDiagnostics.map((line, i) => (
                            <motion.div
                                key={i}
                                className="flex items-center gap-4"
                                style={{
                                    opacity: useTransform(
                                        scrollYProgress,
                                        [0.3 + i * 0.03, 0.34 + i * 0.03],
                                        [0, 0.4]
                                    ),
                                    x: useTransform(
                                        scrollYProgress,
                                        [0.3 + i * 0.03, 0.34 + i * 0.03],
                                        [-20, 0]
                                    ),
                                }}
                            >
                                <div className="w-8 h-[1px] bg-white/20" />
                                <span
                                    className="text-[11px] text-white/60 font-medium tracking-wide uppercase"
                                    style={{ fontFamily: 'var(--font-label)' }}
                                >
                                    {line}
                                </span>
                            </motion.div>
                        ))}
                    </div>

                    {/* Right diagnostics */}
                    <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 flex flex-col gap-4 items-end">
                        {phaseContent.intelligence.rightDiagnostics.map((stat, i) => (
                            <motion.div
                                key={i}
                                className="flex items-center gap-4"
                                style={{
                                    opacity: useTransform(
                                        scrollYProgress,
                                        [0.34 + i * 0.025, 0.38 + i * 0.025],
                                        [0, 0.6]
                                    ),
                                    x: useTransform(
                                        scrollYProgress,
                                        [0.34 + i * 0.025, 0.38 + i * 0.025],
                                        [20, 0]
                                    ),
                                }}
                            >
                                <span className="text-[11px] text-white/40 font-semibold tracking-wider" style={{ fontFamily: 'var(--font-label)' }}>
                                    {stat.label}
                                </span>
                                <span className="text-[14px] text-white font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                                    {stat.value}
                                </span>
                            </motion.div>
                        ))}
                    </div>

                    {/* Center heading */}
                    <motion.div
                        className="text-center"
                        style={{
                            opacity: useTransform(scrollYProgress, [0.38, 0.42], [0, 1]),
                            y: useTransform(scrollYProgress, [0.38, 0.42], [15, 0]),
                        }}
                    >
                        <p className="text-xs text-white/40 mb-6 font-semibold tracking-widest uppercase" style={{ fontFamily: 'var(--font-label)' }}>
                            {phaseContent.intelligence.hudLabel}
                        </p>
                        <h2 className="heading-display !text-6xl md:!text-7xl mb-6">
                            {phaseContent.intelligence.centerHeading}
                        </h2>
                        <p className="body-refined text-text-secondary text-base max-w-lg mx-auto">
                            {phaseContent.intelligence.centerSubtext}
                        </p>
                    </motion.div>
                </div>

                {/* Data Stream (right edge) */}
                <motion.div
                    className="data-stream opacity-20"
                    style={{
                        opacity: useTransform(scrollYProgress, [0.3, 0.35, 0.5, 0.54], [0, 0.1, 0.1, 0]),
                    }}
                >
                    <div className="data-stream-inner">
                        {[...dataStreamItems, ...dataStreamItems].map((item, i) => (
                            <div key={i}>{item}</div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>

            {/* ─── PHASE 3: TRANSFORMATION ──────────────────────────── */}
            <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
                style={{ opacity: phase3Opacity }}
            >
                <motion.p
                    className="mb-12 text-white/40 text-xs font-semibold tracking-[0.2em] uppercase"
                    style={{
                        fontFamily: 'var(--font-label)',
                        opacity: useTransform(scrollYProgress, [0.55, 0.58], [0, 1]),
                    }}
                >
                    {phaseContent.transformation.hudLabel}
                </motion.p>
                {phaseContent.transformation.lines.map((line, i) => (
                    <motion.p
                        key={i}
                        className="heading-display !text-[8vw] md:!text-[6vw] mb-4"
                        style={{
                            opacity: useTransform(
                                scrollYProgress,
                                [0.58 + i * 0.05, 0.62 + i * 0.05, 0.72, 0.76],
                                [0, 1, 1, 0]
                            ),
                            scale: useTransform(
                                scrollYProgress,
                                [0.58 + i * 0.05, 0.62 + i * 0.05],
                                [0.98, 1]
                            ),
                        }}
                    >
                        {line}
                    </motion.p>
                ))}
                {/* Sub-stat */}
                <motion.div
                    className="mt-12"
                    style={{
                        opacity: useTransform(scrollYProgress, [0.7, 0.74], [0, 0.6]),
                    }}
                >
                    <span className="text-[13px] text-white font-bold tracking-[0.25em] uppercase" style={{ fontFamily: 'var(--font-label)' }}>
                        {phaseContent.transformation.subStat}
                    </span>
                </motion.div>
            </motion.div>

            {/* ─── PHASE 4: SMARTPLATE  ─────────────────────────────── */}
            <motion.div
                className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-end pb-12 md:pb-24 text-center px-6"
                style={{ opacity: phase4Opacity, top: "50%" }}
            >
                <motion.p
                    className="mb-8 text-white/40 text-xs font-semibold tracking-[0.25em] uppercase"
                    style={{
                        fontFamily: 'var(--font-label)',
                        opacity: useTransform(scrollYProgress, [0.82, 0.85], [0, 1]),
                    }}
                >
                    {phaseContent.smartplate.hudLabel}
                </motion.p>
                <motion.h2
                    className="heading-display !text-[10vw] mb-4"
                    style={{
                        opacity: useTransform(scrollYProgress, [0.85, 0.9], [0, 1]),
                        y: useTransform(scrollYProgress, [0.85, 0.9], [20, 0]),
                    }}
                >
                    {phaseContent.smartplate.headline}
                </motion.h2>
                <motion.p
                    className="heading-display !text-3xl mb-4 text-white/80"
                    style={{
                        opacity: useTransform(scrollYProgress, [0.88, 0.92], [0, 1]),
                    }}
                >
                    {phaseContent.smartplate.tagline}
                </motion.p>
                <motion.p
                    className="body-refined text-text-secondary text-sm mb-12 max-w-md mx-auto"
                    style={{
                        opacity: useTransform(scrollYProgress, [0.89, 0.93], [0, 1]),
                    }}
                >
                    {phaseContent.smartplate.subTagline}
                </motion.p>
                <motion.a
                    href="/auth/signup"
                    className="pointer-events-auto px-16 py-5 bg-white text-black text-sm font-bold uppercase tracking-wider rounded-full hover:bg-transparent hover:text-white border border-white transition-all duration-300"
                    style={{
                        fontFamily: 'var(--font-label)',
                        opacity: useTransform(scrollYProgress, [0.92, 0.96], [0, 1]),
                        scale: useTransform(scrollYProgress, [0.92, 0.96], [0.98, 1]),
                    }}
                >
                    {phaseContent.smartplate.cta}
                </motion.a>
                <motion.p
                    className="text-[11px] mt-8 text-white/30 font-medium tracking-widest uppercase"
                    style={{
                        fontFamily: 'var(--font-label)',
                        opacity: useTransform(scrollYProgress, [0.94, 0.98], [0, 0.5]),
                    }}
                >
                    {phaseContent.smartplate.ctaSubtext}
                </motion.p>
            </motion.div>

            {/* ─── SCREEN READER SUMMARY ────────────────────────────── */}
            <div className="sr-only" role="region" aria-label="SmartPlate Experience">
                <h2>SmartPlate — The Last Diet App You&apos;ll Ever Need</h2>
                <p>
                    An interactive scroll-driven experience showing how SmartPlate transforms
                    food ingredients into personalized nutrition intelligence, body
                    transformation, and a powerful health dashboard.
                </p>
            </div>
        </div>
    );
}
