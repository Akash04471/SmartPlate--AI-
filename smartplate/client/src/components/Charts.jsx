// ─── CHART COMPONENTS ──────────────────────────────────────────────
// Reusable SVG chart components for the SmartPlate dashboard

const COLORS = {
    green2: '#16a34a',
    green3: '#22c55e',
    lime: '#a3e635',
    muted: '#6b9e7a',
};

// ─── RING CHART ────────────────────────────────────────────────────
export function RingChart({ value = 1580, max = 2000, size = 180, strokeWidth = 14, label = 'kcal today' }) {
    const pct = Math.min(value / max, 1);
    const r = (size - strokeWidth) / 2 - 4;
    const circ = 2 * Math.PI * r;
    const dash = pct * circ;
    const center = size / 2;

    return (
        <div style={{ position: 'relative', width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={center} cy={center} r={r} fill="none" stroke="rgba(34,197,94,0.08)" strokeWidth={strokeWidth} />
                <circle cx={center} cy={center} r={r} fill="none"
                    stroke="url(#ringGradient)" strokeWidth={strokeWidth}
                    strokeDasharray={`${dash} ${circ}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 1.5s cubic-bezier(0.4,0,0.2,1)' }}
                />
                <defs>
                    <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={COLORS.green2} />
                        <stop offset="100%" stopColor={COLORS.lime} />
                    </linearGradient>
                </defs>
            </svg>
            <div className="ring-center">
                <div className="ring-cal">{value.toLocaleString()}</div>
                <div className="ring-sub">{label}</div>
            </div>
        </div>
    );
}

// ─── SPARKLINE ─────────────────────────────────────────────────────
export function Sparkline({ data, color = COLORS.green3, height = 80 }) {
    const w = 300;
    const h = height;
    if (!data || data.length < 2) return null;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const pts = data.map((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - ((v - min) / range) * h * 0.8 - h * 0.1;
        return `${x},${y}`;
    }).join(' ');

    const gradId = `sparkGrad_${Math.random().toString(36).slice(2, 8)}`;

    return (
        <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
            <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
            <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#${gradId})`} />
        </svg>
    );
}

// ─── PIE CHART ─────────────────────────────────────────────────────
export function PieChart({ segments = [], size = 180 }) {
    const total = segments.reduce((s, seg) => s + seg.value, 0);
    const center = size / 2;
    const radius = size / 2 - 8;
    let cumulativeAngle = -90;

    const paths = segments.map((seg, i) => {
        const angle = (seg.value / total) * 360;
        const startAngle = cumulativeAngle;
        const endAngle = cumulativeAngle + angle;
        cumulativeAngle = endAngle;

        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;
        const x1 = center + radius * Math.cos(startRad);
        const y1 = center + radius * Math.sin(startRad);
        const x2 = center + radius * Math.cos(endRad);
        const y2 = center + radius * Math.sin(endRad);
        const largeArc = angle > 180 ? 1 : 0;

        const d = `M${center},${center} L${x1},${y1} A${radius},${radius} 0 ${largeArc} 1 ${x2},${y2} Z`;

        return (
            <path key={i} d={d} fill={seg.color} opacity="0.85"
                style={{ transition: 'opacity 0.2s', cursor: 'pointer' }}
                onMouseEnter={(e) => e.target.style.opacity = '1'}
                onMouseLeave={(e) => e.target.style.opacity = '0.85'}
            />
        );
    });

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {paths}
            <circle cx={center} cy={center} r={radius * 0.55} fill="#050f08" />
        </svg>
    );
}

// ─── BAR CHART ─────────────────────────────────────────────────────
export function BarChart({ data = [], labels = [], activeIndex = -1, height = 140 }) {
    return (
        <div>
            <div className="graph-bars" style={{ height }}>
                {data.map((v, i) => (
                    <div key={i}
                        className={`graph-bar ${i === activeIndex ? 'active' : ''}`}
                        style={{ height: `${v}%` }}
                        title={`${v}%`}
                    />
                ))}
            </div>
            {labels.length > 0 && (
                <div className="graph-labels">
                    {labels.map((l, i) => <span key={i}>{l}</span>)}
                </div>
            )}
        </div>
    );
}

export default { RingChart, Sparkline, PieChart, BarChart };
