"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, Utensils, TrendingUp, Trophy, Settings, 
  LogOut, Search, Bell, Flame, Target, Zap, Plus, X, Sparkles, ChevronRight, Camera, Image as ImageIcon
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { 
  getProfile, getDailyStats, getWeeklyStats, getMealLogs, 
  createMealLog, addMealLogItem, getUser, logout, getToken,
  searchNutrition, interpretMeal, logWeight, getWeightHistory, getAdherenceStats,
  upsertProfile, analyzeImage, getCoachInsights

} from "@/utils/api";


import { getSuggestions, getAllFoodsForDiet, getCheatSuggestions, type FoodSuggestion } from "@/utils/SuggestionEngine";


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
  { icon: <Utensils size={20} />, label: "Diet Plan", id: "diet" },
  { icon: <TrendingUp size={20} />, label: "Progress", id: "progress" },
  { icon: <Trophy size={20} />, label: "Awards", id: "awards" },
  { icon: <Sparkles size={20} />, label: "Community", id: "community" },
  { icon: <Settings size={20} />, label: "Settings", id: "settings" },
];



// ─── MAIN DASHBOARD ─────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [todayMeals, setTodayMeals] = useState<MealLog[]>([]);
  const [suggestions, setSuggestions] = useState<FoodSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [userName, setUserName] = useState("User");
  
  // New States
  const [weightHistory, setWeightHistory] = useState<any[]>([]);
  const [adherenceStats, setAdherenceStats] = useState<any>(null);
  const [isCheatDayUnlocked, setIsCheatDayUnlocked] = useState(false);
  const [historyMeals, setHistoryMeals] = useState<MealLog[]>([]);
  const [coachInsights, setCoachInsights] = useState<any>(null);
  const [tribes, setTribes] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any>(null);





  // Auth guard
  useEffect(() => {
    if (!getToken()) {
      router.push("/auth/login");
      return;
    }
    const user = getUser();
    if (user) setUserName(user.name);
  }, [router]);

  // Load all data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [profileRes, dailyRes, weeklyRes, mealsRes] = await Promise.allSettled([
        getProfile(),
        getDailyStats(),
        getWeeklyStats(),
        getMealLogs(1, 10),
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
        setTodayMeals(mealsRes.value.data);
      }
      
      // Fetch History & Progress Data
      const [historyRes, weightRes, adherenceRes] = await Promise.allSettled([
        getMealLogs(1, 20), // Fetch history (no date filter)
        getWeightHistory(),
        getAdherenceStats()
      ]);
      
      if (historyRes.status === "fulfilled") {
        // Filter out today's meals from history to avoid duplicates
        const todayIds = new Set(todayMeals.map(m => m.id));
        setHistoryMeals(historyRes.value.data.filter((m: any) => !todayIds.has(m.id)));
      }
      
      if (weightRes.status === "fulfilled") setWeightHistory(weightRes.value);
      if (adherenceRes.status === "fulfilled") {
        setAdherenceStats(adherenceRes.value);
        setIsCheatDayUnlocked(adherenceRes.value.awards.some((a: any) => a.type === 'cheat_day_unlock'));
      }

      // Fetch AI Coach Insights
      try {
        const coachRes = await getCoachInsights();
        setCoachInsights(coachRes);
      } catch (err) {
        console.error("Coach insights load error:", err);
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
    <div className="flex min-h-screen bg-base-dark text-white">
      {/* ─── SIDEBAR ────────────────────────────────────────── */}
      <aside className="w-64 border-r border-white/5 bg-[#080808] flex flex-col p-6">
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>SmartPlate</h2>
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
      <main className="flex-1 p-10 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === "overview" && <OverviewTab key="overview" profile={profile} userName={userName} calPct={calPct} proteinPct={proteinPct} calCurrent={calCurrent} calTarget={calTarget} proteinCurrent={proteinCurrent} proteinTarget={proteinTarget} mealCount={mealCount} yesterdayData={weeklyData} todayMeals={todayMeals} historyMeals={historyMeals} suggestions={suggestions} coachInsights={coachInsights} goalLabel={goalLabel} onAddMeal={() => setShowAddMeal(true)} onToggleCoach={() => loadData()} setActiveTab={setActiveTab} />}

          {activeTab === "community" && <CommunityTab key="community" />}



          {activeTab === "diet" && <DietPlanTab key="diet" profile={profile} goalLabel={goalLabel} />}
          {activeTab === "progress" && <ProgressTab key="progress" weightHistory={weightHistory} adherenceStats={adherenceStats} onLogWeight={(w: number) => { logWeight(w); loadData(); }} />}

          {activeTab === "awards" && <AwardsTab key="awards" adherenceStats={adherenceStats} isUnlocked={isCheatDayUnlocked} profile={profile} />}
          {activeTab === "settings" && <SettingsTab key="settings" profile={profile} onUpdate={() => loadData()} />}
        </AnimatePresence>
      </main>

      {/* ─── ADD MEAL MODAL ──────────────────────────────────── */}
      <AnimatePresence>
        {showAddMeal && (
          <AddMealModal 
            onClose={() => setShowAddMeal(false)} 
            onSuccess={() => { setShowAddMeal(false); loadData(); }}
            profile={profile}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── ADD MEAL MODAL ─────────────────────────────────────────────────────────


// ─── TAB COMPONENTS ─────────────────────────────────────────────────────────

function OverviewTab({ profile, userName, calPct, proteinPct, calCurrent, calTarget, proteinCurrent, proteinTarget, mealCount, yesterdayData, todayMeals, historyMeals, suggestions, coachInsights, goalLabel, onAddMeal, setActiveTab }: any) {

  const getAlignmentColor = (meal: any) => {
    if (!profile?.dailyCalorieTarget) return "text-white/40";
    const targetPerMeal = profile.dailyCalorieTarget / 4;
    const calories = meal.totals?.calories || 0;
    const diff = Math.abs(calories - targetPerMeal) / targetPerMeal;

    if (diff <= 0.15) return "text-emerald-400"; // Green: Aligned
    if (diff <= 0.30) return "text-amber-400";   // Yellow: Moderate
    return "text-rose-400";                     // Red: Opposing
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -10 }}
      className="space-y-10"
    >
      <header className="flex justify-between items-center">
        <div>
          <p className="text-xs text-white/30 mb-2 tracking-wider font-bold uppercase" style={{ fontFamily: 'var(--font-label)' }}>
            System Status: {calPct > 90 ? "Optimal Protocol" : "Standby"}
          </p>
          <h1 className="text-5xl font-black text-white tracking-tighter italic" style={{ fontFamily: 'var(--font-display)' }}>{greeting()}, {userName.split(" ")[0]}.</h1>
        </div>
        <div className="flex gap-4 items-center">
          <div className="text-right mr-4 hidden md:block">
            <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">Active Protocol</p>
            <p className="text-sm font-bold text-emerald-400/80">{goalLabel(profile?.goalType || null)}</p>
          </div>
          <button className="p-3 border border-white/5 hover:border-emerald-400/20 bg-white/[0.02] transition-all relative rounded-xl group">
            <Bell size={20} className="text-white/30 group-hover:text-emerald-400/60" />
            <div className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full" />
          </button>
        </div>
      </header>

      {/* AI COACH INSIGHT CARD */}
      <div className="p-1 border border-white/5 bg-white/[0.01] rounded-[2.5rem] relative overflow-hidden group/coach">
        <div className="p-8 flex flex-col md:flex-row gap-8 items-center justify-between relative z-10">
          <div className="flex gap-6 items-center">
            <div className={`p-5 rounded-3xl ${coachInsights?.enabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-white/20'}`}>
               <Sparkles size={32} />
            </div>
            <div>
              <h3 className="text-xl font-black italic tracking-tighter text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>AI Health Coach</h3>
              <p className="max-w-xl text-sm font-medium text-white/60 leading-relaxed italic">
                {coachInsights?.enabled 
                  ? coachInsights.data?.advice 
                  : "Enable the AI Coach in the settings to get personalized daily nutritional advice and meal suggestions."}
              </p>
            </div>
          </div>
          {!coachInsights?.enabled && (
            <button 
              onClick={() => setActiveTab('settings')}
              className="px-8 py-4 bg-white/[0.03] border border-white/10 hover:border-white/20 text-white/60 hover:text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all"
            >Configure Coach</button>
          )}
          {coachInsights?.enabled && coachInsights.data?.suggestion && (
            <div className="px-6 py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center">
               <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400/60 mb-1">Focus Target</p>
               <p className="text-lg font-black italic tracking-tighter text-emerald-400">+{coachInsights.data.suggestion.amount}{coachInsights.data.suggestion.unit} {coachInsights.data.suggestion.type}</p>
            </div>
          )}
        </div>
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/coach:opacity-20 transition-opacity">
           <Zap size={120} strokeWidth={1} />
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Calories", value: calCurrent.toLocaleString(), sub: `/ ${calTarget.toLocaleString()} kcal`, icon: <Flame className="text-emerald-400" size={18}/>, pct: calPct, color: "bg-emerald-400/40" },
          { label: "Protein", value: `${proteinCurrent}g`, sub: `/ ${proteinTarget}g`, icon: <Zap className="text-blue-400" size={18}/>, pct: proteinPct, color: "bg-blue-400/40" },
          { label: "Efficiency", value: `${Math.round(calPct)}%`, sub: "utilization", icon: <TrendingUp className="text-amber-400" size={18}/>, pct: calPct, color: "bg-amber-400/40" },
          { label: "Goal Progress", value: "Phase 1", sub: "tracking active", icon: <Target className="text-white/40" size={18}/>, pct: 100, color: "bg-white/20" },
        ].map((stat, i) => (
          <div key={i} className="p-8 border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all group rounded-[2rem] relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <span className="text-[10px] tracking-[0.2em] text-white/30 uppercase font-black" style={{ fontFamily: 'var(--font-label)' }}>{stat.label}</span>
              <div className="p-2.5 border border-white/5 group-hover:border-emerald-400/20 transition-colors rounded-xl">{stat.icon}</div>
            </div>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-black italic tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>{stat.value}</span>
              <span className="text-[10px] text-white/20 font-black uppercase tracking-widest">{stat.sub}</span>
            </div>
            <div className="h-[2px] w-full bg-white/5 overflow-hidden rounded-full">
              <motion.div initial={{ width: 0 }} animate={{ width: `${stat.pct}%` }} transition={{ duration: 1.5, delay: i * 0.1 }} className={`h-full ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 border border-white/5 p-8 bg-white/[0.01] rounded-[2.5rem] relative overflow-hidden">
          <div className="flex justify-between items-center mb-10 relative z-10">
            <div>
              <h3 className="text-2xl font-black italic tracking-tighter text-white" style={{ fontFamily: 'var(--font-display)' }}>Biometric Analytics</h3>
              <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em] mt-1">Caloric Intensity Spectrum</p>
            </div>
            <div className="flex gap-2">
               <div className="flex items-center gap-2 px-3 py-1.5 border border-white/5 bg-white/[0.02] rounded-lg">
                 <div className="w-2 h-2 rounded-full bg-emerald-400" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Target Intensity</span>
               </div>
            </div>
          </div>
          <div className="h-[350px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={yesterdayData}>
                <defs>
                  <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                <XAxis dataKey="name" stroke="none" tick={{ fill: '#4a665a', fontSize: 10, fontWeight: 700 }} />
                <YAxis stroke="none" tick={{ fill: '#4a665a', fontSize: 10, fontWeight: 700 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#031810', border: '1px solid #10b98120', borderRadius: '16px', backdropFilter: 'blur(20px)' }}
                  itemStyle={{ color: '#10b981', fontSize: '12px', fontWeight: 900, textTransform: 'uppercase' }}
                  labelStyle={{ color: '#ffffff40', fontSize: '10px', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="calories" stroke="#10b981" fillOpacity={1} fill="url(#colorCal)" strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border border-white/5 p-8 bg-white/[0.01] rounded-[2.5rem] flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-black italic tracking-tighter text-white" style={{ fontFamily: 'var(--font-display)' }}>Intelligence Feed</h3>
            <button onClick={onAddMeal} className="p-3 bg-emerald-500 text-white hover:bg-emerald-400 transition-all rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <Plus size={18} strokeWidth={3}/>
            </button>
          </div>
          
          <div className="flex-1 space-y-8 overflow-y-auto pr-2 custom-scrollbar">
            {/* Today's Section */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-4 ml-1">Today's Intake</p>
              {todayMeals.length === 0 ? (
                <div className="p-6 border border-dashed border-white/10 rounded-2xl text-center">
                  <p className="text-xs text-white/20 font-bold italic">No data logged for current cycle</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayMeals.map((meal: any) => (
                    <div key={meal.id} className="group">
                      <div className="flex-1 border border-white/5 p-4 flex justify-between items-center bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all rounded-2xl relative overflow-hidden gap-4">
                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/20" />
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          {meal.imageUrl && (
                            <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10 shrink-0">
                               <img src={meal.imageUrl} alt="" className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                               <p className="text-xs font-black italic tracking-tighter uppercase truncate">{meal.mealType}</p>
                               <span className="text-[9px] text-white/20 font-bold">{new Date(meal.loggedAt).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}</span>
                               {meal.imageUrl && <Zap size={10} className="text-emerald-400/60" />}
                            </div>
                            <p className="text-[10px] text-white/40 mt-1 font-bold truncate">{meal.notes || (meal.imageUrl ? "AI Visual Entry" : "Standard Protocol")}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className={`text-sm font-black italic tracking-tighter ${getAlignmentColor(meal)}`}>{meal.totals?.calories || 0} kcal</p>
                          <div className="w-1.5 h-1.5 rounded-full bg-current ml-auto mt-1 opacity-20" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* History Section */}
            {historyMeals.length > 0 && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-4 ml-1">Historical Feed</p>
                <div className="space-y-3 opacity-60 hover:opacity-100 transition-opacity">
                  {historyMeals.slice(0, 5).map((meal: any) => (
                    <div key={meal.id} className="flex justify-between items-center border border-white/5 p-4 bg-white/[0.01] rounded-2xl">
                       <div>
                         <p className="text-[11px] font-black italic tracking-tight uppercase opacity-50">{meal.mealType}</p>
                         <p className="text-[9px] text-white/20 font-bold">{new Date(meal.loggedAt).toLocaleDateString("en", { month: 'short', day: 'numeric' })}</p>
                       </div>
                       <p className={`text-xs font-black italic tracking-tighter ${getAlignmentColor(meal)}`}>{meal.totals?.calories || 0} kcal</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}


function DietPlanTab({ profile, goalLabel }: any) {
  const targets = [
    { label: "Calories", value: profile?.dailyCalorieTarget || 2000, color: "from-orange-500/20 to-orange-500/5", ring: "border-orange-500/40", unit: "kcal" },
    { label: "Protein", value: profile?.dailyProteinTargetG || 150, color: "from-blue-500/20 to-blue-500/5", ring: "border-blue-500/40", unit: "g" },
    { label: "Carbs", value: profile?.dailyCarbsTargetG || 200, color: "from-green-500/20 to-green-500/5", ring: "border-green-500/40", unit: "g" },
    { label: "Fats", value: profile?.dailyFatTargetG || 70, color: "from-yellow-500/20 to-yellow-500/5", ring: "border-yellow-500/40", unit: "g" },
  ];

  const suggestions = getSuggestions(profile?.goalType, profile?.dietPreference, 8);

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
      <header>
        <h2 className="text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>Nutritional Protocol</h2>
        <p className="text-white/30 text-sm">Optimized for {goalLabel(profile?.goalType)} · {profile?.dietPreference?.toUpperCase()}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {targets.map((t, i) => (
          <div key={i} className={`p-8 bg-gradient-to-br ${t.color} border border-white/5 rounded-[2rem] relative group`}>
            <p className="text-xs uppercase font-black tracking-[0.2em] text-white/40 mb-4">{t.label}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black italic tracking-tighter leading-none">{t.value}</span>
              <span className="text-lg font-bold text-white/20 italic">{t.unit}</span>
            </div>
            <div className={`absolute top-8 right-8 w-12 h-12 border-2 ${t.ring} rounded-full flex items-center justify-center opacity-20 group-hover:opacity-100 transition-opacity`}>
              <div className="w-6 h-1 bg-white/60 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      <div className="border border-white/5 bg-white/[0.01] p-10 rounded-[3rem]">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-white text-black rounded-2xl"><Target size={24}/></div>
          <div>
            <h3 className="text-2xl font-bold tracking-tight">Goal Alignment</h3>
            <p className="text-white/20 text-sm">Current protocol efficiency: <span className="text-white/60 font-bold">94.2%</span></p>
          </div>
        </div>
        <p className="max-w-3xl text-lg text-white/50 leading-relaxed font-medium italic">
          "Based on your preference for a <span className="text-white/90">{profile?.dietPreference}</span> diet and goal of <span className="text-white/90">{goalLabel(profile?.goalType)}</span>, our engine has prioritized high-bioavailable proteins and complex fiber sources while maintaining a controlled caloric deficit relative to your TDEE."
        </p>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-6 flex items-center gap-3"><Sparkles className="text-white/30" /> Recommended Foundations</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {suggestions.map((f, i) => (
            <div key={i} className="p-5 border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all rounded-2xl">
              <p className="font-bold text-sm mb-1">{f.foodName}</p>
              <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{f.category} · {f.calories} kcal</p>
            </div>
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
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>Biometric Evolution</h2>
          <p className="text-white/30 text-sm">Tracking day-to-day physiological shifts</p>
        </div>
        <div className="flex gap-4">
          <input 
            type="number" 
            placeholder="Today's kg..." 
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            className="w-32 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-white/30 outline-none"
          />
          <button 
            onClick={() => { if(newWeight) onLogWeight(parseFloat(newWeight)); setNewWeight(""); }}
            className="px-6 py-3 bg-white text-black font-bold text-sm rounded-xl hover:bg-white/80 transition-all"
          >Log Entry</button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 border border-white/5 p-8 bg-white/[0.01] rounded-[2rem]">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-bold uppercase tracking-widest text-white/40 text-xs">Mass Distribution</h3>
            <span className="text-sm font-bold italic">Current Index: {currentWeight} kg</span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                <XAxis dataKey="date" stroke="none" tick={{ fill: '#4a665a', fontSize: 10, fontWeight: 700 }} />
                <YAxis domain={['dataMin - 2', 'dataMax + 2']} stroke="none" tick={{ fill: '#4a665a', fontSize: 10, fontWeight: 700 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#031810', border: '1px solid #10b98120', borderRadius: '16px', backdropFilter: 'blur(20px)' }}
                  itemStyle={{ color: '#10b981', fontSize: '12px', fontWeight: 900 }}
                />
                <Area type="step" dataKey="weight" stroke="#10b981" strokeWidth={3} fill="url(#colorWeight)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

        </div>

        <div className="space-y-6">
          <div className="p-8 border border-white/5 bg-white/[0.01] rounded-[2rem]">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-white/20 mb-6">Weekly Adherence</h4>
            <div className="flex justify-between gap-1">
              {[1, 2, 3, 4, 5, 6, 7].map(d => {
                const day = adherenceStats?.recentAdherence?.find((a: any) => new Date(a.date).getDay() === (d % 7));
                return (
                  <div key={d} className={`flex-1 h-12 rounded-lg border border-white/5 flex items-center justify-center ${day?.status === 'on_track' ? 'bg-white/20' : 'bg-white/[0.02]'}`}>
                    {day?.status === 'on_track' && <Sparkles size={12} className="text-white/60"/>}
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-[10px] text-center font-bold text-white/20 tracking-widest uppercase">Operational Consistency</p>
          </div>

          <div className="p-8 border border-white/5 bg-gradient-to-br from-white/[0.05] to-transparent rounded-[2rem]">
            <Trophy size={32} className="text-white/20 mb-4" />
            <h4 className="text-xl font-black italic tracking-tighter mb-2">Weekly Badges</h4>
            <div className="flex gap-2">
              {Array.from({ length: adherenceStats?.weeklyAwardCount || 0 }).map((_, i) => (
                 <div key={i} className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                    <Zap size={16} className="text-black" />
                 </div>
              ))}
              <div className="w-10 h-10 rounded-full border border-dashed border-white/20 flex items-center justify-center">
                 <Plus size={12} className="text-white/10" />
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
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-12">
      <header className="text-center max-w-2xl mx-auto space-y-4">
        <h2 className="text-6xl font-black italic tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>Milestone Protocol</h2>
        <p className="text-white/40 text-lg font-medium leading-relaxed">Your consistency translates directly into procedural rewards. Accumulate points monthly to unlock high-utility 'cheat' day parameters.</p>
      </header>

      <div className="max-w-4xl mx-auto p-16 border border-white/10 bg-white/[0.01] rounded-[4rem] relative overflow-hidden text-center">
        <div className="relative z-10">
          <p className="text-xs font-black uppercase tracking-[0.5em] text-white/30 mb-8">Monthly Progress Cycle</p>
          <div className="inline-flex items-baseline gap-4 mb-10">
            <span className="text-9xl font-black tracking-tighter tabular-nums">{points}</span>
            <span className="text-2xl font-bold text-white/20 italic">/ {monthlyGoal} PTS</span>
          </div>
          <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden mb-12 border border-white/10">
            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 2, ease: "circOut" }} className="h-full bg-white shadow-[0_0_40px_rgba(255,255,255,0.4)]" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className={`p-10 border rounded-[3rem] transition-all duration-700 ${isUnlocked ? 'border-white bg-white text-black' : 'border-white/5 bg-white/[0.02] opacity-40 grayscale'}`}>
              <Zap size={40} className={isUnlocked ? 'text-black' : 'text-white/20'} />
              <h4 className="text-2xl font-black italic tracking-tighter mt-6 mb-2">Cheat Day Protocol</h4>
              <p className={isUnlocked ? 'text-black/60 font-medium' : 'text-white/20'}>{isUnlocked ? "AUTHORIZED: Relaxed macro constraints enabled for 24 hours." : "LOCKED: Complete 85% of monthly targets to unlock."}</p>
              {isUnlocked && <button className="mt-8 px-8 py-3 bg-black text-white rounded-full font-bold text-sm">Activate Selection</button>}
            </div>
            
            <div className={`p-10 border rounded-[3rem] transition-all duration-700 ${points >= 100 ? 'border-white/20 bg-white/5' : 'border-white/5 bg-white/[0.02] opacity-40'}`}>
              <Utensils size={40} className="text-white/30" />
              <h4 className="text-2xl font-black italic tracking-tighter mt-6 mb-2">Optimized Cheats</h4>
              <div className="space-y-3 mt-4">
                {points >= 100 ? (
                  cheatOptions.map((opt, i) => (
                    <div key={i} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                      <div className="text-left">
                        <p className="text-sm font-bold">{opt.foodName}</p>
                        <p className="text-[10px] text-white/40 uppercase">{opt.calories} kcal · {opt.proteinG}g P</p>
                      </div>
                      <Plus size={14} className="text-white/40" />
                    </div>
                  ))
                ) : (
                  <p className="text-white/20 font-medium italic">Accumulate 100 pts to reveal healthy alternatives.</p>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-t from-white/[0.02] to-transparent pointer-events-none" />
      </div>
    </motion.div>
  );
}


function SettingsTab({ profile, onUpdate }: any) {
  const [formData, setFormData] = useState({
    name: getUser()?.name || "",
    age: profile?.age || "",
    weightKg: profile?.weightKg || "",
    goalType: profile?.goalType || "general_health",
    dietPreference: profile?.dietPreference || "omnivore",
    coachEnabled: profile?.coachEnabled || false
  });

  const [saving, setSaving] = useState(false);

  const goals = [
    { id: "lose_weight", label: "Lose Weight" },
    { id: "gain_muscle", label: "Gain Muscle" },
    { id: "maintain_weight", label: "Maintain" },
    { id: "improve_endurance", label: "Endurance" },
    { id: "general_health", label: "Health" }
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
      await upsertProfile(formData);
      onUpdate();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl space-y-12">
      <header>
        <h2 className="text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>System Architecture</h2>
        <p className="text-white/30 text-sm">Configure your biological and nutritional parameters</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Identifier</label>
          <input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-white/[0.03] border border-white/5 p-4 rounded-xl focus:border-white/30 outline-none transition-all" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Age Parameter</label>
          <input type="number" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} className="w-full bg-white/[0.03] border border-white/5 p-4 rounded-xl focus:border-white/30 outline-none transition-all" />
        </div>

        <div className="md:col-span-2 space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Primary Objective</label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
             {goals.map(g => (
               <button 
                 key={g.id} 
                 onClick={() => setFormData({...formData, goalType: g.id})}
                 className={`py-6 px-2 rounded-2xl border transition-all text-[11px] font-bold uppercase tracking-tighter ${formData.goalType === g.id ? 'bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.1)]' : 'border-white/5 text-white/40 hover:border-white/20'}`}
               >{g.label}</button>
             ))}
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Nutritional Constraint</label>
          <div className="flex flex-wrap gap-3">
             {diets.map(d => (
               <button 
                 key={d.id} 
                 onClick={() => setFormData({...formData, dietPreference: d.id})}
                 className={`py-4 px-8 rounded-full border transition-all text-xs font-bold uppercase ${formData.dietPreference === d.id ? 'bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.1)]' : 'border-white/5 text-white/40 hover:border-white/20'}`}
               >{d.label}</button>
             ))}
          </div>
        </div>

        <div className="md:col-span-2 p-8 border border-white/5 bg-white/[0.01] rounded-[2rem] flex items-center justify-between">
           <div>
             <h4 className="text-sm font-black italic tracking-tighter text-white mb-1">Empower AI Coaching</h4>
             <p className="text-xs text-white/20 font-medium italic">Allow our Intelligence Engine to provide casual, supportive advice based on your daily gaps.</p>
           </div>
           <button 
             onClick={() => setFormData({...formData, coachEnabled: !formData.coachEnabled})}
             className={`w-16 h-8 rounded-full relative transition-all ${formData.coachEnabled ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-white/10'}`}
           >
             <motion.div 
               animate={{ x: formData.coachEnabled ? 32 : 4 }}
               className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-lg" 
             />
           </button>
        </div>
      </div>


      <div className="pt-10 flex justify-end">
        <button 
          onClick={handleSave}
          disabled={saving}
          className="px-12 py-5 bg-white text-black font-black italic tracking-tighter rounded-full hover:scale-105 transition-all disabled:opacity-50 shadow-[0_0_50px_rgba(255,255,255,0.2)]"
        >{saving ? "SYNCING..." : "COMMIT CHANGES"}</button>
      </div>
    </motion.div>
  );
}

function AddMealModal({ 
  onClose, onSuccess, profile 
}: { 
  onClose: () => void; 
  onSuccess: () => void;
  profile: Profile | null;
}) {
  const [mealType, setMealType] = useState<string>("breakfast");
  const [items, setItems] = useState<FoodSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);


  const [aiInput, setAiInput] = useState("");
  const [isAiMode, setIsAiMode] = useState(true);
  const [visionMode, setVisionMode] = useState(false); // New: Image vs Text AI
  const [visionFile, setVisionFile] = useState<File | null>(null);
  const [visionImageUrl, setVisionImageUrl] = useState<string | null>(null);
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
          servingSize: f.servingSize,
          servingUnit: f.servingUnit,
          calories: f.calories,
          proteinG: f.protein,
          carbsG: f.carbs,
          fatG: f.fat,
          fiberG: f.fiber,
          category: "snack" as const
        }));

        setItems(prev => [...prev, ...newItems]);
        setAiInput("");
        setIsAiMode(false);
      }
    } catch (err: any) {
      setError(err.message || "Could not interpret meal description");
    } finally {
      setIsInterpreting(false);
    }
  };

  const addItem = (food: FoodSuggestion) => {

    setItems(prev => [...prev, food]);
  };

  const addItemFromSearch = (food: any) => {
    setItems(prev => [...prev, {
      foodName: food.label,
      servingSize: 100, // Default to 100g 
      servingUnit: "g",
      calories: Math.round(food.calories),
      proteinG: Math.round(food.protein),
      carbsG: Math.round(food.carbs),
      fatG: Math.round(food.fat),
      fiberG: Math.round(food.fiber || 0),
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


  const totalCal = items.reduce((sum, i) => sum + i.calories, 0);
  const totalProtein = items.reduce((sum, i) => sum + i.proteinG, 0);

  const handleSubmit = async () => {
    if (items.length === 0) {
      setError("Add at least one food item");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await createMealLog(mealType, undefined, visionImageUrl || undefined);
      const logId = res.data.id;
      
      // Add all items in parallel
      await Promise.all(items.map(item => 
        addMealLogItem(logId, {
          foodName: item.foodName,
          servingSize: item.servingSize,
          servingUnit: item.servingUnit,
          calories: item.calories,
          proteinG: item.proteinG,
          carbsG: item.carbsG,
          fatG: item.fatG,
          fiberG: item.fiberG,
        })
      ));

      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to log meal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="bg-[#0a0a0a] border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Log Meal</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/5 transition-colors">
              <X size={18} className="text-white/40" />
            </button>
          </div>

          {error && (
            <div className="mb-6 p-3 border border-red-500/30 bg-red-500/5 text-red-400 text-sm rounded-lg">
              {error}
            </div>
          )}

          {/* Meal Type */}
          <div className="mb-8">
            <label className="text-xs text-white/30 tracking-wider mb-3 block font-semibold uppercase" style={{ fontFamily: 'var(--font-label)' }}>Meal Type</label>
            <div className="flex gap-2">
              {["breakfast", "lunch", "dinner", "snack"].map(t => (
                <button 
                  key={t} 
                  onClick={() => setMealType(t)}
                  className={`px-5 py-2.5 text-[13px] tracking-wide rounded-lg transition-all ${
                    mealType === t ? 'bg-white text-black font-semibold' : 'border border-white/10 text-white/30 hover:text-white/60'
                  }`}
                  style={{ fontFamily: 'var(--font-label)' }}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Items */}
          {items.length > 0 && (
            <div className="mb-8">
              <label className="text-xs text-white/30 tracking-wider mb-3 block font-semibold uppercase" style={{ fontFamily: 'var(--font-label)' }}>
                Items ({items.length}) — {totalCal} kcal / {totalProtein}g protein
              </label>
              <div className="space-y-2">
                {items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center border border-white/5 p-3 bg-white/[0.02]">
                    <div>
                      <span className="text-sm font-medium" style={{ fontFamily: 'var(--font-label)' }}>{item.foodName}</span>
                      <span className="ml-3 text-xs text-white/30">{item.calories} kcal</span>
                    </div>
                    <button onClick={() => removeItem(i)} className="text-red-400/40 hover:text-red-400 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search/Browse Foods */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <label className="text-xs text-white/30 tracking-wider font-semibold uppercase" style={{ fontFamily: 'var(--font-label)' }}>
                {isAiMode ? "Smart AI Interpretation" : (searchTerm ? "Search Results" : "Suggested Items")}
              </label>
              <button 
                onClick={() => setIsAiMode(!isAiMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${isAiMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/20'}`}
              >
                <Sparkles size={12} />
                {isAiMode ? "Smart AI Entry" : "Standard Entry"}
              </button>
            </div>

            {isAiMode ? (
              <div className="space-y-4">
                <div className="flex gap-2">
                   <button 
                     onClick={() => setVisionMode(false)}
                     className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${!visionMode ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-white/[0.02] border-white/5 text-white/20'}`}
                   >Text Prompt</button>
                   <button 
                     onClick={() => setVisionMode(true)}
                     className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${visionMode ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-white/[0.02] border-white/5 text-white/20'}`}
                   >Visual AI</button>
                </div>

                {!visionMode ? (
                  <>
                    <textarea 
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      placeholder="e.g. 3 large eggs and an avocado..."
                      className="w-full h-32 bg-white/[0.02] border border-white/5 p-4 rounded-xl focus:border-emerald-500/30 outline-none text-sm resize-none custom-scrollbar"
                    />
                    <button 
                      onClick={handleAiInterpret}
                      disabled={isInterpreting || !aiInput.trim()}
                      className="w-full py-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      {isInterpreting ? "Interpreting Algorithm..." : "Run AI Interpretation"}
                    </button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="relative group">
                      <input 
                        type="file" 
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setVisionFile(file);
                            try {
                              setIsInterpreting(true);
                              const res = await analyzeImage(file);
                              setVisionImageUrl(res.imageUrl);
                              setItems(res.data);
                            } catch (err: any) {
                              alert(err.message);
                            } finally {
                              setIsInterpreting(false);
                            }
                          }
                        }}
                      />
                      <div className="w-full h-40 border-2 border-dashed border-white/5 group-hover:border-emerald-500/30 bg-white/[0.02] rounded-2xl flex flex-col items-center justify-center gap-4 transition-all">
                        {visionFile ? (
                           <div className="flex flex-col items-center">
                              <div className="w-20 h-20 rounded-xl overflow-hidden border border-white/10 mb-2">
                                <img src={URL.createObjectURL(visionFile)} alt="" className="w-full h-full object-cover" />
                              </div>
                              <p className="text-[10px] font-black text-emerald-400 uppercase">{visionFile.name}</p>
                           </div>
                        ) : (
                          <>
                            <Camera size={32} className="text-white/20 group-hover:text-emerald-400" />
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Snap or Upload Plate</p>
                          </>
                        )}
                      </div>
                    </div>
                    {isInterpreting && <p className="text-center text-[10px] font-black text-emerald-400 uppercase animate-pulse">Running Vision Engine...</p>}
                  </div>
                )}
              </div>

            ) : (
              <>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/15" size={16} />
                  <input 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 bg-white/[0.02] border border-white/5 focus:border-white/20 outline-none text-sm text-white placeholder:text-white/15 rounded-lg"
                    placeholder="Search real foods (Edamam)..."
                  />
                  {isSearching && (
                     <div className="absolute right-3 top-1/2 -translate-y-1/2">
                       <div className="w-4 h-4 border-2 border-white/20 border-t-emerald-500 animate-spin rounded-full"></div>
                     </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {searchTerm.length > 2 ? (
                    searchResults.map((food, i) => (
                      <button 
                        key={i}
                        onClick={() => addItemFromSearch(food)}
                        className="group border border-white/5 p-3 text-left hover:border-emerald-400/20 hover:bg-white/[0.02] transition-all flex justify-between items-center rounded-lg"
                      >
                        <div className="flex gap-3 items-center">
                          {food.image && <img src={food.image} alt="" className="w-10 h-10 rounded object-cover border border-white/5" />}
                          <div>
                            <p className="text-sm font-medium" style={{ fontFamily: 'var(--font-label)' }}>{food.label}</p>
                            <p className="text-xs text-white/20 mt-0.5">{Math.round(food.calories)} kcal · {Math.round(food.protein)}g P</p>
                          </div>
                        </div>
                        <Plus size={14} className="text-white/20 group-hover:text-emerald-400 transition-colors" />
                      </button>
                    ))
                  ) : (
                    getSuggestions(profile?.goalType || null, profile?.dietPreference || null, 6).map((food, i) => (
                      <button 
                        key={i}
                        onClick={() => addItem(food)}
                        className="group border border-white/10 p-4 text-left hover:border-emerald-400/30 hover:bg-emerald-400/5 transition-all flex justify-between items-center rounded-xl relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <Sparkles size={10} className="text-emerald-400/40" />
                        </div>
                        <div>
                          <p className="text-sm font-bold italic tracking-tight">{food.foodName}</p>
                          <p className="text-[10px] text-white/20 mt-0.5 font-black uppercase tracking-widest">{food.calories} kcal · {food.proteinG}g P</p>
                        </div>
                        <Plus size={14} className="text-white/20 group-hover:text-emerald-400 transition-colors" />
                      </button>
                    ))
                  )}
                </div>
              </>
            )}
          </div>


          {/* Submit */}
          <button 
            onClick={handleSubmit}
            disabled={loading || items.length === 0}
            className="w-full py-5 flex items-center justify-center gap-3 text-sm bg-white text-black border border-white hover:bg-transparent hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed font-semibold tracking-wide rounded-lg"
            style={{ fontFamily: 'var(--font-label)' }}
          >
            {loading ? "Logging..." : "Log Meal"} <ChevronRight size={16}/>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── COMMUNITY TAB ──────────────────────────────────────────────────────────

import { listTribes, joinTribe, getLeaderboard } from "@/utils/api";

function CommunityTab() {
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
                leaderboard.map((user, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${
                      i === 0 ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 
                      i === 1 ? 'bg-white/20 text-white' : 
                      i === 2 ? 'bg-white/10 text-white/60' : 'bg-white/5 text-white/20'
                    }`}>
                      {i + 1}
                    </div>
                    <div className="flex-1">
                       <p className="text-sm font-bold group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{user.userName}</p>
                       <p className="text-[10px] text-white/20 font-black tracking-widest uppercase">{user.points} Protocol Points</p>
                    </div>
                    {i === 0 && <Trophy size={16} className="text-emerald-400" />}
                  </div>
                ))
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

