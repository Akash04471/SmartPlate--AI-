import { useState } from 'react';
import Navbar from '../components/Navbar';
import '../styles/global.css';

const initialProfile = {
    name: 'Arjun Mehta',
    email: 'arjun@example.com',
    age: 28,
    height: 175,
    weight: 74.2,
    gender: 'Male',
    activityLevel: 'Moderately Active',
    goal: 'Fat Loss',
    dietPreference: 'Non-Vegetarian',
    targetWeight: 70,
    dailyCalories: 2200,
};

const goalOptions = ['Fat Loss', 'Muscle Gain', 'Body Recomposition', 'Maintain Weight', 'Health Improvement'];
const dietOptions = ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Medical Diet'];
const activityOptions = ['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active', 'Extremely Active'];
const genderOptions = ['Male', 'Female', 'Other'];

export default function Profile() {
    const [profile, setProfile] = useState(initialProfile);
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(initialProfile);
    const [saved, setSaved] = useState(false);

    const handleEdit = () => {
        setDraft({ ...profile });
        setEditing(true);
        setSaved(false);
    };

    const handleSave = () => {
        setProfile({ ...draft });
        setEditing(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleCancel = () => {
        setDraft({ ...profile });
        setEditing(false);
    };

    const updateDraft = (field, value) => {
        setDraft((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <div className="app-layout">
            <Navbar />
            <main className="main-content">
                <div className="grid-bg" />

                <div className="page-header animate-slideUp">
                    <div className="page-header-left">
                        <div className="page-greeting">Your account</div>
                        <div className="page-title">Profile 👤</div>
                    </div>
                    <div className="page-header-right">
                        {!editing ? (
                            <button className="btn-primary" style={{ padding: '10px 24px', fontSize: 13 }} onClick={handleEdit}>
                                ✏️ Edit Profile
                            </button>
                        ) : (
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button className="btn-ghost" style={{ padding: '10px 20px', fontSize: 13 }} onClick={handleCancel}>Cancel</button>
                                <button className="btn-primary" style={{ padding: '10px 20px', fontSize: 13 }} onClick={handleSave}>Save Changes</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Saved notification */}
                {saved && (
                    <div style={{
                        padding: '12px 20px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
                        borderRadius: 12, marginBottom: 20, fontSize: 14, color: '#22c55e', fontWeight: 500,
                        display: 'flex', alignItems: 'center', gap: 8, animation: 'slideUp 0.3s ease',
                    }}>
                        ✅ Profile updated successfully!
                    </div>
                )}

                {/* Profile Header */}
                <div className="profile-header animate-slideUp">
                    <div className="profile-avatar-large">👤</div>
                    <div className="profile-info">
                        <h2>{profile.name}</h2>
                        <p>{profile.email}</p>
                        <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                            <span style={{
                                fontSize: 11, padding: '4px 12px', borderRadius: 100,
                                background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e',
                                fontWeight: 600, letterSpacing: 0.5,
                            }}>{profile.goal}</span>
                            <span style={{
                                fontSize: 11, padding: '4px 12px', borderRadius: 100,
                                background: 'rgba(163,230,53,0.08)', border: '1px solid rgba(163,230,53,0.15)', color: '#a3e635',
                                fontWeight: 600, letterSpacing: 0.5,
                            }}>{profile.dietPreference}</span>
                        </div>
                    </div>
                    <div className="profile-stats">
                        {[
                            { val: `${profile.weight} kg`, label: 'Weight' },
                            { val: `${profile.height} cm`, label: 'Height' },
                            { val: profile.age, label: 'Age' },
                            { val: `${profile.dailyCalories}`, label: 'Daily Cal' },
                        ].map((s, i) => (
                            <div key={i} className="profile-stat">
                                <div className="profile-stat-val">{s.val}</div>
                                <div className="profile-stat-label">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="content-grid two-col">
                    {/* Personal Info */}
                    <div className="content-card animate-slideUp delay-2">
                        <div className="content-card-header">
                            <div className="content-card-title">Personal Information</div>
                        </div>
                        {editing ? (
                            <div className="form-grid two-col">
                                <div className="input-group">
                                    <input type="text" placeholder=" " value={draft.name} onChange={(e) => updateDraft('name', e.target.value)} />
                                    <label>Full Name</label>
                                </div>
                                <div className="input-group">
                                    <input type="email" placeholder=" " value={draft.email} onChange={(e) => updateDraft('email', e.target.value)} />
                                    <label>Email</label>
                                </div>
                                <div className="input-group">
                                    <input type="number" placeholder=" " value={draft.age} onChange={(e) => updateDraft('age', e.target.value)} />
                                    <label>Age</label>
                                </div>
                                <div className="input-group">
                                    <select value={draft.gender} onChange={(e) => updateDraft('gender', e.target.value)}>
                                        {genderOptions.map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                    <label>Gender</label>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {[
                                    { label: 'Full Name', val: profile.name },
                                    { label: 'Email', val: profile.email },
                                    { label: 'Age', val: `${profile.age} years` },
                                    { label: 'Gender', val: profile.gender },
                                ].map((item, i) => (
                                    <div key={i} style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '12px 16px', background: 'rgba(10,30,18,0.4)', borderRadius: 10,
                                        border: '1px solid rgba(34,197,94,0.06)',
                                    }}>
                                        <span style={{ fontSize: 13, color: 'var(--muted)' }}>{item.label}</span>
                                        <span style={{ fontSize: 14, fontWeight: 500 }}>{item.val}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Health Info */}
                    <div className="content-card animate-slideUp delay-3">
                        <div className="content-card-header">
                            <div className="content-card-title">Health Information</div>
                        </div>
                        {editing ? (
                            <div className="form-grid two-col">
                                <div className="input-group">
                                    <input type="number" placeholder=" " value={draft.height} onChange={(e) => updateDraft('height', e.target.value)} />
                                    <label>Height (cm)</label>
                                </div>
                                <div className="input-group">
                                    <input type="number" placeholder=" " value={draft.weight} onChange={(e) => updateDraft('weight', e.target.value)} />
                                    <label>Weight (kg)</label>
                                </div>
                                <div className="input-group">
                                    <input type="number" placeholder=" " value={draft.targetWeight} onChange={(e) => updateDraft('targetWeight', e.target.value)} />
                                    <label>Target Weight (kg)</label>
                                </div>
                                <div className="input-group">
                                    <input type="number" placeholder=" " value={draft.dailyCalories} onChange={(e) => updateDraft('dailyCalories', e.target.value)} />
                                    <label>Daily Calories</label>
                                </div>
                                <div className="input-group">
                                    <select value={draft.activityLevel} onChange={(e) => updateDraft('activityLevel', e.target.value)}>
                                        {activityOptions.map(a => <option key={a} value={a}>{a}</option>)}
                                    </select>
                                    <label>Activity Level</label>
                                </div>
                                <div className="input-group">
                                    <select value={draft.goal} onChange={(e) => updateDraft('goal', e.target.value)}>
                                        {goalOptions.map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                    <label>Health Goal</label>
                                </div>
                                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                                    <select value={draft.dietPreference} onChange={(e) => updateDraft('dietPreference', e.target.value)}>
                                        {dietOptions.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                    <label>Diet Preference</label>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {[
                                    { label: 'Height', val: `${profile.height} cm` },
                                    { label: 'Weight', val: `${profile.weight} kg` },
                                    { label: 'Target Weight', val: `${profile.targetWeight} kg` },
                                    { label: 'Daily Calories', val: `${profile.dailyCalories} kcal` },
                                    { label: 'Activity Level', val: profile.activityLevel },
                                    { label: 'Health Goal', val: profile.goal },
                                    { label: 'Diet Preference', val: profile.dietPreference },
                                ].map((item, i) => (
                                    <div key={i} style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '12px 16px', background: 'rgba(10,30,18,0.4)', borderRadius: 10,
                                        border: '1px solid rgba(34,197,94,0.06)',
                                    }}>
                                        <span style={{ fontSize: 13, color: 'var(--muted)' }}>{item.label}</span>
                                        <span style={{ fontSize: 14, fontWeight: 500 }}>{item.val}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* BMI Card */}
                <div className="content-card animate-slideUp delay-4" style={{ marginTop: 20 }}>
                    <div className="content-card-header">
                        <div className="content-card-title">Body Metrics</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                        {(() => {
                            const bmi = (profile.weight / ((profile.height / 100) ** 2)).toFixed(1);
                            const bmr = Math.round(88.362 + (13.397 * profile.weight) + (4.799 * profile.height) - (5.677 * profile.age));
                            const tdee = Math.round(bmr * 1.55);
                            const idealMin = Math.round(18.5 * ((profile.height / 100) ** 2));
                            const idealMax = Math.round(24.9 * ((profile.height / 100) ** 2));

                            return [
                                { label: 'BMI', val: bmi, sub: bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : 'Overweight', color: bmi < 25 ? '#22c55e' : '#f59e0b' },
                                { label: 'BMR', val: `${bmr}`, sub: 'kcal/day', color: '#38bdf8' },
                                { label: 'TDEE', val: `${tdee}`, sub: 'kcal/day', color: '#a3e635' },
                                { label: 'Ideal Weight', val: `${idealMin}-${idealMax}`, sub: 'kg range', color: '#a78bfa' },
                            ].map((m, i) => (
                                <div key={i} style={{
                                    textAlign: 'center', padding: 20, background: 'rgba(10,30,18,0.5)',
                                    borderRadius: 14, border: '1px solid rgba(34,197,94,0.06)',
                                }}>
                                    <div style={{ fontSize: 12, color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>{m.label}</div>
                                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 900, color: m.color }}>{m.val}</div>
                                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{m.sub}</div>
                                </div>
                            ));
                        })()}
                    </div>
                </div>
            </main>

            <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
}
