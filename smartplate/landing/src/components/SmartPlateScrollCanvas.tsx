"use client";

import { useRef, useEffect, useCallback } from "react";
import { nutritionRings } from "@/data/smartplateContent";

// ─── FOOD GROUP COLORS ─────────────────────────────────────────────
// ─── FOOD GROUP COLORS (Minimalist / Obsidian) ─────────────────────
const FOOD_GROUPS = ["protein", "carb", "fat", "fiber", "vitamin"] as const;
const GROUP_COLORS: Record<string, string> = {
    protein: "#ffffff",
    carb: "#d1d1d1",
    fat: "#a1a1a1",
    fiber: "#717171",
    vitamin: "#414141",
};

interface Particle {
    x: number;
    y: number;
    originX: number;
    originY: number;
    targetX: number;
    targetY: number;
    vx: number;
    vy: number;
    radius: number;
    glowRadius: number;
    color: string;
    group: string;
    opacity: number;
    targetOpacity: number;
    pulse: number;
    trail: { x: number; y: number }[];
}

interface SmartPlateScrollCanvasProps {
    progress: number;
}

export default function SmartPlateScrollCanvas({
    progress,
}: SmartPlateScrollCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const rafRef = useRef<number>(0);
    const progressRef = useRef(0);

    progressRef.current = progress;

    // ─── INIT PARTICLES ──────────────────────────────────────────────
    const initParticles = useCallback((w: number, h: number) => {
        const particles: Particle[] = [];
        const count = 65;
        const perGroup = 13;

        for (let i = 0; i < count; i++) {
            const groupIdx = Math.floor(i / perGroup);
            const group = FOOD_GROUPS[Math.min(groupIdx, FOOD_GROUPS.length - 1)];
            const color = GROUP_COLORS[group];

            // Spawn from edges
            const edge = Math.floor(Math.random() * 4);
            let spawnX: number, spawnY: number;
            switch (edge) {
                case 0: spawnX = Math.random() * w; spawnY = -20; break;
                case 1: spawnX = w + 20; spawnY = Math.random() * h; break;
                case 2: spawnX = Math.random() * w; spawnY = h + 20; break;
                default: spawnX = -20; spawnY = Math.random() * h; break;
            }

            // Scatter destinations
            const destX = w * 0.1 + Math.random() * w * 0.8;
            const destY = h * 0.1 + Math.random() * h * 0.8;

            // Plate ring target
            const angle = (i / count) * Math.PI * 2;
            const plateR = 80 + Math.random() * 100;
            const plateX = w / 2 + Math.cos(angle) * plateR;
            const plateY = h / 2 + Math.sin(angle) * plateR;

            const radius = 4 + Math.random() * 10;

            particles.push({
                x: spawnX,
                y: spawnY,
                originX: destX,
                originY: destY,
                targetX: plateX,
                targetY: plateY,
                vx: (Math.random() - 0.5) * 1.6,
                vy: (Math.random() - 0.5) * 1.6,
                radius,
                glowRadius: radius * 3,
                color,
                group,
                opacity: 0,
                targetOpacity: 0.6 + Math.random() * 0.4,
                pulse: Math.random() * Math.PI * 2,
                trail: [],
            });
        }
        particlesRef.current = particles;
    }, []);

    // ─── DRAW PARTICLE ───────────────────────────────────────────────
    const drawParticle = useCallback(
        (ctx: CanvasRenderingContext2D, p: Particle, t: number, colorOverride?: string) => {
            const color = colorOverride || p.color;

            // Trail
            if (p.trail.length > 1) {
                for (let i = 1; i < p.trail.length; i++) {
                    const alpha = (i / p.trail.length) * 0.15 * p.opacity;
                    ctx.globalAlpha = alpha;
                    ctx.beginPath();
                    ctx.arc(p.trail[i].x, p.trail[i].y, p.radius * 0.5, 0, Math.PI * 2);
                    ctx.fillStyle = color;
                    ctx.fill();
                }
            }

            // Glow layer
            const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.glowRadius);
            grd.addColorStop(0, color + "40");
            grd.addColorStop(1, color + "00");
            ctx.globalAlpha = p.opacity;
            ctx.fillStyle = grd;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.glowRadius, 0, Math.PI * 2);
            ctx.fill();

            // Core orb
            const pulsedR = p.radius + Math.sin(t * 0.002 + p.pulse) * 1.5;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, pulsedR, 0, Math.PI * 2);
            ctx.fill();

            // Inner highlight
            ctx.fillStyle = "rgba(255,255,255,0.3)";
            ctx.beginPath();
            ctx.arc(
                p.x - pulsedR * 0.3,
                p.y - pulsedR * 0.3,
                pulsedR * 0.35,
                0,
                Math.PI * 2
            );
            ctx.fill();
            ctx.globalAlpha = 1;
        },
        []
    );

    // ─── PHASE 1: FLOATING PARTICLES ─────────────────────────────────
    const drawPhase1 = useCallback(
        (ctx: CanvasRenderingContext2D, w: number, h: number, p: number, t: number) => {
            const spawnP = Math.min(1, p / 0.1); // 0–10% scroll: particles move from edge to scatter
            const gravP = Math.max(0, (p - 0.25) / 0.05); // 25–30%: start pull toward center

            particlesRef.current.forEach((particle) => {
                // Fade in
                particle.opacity += (particle.targetOpacity * spawnP - particle.opacity) * 0.05;

                // Scatter position
                const scatterX = particle.originX + Math.sin(t * 0.001 + particle.pulse) * 25;
                const scatterY = particle.originY + Math.cos(t * 0.0008 + particle.pulse) * 20;

                // Lerp from edge spawn → scatter position
                const lerpSpeed = 0.03;
                const destX = scatterX + (w / 2 - scatterX) * gravP * 0.3;
                const destY = scatterY + (h / 2 - scatterY) * gravP * 0.3;

                particle.x += (destX - particle.x) * lerpSpeed;
                particle.y += (destY - particle.y) * lerpSpeed;

                // Update trail
                particle.trail.push({ x: particle.x, y: particle.y });
                if (particle.trail.length > 5) particle.trail.shift();

                drawParticle(ctx, particle, t);
            });
        },
        [drawParticle]
    );

    // ─── PHASE 2: PLATE ASSEMBLY + RINGS ─────────────────────────────
    const drawPhase2 = useCallback(
        (ctx: CanvasRenderingContext2D, w: number, h: number, p: number, t: number) => {
            const assemblyP = Math.min(1, (p - 0.28) / 0.12);
            const eased = 1 - Math.pow(1 - assemblyP, 3);

            // Plate circle — stroke dashoffset draw
            const plateR = 110;
            const circumference = 2 * Math.PI * plateR;
            const dashOffset = circumference * (1 - eased);

            ctx.save();
            ctx.beginPath();
            ctx.arc(w / 2, h / 2, plateR, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(15, 15, 15, ${0.4 * eased})`;
            ctx.fill();

            ctx.setLineDash([circumference]);
            ctx.lineDashOffset = dashOffset;
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * eased})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();

            // Particles collapse to plate positions
            particlesRef.current.forEach((particle) => {
                const destX = particle.targetX;
                const destY = particle.targetY;

                particle.x += (destX - particle.x) * eased * 0.08;
                particle.y += (destY - particle.y) * eased * 0.08;
                particle.opacity += (particle.targetOpacity * (1 - eased * 0.4) - particle.opacity) * 0.05;

                particle.trail.push({ x: particle.x, y: particle.y });
                if (particle.trail.length > 5) particle.trail.shift();

                drawParticle(ctx, particle, t);
            });

            // Nutrition rings
            if (eased > 0.3) {
                const ringAlpha = (eased - 0.3) / 0.7;
                drawNutritionRings(ctx, w, h, ringAlpha, t, eased);
            }

            // Pulse rings at 50% scroll
            if (p > 0.48 && p < 0.52) {
                const pulseP = Math.sin(((p - 0.48) / 0.04) * Math.PI);
                ctx.save();
                ctx.translate(w / 2, h / 2);
                ctx.scale(1 + pulseP * 0.05, 1 + pulseP * 0.05);
                ctx.translate(-w / 2, -h / 2);
                drawNutritionRings(ctx, w, h, 1, t, 1);
                ctx.restore();
            }
        },
        [drawParticle]
    );

    // ─── NUTRITION RINGS ─────────────────────────────────────────────
    const drawNutritionRings = useCallback(
        (ctx: CanvasRenderingContext2D, w: number, h: number, opacity: number, t: number, animP: number) => {
            const cx = w / 2;
            const cy = h / 2;

            nutritionRings.forEach((ring, i) => {
                const r = 150 + i * 35;
                const pct = (ring.value / ring.max) * animP;
                const startAngle = -Math.PI / 2;
                const endAngle = startAngle + pct * Math.PI * 2;
                const ringColor = i === 0 ? "rgba(255,255,255,0.8)" : `rgba(255,255,255,${0.6 - i * 0.1})`;

                ctx.save();
                // Background ring
                ctx.globalAlpha = opacity * 0.05;
                ctx.beginPath();
                ctx.arc(cx, cy, r, 0, Math.PI * 2);
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 1;
                ctx.stroke();

                // Value ring
                ctx.globalAlpha = opacity * (0.4 + (1 - i / 5) * 0.4);
                ctx.beginPath();
                ctx.arc(cx, cy, r, startAngle, endAngle);
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 1.5;
                ctx.lineCap = "butt";
                ctx.stroke();

                // Labels
                ctx.globalAlpha = opacity * 0.4;
                ctx.font = '8px "DM Mono", monospace';
                ctx.fillStyle = "#ffffff";
                ctx.textAlign = "right";

                const counterVal = Math.round(ring.value * animP);
                ctx.fillText(
                    `${ring.label.toUpperCase()} ${counterVal}/${ring.max}`,
                    cx + r + 55,
                    cy - r + i * 20
                );

                ctx.globalAlpha = opacity * 0.2;
                ctx.font = '7px "DM Mono", monospace';
                ctx.fillText(ring.subLabel.toUpperCase(), cx + r + 55, cy - r + i * 20 + 10);
                ctx.restore();
            });
        },
        []
    );

    // ─── PHASE 3: ENERGY EXPLOSION ───────────────────────────────────
    const drawPhase3 = useCallback(
        (ctx: CanvasRenderingContext2D, w: number, h: number, p: number, t: number) => {
            const dissolveP = Math.min(1, (p - 0.53) / 0.15);
            const eased = 1 - Math.pow(1 - dissolveP, 2);

            // Fading rings
            if (dissolveP < 0.3) {
                drawNutritionRings(ctx, w, h, 1 - dissolveP * 3.3, t, 1);
            }

            // Energy particles burst outward — grayscale
            const burstCount = 80;

            for (let i = 0; i < burstCount; i++) {
                const angle = (i / burstCount) * Math.PI * 2 + t * 0.1;
                const speed = 2 + (i % 5) * 1.5;
                const baseR = 20 + eased * speed * 40;
                const r = baseR + Math.sin(t * 0.003 + i * 0.7) * 15;
                const x = w / 2 + Math.cos(angle) * r;
                const y = h / 2 + Math.sin(angle) * r;

                const displayColor = i % 2 === 0 ? "#ffffff" : "#444444";
                const size = 0.5 + Math.random() * 2;

                // Core
                ctx.globalAlpha = (1 - eased * 0.3) * (0.3 + Math.random() * 0.4);
                ctx.fillStyle = displayColor;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
            }

            // Central glow fading
            const gradient = ctx.createRadialGradient(
                w / 2, h / 2, 0,
                w / 2, h / 2, 180 - eased * 100
            );
            gradient.addColorStop(0, `rgba(255,255,255,${0.05 * (1 - eased)})`);
            gradient.addColorStop(1, "transparent");
            ctx.globalAlpha = 1;
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, w, h);

            ctx.globalAlpha = 1;
        },
        [drawNutritionRings]
    );

    // ─── PHASE 4: DASHBOARD ──────────────────────────────────────────
    const drawPhase4 = useCallback(
        (ctx: CanvasRenderingContext2D, w: number, h: number, p: number, t: number) => {
            const revealP = Math.min(1, (p - 0.78) / 0.15);
            const eased = 1 - Math.pow(1 - revealP, 3);

            const dashW = Math.min(700, w * 0.72);
            const dashH = Math.min(340, h * 0.45);
            const dashX = (w - dashW) / 2;
            const dashY = h * 0.05;

            ctx.save();
            ctx.globalAlpha = eased;

            // Main frame
            ctx.fillStyle = "rgba(5, 5, 5, 0.98)";
            roundRect(ctx, dashX, dashY, dashW, dashH, 0); // Sharp corners for Obsidian feel
            ctx.fill();
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.05 * eased})`;
            ctx.lineWidth = 1;
            ctx.stroke();

            // ─── SIDEBAR ─────────────────────────────────────────────
            const sideW = 185;
            const clipP = Math.min(1, eased * 1.5);
            ctx.save();
            ctx.beginPath();
            ctx.rect(dashX, dashY, sideW * clipP, dashH);
            ctx.clip();

            ctx.fillStyle = "rgba(10, 10, 10, 1)";
            ctx.fillRect(dashX, dashY, sideW, dashH);

            // Logo
            ctx.font = 'italic 14px "Instrument Serif", serif';
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "left";
            ctx.fillText("SmartPlate.", dashX + 24, dashY + 40);
            
            // Sync status
            ctx.font = '7px "DM Mono", monospace';
            ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
            ctx.fillText("SYNC_ACTIVE // 042", dashX + 24, dashY + 54);

            // Nav items
            const navItems = ["DASHBOARD", "PROTOCOL", "METRICS", "ARCHIVE", "SETTINGS"];
            navItems.forEach((item, i) => {
                ctx.font = '8px "DM Mono", monospace';
                if (i === 0) {
                    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
                    ctx.fillRect(dashX + 16, dashY + 80 + i * 35, sideW - 32, 24);
                    ctx.fillStyle = "#ffffff";
                } else {
                    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
                }
                ctx.fillText(item, dashX + 28, dashY + 95 + i * 35);
            });
            ctx.restore();

            // Divider
            ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
            ctx.beginPath();
            ctx.moveTo(dashX + sideW, dashY + 20);
            ctx.lineTo(dashX + sideW, dashY + dashH - 20);
            ctx.stroke();

            // ─── MAIN CONTENT ────────────────────────────────────────
            const mainX = dashX + sideW + 30;
            const mainW = dashW - sideW - 60;

            // Greeting
            ctx.font = 'italic 20px "Instrument Serif", serif';
            ctx.fillStyle = "#ffffff";
            ctx.fillText("Good evening, Arjun", mainX, dashY + 45);
            
            ctx.font = '7px "DM Mono", monospace';
            ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
            ctx.fillText("CALIBRATION_STAGE: OPTIMAL // DAY_24", mainX, dashY + 60);

            // Stat cards
            const cardW = (mainW - 30) / 3;
            const cards = [
                { val: "1.8k", label: "INTAKE", unit: "kcal" },
                { val: "-2.4", label: "DELTA", unit: "kg" },
                { val: "23", label: "STREAK", unit: "days" },
            ];

            cards.forEach((card, i) => {
                const delay = Math.min(1, Math.max(0, (eased - 0.3 - i * 0.08) * 4));
                const cx = mainX + i * (cardW + 15);
                const cy = dashY + 85;

                ctx.globalAlpha = eased * delay;
                ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
                ctx.strokeRect(cx, cy, cardW, 60);

                ctx.font = 'italic 20px "Instrument Serif", serif';
                ctx.fillStyle = "#ffffff";
                ctx.fillText(card.val, cx + 12, cy + 30);

                ctx.font = '7px "DM Mono", monospace';
                ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
                ctx.fillText(card.label, cx + 12, cy + 45);
            });

            ctx.globalAlpha = eased;

            // Bar chart
            const graphY = dashY + 165;
            const graphH = 100;
            ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
            ctx.strokeRect(mainX, graphY, mainW, graphH);

            ctx.font = '7px "DM Mono", monospace';
            ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
            ctx.fillText("WEEKLY_ADHERENCE", mainX + 12, graphY + 18);

            const barData = [72, 68, 85, 79, 91, 83, 88];
            const barW = (mainW - 60) / barData.length;
            barData.forEach((v, i) => {
                const barDelay = Math.min(1, Math.max(0, (eased - 0.5 - i * 0.03) * 5));
                const bh = (v / 100) * (graphH - 45) * barDelay;
                const bx = mainX + 30 + i * barW + barW * 0.15;
                const by = graphY + graphH - 20 - bh;

                ctx.fillStyle = i === barData.length - 1 ? "#ffffff" : "rgba(255,255,255,0.1)";
                ctx.fillRect(bx, by, barW * 0.6, bh);
            });

            // Meal list
            const listY = graphY + graphH + 15;
            const meals = [
                "07:30 // MASALA_OATS // 380 KCAL",
                "13:00 // PANEER_SALAD // 460 KCAL",
                "19:30 // TANDOORI_CHICKEN // 540 KCAL",
            ];
            meals.forEach((m, i) => {
                const mDelay = Math.min(1, Math.max(0, (eased - 0.6 - i * 0.05) * 5));
                ctx.globalAlpha = eased * mDelay;
                ctx.font = '8px "DM Mono", monospace';
                ctx.fillStyle = i < 2 ? "rgba(255, 255, 255, 0.6)" : "rgba(255, 255, 255, 0.2)";
                ctx.fillText(m, mainX, listY + i * 14);
            });

            ctx.restore();

            // Residual particles
            const pCount = 20;
            for (let i = 0; i < pCount; i++) {
                const angle = (i / pCount) * Math.PI * 2 + t * 0.0005;
                const r = 300 + Math.sin(t * 0.001 + i) * 30;
                const x = w / 2 + Math.cos(angle) * r;
                const y = h / 2 + Math.sin(angle) * r;
                ctx.beginPath();
                ctx.arc(x, y, 1, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
                ctx.globalAlpha = (1 - eased) * 0.4;
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        },
        []
    );

    // ─── ANIMATION LOOP ──────────────────────────────────────────────
    const render = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;

        if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            ctx.scale(dpr, dpr);
            initParticles(w, h);
        }

        const p = progressRef.current;
        const t = performance.now();

        ctx.clearRect(0, 0, w, h);

        // Ambient glow
        const ambientGrad = ctx.createRadialGradient(
            w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.6
        );
        ambientGrad.addColorStop(0, "rgba(22,163,74,0.05)");
        ambientGrad.addColorStop(1, "transparent");
        ctx.fillStyle = ambientGrad;
        ctx.fillRect(0, 0, w, h);

        // Phase rendering with crossfades
        if (p < 0.3) {
            drawPhase1(ctx, w, h, p, t);
        } else if (p < 0.55) {
            drawPhase2(ctx, w, h, p, t);
        } else if (p < 0.8) {
            drawPhase3(ctx, w, h, p, t);
        } else {
            drawPhase4(ctx, w, h, p, t);
        }

        rafRef.current = requestAnimationFrame(render);
    }, [drawPhase1, drawPhase2, drawPhase3, drawPhase4, initParticles]);

    useEffect(() => {
        rafRef.current = requestAnimationFrame(render);
        return () => cancelAnimationFrame(rafRef.current);
    }, [render]);

    useEffect(() => {
        const handleResize = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            initParticles(canvas.clientWidth, canvas.clientHeight);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [initParticles]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            aria-hidden="true"
            style={{ imageRendering: "auto" }}
        />
    );
}

// ─── HELPERS ───────────────────────────────────────────────────────
function roundRect(
    ctx: CanvasRenderingContext2D,
    x: number, y: number, w: number, h: number, r: number
) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

function lerpColor(a: string, b: string, t: number): string {
    const ah = parseInt(a.replace("#", ""), 16);
    const bh = parseInt(b.replace("#", ""), 16);
    const ar = (ah >> 16) & 0xff, ag = (ah >> 8) & 0xff, ab = ah & 0xff;
    const br = (bh >> 16) & 0xff, bg = (bh >> 8) & 0xff, bb = bh & 0xff;
    const rr = Math.round(ar + (br - ar) * t);
    const rg = Math.round(ag + (bg - ag) * t);
    const rb = Math.round(ab + (bb - ab) * t);
    return `#${((rr << 16) | (rg << 8) | rb).toString(16).padStart(6, "0")}`;
}
