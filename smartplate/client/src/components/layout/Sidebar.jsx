import {
  Home,
  Utensils,
  LineChart,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Dashboard", icon: Home },
  { label: "Diet Plan", icon: Utensils },
  { label: "Progress", icon: LineChart },
  { label: "Settings", icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex w-64 flex-col bg-slate-950 text-slate-100">
      <div className="px-6 py-4 text-xl font-bold text-emerald-500">
        SmartPlate
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map(({ label, icon: Icon }) => (
          <Button
            key={label}
            variant="ghost"
            className="w-full justify-start gap-3 text-slate-300 hover:text-white"
          >
            <Icon size={18} />
            {label}
          </Button>
        ))}
      </nav>

      <div className="p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-red-400"
        >
          <LogOut size={18} />
          Logout
        </Button>
      </div>
    </aside>
  );
}
