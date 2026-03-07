import { useState } from 'react';
import Navbar from '../components/Navbar';
import { RingChart, Sparkline, BarChart } from '../components/Charts';
import '../styles/global.css';

// ─── MOCK DATA ──────────────────────────────────────────────────────
const macros = [
    { name: 'Protein', val: 142, max: 180, unit: 'g', color: '#22c55e', pct: 79, icon: '💪' },
    { name: 'Carbohydrates', val: 210, max: 280, unit: 'g', color: '#a3e635', pct: 75, icon: '⚡' },
    { name: 'Fats', val: 58, max: 80, unit: 'g', color: '#f59e0b', pct: 73, icon: '🫒' },
    { name: 'Fiber', val: 28, max: 35, unit: 'g', color: '#38bdf8', pct: 80, icon: '🥬' },
];

const weekData = [65, 72, 68, 80, 75, 82, 78];
const weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const calorieWeek = [1850, 1920, 1780, 1950, 1850, 1700, 1580];

const todayMeals = [
    { emoji: '🥗', name: 'Quinoa Bowl', cal: 420, time: '8:30 AM', logged: true },
    { emoji: '🍌', name: 'Banana + Almonds', cal: 280, time: '11:00 AM', logged: true },
    { emoji: '🍗', name: 'Grilled Chicken Salad', cal: 520, time: '1:00 PM', logged: true },
    { emoji: '🥤', name: 'Protein Shake', cal: 180, time: '4:30 PM', logged: false },
    { emoji: '🐟', name: 'Salmon with Veggies', cal: 480, time: '7:30 PM', logged: false },
];

const goals = [
    { label: 'Weight Goal', current: '74.8 kg', target: '70 kg', pct: 68, color: '#22c55e', icon: '⚖️' },
    { label: 'Diet Adherence', current: '84%', target: '95%', pct: 88, color: '#a3e635', icon: '✅' },
    { label: 'Activity Score', current: '72/100', target: '90/100', pct: 80, color: '#38bdf8', icon: '🏃' },
];

const streakDays = [
    { day: 'M', done: true }, { day: 'T', done: true }, { day: 'W', done: true },
    { day: 'T', done: true }, { day: 'F', done: true }, { day: 'S', done: true },
    { day: 'S', done: false, today: true },
];

export default function Dashboard() {
    const [activeCard, setActiveCard] = useState(null);

    const now = new Date();
    const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';
    const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <div className="app-layout">
            <Navbar />
            <main className="main-content">
                <div className="grid-bg" />

                {/* Header */}
                <div className="page-header animate-slideUp">
                    <div className="page-header-left">
                        <div className="page-greeting">{greeting},</div>
                        <div className="page-title">Arjun 👋</div>
                    </div>
                    <div className="page-header-right">
                        <div className="page-date">{dateStr}</div>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="stats-row">
                    {[
                        { icon: '🔥', value: '1,580', label: 'Calories Today', color: '#a3e635', trend: '↓ 12%', trendDir: 'down' },
                        { icon: '🎯', value: '78%', label: 'Goal Progress', color: '#22c55e', trend: '↑ 5%', trendDir: 'up' },
                        { icon: '💪', value: '142g', label: 'Protein Intake', color: '#38bdf8', trend: '↑ 8%', trendDir: 'up' },
                        { icon: '🔥', value: '7', label: 'Day Streak', color: '#ef4444', trend: 'Personal Best!', trendDir: 'up' },
                    ].map((s, i) => (
                        <div key={i}
                            className={`stat-card animate-slideUp delay-${i + 1}`}
                            onMouseEnter={() => setActiveCard(i)}
                            onMouseLeave={() => setActiveCard(null)}
                        >
                            <span className="stat-card-icon">{s.icon}</span>
                            <div className="stat-card-value" style={{ color: s.color }}>{s.value}</div>
                            <div className="stat-card-label">{s.label}</div>
                            <div className={`stat-card-trend ${s.trendDir}`}>{s.trend}</div>
                        </div>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="content-grid two-col" style={{ marginBottom: 20 }}>
                    {/* Calorie Ring + Macros */}
                    <div className="content-card animate-slideUp delay-2">
                        <div className="content-card-header">
                            <div className="content-card-title">Today's Nutrition</div>
                            <button className="content-card-action">Details →</button>
                        </div>
                        <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                                <RingChart value={1580} max={2200} size={170} label="kcal today" />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%' }}>
                                    {[
                                        { label: 'Remaining', val: '620 kcal', color: '#22c55e' },
                                        { label: 'Burned', val: '320 kcal', color: '#a3e635' },
                                    ].map((s, i) => (
                                        <div key={i} style={{
                                            background: 'rgba(10,30,18,0.6)', border: '1px solid rgba(34,197,94,0.08)',
                                            borderRadius: 10, padding: '10px 12px', textAlign: 'center',
                                        }}>
                                            <div style={{ fontSize: 14, fontWeight: 700, color: s.color }}>{s.val}</div>
                                            <div style={{ fontSize: 11, color: '#6b9e7a', marginTop: 2 }}>{s.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div style={{ flex: 1, minWidth: 200 }}>
                                <div className="macro-bars">
                                    {macros.map((m, i) => (
                                        <div key={i} className="macro-row">
                                            <div className="macro-label">
                                                <span className="macro-name">{m.icon} {m.name}</span>
                                                <span className="macro-val">{m.val}{m.unit} / {m.max}{m.unit}</span>
                                            </div>
                                            <div className="bar-bg">
                                                <div className="bar-fill" style={{
                                                    width: `${m.pct}%`,
                                                    background: `linear-gradient(90deg, ${m.color}88, ${m.color})`,
                                                }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Weekly Progress */}
                    <div className="content-card animate-slideUp delay-3">
                        <div className="content-card-header">
                            <div className="content-card-title">Weekly Progress</div>
                            <button className="content-card-action">This Week</button>
                        </div>
                        <BarChart data={weekData} labels={weekLabels} activeIndex={6} height={130} />

                        <div style={{ marginTop: 20, padding: 16, background: 'rgba(10,30,18,0.5)', borderRadius: 12, border: '1px solid rgba(34,197,94,0.06)' }}>
                            <div style={{ fontSize: 11, color: '#6b9e7a', letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase' }}>Calorie Trend</div>
                            <Sparkline data={calorieWeek} color="#22c55e" height={60} />
                        </div>
                    </div>
                </div>

                {/* Today's Plan + Goals + Streaks */}
                <div className="content-grid" style={{ gridTemplateColumns: '1fr 1fr 0.8fr', marginBottom: 20 }}>
                    {/* Today's Meals */}
                    <div className="content-card animate-slideUp delay-3">
                        <div className="content-card-header">
                            <div className="content-card-title">Today's Diet Plan</div>
                            <button className="content-card-action">View All →</button>
                        </div>
                        <div className="food-log">
                            {todayMeals.map((meal, i) => (
                                <div key={i} className="food-log-item">
                                    <div className="food-log-emoji">{meal.emoji}</div>
                                    <div className="food-log-info">
                                        <div className="food-log-name">{meal.name}</div>
                                        <div className="food-log-time">{meal.time}</div>
                                    </div>
                                    <div className="food-log-cals">{meal.cal} kcal</div>
                                    <div style={{
                                        width: 8, height: 8, borderRadius: '50%',
                                        background: meal.logged ? '#22c55e' : 'rgba(34,197,94,0.2)',
                                    }} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Goals */}
                    <div className="content-card animate-slideUp delay-4">
                        <div className="content-card-header">
                            <div className="content-card-title">Goal Progress</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            {goals.map((g, i) => (
                                <div key={i} style={{
                                    padding: 16, background: 'rgba(10,30,18,0.5)',
                                    borderRadius: 14, border: '1px solid rgba(34,197,94,0.06)',
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ fontSize: 18 }}>{g.icon}</span>
                                            <span style={{ fontSize: 13, fontWeight: 600 }}>{g.label}</span>
                                        </div>
                                        <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 900, color: g.color }}>{g.pct}%</span>
                                    </div>
                                    <div className="bar-bg" style={{ height: 6 }}>
                                        <div className="bar-fill" style={{ width: `${g.pct}%`, background: g.color }} />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: '#6b9e7a' }}>
                                        <span>Current: {g.current}</span>
                                        <span>Target: {g.target}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Streak Tracker */}
                    <div className="content-card animate-slideUp delay-5">
                        <div className="content-card-header">
                            <div className="content-card-title">Streak Tracker</div>
                        </div>
                        <div style={{ textAlign: 'center', marginBottom: 20 }}>
                            <div style={{ fontSize: 48, marginBottom: 4 }}>🔥</div>
                            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 36, fontWeight: 900, color: '#ef4444' }}>7</div>
                            <div style={{ fontSize: 13, color: '#6b9e7a' }}>Day Streak</div>
                        </div>
                        <div style={{ fontSize: 12, color: '#6b9e7a', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>This Week</div>
                        <div className="streak-grid">
                            {streakDays.map((d, i) => (
                                <div key={i} className={`streak-day ${d.done ? 'completed' : ''} ${d.today ? 'today' : ''} ${!d.done && !d.today ? 'future' : ''}`}>
                                    {d.done ? '✓' : d.day}
                                </div>
                            ))}
                        </div>
                        <div style={{ marginTop: 20, padding: 14, background: 'rgba(163,230,53,0.06)', border: '1px solid rgba(163,230,53,0.15)', borderRadius: 12, textAlign: 'center' }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#a3e635' }}>🎉 Personal Best!</div>
                            <div style={{ fontSize: 12, color: '#6b9e7a', marginTop: 4 }}>Keep going to unlock the 14-day badge</div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
