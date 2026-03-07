import { useState } from 'react';
import Navbar from '../components/Navbar';
import '../styles/global.css';

const badges = [
    { icon: '🔥', name: '7 Day Streak', desc: 'Logged meals for 7 consecutive days', pct: 100, color: '#ef4444', unlocked: true },
    { icon: '🥗', name: '30 Day Diet Master', desc: 'Completed 30 days of your diet plan', pct: 80, color: '#22c55e', unlocked: false },
    { icon: '🎯', name: 'Goal Achiever', desc: 'Reached your first weight milestone', pct: 100, color: '#a3e635', unlocked: true },
    { icon: '💪', name: 'Protein Champion', desc: 'Hit protein goals for 5 days straight', pct: 100, color: '#a78bfa', unlocked: true },
    { icon: '🧘', name: 'Mindful Eater', desc: 'Logged every meal for a full week', pct: 100, color: '#38bdf8', unlocked: true },
    { icon: '🏃', name: 'Active Lifestyle', desc: 'Reached 10K steps for 7 days', pct: 60, color: '#f59e0b', unlocked: false },
    { icon: '💧', name: 'Hydration Hero', desc: 'Drank 3L water daily for a week', pct: 85, color: '#38bdf8', unlocked: false },
    { icon: '🌙', name: 'Sleep Master', desc: '8 hours of sleep for 14 days', pct: 45, color: '#a78bfa', unlocked: false },
    { icon: '📊', name: 'Data Driven', desc: 'Tracked every macro for 30 days', pct: 70, color: '#22c55e', unlocked: false },
];

const cheatMealRewards = [
    { emoji: '🍕', name: 'Pizza Night', description: 'Earn by maintaining 14-day streak', requirement: '14 Day Streak', unlocked: true, daysLeft: 0 },
    { emoji: '🍰', name: 'Dessert Day', description: 'Earn by hitting all macros for 7 days', requirement: '7 Day Macro Master', unlocked: true, daysLeft: 0 },
    { emoji: '🍔', name: 'Burger Treat', description: 'Earn by losing 3 kg total', requirement: '3 kg Lost', unlocked: false, daysLeft: 3 },
    { emoji: '🍦', name: 'Ice Cream Reward', description: 'Earn by reaching 90% adherence', requirement: '90% Weekly Adherence', unlocked: false, daysLeft: 5 },
];

const streakCalendar = Array.from({ length: 28 }, (_, i) => ({
    day: i + 1,
    completed: i < 21,
    today: i === 21,
}));

export default function Rewards() {
    const [selectedBadge, setSelectedBadge] = useState(null);

    const unlockedCount = badges.filter(b => b.unlocked).length;

    return (
        <div className="app-layout">
            <Navbar />
            <main className="main-content">
                <div className="grid-bg" />

                <div className="page-header animate-slideUp">
                    <div className="page-header-left">
                        <div className="page-greeting">Your achievements</div>
                        <div className="page-title">Rewards 🏆</div>
                    </div>
                </div>

                {/* Stats */}
                <div className="stats-row">
                    {[
                        { icon: '🏅', val: `${unlockedCount}/${badges.length}`, label: 'Badges Earned', color: '#a3e635' },
                        { icon: '🔥', val: '22', label: 'Day Streak', color: '#ef4444' },
                        { icon: '🍕', val: '2', label: 'Cheat Meals Earned', color: '#f59e0b' },
                        { icon: '⭐', val: '1,250', label: 'Total Points', color: '#38bdf8' },
                    ].map((s, i) => (
                        <div key={i} className={`stat-card animate-slideUp delay-${i + 1}`}>
                            <span className="stat-card-icon">{s.icon}</span>
                            <div className="stat-card-value" style={{ color: s.color }}>{s.val}</div>
                            <div className="stat-card-label">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Achievement Badges */}
                <div className="content-card animate-slideUp delay-2" style={{ marginBottom: 20 }}>
                    <div className="content-card-header">
                        <div className="content-card-title">Achievement Badges</div>
                        <div style={{ fontSize: 13, color: 'var(--lime)', fontFamily: "'DM Mono', monospace" }}>
                            {unlockedCount} of {badges.length} unlocked
                        </div>
                    </div>
                    <div className="badges-grid">
                        {badges.map((b, i) => (
                            <div key={i} className={`badge-card ${!b.unlocked ? 'locked' : ''}`}
                                onClick={() => setSelectedBadge(b)}
                                style={{ cursor: 'pointer' }}>
                                <span className="badge-icon" style={{ animationPlayState: b.unlocked ? 'running' : 'paused' }}>{b.icon}</span>
                                <h3>{b.name}</h3>
                                <p>{b.desc}</p>
                                <div className="badge-progress-bar">
                                    <div className="badge-fill" style={{ width: `${b.pct}%`, background: `linear-gradient(90deg, ${b.color}66, ${b.color})` }} />
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>
                                    {b.pct === 100 ? '✅ Unlocked!' : `${b.pct}% complete`}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="content-grid two-col" style={{ marginBottom: 20 }}>
                    {/* Diet Streak Tracker */}
                    <div className="content-card animate-slideUp delay-3">
                        <div className="content-card-header">
                            <div className="content-card-title">Diet Streak Calendar</div>
                            <div>
                                <span style={{ fontSize: 28, marginRight: 8 }}>🔥</span>
                                <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 900, color: '#ef4444' }}>22</span>
                                <span style={{ fontSize: 13, color: 'var(--muted)', marginLeft: 6 }}>days</span>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginTop: 8 }}>
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                                <div key={i} style={{ textAlign: 'center', fontSize: 11, color: 'var(--muted)', padding: '4px 0', fontWeight: 600 }}>{d}</div>
                            ))}
                            {streakCalendar.map((d, i) => (
                                <div key={i} className={`streak-day ${d.completed ? 'completed' : ''} ${d.today ? 'today' : ''} ${!d.completed && !d.today ? 'future' : ''}`}>
                                    {d.completed ? '✓' : d.day}
                                </div>
                            ))}
                        </div>

                        <div style={{
                            marginTop: 20, display: 'flex', gap: 16, justifyContent: 'center', fontSize: 12, color: 'var(--muted)',
                        }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span style={{ width: 10, height: 10, borderRadius: 3, background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.3)' }} /> Completed
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span style={{ width: 10, height: 10, borderRadius: 3, background: 'rgba(163,230,53,0.2)', border: '1px solid rgba(163,230,53,0.4)' }} /> Today
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span style={{ width: 10, height: 10, borderRadius: 3, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }} /> Upcoming
                            </span>
                        </div>
                    </div>

                    {/* Cheat Meal Rewards */}
                    <div className="content-card animate-slideUp delay-4">
                        <div className="content-card-header">
                            <div className="content-card-title">Cheat Meal Rewards</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {cheatMealRewards.map((reward, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: 16, padding: 16,
                                    background: reward.unlocked ? 'rgba(163,230,53,0.06)' : 'rgba(10,30,18,0.5)',
                                    border: `1px solid ${reward.unlocked ? 'rgba(163,230,53,0.2)' : 'rgba(34,197,94,0.06)'}`,
                                    borderRadius: 14, transition: 'all 0.3s', cursor: 'default',
                                    opacity: reward.unlocked ? 1 : 0.7,
                                }}>
                                    <div style={{ fontSize: 36, filter: reward.unlocked ? 'none' : 'grayscale(0.5)' }}>{reward.emoji}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>
                                            {reward.name}
                                            {reward.unlocked && <span style={{ fontSize: 11, color: '#a3e635', marginLeft: 8, fontWeight: 700 }}>✅ UNLOCKED</span>}
                                        </div>
                                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{reward.description}</div>
                                        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                                            Requirement: <span style={{ color: 'var(--green3)' }}>{reward.requirement}</span>
                                        </div>
                                    </div>
                                    {!reward.unlocked && (
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 900, color: '#f59e0b' }}>{reward.daysLeft}</div>
                                            <div style={{ fontSize: 10, color: 'var(--muted)' }}>days left</div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div style={{
                            marginTop: 20, padding: 16, background: 'rgba(163,230,53,0.04)',
                            border: '1px solid rgba(163,230,53,0.1)', borderRadius: 12, textAlign: 'center',
                        }}>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#a3e635', marginBottom: 4 }}>
                                🎉 Next cheat meal in 3 days!
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                                Maintain your streak to unlock Burger Treat
                            </div>
                        </div>
                    </div>
                </div>

                {/* Badge Detail Modal */}
                {selectedBadge && (
                    <div style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
                        backdropFilter: 'blur(10px)', zIndex: 100,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }} onClick={() => setSelectedBadge(null)}>
                        <div style={{
                            background: 'rgba(8,22,14,0.95)', border: '1px solid var(--border)',
                            borderRadius: 24, padding: 40, width: 'min(400px, 90vw)', textAlign: 'center',
                            animation: 'authSlideUp 0.4s ease',
                        }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ fontSize: 64, marginBottom: 16 }}>{selectedBadge.icon}</div>
                            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 900, marginBottom: 8 }}>{selectedBadge.name}</h3>
                            <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 20 }}>{selectedBadge.desc}</p>
                            <div className="badge-progress-bar" style={{ height: 6 }}>
                                <div className="badge-fill" style={{ width: `${selectedBadge.pct}%`, background: `linear-gradient(90deg, ${selectedBadge.color}66, ${selectedBadge.color})` }} />
                            </div>
                            <div style={{ fontSize: 13, marginTop: 12, color: selectedBadge.unlocked ? '#a3e635' : 'var(--muted)' }}>
                                {selectedBadge.unlocked ? '🎉 Badge Unlocked!' : `${selectedBadge.pct}% — Keep going!`}
                            </div>
                            <button className="btn-ghost" style={{ marginTop: 20 }} onClick={() => setSelectedBadge(null)}>Close</button>
                        </div>
                    </div>
                )}
            </main>

            <style>{`
        @keyframes authSlideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.95); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
        </div>
    );
}
