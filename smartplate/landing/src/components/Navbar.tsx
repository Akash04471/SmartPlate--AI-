"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValueEvent, useScroll } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

const navLinks = [
    { label: "How it Works", href: "#features" },
    { label: "AI Coach", href: "/ai-coach" },
    { label: "Diet Plans", href: "#diets" },
    { label: "Tracking", href: "#features" },
    { label: "Rewards", href: "#rewards" },
];

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest) => {
        setScrolled(latest > 60);
    });

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [mobileOpen]);

    return (
        <>
            <motion.nav
                className={`fixed top-0 left-0 right-0 z-[100] px-6 md:px-12 py-3 flex items-center justify-between transition-all duration-300 ${scrolled
                        ? "backdrop-blur-xl bg-base-dark/80 border-b border-border"
                        : "bg-transparent"
                    }`}
                initial={{ y: -60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            >
                {/* Logo */}
                <a href="/" className="hover:opacity-80 transition-all flex items-center gap-3">
                    <Image 
                        src="/images/smartplate-logo.jpg" 
                        alt="SmartPlate Logo" 
                        width={140} 
                        height={40} 
                        className="h-8 md:h-10 w-auto object-contain"
                    />
                </a>

                {/* Desktop Links */}
                <ul className="hidden lg:flex items-center gap-10">
                    {navLinks.map((link) => (
                        <li key={link.label}>
                            <a
                                href={link.href}
                                className="text-[11px] uppercase tracking-[0.3em] text-white/40 hover:text-white transition-colors duration-300 font-black"
                                style={{ fontFamily: 'var(--font-label)' }}
                            >
                                {link.label}
                            </a>
                        </li>
                    ))}
                </ul>

                {/* Auth CTAs */}
                <div className="hidden lg:flex items-center gap-8">
                    <Link 
                        href="/auth/login"
                        className="text-[11px] uppercase tracking-[0.3em] text-white/40 hover:text-white transition-colors font-black"
                        style={{ fontFamily: 'var(--font-label)' }}
                    >
                        Login
                    </Link>
                    <Link
                        href="/auth/signup"
                        className="relative group px-8 py-3.5 bg-white text-black text-[11px] font-black uppercase tracking-[0.1em] hover:bg-emerald-500 hover:text-white transition-all duration-300 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                        style={{ fontFamily: 'var(--font-label)' }}
                    >
                        Get Started
                    </Link>
                </div>

                {/* Mobile toggle */}
                <button
                    className="lg:hidden flex items-center gap-3 text-white/40 p-2 text-[10px] uppercase tracking-[0.3em] font-black group transition-all"
                    style={{ fontFamily: 'var(--font-label)' }}
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle menu"
                >
                    <span className="group-hover:text-emerald-400">{mobileOpen ? "CLOSE" : "MENU"}</span>
                    <div className="flex flex-col gap-1 w-5">
                       <div className={`h-[2px] w-full bg-current transition-all ${mobileOpen ? 'rotate-45 translate-y-[6px]' : ''}`} />
                       <div className={`h-[2px] w-full bg-current transition-all ${mobileOpen ? 'opacity-0' : ''}`} />
                       <div className={`h-[2px] w-full bg-current transition-all ${mobileOpen ? '-rotate-45 -translate-y-[6px]' : ''}`} />
                    </div>
                </button>
            </motion.nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        className="fixed inset-0 z-[99] bg-base-dark/95 backdrop-blur-3xl flex flex-col items-center justify-center p-12 text-center"
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                    >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-white/[0.01] rounded-full blur-[140px] pointer-events-none" />
                        
                        <div className="flex flex-col gap-10 relative z-10 w-full">
                            {navLinks.map((link, i) => (
                                <motion.a
                                    key={link.label}
                                    href={link.href}
                                    className="text-4xl md:text-5xl font-black text-white hover:text-emerald-400 transition-colors italic tracking-tighter"
                                    style={{ fontFamily: 'var(--font-display)' }}
                                    onClick={() => setMobileOpen(false)}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.05 * i, duration: 0.6 }}
                                >
                                    {link.label}
                                </motion.a>
                            ))}
                            
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex flex-col gap-6 pt-12 border-t border-white/5 mt-4"
                            >
                                <Link 
                                    href="/auth/login"
                                    className="text-[12px] font-black uppercase tracking-[0.4em] text-white/30 hover:text-white transition-colors"
                                    style={{ fontFamily: 'var(--font-label)' }}
                                    onClick={() => setMobileOpen(false)}
                                >
                                    Access Port
                                </Link>
                                <Link
                                    href="/auth/signup"
                                    className="px-12 py-5 bg-white text-black text-[12px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.1)] active:scale-95 transition-all"
                                    style={{ fontFamily: 'var(--font-label)' }}
                                    onClick={() => setMobileOpen(false)}
                                >
                                    Initialize
                                </Link>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
