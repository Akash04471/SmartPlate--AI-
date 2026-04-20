import { DashboardClient } from "./DashboardClient";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen bg-base-dark items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-48 h-[2px] bg-white/5 relative overflow-hidden rounded-full">
            <div className="absolute inset-0 bg-white/40 animate-pulse" />
          </div>
          <span className="text-sm text-white/30 tracking-wide font-medium">Loading Dashboard Architecture...</span>
        </div>
      </div>
    }>
      <DashboardClient />
    </Suspense>
  );
}
