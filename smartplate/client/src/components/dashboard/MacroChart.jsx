import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const COLORS = {
  Protein: "#10b981",
  Carbs: "#38bdf8",
  Fats: "#facc15",
};

export default function MacroChart({
  data = [
    { name: "Protein", value: 120 },
    { name: "Carbs", value: 180 },
    { name: "Fats", value: 60 },
  ],
}) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            innerRadius={50}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={COLORS[entry.name]}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <div className="flex justify-center gap-4 mt-4 text-sm">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS[item.name] }}
            />
            <span className="text-slate-300">
              {item.name}: {item.value}g
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
