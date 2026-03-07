import { useState } from 'react';
import Navbar from '../components/Navbar';
import { RingChart, Sparkline, PieChart } from '../components/Charts';
import '../styles/global.css';

const dailyCalories = [1850, 1920, 1780, 1950, 1850, 1700, 1580];
const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];

const macroData = [
    { name: 'Protein', val: 142, max: 180, unit: 'g', color: '#22c55e', pct: 79 },
    { name: 'Carbs', val: 210, max: 280, unit: 'g', color: '#a3e635', pct: 75 },
    { name: 'Fats', val: 58, max: 80, unit: 'g', color: '#f59e0b', pct: 73 },
    { name: 'Fiber', val: 28, max: 35, unit: 'g', color: '#38bdf8', pct: 80 },
];

const pieSegments = [
    { label: 'Protein', value: 142 * 4, color: '#22c55e' },
    { label: 'Carbs', value: 210 * 4, color: '#a3e635' },
    { label: 'Fats', value: 58 * 9, color: '#f59e0b' },
];

const foodLog = [
    { emoji: '🥣', name: 'Oatmeal with Berries', cal: 320, time: '8:30 AM' },
    { emoji: '🥚', name: 'Boiled Eggs (2)', cal: 155, time: '8:35 AM' },
    { emoji: '🍵', name: 'Green Tea', cal: 5, time: '9:00 AM' },
    { emoji: '🍌', name: 'Banana + Almond Butter', cal: 280, time: '11:00 AM' },
    { emoji: '🍗', name: 'Grilled Chicken Breast', cal: 365, time: '1:00 PM' },
    { emoji: '🥗', name: 'Mixed Green Salad', cal: 120, time: '1:05 PM' },
    { emoji: '🥤', name: 'Whey Protein Shake', cal: 150, time: '4:30 PM' },
    { emoji: '🥜', name: 'Mixed Nuts', cal: 180, time: '5:00 PM' },
];

export default function CalorieTracker() {
    const [showAddFood, setShowAddFood] = useState(false);
    const [newFood, setNewFood] = useState({ name: '', cal: '' });

    const totalCal = foodLog.reduce((s, f) => s + f.cal, 0);
    const targetCal = 2200;

    return (
        <div className="app-layout">
            <Navbar />
            <main className="main-content">
                <div className="grid-bg" />

                <div className="page-header animate-slideUp">
                    <div className="page-header-left">
                        <div className="page-greeting">Track your</div>
                        <div className="page-title">Calorie Tracker 🔥</div>
                    </div>
                    <div className="page-header-right">
                        <button className="btn-primary" style={{ padding: '10px 20px', fontSize: 13 }} onClick={() => setShowAddFood(!showAddFood)}>
                            + Log Food
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="stats-row">
                    {[
                        { icon: '🔥', val: `${totalCal}`, label: 'Consumed', color: '#a3e635' },
                        { icon: '🎯', val: `${targetCal}`, label: 'Target', color: '#22c55e' },
                        { icon: '📊', val: `${targetCal - totalCal}`, label: 'Remaining', color: '#38bdf8' },
                        { icon: '🏃', val: '320', label: 'Burned', color: '#f59e0b' },
                    ].map((s, i) => (
                        <div key={i} className={`stat-card animate-slideUp delay-${i + 1}`}>
                            <span className="stat-card-icon">{s.icon}</span>
                            <div className="stat-card-value" style={{ color: s.color }}>{s.val}</div>
                            <div className="stat-card-label">{s.label}</div>
                        </div>
                    ))}
                </div>

                <div className="content-grid two-col" style={{ marginBottom: 20 }}>
                    {/* Calorie Ring + Pie */}
                    <div className="content-card animate-slideUp delay-2">
                        <div className="content-card-header">
                            <div className="content-card-title">Daily Calorie Progress</div>
                        </div>
                        <div style={{ display: 'flex', gap: 36, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                                <RingChart value={totalCal} max={targetCal} size={170} label="kcal consumed" />
                                <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                                    {Math.round((totalCal / targetCal) * 100)}% of daily target
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                                <div style={{ fontSize: 12, color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase' }}>Macro Split</div>
                                <PieChart segments={pieSegments} size={160} />
                                <div style={{ display: 'flex', gap: 16 }}>
                                    {pieSegments.map((s, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
                                            <span style={{ color: 'var(--muted)' }}>{s.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Macronutrient Bars */}
                    <div className="content-card animate-slideUp delay-3">
                        <div className="content-card-header">
                            <div className="content-card-title">Macronutrients</div>
                        </div>
                        <div className="macro-bars">
                            {macroData.map((m, i) => (
                                <div key={i} className="macro-row">
                                    <div className="macro-label">
                                        <span className="macro-name">{m.name}</span>
                                        <span className="macro-val">{m.val}{m.unit} / {m.max}{m.unit}</span>
                                    </div>
                                    <div className="bar-bg">
                                        <div className="bar-fill" style={{
                                            width: `${m.pct}%`,
                                            background: `linear-gradient(90deg, ${m.color}88, ${m.color})`,
                                        }} />
                                    </div>
                                    <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'right' }}>{m.pct}%</div>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: 24, padding: 16, background: 'rgba(10,30,18,0.5)', borderRadius: 14, border: '1px solid rgba(34,197,94,0.06)' }}>
                            <div style={{ fontSize: 12, color: 'var(--muted)', letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase' }}>Weekly Calorie Trend</div>
                            <Sparkline data={dailyCalories} color="#22c55e" height={60} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'var(--muted)' }}>
                                {dayLabels.map(d => <span key={d}>{d}</span>)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Food Log */}
                <div className="content-card animate-slideUp delay-4">
                    <div className="content-card-header">
                        <div className="content-card-title">Today's Food Log</div>
                        <div style={{ fontSize: 13, color: 'var(--lime)', fontFamily: "'DM Mono', monospace" }}>
                            {foodLog.length} items · {totalCal} kcal
                        </div>
                    </div>

                    {/* Add Food Form */}
                    {showAddFood && (
                        <div style={{
                            display: 'flex', gap: 12, marginBottom: 16, padding: 16,
                            background: 'rgba(10,30,18,0.5)', borderRadius: 12, border: '1px solid rgba(34,197,94,0.1)',
                        }}>
                            <div className="input-group" style={{ flex: 2, marginBottom: 0 }}>
                                <input type="text" placeholder=" " value={newFood.name} onChange={(e) => setNewFood({ ...newFood, name: e.target.value })} />
                                <label>Food name</label>
                            </div>
                            <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                                <input type="number" placeholder=" " value={newFood.cal} onChange={(e) => setNewFood({ ...newFood, cal: e.target.value })} />
                                <label>Calories</label>
                            </div>
                            <button className="btn-primary" style={{ padding: '10px 16px', fontSize: 13, alignSelf: 'flex-start' }}>Add</button>
                        </div>
                    )}

                    <div className="food-log">
                        {foodLog.map((item, i) => (
                            <div key={i} className="food-log-item">
                                <div className="food-log-emoji">{item.emoji}</div>
                                <div className="food-log-info">
                                    <div className="food-log-name">{item.name}</div>
                                    <div className="food-log-time">{item.time}</div>
                                </div>
                                <div className="food-log-cals">{item.cal} kcal</div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
