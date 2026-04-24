"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  LayoutDashboard, Utensils, TrendingUp, Trophy, Settings, 
  LogOut, Search, Bell, Flame, Target, Zap, Plus, X, Sparkles, ChevronRight, Camera, Image as ImageIcon, Activity,
  Scale, Bot
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { 
  getProfile, getDailyStats, getWeeklyStats, getMealLogs, 
  createMealLog, addMealLogItem, getUser, logout, getToken,
  searchNutrition, interpretMeal, logWeight, getWeightHistory, getAdherenceStats,
  upsertProfile, analyzeImage, getCoachInsights, listTribes, joinTribe, getLeaderboard,
  getProtocolSummary
} from "@/utils/api";


import { getSuggestions, getAllFoodsForDiet, getCheatSuggestions, type FoodSuggestion } from "@/utils/SuggestionEngine";
import { scaleMacros, UNIT_MAP } from "@/utils/unitConverter";
import GlassTilt from "@/components/GlassTilt";
import FoodParticles from "@/components/FoodParticles";
import MetabolicRuler from "@/components/MetabolicRuler";
import Image from "next/image";
import AICoachChat from "@/components/AICoachChat";


// ─── TYPES ──────────────────────────────────────────────────────────────────

interface Profile {
  goalType: string | null;
  dietPreference: string | null;
  dailyCalorieTarget: number | null;
  dailyProteinTargetG: number | null;
  dailyCarbsTargetG: number | null;
  dailyFatTargetG: number | null;
  weightKg: number | null;
  heightCm: number | null;
  age: number | null;
}

interface DailyStats {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  meal_count: number;
  item_count: number;
}

interface MealLog {
  id: string;
  mealType: string;
  loggedAt: string;
  notes: string | null;
  items?: any[];
}

// ─── SIDEBAR ────────────────────────────────────────────────────────────────

const sidebarItems = [
  { icon: <LayoutDashboard size={20} />, label: "Overview", id: "overview" },
  { icon: <Plus size={20} />, label: "Log Intake", id: "intake" },
  { icon: <Utensils size={20} />, label: "Diet Plan", id: "diet" },
  { icon: <TrendingUp size={20} />, label: "Progress", id: "progress" },
  { icon: <Trophy size={20} />, label: "Awards", id: "awards" },
  { icon: <Bot size={20} />, label: "AI Coach", id: "coach" },
  { icon: <Sparkles size={20} />, label: "Community", id: "community" },
  { icon: <Settings size={20} />, label: "Settings", id: "settings" },
];



// ─── MAIN DASHBOARD ─────────────────────────────────────────────────────────

export function DashboardClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [todayMeals, setTodayMeals] = useState<MealLog[]>([]);
  const [yesterdayMeals, setYesterdayMeals] = useState<MealLog[]>([]);
  const [historyMeals, setHistoryMeals] = useState<MealLog[]>([]);
  const [suggestions, setSuggestions] = useState<FoodSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [pendingItem, setPendingItem] = useState<any | null>(null);
  const [userName, setUserName] = useState("User");
  
  // New States
  const [weightHistory, setWeightHistory] = useState<any[]>([]);
  const [adherenceStats, setAdherenceStats] = useState<any>(null);
  const [isCheatDayUnlocked, setIsCheatDayUnlocked] = useState(false);
  const [coachInsights, setCoachInsights] = useState<any>(null);
  const [tribes, setTribes] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any>(null);
  const [activeProtocols, setActiveProtocols] = useState<any[]>([]);
  const [protocolSummary, setProtocolSummary] = useState<any>(null);
  const [showCoachModal, setShowCoachModal] = useState(false);





  // Auth guard
  useEffect(() => {
    if (!getToken()) {
      router.push("/auth/login");
      return;
    }
    const user = getUser();
    if (user) setUserName(user.name);

    // Sync active tab from URL
    const tab = searchParams.get("tab");
    if (tab && sidebarItems.find(i => i.id === tab)) {
      setActiveTab(tab);
    }
  }, [router, searchParams]);

  // Load all data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [profileRes, dailyRes, weeklyRes, mealsRes] = await Promise.allSettled([
        getProfile(),
        getDailyStats(),
        getWeeklyStats(),
        getMealLogs(1, 50),
      ]);

      if (profileRes.status === "fulfilled") {
        const p = profileRes.value.data;
        setProfile(p);
        const sugg = getSuggestions(p.goalType, p.dietPreference, 5);
        setSuggestions(sugg);
      }

      if (dailyRes.status === "fulfilled") {
        setDailyStats(dailyRes.value.data);
      }

      if (weeklyRes.status === "fulfilled") {
        const formatted = weeklyRes.value.data.map((d: any) => ({
          name: new Date(d.date).toLocaleDateString("en", { weekday: "short" }),
          calories: Math.round(d.calories),
        }));
        setWeeklyData(formatted);
      }

      
      if (mealsRes.status === "fulfilled") {
        const allFetched = mealsRes.value.data;
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const yesterday = today - 86400000;

        const t: any[] = [];
        const y: any[] = [];
        const h: any[] = [];

        allFetched.forEach((m: any) => {
          const d = new Date(m.loggedAt);
          const mealDate = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
          
          if (mealDate === today) t.push(m);
          else if (mealDate === yesterday) y.push(m);
          else h.push(m);
        });

        setTodayMeals(t);
        setYesterdayMeals(y);
        setHistoryMeals(h);
      }

      // Restore missing history, weight and adherence fetches
      const [weightRes, adherenceRes] = await Promise.allSettled([
        getWeightHistory(),
        getAdherenceStats()
      ]);
      
      if (weightRes.status === "fulfilled") setWeightHistory(weightRes.value as any);
      if (adherenceRes.status === "fulfilled") {
        const data = adherenceRes.value as any;
        setAdherenceStats(data);
        setIsCheatDayUnlocked(data.awards?.some((a: any) => a.type === 'cheat_day_unlock'));
      }

      // Fetch AI Coach Insights
      try {
        const coachRes = await getCoachInsights();
        setCoachInsights(coachRes);
      } catch (err) {
        console.error("Coach insights load error:", err);
      }

      // Fetch Protocol Data
      try {
        const protoRes = await getProtocolSummary();
        if (protoRes.data) {
          setActiveProtocols(protoRes.data.activeProtocols || []);
          setProtocolSummary(protoRes.data);
        }
      } catch (err) {
        console.error("Protocol summary load error:", err);
      }


      
    } catch (err) {

      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (getToken()) loadData();
  }, [loadData]);

  // Computed values
  const calTarget = profile?.dailyCalorieTarget || 2000;
  const proteinTarget = profile?.dailyProteinTargetG || 150;
  const calCurrent = Math.round(dailyStats?.calories || 0);
  const proteinCurrent = Math.round(dailyStats?.protein_g || 0);
  const calPct = Math.min(100, Math.round((calCurrent / calTarget) * 100));
  const proteinPct = Math.min(100, Math.round((proteinCurrent / proteinTarget) * 100));
  const mealCount = dailyStats?.meal_count || 0;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const goalLabel = (g: string | null) => {
    const map: Record<string, string> = {
      lose_weight: "Weight Loss",
      gain_muscle: "Muscle Gain",
      maintain_weight: "Maintenance",
      improve_endurance: "Endurance",
      general_health: "Daily Health",
    };
    return g ? map[g] || g.toUpperCase() : "Set Your Goal";
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-base-dark items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-48 h-[2px] bg-white/5 relative overflow-hidden rounded-full">
            <motion.div 
              animate={{ x: ["-100%", "100%"] }} 
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-white/40"
            />
          </div>
          <span className="text-sm text-white/30 tracking-wide font-medium" style={{ fontFamily: 'var(--font-label)' }}>Loading your data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-base-dark text-white relative overflow-x-hidden">
      {/* Living Background */}
      <FoodParticles count={6} />
      
      {/* ─── SIDEBAR (Desktop) ────────────────────────────────────────── */}
      <aside className="hidden lg:flex w-64 border-r border-white/5 bg-[#080808] flex-col p-6 sticky top-0 h-screen">
        <div className="mb-12">
          <Image 
            src="/images/smartplate-logo.jpg" 
            alt="SmartPlate Logo" 
            width={160} 
            height={50}
            className="w-40 h-auto object-contain"
          />
        </div>
        
        <nav className="flex-1 space-y-1">
          {sidebarItems.map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)} 
              className={`w-full flex items-center gap-4 px-4 py-3.5 text-[13px] tracking-wide rounded-lg transition-all ${
                activeTab === item.id 
                  ? 'bg-white text-black font-semibold shadow-[0_0_20px_rgba(255,255,255,0.1)]' 
                  : 'text-white/40 hover:text-white/70 hover:bg-white/[0.03]'
              }`}
              style={{ fontFamily: 'var(--font-label)' }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <button onClick={() => logout()} className="flex items-center gap-4 px-4 py-3.5 text-[13px] tracking-wide text-red-400/60 hover:text-red-400 hover:bg-red-400/5 transition-colors mt-auto rounded-lg" style={{ fontFamily: 'var(--font-label)' }}>
          <LogOut size={20} />
          Sign Out
        </button>
      </aside>

      {/* ─── MAIN CONTENT ───────────────────────────────────── */}
      <main className="flex-1 px-6 py-8 md:p-10 lg:p-12 pb-32 lg:pb-12 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === "overview" && <OverviewTab key="overview" profile={profile} userName={userName} calPct={calPct} proteinPct={proteinPct} calCurrent={calCurrent} calTarget={calTarget} proteinCurrent={proteinCurrent} proteinTarget={proteinTarget} mealCount={mealCount} yesterdayData={weeklyData} todayMeals={todayMeals} yesterdayMeals={yesterdayMeals} historyMeals={historyMeals} suggestions={suggestions} coachInsights={coachInsights} goalLabel={goalLabel} activeProtocols={activeProtocols} protocolSummary={protocolSummary} onAddMeal={(item?: any) => { setPendingItem(item || null); setShowAddMeal(true); }} onToggleCoach={() => loadData()} setActiveTab={setActiveTab} onShowCoach={() => setShowCoachModal(true)} />}

          {activeTab === "intake" && (
            <IntakeTab 
              key="intake" 
              profile={profile} 
              onSuccess={() => { loadData(); setActiveTab("overview"); }} 
              pendingItem={pendingItem} 
            />
          )}

          {activeTab === "community" && <CommunityTab key="community" userName={userName} />}

          {activeTab === "diet" && (
            <DietPlanTab 
              key="diet" 
              profile={profile} 
              goalLabel={goalLabel} 
              activeProtocols={activeProtocols}
              todayMeals={todayMeals}
              yesterdayMeals={yesterdayMeals}
              historyMeals={historyMeals}
              onAddMeal={(item?: any) => { setPendingItem(item || null); setShowAddMeal(true); }}
              calCurrent={calCurrent}
              calTarget={calTarget}
              proteinCurrent={proteinCurrent}
              proteinTarget={proteinTarget}
            />
          )}
          {activeTab === "progress" && <ProgressTab key="progress" weightHistory={weightHistory} adherenceStats={adherenceStats} onLogWeight={(w: number) => { logWeight(w); loadData(); }} />}

          {activeTab === "awards" && <AwardsTab key="awards" adherenceStats={adherenceStats} isUnlocked={isCheatDayUnlocked} profile={profile} />}
          {activeTab === "coach" && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-[88vh] w-full max-w-7xl mx-auto"
            >
              <AICoachChat />
            </motion.div>
          )}
          {activeTab === "settings" && <SettingsTab key="settings" profile={profile} onUpdate={() => loadData()} />}
        </AnimatePresence>
      </main>

      {/* ─── BOTTOM NAVIGATION (Mobile) ────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-black/80 backdrop-blur-3xl border-t border-white/5 px-4 pb-8 pt-4">
        <div className="flex justify-between items-center max-w-md mx-auto">
          {sidebarItems.slice(0, 6).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${
                activeTab === item.id ? 'text-emerald-400' : 'text-white/30'
              }`}
            >
              <div className={activeTab === item.id ? 'scale-110' : ''}>
                {item.icon}
              </div>
              <span className="text-[9px] font-bold tracking-tighter uppercase" style={{ fontFamily: 'var(--font-label)' }}>
                {item.label === "Overview" ? "Home" : item.label.split(" ")[0]}
              </span>
            </button>
          ))}
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${
              activeTab === "settings" ? 'text-emerald-400' : 'text-white/30'
            }`}
          >
            <Settings size={20} className={activeTab === "settings" ? 'scale-110' : ''} />
            <span className="text-[9px] font-bold tracking-tighter uppercase" style={{ fontFamily: 'var(--font-label)' }}>Config</span>
          </button>
        </div>
      </nav>

      {/* ─── MODALS ────────────────────────────────────────── */}
      <AnimatePresence>
        {showAddMeal && (
          <AddMealModal 
            onClose={() => { setShowAddMeal(false); setPendingItem(null); }} 
            onSuccess={() => { setShowAddMeal(false); setPendingItem(null); loadData(); }}
            profile={profile}
            pendingItem={pendingItem}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCoachModal && (
          <CoachModal 
            onClose={() => setShowCoachModal(false)}
            coachInsights={coachInsights}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── ADD MEAL MODAL ─────────────────────────────────────────────────────────


// ─── TAB COMPONENTS ─────────────────────────────────────────────────────────

function OverviewTab({ profile, userName, calPct, proteinPct, calCurrent, calTarget, proteinCurrent, proteinTarget, mealCount, yesterdayData, todayMeals, yesterdayMeals, historyMeals, suggestions, coachInsights, goalLabel, activeProtocols, protocolSummary, onAddMeal, setActiveTab, onShowCoach }: any) {

  const getAlignmentColor = (meal: any) => {
    if (!profile?.dailyCalorieTarget) return "text-emerald-400/40";
    const targetPerMeal = profile.dailyCalorieTarget / 4;
    const calories = meal.totals?.calories || 0;
    const diff = Math.abs(calories - targetPerMeal) / targetPerMeal;

    if (diff <= 0.15) return "text-emerald-400"; 
    if (diff <= 0.30) return "text-amber-400";   
    return "text-rose-400";                     
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const currentProtocol = activeProtocols?.[0];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, scale: 0.98 }}
      className="space-y-10 md:space-y-16 pb-20"
    >
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-0">
        <div>
          <motion.p 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-[10px] text-emerald-400/60 mb-2 md:mb-4 tracking-[0.4em] font-black uppercase"
          >
            System Status: {calPct > 95 ? "Physiological Equilibrium" : "Metabolic Sync Active"}
          </motion.p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter italic leading-none" style={{ fontFamily: 'var(--font-display)' }}>
            {greeting()}, <br className="md:hidden" /> <span className="text-emerald-400">{userName.split(" ")[0]}</span>.
          </h1>
        </div>
        <div className="flex gap-4 items-center w-full md:w-auto">
          <div className="text-right hidden sm:block">
            <p className="text-[9px] text-white/20 font-black uppercase tracking-[0.3em] mb-1">Active Mandate</p>
            <p className="text-xs md:text-sm font-black italic tracking-tight text-white/80">{currentProtocol ? currentProtocol.title : goalLabel(profile?.goalType || null)}</p>
          </div>
          <div className="flex gap-3 ml-auto md:ml-0">
            <button 
              onClick={() => logout()}
              className="p-3.5 md:px-6 md:py-4 border border-white/5 hover:border-red-400/20 bg-white/[0.02] hover:bg-red-400/5 transition-all flex items-center gap-3 rounded-2xl group text-red-400/60 hover:text-red-400"
            >
              <LogOut size={18} />
              <span className="hidden md:inline text-[10px] font-black uppercase tracking-widest" style={{ fontFamily: 'var(--font-label)' }}>Terminate</span>
            </button>
            <button className="p-3.5 md:p-4 border border-white/5 hover:border-emerald-400/20 bg-white/[0.02] transition-all relative rounded-2xl group overflow-hidden">
              <div className="absolute inset-0 bg-emerald-400/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <Bell size={20} className="text-white/20 group-hover:text-emerald-400 transition-colors relative z-10" />
              <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
            </button>
          </div>
        </div>
      </header>

      {/* AI COACH: Holographic Insight */}
      <motion.div 
        whileHover={{ y: -4 }}
        onClick={onShowCoach}
        className="p-[1px] bg-gradient-to-r from-emerald-500/20 via-white/5 to-emerald-500/20 rounded-[2rem] md:rounded-[3rem] relative group/coach shadow-2xl cursor-pointer"
      >
        <div className="bg-[#080808] rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 flex flex-col lg:flex-row gap-6 md:gap-10 items-center justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-emerald-500/[0.02] opacity-0 group-hover/coach:opacity-100 transition-opacity" />
          <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center relative z-10 text-center md:text-left">
            <div className={`p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border transition-all duration-700 ${coachInsights?.enabled ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/5 border-white/5 text-white/20'}`}>
               {coachInsights?.enabled ? <Activity size={32} strokeWidth={1.5} className="w-8 h-8 md:w-10 md:h-10 animate-pulse" /> : <Sparkles size={32} strokeWidth={1.5} className="w-8 h-8 md:w-10 md:h-10" />}
            </div>
            <div className="max-w-xl">
              <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                <h3 className="text-xl md:text-2xl font-black italic tracking-tighter text-white" style={{ fontFamily: 'var(--font-display)' }}>AI Nutrition Analyst</h3>
                {coachInsights?.protocolActive && (
                  <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[8px] font-black text-emerald-400 uppercase tracking-widest">Protocol-Aware</span>
                )}
              </div>
              <p className="text-sm md:text-base font-medium text-white/50 leading-relaxed italic">
                {coachInsights?.enabled 
                  ? coachInsights.data?.advice 
                  : "Sync the Nutrition Assistant to initiate metabolic tracking and algorithmic guidance."}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-4 relative z-10 w-full lg:w-64">
            {!coachInsights?.enabled ? (
              <button 
                onClick={(e) => { e.stopPropagation(); setActiveTab('settings'); }}
                className="w-full py-4 md:py-5 bg-white text-black rounded-xl md:rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-400 hover:text-white transition-all shadow-xl"
              >Initialize Assistant</button>
            ) : (
              <div className="p-4 md:p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl md:rounded-3xl text-center backdrop-blur-md">
                 <p className="text-[9px] font-black uppercase tracking-[0.4em] text-emerald-400/40 mb-2">Optimization Vector</p>
                 <p className="text-lg md:text-xl font-black italic tracking-tighter text-emerald-400">
                   {coachInsights.data?.suggestion 
                     ? `+${coachInsights.data.suggestion.amount}${coachInsights.data.suggestion.unit} ${coachInsights.data.suggestion.type.toUpperCase()}`
                     : "NEUTRAL BALANCE"}
                 </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>


      {/* MACRO HUD: Precision Nutrition HUD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {[
          { label: "Caloric Intake", value: calCurrent.toLocaleString(), sub: `Target ${calTarget.toLocaleString()}`, icon: <Flame size={20}/>, pct: calPct, color: "from-emerald-400 to-emerald-600", glow: "shadow-emerald-500/20" },
          { label: "Protein Availability", value: `${proteinCurrent}g`, sub: `Limit ${proteinTarget}g`, icon: <Zap size={20}/>, pct: proteinPct, color: "from-blue-400 to-blue-600", glow: "shadow-blue-500/20" },
          { label: "Protocol Compliance", value: `${Math.round(calPct)}%`, sub: "Metabolic Alignment", icon: <Target size={20}/>, pct: calPct, color: "from-amber-400 to-amber-600", glow: "shadow-amber-500/20" },
          { label: "Nutritional Velocity", value: mealCount > 0 ? "High" : "Standby", sub: `${mealCount} Entries Logged`, icon: <TrendingUp size={20}/>, pct: Math.min(100, (mealCount / 4) * 100), color: "from-white/20 to-white/5", glow: "" },
        ].map((stat, i) => (
          <GlassTilt key={i} intensity={10}>
            <motion.div 
              whileHover={{ y: -4 }}
              className="p-8 md:p-10 border border-white/5 bg-white/[0.02] backdrop-blur-3xl hover:bg-white/[0.05] transition-all group rounded-[2.5rem] md:rounded-[3rem] relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-8 md:mb-10">
                <span className="text-[9px] tracking-[0.4em] text-white/20 uppercase font-black" style={{ fontFamily: 'var(--font-label)' }}>{stat.label}</span>
                <div className="p-2.5 md:p-3 border border-white/5 group-hover:border-white/20 transition-colors rounded-xl md:rounded-2xl text-white/30 group-hover:text-white">
                  {stat.icon}
                </div>
              </div>
              <div className="flex flex-col mb-8 md:mb-10">
                <span className="text-4xl md:text-5xl font-black italic tracking-tighter text-liquid mb-2" style={{ fontFamily: 'var(--font-display)' }}>{stat.value}</span>
                <span className="text-[9px] text-white/10 font-black uppercase tracking-[0.3em] font-bold">{stat.sub}</span>
              </div>
              <div className="h-[4px] w-full bg-white/5 overflow-hidden rounded-full">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${stat.pct}%` }} 
                  transition={{ duration: 2.5, delay: i * 0.15, ease: [0.2, 0.8, 0.2, 1] }} 
                  className={`h-full bg-gradient-to-r ${stat.color} ${stat.glow} shadow-2xl transition-all`} 
                />
              </div>
            </motion.div>
          </GlassTilt>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* BIOMETRIC ANALYTICS */}
        <div className="lg:col-span-12 border border-white/5 p-8 md:p-12 bg-white/[0.01] rounded-[2.5rem] md:rounded-[4rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none hidden md:block">
            <LayoutDashboard size={300} strokeWidth={0.5} />
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start mb-12 md:mb-16 relative z-10 gap-6 md:gap-0">
            <div>
              <h3 className="text-2xl md:text-3xl font-black italic tracking-tighter text-white leading-none" style={{ fontFamily: 'var(--font-display)' }}>Biometric Analytics</h3>
              <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.4em] mt-4">Metabolic Flux Spectrum</p>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
               <div className="flex items-center gap-3 px-5 py-2.5 border border-white/5 bg-white/[0.02] rounded-xl md:rounded-2xl w-full md:w-auto overflow-hidden">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                 <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 whitespace-nowrap">Efficiency Vector</span>
               </div>
            </div>
          </div>
          
          <div className="h-[250px] md:h-[400px] w-full relative z-10">
            {!yesterdayData || yesterdayData.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-white/[0.02] border border-white/5 rounded-[1.5rem] md:rounded-[2rem]">
                <div className="w-32 md:w-48 h-[1px] bg-white/5 relative overflow-hidden">
                  <motion.div 
                    animate={{ x: ["-100%", "100%"] }} 
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-emerald-400/20"
                  />
                </div>
                <span className="text-[9px] md:text-[10px] text-white/20 font-black uppercase tracking-widest text-center px-4">Awaiting Biometric Data Stream...</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={yesterdayData}>
                  <defs>
                    <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="12 12" stroke="#ffffff03" vertical={false} />
                  <XAxis dataKey="name" stroke="none" tick={{ fill: '#ffffff15', fontSize: 10, fontWeight: 900 }} dy={20} />
                  <YAxis stroke="none" tick={{ fill: '#ffffff15', fontSize: 10, fontWeight: 900 }} dx={-20} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#050505', border: '1px solid #ffffff10', borderRadius: '16px', backdropFilter: 'blur(40px)', padding: '15px' }}
                    itemStyle={{ color: '#10b981', fontSize: '11px', fontWeight: 900, fontStyle: 'italic', letterSpacing: '-0.02em' }}
                    labelStyle={{ color: '#ffffff30', fontSize: '9px', fontWeight: 900, letterSpacing: '0.2em', marginBottom: '8px' }}
                    cursor={{ stroke: '#ffffff10', strokeWidth: 2 }}
                  />

                  <Area type="monotone" dataKey="calories" stroke="#10b981" fillOpacity={1} fill="url(#colorCal)" strokeWidth={4} animationDuration={3000} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}



function DietPlanTab({ profile, goalLabel, activeProtocols, todayMeals, yesterdayMeals, historyMeals, onAddMeal, calCurrent, calTarget, proteinCurrent, proteinTarget }: any) {
  const currentProtocol = activeProtocols?.[0];
  
  const targets = [
    { label: "Energy Threshold", value: currentProtocol?.targetCalories || profile?.dailyCalorieTarget || 2000, color: "from-emerald-500/10 to-transparent", ring: "border-emerald-500/20", unit: "kcal", icon: <Flame size={16}/> },
    { label: "Essential Protein", value: currentProtocol?.targetProteinG || profile?.dailyProteinTargetG || 150, color: "from-blue-500/10 to-transparent", ring: "border-blue-500/20", unit: "g", icon: <Zap size={16}/> },
    { label: "Complex Carbs", value: currentProtocol?.targetCarbsG || profile?.dailyCarbsTargetG || 200, color: "from-amber-500/10 to-transparent", ring: "border-amber-500/20", unit: "g", icon: <Activity size={16}/> },
    { label: "Balanced Lipids", value: currentProtocol?.targetFatG || profile?.dailyFatTargetG || 70, color: "from-rose-500/10 to-transparent", ring: "border-rose-500/20", unit: "g", icon: <Target size={16}/> },
  ];

  const suggestions = getSuggestions(profile?.goalType, profile?.dietPreference, 8);

  const calPct = Math.min(100, Math.round((calCurrent / calTarget) * 100));

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 0.98 }} 
      className="space-y-16"
    >
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-0">
        <div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black italic tracking-tighter mb-2 md:mb-4" style={{ fontFamily: 'var(--font-display)' }}>Nutritional Mandate</h2>
          <p className="text-[9px] md:text-[10px] text-emerald-400 font-black uppercase tracking-[0.3em] md:tracking-[0.4em]">Current Strategy: <br className="sm:hidden" /> {currentProtocol ? currentProtocol.title : goalLabel(profile?.goalType)} · {profile?.dietPreference?.toUpperCase()}</p>
        </div>
      </header>

      {/* NEURAL HUD: Circular Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8 md:space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {targets.map((t, i) => (
              <motion.div 
                key={i} 
                whileHover={{ y: -8 }}
                className={`p-8 md:p-10 bg-white/[0.01] border border-white/5 hover:border-white/10 rounded-[2.5rem] md:rounded-[3rem] relative group overflow-hidden transition-all`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${t.color} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-8 md:mb-10">
                    <p className="text-[9px] uppercase font-black tracking-[0.4em] text-white/20 group-hover:text-white/40 transition-colors">{t.label}</p>
                    <div className="text-white/20 group-hover:text-white/60 transition-colors">{t.icon}</div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl md:text-4xl font-black italic tracking-tighter leading-none text-white">{t.value}</span>
                    <span className="text-[9px] md:text-[10px] font-black text-white/10 uppercase tracking-widest">{t.unit}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="p-[1px] bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl relative group overflow-hidden">
            <div className="absolute inset-0 bg-emerald-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="bg-[#080808] p-8 md:p-12 lg:p-16 rounded-[2.5rem] md:rounded-[3.5rem] relative z-10">
              <div className="flex items-center gap-6 md:gap-8 mb-8 md:mb-10 text-center md:text-left">
                <div className="p-4 md:p-5 bg-white/[0.03] border border-white/5 text-emerald-400 rounded-2xl md:rounded-3xl shadow-2xl"><Target size={28} className="w-7 h-7 md:w-8 md:h-8" strokeWidth={1.5}/></div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-black italic tracking-tighter">Strategic Alignment</h3>
                  <p className="text-[9px] md:text-[10px] text-white/20 font-black uppercase tracking-[0.3em] mt-2">Protocol Efficiency: <span className="text-emerald-400">94.2% Accurate</span></p>
                </div>
              </div>
              <p className="max-w-4xl text-lg md:text-xl lg:text-2xl text-white/40 leading-tight font-medium italic tracking-tight">
                "Your physiological profile indicates a shift towards <span className="text-white">optimized metabolic flexibility</span>. By prioritizing <span className="text-white">bioavailable amino acids</span> and maintaining a surgical <span className="text-white">carbohydrate cycle</span>, we are locking into a verified metabolic state aligned with the <span className="text-emerald-400">{goalLabel(profile?.goalType)}</span> directive."
              </p>
            </div>
          </div>
        </div>

        {/* METABOLIC TIMELINE */}
        <div className="lg:col-span-4 border border-white/5 p-8 md:p-12 bg-white/[0.01] rounded-[2.5rem] md:rounded-[4rem] flex flex-col relative overflow-hidden h-[500px] md:h-[700px]">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none hidden md:block">
            <Activity size={300} strokeWidth={0.5} />
          </div>
          
          <div className="mb-8 md:mb-12 relative z-10 text-center">
             <div className="relative inline-block w-32 h-32 md:w-40 md:h-40 mb-6 md:mb-8">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="70" fill="transparent" stroke="#ffffff08" strokeWidth="8" />
                  <motion.circle 
                    cx="80" cy="80" r="70" fill="transparent" stroke="#10b981" strokeWidth="8" 
                    strokeDasharray={440} 
                    initial={{ strokeDashoffset: 440 }}
                    animate={{ strokeDashoffset: 440 - (440 * calPct) / 100 }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <p className="text-2xl md:text-3xl font-black italic tracking-tighter text-white leading-none">{calPct}%</p>
                   <p className="text-[7px] md:text-[8px] text-white/20 font-black uppercase tracking-widest mt-1">CAPACITY</p>
                </div>
             </div>
             <h3 className="text-xl md:text-2xl font-black italic tracking-tighter text-white">Metabolic Timeline</h3>
             <p className="text-[9px] text-white/20 font-black uppercase tracking-[0.4em] mt-2">Active Intake Stream</p>
          </div>

          <div className="flex-1 space-y-6 md:space-y-10 overflow-y-auto overscroll-contain pr-2 custom-scrollbar relative z-10 px-2">
            {todayMeals.length === 0 ? (
                <div className="p-10 border border-dashed border-white/5 rounded-[2.5rem] text-center bg-white/[0.01]">
                  <p className="text-xs text-white/10 font-black italic tracking-tight uppercase">Ready for Input</p>
                </div>
            ) : (
                <div className="space-y-4">
                  {todayMeals.map((meal: any) => (
                    <motion.div 
                      key={meal.id} 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="group p-6 border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all rounded-[2rem] flex justify-between items-center"
                    >
                      <div className="flex items-center gap-5 min-w-0">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20 transition-all">
                           <Utensils size={18} className="text-emerald-400" />
                        </div>
                        <div className="min-w-0">
                           <p className="text-[12px] font-black italic tracking-tight uppercase truncate text-white/90">{meal.mealType}</p>
                           <p className="text-[9px] text-white/20 font-bold tracking-widest uppercase">{new Date(meal.loggedAt).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-black italic tracking-tighter text-emerald-400">{meal.totals?.calories || 0} kcal</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
            )}

            {yesterdayMeals.length > 0 && (
              <div className="space-y-6 pt-6 border-t border-white/5">
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">Historical Delta</p>
                <div className="space-y-4">
                   {yesterdayMeals.slice(0, 3).map((meal: any) => (
                      <div key={meal.id} className="flex justify-between items-center grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all">
                         <p className="text-[11px] font-black italic text-white/60 uppercase">{meal.mealType}</p>
                         <p className="text-[11px] font-black italic text-white/20">{meal.totals?.calories} kcal</p>
                      </div>
                   ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pt-12">
        <h3 className="text-[10px] font-black uppercase tracking-[0.6em] text-white/20 mb-12 flex items-center gap-8">
          System Foundations <div className="h-[1px] flex-1 bg-gradient-to-r from-white/5 to-transparent" />
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-6">
          {suggestions.map((f, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.05, y: -8 }}
              onClick={() => onAddMeal(f)}
              className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] border border-white/5 group bg-[#080808] cursor-pointer shadow-2xl transition-all hover:border-emerald-500/20"
            >
              {f.image ? (
                <div className="absolute inset-0 z-0">
                  <img 
                    src={f.image} 
                    alt={f.foodName}
                    className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-125 opacity-40 group-hover:opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent opacity-90 group-hover:opacity-60 transition-opacity duration-700" />
                </div>
              ) : (
                <div className="absolute inset-0 bg-white/[0.01]" />
              )}
              
              <div className="absolute inset-0 z-10 p-6 lg:p-8 flex flex-col justify-end">
                <div className="space-y-1 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <p className="font-black italic tracking-tighter text-[13px] leading-tight group-hover:text-emerald-400 transition-colors uppercase">{f.foodName}</p>
                  <div className="flex justify-between items-center opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                    <p className="text-[9px] text-white/40 font-bold uppercase tracking-[0.2em]">{f.calories} kcal</p>
                    <div className="p-2.5 bg-emerald-500 text-black rounded-full shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                      <Plus size={12} strokeWidth={4} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Neural Aura */}
              <div className="absolute inset-0 border-2 border-emerald-500/0 group-hover:border-emerald-500/20 rounded-[2.5rem] transition-all duration-700" />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function ProgressTab({ weightHistory, adherenceStats, onLogWeight }: any) {
  const [newWeight, setNewWeight] = useState("");
  const chartData = weightHistory.map((w: any) => ({
    date: new Date(w.loggedAt).toLocaleDateString("en", { day: "numeric", month: "short" }),
    weight: w.weightKg
  }));

  const currentWeight = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].weightKg : "--";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-16">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-6xl font-black italic tracking-tighter mb-4" style={{ fontFamily: 'var(--font-display)' }}>Health Metrics Tracking</h2>
          <p className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.4em]">Biometric Variance · Physiological Delta</p>
        </div>
        <div className="flex gap-4 p-2 bg-white/[0.02] border border-white/5 rounded-3xl backdrop-blur-md">
          <input 
            type="number" 
            placeholder="Mass (kg)" 
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            className="w-32 bg-transparent px-6 py-4 text-sm font-black italic text-white outline-none placeholder:text-white/10"
          />
          <button 
            onClick={() => { if(newWeight) onLogWeight(parseFloat(newWeight)); setNewWeight(""); }}
            className="px-8 py-4 bg-emerald-500 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-emerald-400 transition-all shadow-xl"
          >Sync Entry</button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 border border-white/5 p-12 bg-white/[0.01] rounded-[4rem] relative overflow-hidden">
          <div className="flex justify-between items-center mb-16 relative z-10">
            <div>
              <h3 className="text-2xl font-black italic tracking-tighter uppercase text-white/40">Body Weight Analysis</h3>
              <p className="text-[9px] text-emerald-400/60 font-black uppercase tracking-[0.3em] mt-2">Current Physiological State: {currentWeight} kg</p>
            </div>
          </div>
          <div className="h-[400px] relative z-10">
            {!chartData || chartData.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-white/[0.02] border border-white/5 rounded-[2rem]">
                <div className="w-48 h-[1px] bg-white/5 relative overflow-hidden">
                  <motion.div 
                    animate={{ x: ["-100%", "100%"] }} 
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-emerald-400/20"
                  />
                </div>
                <span className="text-[10px] text-white/20 font-black uppercase tracking-widest">Awaiting Biometric Data Stream...</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="12 12" stroke="#ffffff03" vertical={false} />
                  <XAxis dataKey="date" stroke="none" tick={{ fill: '#ffffff15', fontSize: 10, fontWeight: 900 }} dy={20} />
                  <YAxis domain={['dataMin - 2', 'dataMax + 2']} stroke="none" tick={{ fill: '#ffffff15', fontSize: 10, fontWeight: 900 }} dx={-20} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#050505', border: '1px solid #ffffff10', borderRadius: '24px', backdropFilter: 'blur(40px)', padding: '20px' }}
                    itemStyle={{ color: '#10b981', fontSize: '12px', fontWeight: 900, textTransform: 'uppercase' }}
                  />
                  <Area type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={5} fill="url(#colorWeight)" animationDuration={3000} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="p-10 border border-white/5 bg-white/[0.01] rounded-[3rem] relative overflow-hidden group">
            <div className="absolute inset-0 bg-emerald-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-8 relative z-10">Cycle Consistency</h4>
            <div className="flex justify-between gap-1 relative z-10">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => {
                const day = adherenceStats?.recentAdherence?.find((a: any) => new Date(a.date).getDay() === ((i + 1) % 7));
                return (
                  <div key={i} className="flex flex-col items-center gap-3 flex-1">
                    <div className={`w-full h-16 rounded-xl border transition-all duration-700 flex items-center justify-center ${day?.status === 'on_track' ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-white/[0.02] border-white/5 opacity-20'}`}>
                      {day?.status === 'on_track' && <Sparkles size={16} className="text-emerald-400 rotate-12"/>}
                    </div>
                    <span className="text-[9px] font-black text-white/10 uppercase">{d}</span>
                  </div>
                );
              })}
            </div>
            <p className="mt-8 text-[9px] text-center font-black text-white/10 tracking-[0.4em] uppercase">Metabolic Uptime: Active</p>
          </div>

          <div className="p-10 border border-white/5 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-[3rem] relative group shadow-2xl">
            <Trophy size={40} className="text-emerald-400 mb-6" />
            <h4 className="text-2xl font-black italic tracking-tighter text-white mb-2">Protocol Badges</h4>
            <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.2em] mb-8">Weekly Distinction Earned</p>
            <div className="flex flex-wrap gap-3">
              {Array.from({ length: adherenceStats?.weeklyAwardCount || 0 }).map((_, i) => (
                 <motion.div 
                   key={i} 
                   whileHover={{ rotate: 15 }}
                   className="w-14 h-14 rounded-2xl bg-white text-black flex items-center justify-center shadow-xl border border-white/20"
                 >
                    <Zap size={20} fill="currentColor" />
                 </motion.div>
              ))}
              <div className="w-14 h-14 rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center opacity-40">
                 <Plus size={16} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function AwardsTab({ adherenceStats, isUnlocked, profile }: any) {
  const points = adherenceStats?.totalPoints || 0;
  const monthlyGoal = 250;
  const pct = Math.min(100, (points / monthlyGoal) * 100);
  const cheatOptions = getCheatSuggestions(3);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 0.98 }} 
      className="space-y-16"
    >
      <header className="text-center max-w-3xl mx-auto space-y-6">
        <h2 className="text-7xl font-black italic tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>Achievement Calibration</h2>
        <p className="text-white/40 text-lg font-medium leading-relaxed italic">Consistency in your nutritional mandate unlocks strategic dietary flexibility. Maintain high-fidelity adherence to access verified bypass rewards.</p>
      </header>

      <div className="max-w-5xl mx-auto p-20 border border-white/5 bg-white/[0.01] rounded-[5rem] relative overflow-hidden text-center shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 blur-[150px] rounded-full" />
        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 mb-10">Monthly Synchronization Cycle</p>
          <div className="inline-flex items-baseline gap-6 mb-12">
            <span className="text-[12rem] font-black tracking-tighter leading-none tabular-nums text-white">{points}</span>
            <span className="text-3xl font-black text-white/10 italic">/ {monthlyGoal} Pts</span>
          </div>
          <div className="h-6 w-full bg-white/[0.02] rounded-full overflow-hidden mb-16 border border-white/5 p-1.5 shadow-inner">
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: `${pct}%` }} 
              transition={{ duration: 2.5, ease: "circOut" }} 
              className="h-full bg-white rounded-full shadow-[0_0_50px_rgba(255,255,255,0.4)] relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-white opacity-40" />
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className={`p-12 border rounded-[3.5rem] transition-all duration-1000 relative group overflow-hidden ${isUnlocked ? 'border-white bg-white text-black' : 'border-white/5 bg-white/[0.02] grayscale opacity-40'}`}
            >
              <Zap size={56} strokeWidth={1.5} className={isUnlocked ? 'text-black' : 'text-white/10'} />
              <h4 className="text-4xl font-black italic tracking-tighter mt-10 mb-4">Cheat Protocol</h4>
              <p className={`text-base leading-relaxed ${isUnlocked ? 'text-black/60 font-medium italic' : 'text-white/20'}`}>
                {isUnlocked ? "SYSTEM AUTHORIZED: Relaxed metabolic constraints enabled for 24-hour cycle. Bio-safety protocols active." : "ACCESS DENIED: Attain 85% volumetric adherence to unlock metabolic bypass."}
              </p>
              {isUnlocked && <button className="mt-10 px-12 py-5 bg-black text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl hover:bg-emerald-500 transition-all">Engage Selection</button>}
            </motion.div>
            
            <div className={`p-12 border rounded-[3.5rem] transition-all duration-1000 relative group overflow-hidden ${points >= 100 ? 'border-emerald-500/20 bg-emerald-500/[0.02]' : 'border-white/5 bg-white/[0.01] opacity-40'}`}>
              <div className="space-y-4">
                {points >= 100 ? (
                  cheatOptions.map((opt, i) => (
                    <div key={i} className="flex justify-between items-center bg-white/[0.03] p-5 rounded-3xl border border-white/5 hover:border-emerald-500/30 transition-all group/opt">
                      <div className="text-left min-w-0">
                        <p className="text-sm font-black italic text-white/80 group-hover/opt:text-emerald-400 transition-colors uppercase truncate">{opt.foodName}</p>
                        <p className="text-[10px] text-white/20 font-black uppercase tracking-widest mt-1">{opt.calories} kcal · {opt.proteinG}g P</p>
                      </div>
                      <Plus size={18} className="text-white/10 group-hover/opt:text-emerald-400" />
                    </div>
                  ))
                ) : (
                  <p className="text-white/20 font-medium italic text-lg py-12">Stabilize 100 pts to reveal high-fidelity nutritional foundation.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}


function SettingsTab({ profile, onUpdate }: any) {
  const [formData, setFormData] = useState({
    name: getUser()?.name || "",
    age: profile?.age || "",
    gender: profile?.gender || "male",
    heightCm: profile?.heightCm || "",
    weightKg: profile?.weightKg || "",
    goalType: profile?.goalType || "general_health",
    dietPreference: profile?.dietPreference || "omnivore",
    activityLevel: profile?.activityLevel || "sedentary",
    coachEnabled: profile?.coachEnabled || false
  });

  const [userName, setUserName] = useState(getUser()?.name || "");
  const [saving, setSaving] = useState(false);

  const goals = [
    { id: "lose_weight", label: "Reduce Mass" },
    { id: "gain_muscle", label: "Hypertrophy" },
    { id: "maintain_weight", label: "Equilibrium" },
    { id: "improve_endurance", label: "Endurance" },
    { id: "general_health", label: "Vitality" }
  ];

  const genders = [
    { value: 'male', label: 'Biological Male' },
    { value: 'female', label: 'Biological Female' },
    { value: 'other', label: 'Bypass Binary' }
  ];

  const diets = [
    { id: "omnivore", label: "Omnivore" },
    { id: "vegetarian", label: "Vegetarian" },
    { id: "vegan", label: "Vegan" },
    { id: "keto", label: "Keto" },
    { id: "paleo", label: "Paleo" }
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      await upsertProfile({ ...formData, name: userName });
      onUpdate();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl space-y-20 pb-20">
      <header>
        <h2 className="text-6xl font-black italic tracking-tighter mb-4" style={{ fontFamily: 'var(--font-display)' }}>System Architecture</h2>
        <p className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.4em]">Configuration: Biological & Algorithmic Parameters</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-16">
        <div className="space-y-10">
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-4 block">Biological Identifier</label>
            <input 
              type="text" 
              value={userName} 
              onChange={(e) => setUserName(e.target.value)} 
              className="w-full bg-white/[0.02] border-b border-white/10 p-6 text-2xl font-black italic text-white focus:border-emerald-500 outline-none transition-all placeholder:text-white/5"
              placeholder="Entity Name"
            />
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-4 block">Age Cycle</label>
              <input 
                type="number" 
                value={formData.age} 
                onChange={(e) => setFormData({...formData, age: e.target.value})} 
                className="w-full bg-white/[0.02] border-b border-white/10 p-6 text-2xl font-black italic text-white focus:border-emerald-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-4 block">Target Mass (kg)</label>
              <input 
                type="number" 
                value={formData.weightKg} 
                onChange={(e) => setFormData({...formData, weightKg: e.target.value})} 
                className="w-full bg-white/[0.02] border-b border-white/10 p-6 text-2xl font-black italic text-white focus:border-emerald-500 outline-none transition-all"
              />
            </div>
          </div>

          <div>
             <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-6 block">Gender Protocol</label>
             <div className="flex flex-wrap gap-3">
               {genders.map(g => (
                 <button 
                  key={g.value}
                  onClick={() => setFormData({...formData, gender: g.value})}
                  className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${formData.gender === g.value ? 'bg-white text-black border-white' : 'bg-white/[0.02] border-white/5 text-white/40 hover:border-white/20'}`}
                 >
                   {g.label}
                 </button>
               ))}
             </div>
          </div>
        </div>

        <div className="space-y-10">
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-6 block">Optimization Directive</label>
            <div className="grid grid-cols-1 gap-3">
              {goals.map(g => (
                <button 
                  key={g.id}
                  onClick={() => setFormData({...formData, goalType: g.id})}
                  className={`w-full text-left p-6 rounded-[2rem] border transition-all flex justify-between items-center group ${formData.goalType === g.id ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-white/[0.01] border-white/5 text-white/20 hover:border-white/20'}`}
                >
                  <span className="font-black italic tracking-tighter text-xl uppercase">{g.label}</span>
                  <div className={`w-3 h-3 rounded-full border-2 ${formData.goalType === g.id ? 'bg-emerald-400 border-emerald-400' : 'border-white/10'}`} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-6 block">Nutritional Framework</label>
            <div className="flex flex-wrap gap-3">
              {diets.map(d => (
                <button 
                  key={d.id}
                  onClick={() => setFormData({...formData, dietPreference: d.id})}
                  className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${formData.dietPreference === d.id ? 'bg-white text-black border-white' : 'bg-white/[0.02] border-white/5 text-white/40 hover:border-white/20'}`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-16 border-t border-white/5">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl"><Activity size={24}/></div>
          <div>
            <p className="font-black italic text-white text-lg">AI Coach Synchronization</p>
            <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em] mt-1">Real-time physiological auditing active</p>
          </div>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="px-16 py-6 bg-white text-black font-black uppercase tracking-[0.3em] text-xs rounded-[2.5rem] hover:bg-emerald-500 hover:text-white transition-all shadow-[0_20px_50px_rgba(0,0,0,0.3)] disabled:opacity-50"
        >
          {saving ? "Synchronizing..." : "Initialize Update"}
        </button>
      </div>
    </motion.div>
  );
}

function AddMealModal({ 
  onClose, onSuccess, profile, pendingItem, inline = false
}: { 
  onClose: () => void; 
  onSuccess: () => void;
  profile: Profile | null;
  pendingItem: any | null;
  inline?: boolean;
}) {
  useEffect(() => {
    if (!inline) document.body.style.overflow = "hidden";
    if (pendingItem) {
       addItem({
         ...pendingItem,
         userQuantity: pendingItem.servingSize,
         userUnit: pendingItem.servingUnit
       });
       setIsAiMode(false);
    }
    return () => {
      if (!inline) document.body.style.overflow = "unset";
    };
  }, [pendingItem, inline]);

  const [mealType, setMealType] = useState<string>("breakfast");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [aiInput, setAiInput] = useState("");
  const [isAiMode, setIsAiMode] = useState(true);
  const [isInterpreting, setIsInterpreting] = useState(false);

  const handleAiInterpret = async () => {
    if (!aiInput.trim()) return;
    setIsInterpreting(true);
    setError("");
    try {
      const res = await interpretMeal(aiInput);
      if (res.data && res.data.length > 0) {
        const newItems = res.data.map((f: any) => ({
          foodName: f.label,
          servingSize: f.servingSize || 100,
          servingUnit: f.servingUnit || "g",
          calories: f.calories,
          proteinG: f.protein,
          carbsG: f.carbs,
          fatG: f.fat,
          fiberG: f.fiber || 0,
          userQuantity: f.servingSize || 100,
          userUnit: f.servingUnit || "g",
          category: "snack" as const
        }));

        setItems(prev => [...prev, ...newItems]);
        setAiInput("");
        setIsAiMode(false);
      }
    } catch (err: any) {
      setError(err.message || "Neural engine encountered a bottleneck. Try a simpler prompt.");
    } finally {
      setIsInterpreting(false);
    }
  };

  const addItem = (food: FoodSuggestion) => {
    setItems(prev => [...prev, { 
      ...food, 
      userQuantity: food.servingSize, 
      userUnit: food.servingUnit 
    }]);
  };

  const addItemFromSearch = (food: any) => {
    setItems(prev => [...prev, {
      foodName: food.label,
      servingSize: 100,
      servingUnit: "g",
      calories: Math.round(food.calories),
      proteinG: Math.round(food.protein),
      carbsG: Math.round(food.carbs),
      fatG: Math.round(food.fat),
      fiberG: Math.round(food.fiber || 0),
      userQuantity: 100,
      userUnit: "g",
      category: "snack"
    }]);
    setSearchTerm("");
    setSearchResults([]);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.length > 2) {
        setIsSearching(true);
        try {
          const results = await searchNutrition(searchTerm);
          setSearchResults(results);
        } catch (err) {
          console.error(err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateItemQty = (index: number, val: number) => {
    setItems(prev => {
      const next = [...prev];
      next[index] = { ...next[index], userQuantity: val };
      return next;
    });
  };

  const updateItemUnit = (index: number, unit: string) => {
    setItems(prev => {
      const next = [...prev];
      next[index] = { ...next[index], userUnit: unit };
      return next;
    });
  };

  const getScaledMacro = (item: any, macroKey: string) => {
    const scaled = scaleMacros(
      {
        calories: item.calories,
        proteinG: item.proteinG,
        carbsG: item.carbsG,
        fatG: item.fatG,
        fiberG: item.fiberG,
      },
      item.servingSize,
      item.servingUnit,
      item.userQuantity,
      item.userUnit
    );
    return (scaled as any)[macroKey] || 0;
  };

  const totalCal = items.reduce((sum, item) => sum + getScaledMacro(item, 'calories'), 0);
  const totalProtein = items.reduce((sum, item) => sum + getScaledMacro(item, 'proteinG'), 0);

  const handleSubmit = async () => {
    if (items.length === 0) {
      setError("Add at least one food item to finalize the log");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await createMealLog(mealType, undefined);
      const logId = res.data.id;
      
      await Promise.all(items.map(item => 
        addMealLogItem(logId, {
          foodName: item.foodName,
          servingSize: item.userQuantity,
          servingUnit: item.userUnit,
          calories: getScaledMacro(item, 'calories'),
          proteinG: getScaledMacro(item, 'proteinG'),
          carbsG: getScaledMacro(item, 'carbsG'),
          fatG: getScaledMacro(item, 'fatG'),
          fiberG: getScaledMacro(item, 'fiberG'),
        })
      ));

      onSuccess();
    } catch (err: any) {
      setError(err.message || "System synchronization failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div className={`relative flex flex-col h-full ${inline ? 'bg-transparent' : ''}`}>
      {/* Fixed Header */}
      {!inline && (
        <div className="flex justify-between items-start p-10 lg:p-12 pb-6 border-b border-white/5 bg-[#050505]/80 backdrop-blur-md z-20">
          <div>
            <h2 className="text-4xl font-black italic tracking-tighter text-white" style={{ fontFamily: 'var(--font-display)' }}>Neural Entry Hub</h2>
            <p className="text-[11px] text-emerald-400 font-bold uppercase tracking-[0.4em] mt-3">Protocol: 100% Text-Only Brain Active</p>
          </div>
          <button onClick={onClose} className="p-4 border border-white/5 hover:border-emerald-500/20 bg-white/[0.02] transition-all rounded-2xl group">
            <X size={20} className="text-white/20 group-hover:text-emerald-400" />
          </button>
        </div>
      )}

      {/* Scrollable Content Body */}
      <div className={`flex-1 overflow-y-auto overscroll-contain custom-scrollbar p-10 lg:p-12 pt-8 ${inline ? 'h-[75vh]' : ''}`}>
        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }} 
            animate={{ opacity: 1, x: 0 }}
            className="mb-8 p-6 border border-emerald-500/10 bg-emerald-500/5 text-emerald-400 text-xs font-bold italic rounded-2xl"
          >
            System Error: {error}
          </motion.div>
        )}

        <div className="space-y-12">
          {/* Meal Type Section */}
          <div className="space-y-6">
            <label className="text-[13px] text-white/80 tracking-[0.4em] font-black uppercase" style={{ fontFamily: 'var(--font-label)' }}>Target Interval</label>
            <div className="flex flex-wrap gap-2">
              {["breakfast", "lunch", "dinner", "snack"].map(t => (
                <button 
                  key={t} 
                  onClick={() => setMealType(t)}
                  className={`px-8 py-3.5 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all border ${
                    mealType === t ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'border-white/5 text-white/20 hover:text-white/40 hover:bg-white/[0.02]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Main Interface */}
          <div className="space-y-6">
            <div className="flex justify-between items-center px-1">
              <label className="text-[13px] text-white/80 tracking-[0.4em] font-black uppercase">
                {isAiMode ? "Smart Intelligence Mode" : "Standard Manual Override"}
              </label>
              <button 
                onClick={() => setIsAiMode(!isAiMode)}
                className={`flex items-center gap-3 px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${isAiMode ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/5 border-white/5 text-white/20'}`}
              >
                <Sparkles size={12} />
                {isAiMode ? "AI Active" : "Manual Entry"}
              </button>
            </div>

            {isAiMode ? (
              <div className="space-y-6">
                <div className="relative group">
                  <textarea 
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder='Describe your meal like a scientist. "120g seared sea bass with a handful of microgreens and half a cup of quinoa"...'
                    className="w-full h-44 bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] focus:border-emerald-500/20 outline-none text-base italic leading-relaxed text-white/80 placeholder:text-white/40 resize-none transition-all custom-scrollbar"
                  />
                  <div className="absolute bottom-6 right-8 flex gap-3">
                    <div className="px-3 py-1.5 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                      <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Neural Link v1.5 Stable</span>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={handleAiInterpret}
                  disabled={isInterpreting || !aiInput.trim()}
                  className="w-full py-6 bg-white text-black hover:bg-emerald-400 hover:text-white transition-all rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 disabled:opacity-20"
                >
                  {isInterpreting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full" />
                      Analyzing Physiological Impact...
                    </>
                  ) : (
                    <>Deconstruct Meal Composition <ChevronRight size={16}/></>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="relative group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-emerald-400 transition-colors" size={18} />
                  <input 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-16 pr-6 py-6 bg-white/[0.02] border border-white/5 focus:border-emerald-500/20 outline-none text-sm text-white placeholder:text-white/40 rounded-[1.5rem] transition-all"
                    placeholder="Search Edamam Food Database..."
                  />
                  {isSearching && (
                     <div className="absolute right-6 top-1/2 -translate-y-1/2">
                       <div className="w-5 h-5 border-2 border-emerald-500/10 border-t-emerald-500 animate-spin rounded-full"></div>
                     </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-8">
                  {searchTerm.length > 2 ? (
                    searchResults.map((food, i) => (
                      <button 
                        key={i}
                        onClick={() => addItemFromSearch(food)}
                        className="group border border-white/5 p-4 text-left hover:border-emerald-500/20 hover:bg-emerald-500/[0.02] transition-all flex justify-between items-center rounded-2xl relative overflow-hidden"
                      >
                        <div className="flex gap-4 items-center min-w-0">
                          {food.image && <img src={food.image} alt="" className="w-12 h-12 rounded-xl object-cover border border-white/5 shadow-2xl" />}
                          <div className="min-w-0">
                            <p className="text-[13px] font-black italic tracking-tight truncate">{food.label}</p>
                            <p className="text-[9px] text-white/20 mt-1 font-bold uppercase tracking-widest">{Math.round(food.calories)} kcal · {Math.round(food.protein)}g P</p>
                          </div>
                        </div>
                        <Plus size={16} className="text-white/10 group-hover:text-emerald-400 transition-colors flex-shrink-0" />
                      </button>
                    ))
                  ) : (
                    getSuggestions(profile?.goalType || null, profile?.dietPreference || null, 6).map((food, i) => (
                      <button 
                        key={i}
                        onClick={() => addItem(food)}
                        className="group border border-white/5 p-5 text-left hover:border-emerald-500/30 hover:bg-emerald-500/[0.03] transition-all flex justify-between items-center rounded-[1.5rem] relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <Sparkles size={10} className="text-emerald-400/20" />
                        </div>
                        <div>
                          <p className="text-[13px] font-black italic tracking-tight">{food.foodName}</p>
                          <p className="text-[9px] text-white/20 mt-1 font-black uppercase tracking-[0.2em]">{food.calories} kcal · {food.proteinG}g P</p>
                        </div>
                        <Plus size={16} className="text-white/10 group-hover:text-emerald-400 transition-colors" />
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Selected Items Feed */}
          {items.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pt-4 border-t border-white/5">
              <div className="flex justify-between items-baseline px-1">
                <label className="text-[13px] text-white/80 tracking-[0.4em] font-black uppercase">Consolidated Intake Breakdown</label>
                <span className="text-sm font-black italic tracking-tighter text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]">{totalCal} kcal · {totalProtein}g protein</span>
              </div>
              <div className="flex flex-col gap-3">
                {items.map((item, i) => (
                  <div key={i} className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border border-white/5 p-6 bg-white/[0.01] rounded-[2rem] group/item transition-all hover:bg-white/[0.02]">
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-black italic tracking-tight truncate text-white/90">{item.foodName}</p>
                      <div className="flex items-center gap-3 mt-2">
                         <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                           {getScaledMacro(item, 'calories')} kcal
                         </span>
                         <span className="text-[9px] text-white/20 font-bold uppercase tracking-widest">
                           {getScaledMacro(item, 'proteinG')}g protein
                         </span>
                      </div>
                    </div>

                    <div className="flex flex-col flex-1 w-full gap-4">
                      <div className="flex items-center gap-2 bg-white/[0.02] border border-white/5 p-1.5 rounded-2xl group-hover/item:border-emerald-500/20 transition-all max-w-fit">
                        <input 
                          type="number"
                          value={item.userQuantity ?? 0}
                          onChange={(e) => updateItemQty(i, parseFloat(e.target.value) || 0)}
                          className="w-16 bg-transparent outline-none text-right text-[11px] font-black text-emerald-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <select 
                          value={item.userUnit ?? "g"}
                          onChange={(e) => updateItemUnit(i, e.target.value)}
                          className="bg-transparent outline-none text-[9px] font-black uppercase text-white/40 cursor-pointer pr-2 hover:text-white transition-colors"
                        >
                          {Object.keys(UNIT_MAP).map(u => (
                            <option key={u} value={u} className="bg-[#050505]">{u}</option>
                          ))}
                        </select>
                      </div>
                      
                      <MetabolicRuler 
                        value={item.userQuantity} 
                        onChange={(val) => updateItemQty(i, val)} 
                        unit={item.userUnit}
                        max={item.userUnit === 'g' ? 1000 : (item.userUnit === 'oz' ? 32 : 10)}
                      />
                    </div>

                    <button onClick={() => removeItem(i)} className="p-3 text-white/5 hover:text-rose-500/60 hover:bg-rose-500/5 transition-all rounded-xl">
                      <X size={14} strokeWidth={3} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Spacer for bottom overlap prevention */}
        <div className="h-32" />
      </div>

      {/* Fixed Footer */}
      <div className={`p-10 lg:p-12 pt-6 border-t border-white/5 bg-[#050505]/80 backdrop-blur-md z-20 mt-auto ${inline ? 'rounded-b-[3.5rem]' : ''}`}>
        <button 
          onClick={handleSubmit}
          disabled={loading || items.length === 0}
          className="w-full py-7 flex items-center justify-center gap-4 text-base bg-emerald-500 text-white hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed font-black uppercase tracking-[0.3em] rounded-3xl shadow-[0_20px_50px_rgba(16,185,129,0.2)]"
        >
          {loading ? (
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin rounded-full" />
              Syncing Protocol...
            </div>
          ) : (
            <>Finalize Daily Log <ChevronRight size={18} strokeWidth={3}/></>
          )}
        </button>
      </div>
    </div>
  );

  if (inline) return content;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xl flex items-center justify-center p-6 lg:p-12 overflow-hidden"
      onClick={onClose}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 40 }}
        transition={{ type: "spring", damping: 30, stiffness: 200 }}
        className="bg-[#050505] border border-white/5 w-full max-w-2xl h-[85vh] overflow-hidden rounded-[3.5rem] relative shadow-[0_40px_100px_rgba(0,0,0,0.8)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 bg-grain opacity-[0.03] pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full" />
        {content}
      </motion.div>
    </motion.div>
  );
}

/**
 * IntakeTab
 * Dedicated interface for logging meals, integrated directly into the dashboard flow.
 */
function IntakeTab({ profile, onSuccess, pendingItem }: { profile: any, onSuccess: () => void, pendingItem: any }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }} 
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-4xl mx-auto"
    >
      <div className="mb-12">
        <h2 className="text-6xl font-black italic tracking-tighter mb-4" style={{ fontFamily: 'var(--font-display)' }}>Neural Entry Hub</h2>
        <p className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.4em]">Protocol: Systematic Intake Documentation Active</p>
      </div>

      <div className="bg-[#080808] border border-white/5 rounded-[4rem] overflow-hidden shadow-2xl">
        <AddMealModal 
          inline={true}
          onClose={() => {}} 
          onSuccess={onSuccess}
          profile={profile}
          pendingItem={pendingItem}
        />
      </div>
    </motion.div>
  );
}

// ─── COMMUNITY TAB ──────────────────────────────────────────────────────────




function CommunityTab({ userName }: { userName: string }) {
  const [tribes, setTribes] = useState<any[]>([]);
  const [selectedTribe, setSelectedTribe] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);

  useEffect(() => {
    loadTribes();
  }, []);

  const loadTribes = async () => {
    try {
      setLoading(true);
      const res = await listTribes();
      setTribes(res.data);
      if (res.data.length > 0 && !selectedTribe) {
        handleSelectTribe(res.data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTribe = async (tribe: any) => {
    setSelectedTribe(tribe);
    try {
      const res = await getLeaderboard(tribe.slug);
      setLeaderboard(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleJoin = async (slug: string) => {
    setJoining(slug);
    try {
      await joinTribe(slug);
      loadTribes(); // refresh counts
    } catch (err: any) {
      alert(err.message);
    } finally {
      setJoining(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
      <header className="max-w-3xl">
        <h2 className="text-4xl font-black italic tracking-tighter mb-4" style={{ fontFamily: 'var(--font-display)' }}>The Social Protocol</h2>
        <p className="text-white/40 text-lg">Health is a team sport. Join an official Tribe to compare notes, sync progress, and climb the local leaderboards.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/20">Discovery Feed</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tribes.map((tribe) => (
              <div 
                key={tribe.id} 
                onClick={() => handleSelectTribe(tribe)}
                className={`p-8 border rounded-[2.5rem] transition-all cursor-pointer group relative overflow-hidden ${
                  selectedTribe?.slug === tribe.slug 
                    ? 'border-emerald-500/40 bg-emerald-500/[0.03]' 
                    : 'border-white/5 bg-white/[0.01] hover:border-white/10'
                }`}
              >
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-xl font-black italic tracking-tighter group-hover:text-emerald-400 transition-colors">{tribe.name}</h4>
                    <div className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-white/40">{tribe.memberCount} Members</div>
                  </div>
                  <p className="text-xs text-white/30 leading-relaxed mb-8 h-10 overflow-hidden line-clamp-2">{tribe.description}</p>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleJoin(tribe.slug); }}
                    disabled={joining === tribe.slug}
                    className={`w-full py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                      joining === tribe.slug ? 'opacity-50' : 'hover:scale-[1.02]'
                    } ${
                      selectedTribe?.slug === tribe.slug ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-white/5 text-white/40 hover:bg-white/10'
                    }`}
                  >
                    {joining === tribe.slug ? "Processing..." : "Join Tribe"}
                  </button>
                </div>
                <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity">
                   <Target size={100} strokeWidth={1} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/20 mb-6">Tribe Champions</h3>
          <div className="border border-white/5 bg-white/[0.01] rounded-[2.5rem] p-8">
            <h4 className="text-sm font-black italic tracking-tighter text-emerald-400 mb-8 uppercase tracking-widest">{selectedTribe?.name} Rankings</h4>
            <div className="space-y-6">
              {leaderboard.length === 0 ? (
                <p className="text-xs text-white/20 italic text-center py-10">Waiting for first cohort to verify...</p>
              ) : (
                leaderboard.map((user, i) => {
                  const isUser = user.userName === userName;
                  return (
                    <motion.div 
                      key={i} 
                      whileHover={{ x: 4 }}
                      className={`flex items-center gap-5 group p-2 rounded-2xl transition-all ${isUser ? 'bg-emerald-500/5 border border-emerald-500/10' : ''}`}
                    >
                      <div className={`w-12 h-12 rounded-[1rem] flex items-center justify-center font-black text-sm relative overflow-hidden transition-all ${
                        i === 0 ? 'bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.4)] scale-110' : 
                        i === 1 ? 'bg-white/20 text-white' : 
                        i === 2 ? 'bg-white/10 text-white/60' : 'bg-white/5 text-white/20'
                      }`}>
                        {i + 1}
                        {i < 3 && <div className="absolute inset-0 bg-white/10 animate-pulse" />}
                      </div>
                      <div className="flex-1">
                         <p className={`text-sm font-bold uppercase tracking-tight transition-colors ${i === 0 ? 'text-emerald-400' : 'text-white/80'} ${isUser ? 'underline decoration-emerald-500/40 underline-offset-4' : ''}`}>
                           {user.userName} {isUser && <span className="text-[8px] ml-2 text-emerald-400/60 font-black tracking-[0.2em]">(YOU)</span>}
                         </p>
                         <div className="flex items-center gap-3 mt-1">
                           <p className="text-[10px] text-white/20 font-black tracking-widest uppercase">{user.points} Protocol Points</p>
                           {i === 0 && <div className="px-2 py-0.5 bg-emerald-500/10 rounded-md text-[7px] font-black text-emerald-400 uppercase tracking-tighter">Current Apex</div>}
                         </div>
                      </div>
                      <div className="flex-shrink-0">
                        {i === 0 ? <Trophy size={20} strokeWidth={2.5} className="text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]" /> : 
                         i === 1 ? <Target size={16} className="text-white/20" /> : 
                         i === 2 ? <Activity size={16} className="text-white/10" /> : null}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
            <div className="mt-10 pt-10 border-t border-white/5 text-center">
                <p className="text-[10px] text-white/20 font-bold uppercase tracking-[0.3em]">Next Cycle: Monday 00:00</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CoachModal({ onClose, coachInsights }: any) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 text-white">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-3xl" 
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-6xl h-[85vh] bg-[#0a0a0a] border border-white/5 rounded-[3rem] p-10 md:p-14 relative z-10 shadow-[0_50px_100px_rgba(0,0,0,1)] overflow-hidden flex flex-col"
      >
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
           <Sparkles size={200} strokeWidth={0.5} />
        </div>

        <button onClick={onClose} className="absolute top-12 right-12 p-4 text-white/20 hover:text-white transition-colors">
          <X size={24} />
        </button>

        <div className="mb-16">
          <p className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.5em] mb-4">Precision Nutrition Analysis</p>
          <h2 className="text-5xl font-black italic tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>Nutritional Intelligence Assistant</h2>
        </div>

        <div className="relative z-10">
          <AICoachChat />

          <div className="pt-8 border-t border-white/5 mt-8">
             <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.4em] text-center italic">Calculated in real-time based on active physiological mandates.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

