import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/global.css';

const goalOptions = [
    'Fat Loss', 'Muscle Gain', 'Body Recomposition', 'Maintain Weight', 'Health Improvement',
];

const dietOptions = [
    'Vegetarian', 'Non-Vegetarian', 'Vegan', 'Medical Diet',
];

const genderOptions = ['Male', 'Female', 'Other'];

const activityOptions = [
    'Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active', 'Extremely Active',
];

export default function Signup() {
    const [form, setForm] = useState({
        name: '', age: '', height: '', weight: '',
        gender: '', activityLevel: '', goal: '', dietPreference: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Account, 2: Health Profile

    const update = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const validateStep1 = () => {
        const errs = {};
        if (!form.name.trim()) errs.name = 'Name is required';
        if (!form.age || form.age < 10 || form.age > 120) errs.age = 'Enter a valid age (10-120)';
        return errs;
    };

    const validateStep2 = () => {
        const errs = {};
        if (!form.height || form.height < 50 || form.height > 300) errs.height = 'Enter valid height (cm)';
        if (!form.weight || form.weight < 20 || form.weight > 500) errs.weight = 'Enter valid weight (kg)';
        if (!form.gender) errs.gender = 'Select gender';
        if (!form.activityLevel) errs.activityLevel = 'Select activity level';
        if (!form.goal) errs.goal = 'Select a goal';
        if (!form.dietPreference) errs.dietPreference = 'Select diet preference';
        return errs;
    };

    const handleNext = () => {
        const errs = validateStep1();
        setErrors(errs);
        if (Object.keys(errs).length === 0) setStep(2);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errs = validateStep2();
        setErrors(errs);
        if (Object.keys(errs).length === 0) {
            setLoading(true);
            setTimeout(() => setLoading(false), 2000);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-bg" />
            <div className="auth-grid-bg" />

            {/* Decorative emojis */}
            {['🥗', '💪', '🎯', '🌿', '🧬'].map((emoji, i) => (
                <span key={i} style={{
                    position: 'absolute', fontSize: 28 + i * 4, opacity: 0.12,
                    top: `${10 + i * 18}%`,
                    [i % 2 === 0 ? 'left' : 'right']: `${4 + i * 2}%`,
                    animation: `floatAround ${6 + i}s ease-in-out infinite`,
                    animationDelay: `${i * 0.7}s`,
                    pointerEvents: 'none',
                }}>{emoji}</span>
            ))}

            <div className="auth-card" style={{ width: 'min(580px, 95vw)' }}>
                <div className="auth-logo">SmartPlate</div>
                <div className="auth-title">Create Your Profile</div>
                <div className="auth-subtitle">
                    {step === 1 ? 'Tell us about yourself to get started' : 'Help us personalize your diet plan'}
                </div>

                {/* Step indicator */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
                    {[1, 2].map((s) => (
                        <div key={s} style={{
                            flex: 1, height: 4, borderRadius: 2,
                            background: s <= step
                                ? 'linear-gradient(90deg, var(--green2), var(--lime))'
                                : 'rgba(255,255,255,0.05)',
                            transition: 'background 0.3s',
                        }} />
                    ))}
                </div>

                <form onSubmit={handleSubmit}>
                    {step === 1 ? (
                        <>
                            {/* Google Signup */}
                            <button className="btn-google" type="button">
                                <svg width="18" height="18" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Sign up with Google
                            </button>

                            <div className="auth-divider"><span>or</span></div>

                            <div className="form-grid two-col">
                                <div className="input-group">
                                    <input type="text" placeholder=" " value={form.name}
                                        onChange={(e) => update('name', e.target.value)}
                                        style={errors.name ? { borderColor: 'var(--danger)' } : {}}
                                    />
                                    <label>Full Name</label>
                                    {errors.name && <div className="input-error">{errors.name}</div>}
                                </div>
                                <div className="input-group">
                                    <input type="number" placeholder=" " value={form.age}
                                        onChange={(e) => update('age', e.target.value)}
                                        style={errors.age ? { borderColor: 'var(--danger)' } : {}}
                                    />
                                    <label>Age</label>
                                    {errors.age && <div className="input-error">{errors.age}</div>}
                                </div>
                            </div>

                            <div className="input-group">
                                <input type="email" placeholder=" " />
                                <label>Email Address</label>
                            </div>
                            <div className="input-group">
                                <input type="password" placeholder=" " />
                                <label>Create Password</label>
                            </div>

                            <button type="button" className="btn-primary" style={{ width: '100%' }} onClick={handleNext}>
                                Continue → Health Profile
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="form-grid two-col">
                                <div className="input-group">
                                    <input type="number" placeholder=" " value={form.height}
                                        onChange={(e) => update('height', e.target.value)}
                                        style={errors.height ? { borderColor: 'var(--danger)' } : {}}
                                    />
                                    <label>Height (cm)</label>
                                    {errors.height && <div className="input-error">{errors.height}</div>}
                                </div>
                                <div className="input-group">
                                    <input type="number" placeholder=" " value={form.weight}
                                        onChange={(e) => update('weight', e.target.value)}
                                        style={errors.weight ? { borderColor: 'var(--danger)' } : {}}
                                    />
                                    <label>Weight (kg)</label>
                                    {errors.weight && <div className="input-error">{errors.weight}</div>}
                                </div>
                            </div>

                            <div className="form-grid two-col">
                                <div className="input-group">
                                    <select value={form.gender} onChange={(e) => update('gender', e.target.value)}
                                        style={errors.gender ? { borderColor: 'var(--danger)' } : {}}>
                                        <option value="" disabled>Select gender</option>
                                        {genderOptions.map((g) => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                    <label>Gender</label>
                                    {errors.gender && <div className="input-error">{errors.gender}</div>}
                                </div>
                                <div className="input-group">
                                    <select value={form.activityLevel} onChange={(e) => update('activityLevel', e.target.value)}
                                        style={errors.activityLevel ? { borderColor: 'var(--danger)' } : {}}>
                                        <option value="" disabled>Select level</option>
                                        {activityOptions.map((a) => <option key={a} value={a}>{a}</option>)}
                                    </select>
                                    <label>Activity Level</label>
                                    {errors.activityLevel && <div className="input-error">{errors.activityLevel}</div>}
                                </div>
                            </div>

                            <div className="input-group">
                                <select value={form.goal} onChange={(e) => update('goal', e.target.value)}
                                    style={errors.goal ? { borderColor: 'var(--danger)' } : {}}>
                                    <option value="" disabled>Select your goal</option>
                                    {goalOptions.map((g) => <option key={g} value={g}>{g}</option>)}
                                </select>
                                <label>Health Goal</label>
                                {errors.goal && <div className="input-error">{errors.goal}</div>}
                            </div>

                            <div className="input-group">
                                <select value={form.dietPreference} onChange={(e) => update('dietPreference', e.target.value)}
                                    style={errors.dietPreference ? { borderColor: 'var(--danger)' } : {}}>
                                    <option value="" disabled>Select preference</option>
                                    {dietOptions.map((d) => <option key={d} value={d}>{d}</option>)}
                                </select>
                                <label>Diet Preference</label>
                                {errors.dietPreference && <div className="input-error">{errors.dietPreference}</div>}
                            </div>

                            <div style={{ display: 'flex', gap: 12 }}>
                                <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={() => setStep(1)}>
                                    ← Back
                                </button>
                                <button type="submit" className="btn-primary" style={{ flex: 2, opacity: loading ? 0.7 : 1 }} disabled={loading}>
                                    {loading ? 'Creating your plan...' : 'Create My Diet Plan →'}
                                </button>
                            </div>
                        </>
                    )}
                </form>

                <div className="auth-footer">
                    Already have an account?{' '}
                    <Link to="/login">Sign in</Link>
                </div>
            </div>

            <style>{`
        @keyframes floatAround {
          0%,100% { transform: translateY(0) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(5deg); }
          66% { transform: translateY(10px) rotate(-3deg); }
        }
      `}</style>
        </div>
    );
}
