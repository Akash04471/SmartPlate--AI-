// ─── SCROLL PHASE CONTENT ──────────────────────────────────────────
export const phaseContent = {
    ingredients: {
        lines: [
            "What you eat shapes who you become.",
            "Every ingredient carries a signal.",
            "SmartPlate reads them all.",
        ],
        hudLabel: "BIOMETRIC NUTRITION ANALYSIS",
        phaseTag: "PHASE 01 / 04 · INGREDIENTS",
    },
    intelligence: {
        leftDiagnostics: [
            "ENERGY METABOLISM — MAPPED",
            "MACRO DISTRIBUTION — OPTIMIZED",
            "METABOLIC RATE — CALIBRATING",
            "MICRONUTRIENT GAPS — DETECTED",
        ],
        rightDiagnostics: [
            { label: "ACCURACY", value: "99.4%", color: "#22c55e" },
            { label: "PRECISION", value: "±2.1 kcal", color: "#a3e635" },
            { label: "ADAPTATION SPEED", value: "REAL-TIME", color: "#38bdf8" },
            { label: "PERSONALIZATION SCORE", value: "98/100", color: "#f59e0b" },
        ],
        centerHeading: "Your Body Has a Blueprint.",
        centerSubtext:
            "We decoded it. 47 health biomarkers processed in under 2 seconds.",
        hudLabel: "NUTRITIONAL INTELLIGENCE · ACTIVE",
        phaseTag: "PHASE 02 / 04 · INTELLIGENCE",
    },
    transformation: {
        lines: [
            "Your metabolism isn't broken.",
            "It's been waiting for the right fuel.",
            "Every meal from here is an upgrade.",
        ],
        hudLabel: "METABOLIC OPTIMIZATION · ACTIVE",
        phaseTag: "PHASE 03 / 04 · TRANSFORMATION",
        subStat: "+340 kcal net burn · Today",
    },
    smartplate: {
        headline: "SmartPlate",
        tagline: "The last diet app you'll ever need.",
        subTagline: "Because this one actually works.",
        cta: "Build My Personal Plan →",
        ctaSubtext: "Ready in 90 seconds · Free forever plan",
        hudLabel: "SMARTPLATE · SYSTEM ONLINE",
        phaseTag: "PHASE 04 / 04 · READY",
    },
};

// ─── NUTRITION RINGS ──────────────────────────────────────────────
export const nutritionRings = [
    { label: "CALORIES", value: 1847, max: 2100, subLabel: "Daily Target Met · 88%", color: "#a3e635" },
    { label: "PROTEIN", value: 168, max: 175, subLabel: "Muscle Synthesis Active", color: "#22c55e" },
    { label: "CARBS", value: 195, max: 240, subLabel: "Sustained Energy Zone", color: "#38bdf8" },
    { label: "FATS", value: 62, max: 75, subLabel: "Omega Balance · Optimal", color: "#f59e0b" },
];

// ─── FOOD PARTICLE COLORS ─────────────────────────────────────────
export const foodGroupColors: Record<string, string> = {
    protein: "#f59e0b",
    carb: "#38bdf8",
    fat: "#a3e635",
    fiber: "#22c55e",
    vitamin: "#f87171",
};

// ─── FEATURE CARDS ─────────────────────────────────────────────────
export const features = [
    {
        iconName: "Brain" as const,
        title: "Precision Nutrition Intelligence",
        description:
            "SmartPlate's model processes 47+ biomarkers — your metabolism, activity, sleep, and gut preferences — to generate a diet that evolves with you, week by week.",
        tag: "Adaptive AI",
    },
    {
        iconName: "ScanLine" as const,
        title: "Instant Calorie Vision",
        description:
            "Describe or photograph your meal and SmartPlate identifies ingredients, portions, and macros in under 3 seconds. Clinical-grade precision without the clinic.",
        tag: "3-Second Log",
    },
    {
        iconName: "TrendingUp" as const,
        title: "Deep Progress Analytics",
        description:
            "Weekly body composition trends, macro adherence heatmaps, and predictive goal timelines. See not just where you are — but where you're headed.",
        tag: "Predictive",
    },
    {
        iconName: "Trophy" as const,
        title: "Adherence Optimization",
        description:
            "Streaks, cheat meal unlocks, and transformation milestones keep your motivation compounding. The longer you stay, the better the rewards get.",
        tag: "Gamified",
    },
];

// ─── DIET TYPES ────────────────────────────────────────────────────
export const dietTypes = [
    {
        emoji: "🥗",
        name: "Plant-Based Balanced",
        description:
            "Whole foods, seasonal produce, and complete proteins — crafted for those who thrive on nature's palette. Zero compromise on taste or nutrition.",
        tag: "Most Popular",
    },
    {
        emoji: "🍖",
        name: "High-Performance Omnivore",
        description:
            "Lean proteins, complex carbs, and precision fat ratios engineered for muscle synthesis, recovery, and sustained daily energy.",
        tag: "Muscle & Strength",
    },
    {
        emoji: "🌱",
        name: "Whole-Food Vegan",
        description:
            "Every essential amino acid, vitamin, and mineral — fully plant-sourced. Built for ethical living without nutritional sacrifice.",
        tag: "Eco Intelligence",
    },
    {
        emoji: "🩺",
        name: "Therapeutic Nutrition",
        description:
            "Designed in collaboration with clinical dietitians for conditions like diabetes, PCOS, thyroid disorders, and metabolic syndrome.",
        tag: "Clinically Validated",
    },
];

// ─── TESTIMONIALS ──────────────────────────────────────────────────
export const testimonials = [
    {
        text: "I've tried seven apps. SmartPlate is the first one that didn't feel like homework. The plan fit my Indian food preferences perfectly — I didn't give up a single thing I love.",
        name: "Priya Sharma",
        role: "Software Engineer · Lost 14kg in 90 days",
        avatar: "👩",
    },
    {
        text: "As someone who already knew nutrition, I was skeptical. Then SmartPlate detected a chronic protein timing gap I'd missed for years. My strength PRs jumped in 6 weeks.",
        name: "Arjun Mehta",
        role: "Gym Coach · Gained 9kg lean muscle",
        avatar: "👨",
    },
    {
        text: "I recommend SmartPlate to my patients now. The medical diet plans are evidence-based and the glucose-impact scoring on meals is genuinely impressive clinical work.",
        name: "Dr. Nisha Patel",
        role: "Endocrinologist · T2 Diabetes managed",
        avatar: "👩‍⚕️",
    },
];

// ─── STATS ─────────────────────────────────────────────────────────
export const stats = [
    { value: "2.4M+", numericTarget: 2.4, suffix: "M+", label: "Active Users", subLabel: "Across 40+ countries" },
    { value: "98.2%", numericTarget: 98.2, suffix: "%", label: "Goal Achievement", subLabel: "Within first 90 days" },
    { value: "1,200+", numericTarget: 1200, suffix: "+", label: "Verified Diet Plans", subLabel: "Expert-curated & AI-refined" },
    { value: "4.9★", numericTarget: 4.9, suffix: "★", label: "App Store Rating", subLabel: "180,000+ reviews" },
];

// ─── DATA STREAM (Phase 2 right edge) ──────────────────────────────
export const dataStreamItems = [
    "LEUCINE: 8.2g", "OMEGA-3: 1.4g", "VIT-D: 82IU", "FIBER: 28g",
    "ZINC: 11mg", "IRON: 14mg", "VIT-B12: 4.8μg", "MAGNESIUM: 320mg",
    "VIT-C: 112mg", "CALCIUM: 890mg", "FOLATE: 420μg", "POTASSIUM: 3.2g",
    "SELENIUM: 55μg", "VIT-A: 900μg", "COPPER: 1.1mg", "THIAMINE: 1.4mg",
];

// ─── TRUST BADGES ──────────────────────────────────────────────────
export const trustBadges = [
    "🔒 HIPAA Compliant",
    "🏥 Dietitian Approved",
    "⭐ 4.9 App Store",
];

// ─── PHASE NAMES (for nav indicator) ──────────────────────────────
export const phaseNames = ["NUTRIENTS", "INTELLIGENCE", "METABOLISM", "READY"];
