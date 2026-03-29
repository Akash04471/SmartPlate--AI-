export default function CalorieRing({ consumed = 1450, goal = 2200 }) {
  const radius = 52;
  const stroke = 8;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(consumed / goal, 1);
  const offset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width="140" height="140">
        <circle
          cx="70"
          cy="70"
          r={radius}
          stroke="#1e293b"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx="70"
          cy="70"
          r={radius}
          stroke="#10b981"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
        />
      </svg>

      <div className="text-center">
        <p className="text-2xl font-bold text-white">
          {consumed}
        </p>
        <p className="text-sm text-slate-400">
          of {goal} kcal
        </p>
      </div>
    </div>
  );
}
