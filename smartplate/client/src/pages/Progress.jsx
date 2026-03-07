import Navbar from '../components/Navbar';
import { Sparkline, BarChart } from '../components/Charts';
import '../styles/global.css';

const weightData = [78, 77.2, 76.8, 76.5, 75.9, 75.4, 74.8, 74.5, 74.2, 73.8];
const weekLabels = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'Now'];
const adherenceData = [85, 78, 92, 88, 76, 95, 82];
const adherenceLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const goals = [
    { icon: '⚖️', label: 'Target Weight', current: '74.2 kg', target: '70 kg', pct: 72, color: '#22c55e' },
    { icon: '💪', label: 'Muscle Mass', current: '32.1 kg', target: '35 kg', pct: 55, color: '#38bdf8' },
    { icon: '📉', label: 'Body Fat %', current: '18.2%', target: '14%', pct: 68, color: '#f59e0b' },
    { icon: '🏃', label: 'Daily Steps', current: '8,200', target: '10,000', pct: 82, color: '#a3e635' },
];

const habits = [
    { name: '💧 Drink 3L Water', checks: [true, true, true, true, true, false, false] },
    { name: '🥗 Eat 5 Servings Veggies', checks: [true, true, false, true, true, true, false] },
    { name: '🏃 30 min Exercise', checks: [true, false, true, true, false, true, false] },
    { name: '😴 8 Hours Sleep', checks: [true, true, true, false, true, true, false] },
    { name: '🧘 Mindful Eating', checks: [true, true, true, true, false, true, false] },
    { name: '📝 Log All Meals', checks: [true, true, true, true, true, true, false] },
];

const milestones = [
    { label: 'First 1 kg lost', completed: true, date: 'Week 2' },
    { label: 'Hit protein goals 5x', completed: true, date: 'Week 3' },
    { label: '14-day streak', completed: true, date: 'Week 4' },
    { label: 'Reach 73 kg', completed: false, date: 'In progress' },
    { label: '30-day diet master', completed: false, date: 'Upcoming' },
];

export default function Progress() {
    return (
        <div className="app-layout">
            <Navbar />
            <main className="main-content">
                <div className="grid-bg" />

                <div className="page-header animate-slideUp">
                    <div className="page-header-left">
                        <div className="page-greeting">Your journey</div>
                        <div className="page-title">Progress 📈</div>
                    </div>
                </div>

                {/* Overview Stats */}
                <div className="stats-row">
                    {[
                        { icon: '⚖️', val: '74.2 kg', label: 'Current Weight', color: '#22c55e', trend: '↓ 3.8 kg', trendDir: 'up' },
                        { icon: '📊', val: '84%', label: 'Weekly Adherence', color: '#a3e635', trend: '↑ 6%', trendDir: 'up' },
                        { icon: '🎯', val: '72%', label: 'Goal Progress', color: '#38bdf8', trend: '↑ 12%', trendDir: 'up' },
                        { icon: '🗓️', val: '28', label: 'Days Active', color: '#f59e0b', trend: 'Consistent!', trendDir: 'up' },
                    ].map((s, i) => (
                        <div key={i} className={`stat-card animate-slideUp delay-${i + 1}`}>
                            <span className="stat-card-icon">{s.icon}</span>
                            <div className="stat-card-value" style={{ color: s.color }}>{s.val}</div>
                            <div className="stat-card-label">{s.label}</div>
                            <div className={`stat-card-trend ${s.trendDir}`}>{s.trend}</div>
                        </div>
                    ))}
                </div>

                <div className="content-grid two-col" style={{ marginBottom: 20 }}>
                    {/* Weight Trend */}
                    <div className="content-card animate-slideUp delay-2">
                        <div className="content-card-header">
                            <div className="content-card-title">Weight Trend</div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 900, color: '#a3e635' }}>74.2 <span style={{ fontSize: 16, color: 'var(--muted)' }}>kg</span></div>
                                <div style={{ fontSize: 13, color: '#22c55e', fontWeight: 600 }}>↓ 3.8 kg total</div>
                            </div>
                        </div>
                        <Sparkline data={weightData} color="#a3e635" height={100} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'var(--muted)' }}>
                            {weekLabels.map(l => <span key={l}>{l}</span>)}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 20 }}>
                            {[
                                { label: 'Start', val: '78 kg', color: 'var(--muted)' },
                                { label: 'Current', val: '74.2 kg', color: '#a3e635' },
                                { label: 'Target', val: '70 kg', color: '#22c55e' },
                            ].map((s, i) => (
                                <div key={i} style={{
                                    textAlign: 'center', padding: '12px', background: 'rgba(10,30,18,0.5)',
                                    borderRadius: 10, border: '1px solid rgba(34,197,94,0.06)',
                                }}>
                                    <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.val}</div>
                                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Weekly Adherence */}
                    <div className="content-card animate-slideUp delay-3">
                        <div className="content-card-header">
                            <div className="content-card-title">Weekly Adherence</div>
                            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 900, color: '#22c55e' }}>84%</div>
                        </div>
                        <BarChart data={adherenceData} labels={adherenceLabels} activeIndex={-1} height={120} />

                        <div style={{ marginTop: 20, fontSize: 12, color: 'var(--muted)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(34,197,94,0.06)' }}>
                                <span>Best day</span>
                                <span style={{ color: '#a3e635', fontWeight: 600 }}>Saturday — 95%</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(34,197,94,0.06)' }}>
                                <span>Needs improvement</span>
                                <span style={{ color: '#f59e0b', fontWeight: 600 }}>Friday — 76%</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                                <span>Weekly average</span>
                                <span style={{ color: '#22c55e', fontWeight: 600 }}>84%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="content-grid two-col" style={{ marginBottom: 20 }}>
                    {/* Goal Progress */}
                    <div className="content-card animate-slideUp delay-3">
                        <div className="content-card-header">
                            <div className="content-card-title">Goal Progress</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {goals.map((g, i) => (
                                <div key={i} style={{
                                    padding: 16, background: 'rgba(10,30,18,0.5)', borderRadius: 14,
                                    border: '1px solid rgba(34,197,94,0.06)',
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
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'var(--muted)' }}>
                                        <span>Current: {g.current}</span>
                                        <span>Target: {g.target}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Milestones */}
                        <div style={{ marginTop: 20 }}>
                            <div style={{ fontSize: 12, color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>Milestones</div>
                            {milestones.map((m, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
                                    borderBottom: i < milestones.length - 1 ? '1px solid rgba(34,197,94,0.06)' : 'none',
                                }}>
                                    <div style={{
                                        width: 24, height: 24, borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 12,
                                        background: m.completed ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.03)',
                                        color: m.completed ? '#22c55e' : 'var(--muted)',
                                        border: `1px solid ${m.completed ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.05)'}`,
                                    }}>
                                        {m.completed ? '✓' : '○'}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 13, fontWeight: 500, color: m.completed ? 'var(--text)' : 'var(--muted)' }}>{m.label}</div>
                                    </div>
                                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{m.date}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Habit Tracker */}
                    <div className="content-card animate-slideUp delay-4">
                        <div className="content-card-header">
                            <div className="content-card-title">Habit Tracker</div>
                            <div style={{ fontSize: 11, color: 'var(--muted)', display: 'flex', gap: 12 }}>
                                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                                    <span key={i} style={{ width: 24, textAlign: 'center' }}>{d}</span>
                                ))}
                            </div>
                        </div>
                        <div className="habit-grid">
                            {habits.map((h, i) => (
                                <div key={i} className="habit-row">
                                    <div className="habit-name">{h.name}</div>
                                    <div className="habit-checks">
                                        {h.checks.map((done, j) => (
                                            <div key={j} className={`habit-check ${done ? 'done' : ''}`}>
                                                {done ? '✓' : ''}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: 20, padding: 16, background: 'rgba(10,30,18,0.5)', borderRadius: 12, border: '1px solid rgba(34,197,94,0.06)' }}>
                            <div style={{ fontSize: 12, color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>Completion Rate</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                {[
                                    { label: 'This Week', val: '76%', color: '#22c55e' },
                                    { label: 'Last Week', val: '72%', color: 'var(--muted)' },
                                    { label: 'Best Streak', val: '12 days', color: '#a3e635' },
                                    { label: 'Top Habit', val: 'Meal Logging', color: '#38bdf8' },
                                ].map((s, i) => (
                                    <div key={i} style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.val}</div>
                                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{s.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
