"use client";

import { useState, useEffect } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import Link from "next/link";

const navLinks = [
    { label: "How it Works", href: "#features" },
    { label: "Diet Plans", href: "#diets" },
    { label: "Tracking", href: "#features" },
    { label: "Rewards", href: "#features" },
    { label: "Testimonials", href: "#testimonials" },
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
                className={`fixed top-0 left-0 right-0 z-[100] px-6 md:px-12 py-6 flex items-center justify-between transition-all duration-300 ${scrolled
                        ? "backdrop-blur-xl bg-base-dark/80 border-b border-border"
                        : "bg-transparent"
                    }`}
                initial={{ y: -80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            >
                {/* Logo */}
                <a href="#" className="text-2xl font-bold tracking-tight text-white hover:opacity-70 transition-opacity" style={{ fontFamily: 'var(--font-display)' }}>
                    SmartPlate
                </a>

                {/* Desktop Links */}
                <ul className="hidden lg:flex items-center gap-10">
                    {navLinks.map((link) => (
                        <li key={link.label}>
                            <a
                                href={link.href}
                                className="text-[12px] uppercase tracking-[0.2em] text-text-secondary hover:text-white transition-colors duration-300 font-semibold"
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
                        className="text-[12px] uppercase tracking-[0.2em] text-text-secondary hover:text-white transition-colors font-semibold"
                        style={{ fontFamily: 'var(--font-label)' }}
                    >
                        Login
                    </Link>
                    <Link
                        href="/auth/signup"
                        className="px-8 py-3 bg-white text-black text-[12px] font-bold uppercase tracking-[0.1em] hover:bg-transparent hover:text-white border border-white transition-all duration-300 rounded-full"
                        style={{ fontFamily: 'var(--font-label)' }}
                    >
                        Get Started
                    </Link>
                </div>

                {/* Mobile toggle */}
                <button
                    className="lg:hidden text-text-secondary p-2 text-[11px] uppercase tracking-[0.2em] font-bold"
                    style={{ fontFamily: 'var(--font-label)' }}
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle menu"
                >
                    {mobileOpen ? "CLOSE" : "MENU"}
                </button>
            </motion.nav>

            {/* Mobile Menu */}
            {mobileOpen && (
                <motion.div
                    className="fixed inset-0 z-[99] bg-base-dark flex flex-col items-center justify-center gap-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {navLinks.map((link, i) => (
                        <motion.a
                            key={link.label}
                            href={link.href}
                            className="text-4xl font-bold text-text-primary hover:text-accent transition-colors"
                            style={{ fontFamily: 'var(--font-display)' }}
                            onClick={() => setMobileOpen(false)}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 * i, duration: 0.6 }}
                        >
                            {link.label}
                        </motion.a>
                    ))}
                    <a
                        href="/auth/signup"
                        className="mt-8 px-12 py-4 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-full"
                        style={{ fontFamily: 'var(--font-label)' }}
                        onClick={() => setMobileOpen(false)}
                    >
                        Get Started
                    </a>
                </motion.div>
            )}
        </>
    );
}
