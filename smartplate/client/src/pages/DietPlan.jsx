import { useState } from 'react';
import Navbar from '../components/Navbar';
import '../styles/global.css';

const mealPlan = {
    breakfast: [
        { emoji: '🥣', name: 'Oatmeal with Berries', cal: 320, protein: 12, carbs: 52, fats: 8, logged: false },
        { emoji: '🥚', name: 'Boiled Eggs (2)', cal: 155, protein: 13, carbs: 1, fats: 11, logged: false },
        { emoji: '🍵', name: 'Green Tea', cal: 5, protein: 0, carbs: 1, fats: 0, logged: false },
    ],
    lunch: [
        { emoji: '🍗', name: 'Grilled Chicken Breast', cal: 365, protein: 42, carbs: 12, fats: 16, logged: false },
        { emoji: '🥗', name: 'Mixed Green Salad', cal: 120, protein: 4, carbs: 14, fats: 6, logged: false },
        { emoji: '🍚', name: 'Brown Rice (1 cup)', cal: 215, protein: 5, carbs: 44, fats: 2, logged: false },
    ],
    dinner: [
        { emoji: '🐟', name: 'Baked Salmon Fillet', cal: 420, protein: 38, carbs: 4, fats: 28, logged: false },
        { emoji: '🥦', name: 'Steamed Broccoli', cal: 55, protein: 4, carbs: 11, fats: 0, logged: false },
        { emoji: '🥔', name: 'Sweet Potato', cal: 112, protein: 2, carbs: 26, fats: 0, logged: false },
    ],
    snacks: [
        { emoji: '🍌', name: 'Banana + Almond Butter', cal: 280, protein: 7, carbs: 34, fats: 16, logged: false },
        { emoji: '🥤', name: 'Whey Protein Shake', cal: 150, protein: 25, carbs: 8, fats: 3, logged: false },
        { emoji: '🥜', name: 'Mixed Nuts (30g)', cal: 180, protein: 5, carbs: 7, fats: 16, logged: false },
    ],
};

const sectionMeta = {
    breakfast: { icon: '🌅', label: 'Breakfast', time: '7:00 - 9:00 AM' },
    lunch: { icon: '☀️', label: 'Lunch', time: '12:00 - 2:00 PM' },
    dinner: { icon: '🌙', label: 'Dinner', time: '7:00 - 9:00 PM' },
    snacks: { icon: '🍪', label: 'Snacks', time: 'In between meals' },
};

export default function DietPlan() {
    const [meals, setMeals] = useState(mealPlan);
    const [replacingMeal, setReplacingMeal] = useState(null);

    const toggleLog = (section, index) => {
        setMeals((prev) => {
            const updated = { ...prev };
            updated[section] = [...prev[section]];
            updated[section][index] = { ...updated[section][index], logged: !updated[section][index].logged };
            return updated;
        });
    };

    const totalCal = Object.values(meals).flat().reduce((s, m) => s + m.cal, 0);
    const totalProtein = Object.values(meals).flat().reduce((s, m) => s + m.protein, 0);
    const totalCarbs = Object.values(meals).flat().reduce((s, m) => s + m.carbs, 0);
    const totalFats = Object.values(meals).flat().reduce((s, m) => s + m.fats, 0);
    const loggedCal = Object.values(meals).flat().filter(m => m.logged).reduce((s, m) => s + m.cal, 0);

    return (
        <div className="app-layout">
            <Navbar />
            <main className="main-content">
                <div className="grid-bg" />

                <div className="page-header animate-slideUp">
                    <div className="page-header-left">
                        <div className="page-greeting">Your personalized</div>
                        <div className="page-title">Diet Plan 🥗</div>
                    </div>
                    <div className="page-header-right">
                        <div className="page-date">{new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}</div>
                    </div>
                </div>

                {/* Daily Summary */}
                <div className="stats-row" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                    {[
                        { icon: '🔥', val: `${totalCal}`, label: 'Total Calories', color: '#a3e635' },
                        { icon: '✅', val: `${loggedCal}`, label: 'Logged', color: '#22c55e' },
                        { icon: '💪', val: `${totalProtein}g`, label: 'Protein', color: '#38bdf8' },
                        { icon: '⚡', val: `${totalCarbs}g`, label: 'Carbs', color: '#f59e0b' },
                        { icon: '🫒', val: `${totalFats}g`, label: 'Fats', color: '#a78bfa' },
                    ].map((s, i) => (
                        <div key={i} className={`stat-card animate-slideUp delay-${i + 1}`}>
                            <span className="stat-card-icon">{s.icon}</span>
                            <div className="stat-card-value" style={{ color: s.color, fontSize: 24 }}>{s.val}</div>
                            <div className="stat-card-label">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Meal Sections */}
                {Object.entries(sectionMeta).map(([key, meta]) => (
                    <div key={key} className="content-card animate-slideUp" style={{ marginBottom: 20 }}>
                        <div className="content-card-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{ fontSize: 22 }}>{meta.icon}</span>
                                <div>
                                    <div className="content-card-title" style={{ marginBottom: 0 }}>{meta.label}</div>
                                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{meta.time}</div>
                                </div>
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--lime)', fontFamily: "'DM Mono', monospace" }}>
                                {meals[key].reduce((s, m) => s + m.cal, 0)} kcal
                            </div>
                        </div>

                        {meals[key].map((meal, i) => (
                            <div key={i} className="meal-card">
                                <div className="meal-card-icon">{meal.emoji}</div>
                                <div className="meal-card-info">
                                    <div className="meal-card-name">{meal.name}</div>
                                    <div className="meal-card-macros">
                                        <span>🔥 {meal.cal} kcal</span>
                                        <span>💪 {meal.protein}g P</span>
                                        <span>⚡ {meal.carbs}g C</span>
                                        <span>🫒 {meal.fats}g F</span>
                                    </div>
                                </div>
                                <div className="meal-card-actions">
                                    <button className="meal-action-btn" onClick={() => setReplacingMeal(`${key}-${i}`)}>
                                        🔄 Replace
                                    </button>
                                    <button
                                        className={`meal-action-btn ${meal.logged ? 'logged' : ''}`}
                                        onClick={() => toggleLog(key, i)}
                                    >
                                        {meal.logged ? '✅ Logged' : '📝 Log'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}

                {/* Replacement Modal (simple) */}
                {replacingMeal && (
                    <div style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
                        backdropFilter: 'blur(10px)', zIndex: 100,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }} onClick={() => setReplacingMeal(null)}>
                        <div style={{
                            background: 'rgba(8,22,14,0.95)', border: '1px solid var(--border)',
                            borderRadius: 20, padding: 32, width: 'min(420px, 90vw)',
                        }} onClick={(e) => e.stopPropagation()}>
                            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, marginBottom: 16 }}>Replace Meal</h3>
                            <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 20 }}>Choose an alternative:</p>
                            {[
                                { emoji: '🥙', name: 'Veggie Wrap', cal: 310 },
                                { emoji: '🥘', name: 'Lentil Curry', cal: 380 },
                                { emoji: '🥪', name: 'Turkey Sandwich', cal: 350 },
                            ].map((alt, i) => (
                                <div key={i} className="meal-card" style={{ cursor: 'pointer' }} onClick={() => setReplacingMeal(null)}>
                                    <div className="meal-card-icon">{alt.emoji}</div>
                                    <div className="meal-card-info">
                                        <div className="meal-card-name">{alt.name}</div>
                                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{alt.cal} kcal</div>
                                    </div>
                                </div>
                            ))}
                            <button className="btn-ghost" style={{ width: '100%', marginTop: 12 }} onClick={() => setReplacingMeal(null)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
