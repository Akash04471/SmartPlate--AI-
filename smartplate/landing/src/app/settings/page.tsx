"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Settings Redirect
 * Automatically routes users to the dashboard with the settings tab active.
 */
export default function SettingsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard?tab=settings");
  }, [router]);

  return (
    <div className="flex min-h-screen bg-black items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="w-48 h-[2px] bg-white/5 relative overflow-hidden rounded-full">
          <div className="absolute inset-0 bg-emerald-500/40 animate-pulse" />
        </div>
        <span className="text-[10px] text-white/30 uppercase tracking-[0.4em] font-black">
          Redirecting to System Architecture...
        </span>
      </div>
    </div>
  );
}
