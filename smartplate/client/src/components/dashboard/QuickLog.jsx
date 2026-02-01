import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function QuickLog() {
  return (
    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
      <Plus size={18} />
      Quick Log Meal
    </Button>
  );
}
