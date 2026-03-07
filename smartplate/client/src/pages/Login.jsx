import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/global.css';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const errs = {};
        if (!email.trim()) errs.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email';
        if (!password.trim()) errs.password = 'Password is required';
        else if (password.length < 6) errs.password = 'Password must be at least 6 characters';
        return errs;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errs = validate();
        setErrors(errs);
        if (Object.keys(errs).length === 0) {
            setLoading(true);
            setTimeout(() => setLoading(false), 1500);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-bg" />
            <div className="auth-grid-bg" />

            {/* Floating food decorations */}
            {['🥑', '🫐', '🥦', '🍎'].map((emoji, i) => (
                <span key={i} style={{
                    position: 'absolute', fontSize: 32 + i * 6, opacity: 0.15,
                    top: `${15 + i * 20}%`,
                    [i % 2 === 0 ? 'left' : 'right']: `${5 + i * 3}%`,
                    animation: `floatAround ${6 + i}s ease-in-out infinite`,
                    animationDelay: `${i * 0.5}s`,
                    pointerEvents: 'none',
                }}>{emoji}</span>
            ))}

            <div className="auth-card">
                <div className="auth-logo">SmartPlate</div>
                <div className="auth-title">Welcome back</div>
                <div className="auth-subtitle">Sign in to continue your health journey</div>

                {/* Google Login */}
                <button className="btn-google" type="button">
                    <svg width="18" height="18" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                </button>

                <div className="auth-divider">
                    <span>or</span>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input
                            type="email"
                            placeholder=" "
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={errors.email ? { borderColor: 'var(--danger)' } : {}}
                        />
                        <label>Email address</label>
                        {errors.email && <div className="input-error">{errors.email}</div>}
                    </div>

                    <div className="input-group">
                        <input
                            type="password"
                            placeholder=" "
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={errors.password ? { borderColor: 'var(--danger)' } : {}}
                        />
                        <label>Password</label>
                        {errors.password && <div className="input-error">{errors.password}</div>}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
                        <span style={{ fontSize: 13, color: 'var(--green3)', cursor: 'pointer' }}>
                            Forgot password?
                        </span>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        style={{ width: '100%', opacity: loading ? 0.7 : 1 }}
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In →'}
                    </button>
                </form>

                <div className="auth-footer">
                    Don't have an account?{' '}
                    <Link to="/signup">Create one</Link>
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
