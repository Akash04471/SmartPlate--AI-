import { Card } from "@/components/ui/card";
import CalorieRing from "@/components/dashboard/CalorieRing";
import MacroChart from "@/components/dashboard/MacroChart";
import QuickLog from "@/components/dashboard/QuickLog";

export default function Dashboard() {
  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-bold text-white">
        Today’s Overview
      </h1>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6 bg-slate-900">
          <CalorieRing />
        </Card>

        <Card className="p-6 bg-slate-900 md:col-span-2">
          <MacroChart />
        </Card>
      </div>

      <Card className="p-6 bg-slate-900">
        <QuickLog />
      </Card>
    </div>
  );
}
