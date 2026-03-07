import { NavLink } from 'react-router-dom';
import { useState } from 'react';

const navItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/diet-plan', icon: '🥗', label: 'Diet Plan' },
    { path: '/calorie-tracker', icon: '🔥', label: 'Calorie Tracker' },
    { path: '/progress', icon: '📈', label: 'Progress' },
    { path: '/rewards', icon: '🏆', label: 'Rewards' },
    { path: '/profile', icon: '👤', label: 'Profile' },
];

export default function Navbar() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <>
            {/* Mobile toggle */}
            <button
                className="sidebar-toggle"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle navigation"
            >
                {sidebarOpen ? '✕' : '☰'}
            </button>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
                        zIndex: 45, display: 'none',
                    }}
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <NavLink to="/" className="sidebar-logo" style={{ textDecoration: 'none', display: 'block' }}>
                    SmartPlate
                </NavLink>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <NavLink
                        to="/profile"
                        className="sidebar-user"
                        style={{ textDecoration: 'none' }}
                        onClick={() => setSidebarOpen(false)}
                    >
                        <div className="sidebar-avatar">👤</div>
                        <div className="sidebar-user-info">
                            <div className="sidebar-user-name">Arjun Mehta</div>
                            <div className="sidebar-user-email">arjun@example.com</div>
                        </div>
                    </NavLink>
                </div>
            </aside>

            <style>{`
        @media (max-width: 768px) {
          .sidebar-overlay { display: block !important; }
        }
      `}</style>
        </>
    );
}
