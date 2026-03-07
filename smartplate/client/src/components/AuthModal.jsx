import { useState } from 'react';

const C = {
    green3: '#22c55e',
    lime: '#a3e635',
    muted: '#6b9e7a',
    text: '#e8f5ee',
};

const modalStyles = `
  .auth-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.8);
    backdrop-filter: blur(10px);
    z-index: 1000;
    display: flex; align-items: center; justify-content: center;
    animation: authFadeIn 0.2s;
  }
  @keyframes authFadeIn { from { opacity: 0; } to { opacity: 1; } }

  .auth-modal-card {
    width: min(480px, 90vw);
    padding: 48px 40px;
    border-radius: 28px;
    background: rgba(8,22,14,0.95);
    border: 1px solid rgba(34,197,94,0.2);
    box-shadow: 0 40px 100px rgba(0,0,0,0.8);
    position: relative;
    animation: authModalSlide 0.4s cubic-bezier(0.34,1.56,0.64,1);
  }
  @keyframes authModalSlide {
    from { opacity: 0; transform: translateY(30px) scale(0.95); }
    to { opacity: 1; transform: none; }
  }

  .auth-modal-close {
    position: absolute; top: 20px; right: 20px;
    background: rgba(34,197,94,0.1); border: none;
    color: ${C.muted}; width: 32px; height: 32px; border-radius: 50%;
    cursor: pointer; font-size: 18px;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
  }
  .auth-modal-close:hover { background: rgba(34,197,94,0.2); color: ${C.text}; }

  .auth-modal-input {
    position: relative; margin-bottom: 20px;
  }
  .auth-modal-input input, .auth-modal-input select {
    width: 100%; padding: 18px 16px 8px;
    background: rgba(10,30,18,0.6);
    border: 1px solid rgba(34,197,94,0.15);
    border-radius: 12px; color: ${C.text};
    font-family: 'DM Sans', sans-serif; font-size: 15px;
    outline: none; transition: border-color 0.2s;
    appearance: none; -webkit-appearance: none;
  }
  .auth-modal-input select {
    padding-top: 22px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2322c55e' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 16px center;
    padding-right: 40px;
  }
  .auth-modal-input select option { background: #0a1a10; }
  .auth-modal-input input:focus, .auth-modal-input select:focus { border-color: ${C.green3}; }
  .auth-modal-input label {
    position: absolute; top: 14px; left: 16px;
    font-size: 13px; color: ${C.muted};
    transition: all 0.2s; pointer-events: none;
  }
  .auth-modal-input input:focus ~ label,
  .auth-modal-input input:not(:placeholder-shown) ~ label {
    top: 6px; font-size: 10px; letter-spacing: 0.5px; color: ${C.green3};
  }
  .auth-modal-input select ~ label {
    top: 6px; font-size: 10px; letter-spacing: 0.5px; color: ${C.muted};
  }
  .auth-modal-input select:focus ~ label { color: ${C.green3}; }

  .auth-modal-tabs { display: flex; gap: 8px; margin-bottom: 28px; }
  .auth-modal-tab {
    padding: 8px 20px; border-radius: 100px;
    font-size: 13px; cursor: pointer; transition: all 0.2s;
    border: 1px solid rgba(34,197,94,0.15);
    color: ${C.muted}; background: transparent;
    font-family: 'DM Sans', sans-serif;
  }
  .auth-modal-tab.active {
    background: rgba(34,197,94,0.15);
    border-color: rgba(34,197,94,0.4);
    color: ${C.green3};
  }
  .auth-modal-tab:hover:not(.active) {
    border-color: rgba(34,197,94,0.3); color: ${C.text};
  }
`;

export default function AuthModal({ mode = 'login', onClose }) {
    const [tab, setTab] = useState(mode);
    const isLogin = tab === 'login';

    return (
        <>
            <style>{modalStyles}</style>
            <div className="auth-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
                <div className="auth-modal-card">
                    <button className="auth-modal-close" onClick={onClose}>✕</button>

                    <div style={{ marginBottom: 32 }}>
                        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
                            {isLogin ? 'Welcome back' : 'Join SmartPlate'}
                        </div>
                        <div style={{ fontSize: 14, color: C.muted }}>
                            {isLogin ? 'Sign in to continue your health journey' : 'Start your personalized diet journey today'}
                        </div>
                    </div>

                    <div className="auth-modal-tabs">
                        <button className={`auth-modal-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>Sign In</button>
                        <button className={`auth-modal-tab ${tab === 'signup' ? 'active' : ''}`} onClick={() => setTab('signup')}>Create Account</button>
                    </div>

                    {isLogin ? (
                        <>
                            <div className="auth-modal-input">
                                <input type="email" placeholder=" " />
                                <label>Email address</label>
                            </div>
                            <div className="auth-modal-input">
                                <input type="password" placeholder=" " />
                                <label>Password</label>
                            </div>
                        </>
                    ) : (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                                <div className="auth-modal-input">
                                    <input type="text" placeholder=" " />
                                    <label>Full name</label>
                                </div>
                                <div className="auth-modal-input">
                                    <input type="number" placeholder=" " />
                                    <label>Age</label>
                                </div>
                                <div className="auth-modal-input">
                                    <input type="number" placeholder=" " />
                                    <label>Height (cm)</label>
                                </div>
                                <div className="auth-modal-input">
                                    <input type="number" placeholder=" " />
                                    <label>Weight (kg)</label>
                                </div>
                            </div>
                            <div className="auth-modal-input">
                                <select defaultValue="">
                                    <option value="" disabled>Select goal</option>
                                    <option>Lose weight</option>
                                    <option>Gain muscle</option>
                                    <option>Maintain weight</option>
                                    <option>Improve health</option>
                                </select>
                                <label>Health Goal</label>
                            </div>
                            <div className="auth-modal-input">
                                <select defaultValue="">
                                    <option value="" disabled>Select preference</option>
                                    <option>Vegetarian</option>
                                    <option>Non-Vegetarian</option>
                                    <option>Vegan</option>
                                    <option>Medical Diet</option>
                                </select>
                                <label>Diet Preference</label>
                            </div>
                        </>
                    )}

                    <button className="btn-primary" style={{
                        width: '100%', marginTop: 8, padding: '16px',
                        background: 'linear-gradient(135deg, #0d4f2e, #16a34a)',
                        border: '1px solid #22c55e', borderRadius: 100,
                        color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer',
                        fontFamily: "'DM Sans', sans-serif",
                    }}>
                        {isLogin ? 'Sign In →' : 'Create My Diet Plan →'}
                    </button>

                    {isLogin && (
                        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: C.muted }}>
                            Forgot password? <span style={{ color: C.green3, cursor: 'pointer' }}>Reset it</span>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
