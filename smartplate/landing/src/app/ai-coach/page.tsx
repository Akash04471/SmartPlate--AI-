"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import AICoachChat from "@/components/AICoachChat";
import { Sparkles, Cpu, Zap, ShieldCheck } from "lucide-react";

export default function AICoachPage() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-emerald-500/30">
      <Navbar />
      
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 pt-32 pb-20 px-6 max-w-screen-2xl mx-auto grid lg:grid-cols-[1fr_2fr] gap-12 items-stretch">
        
        {/* Left Side: Intel Branding */}
        <div className="space-y-12">
          {/* ... existing branding content ... */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                <Sparkles size={12} className="text-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Neural Protocol v2.5</span>
              </div>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter leading-[0.9] mb-8">
              ENHANCED <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">AI COACH</span>
            </h1>
            
            <p className="text-lg text-white/40 max-w-xl leading-relaxed font-medium">
              Experience the next generation of precision nutrition. Our enhanced AI Coach leverages real-time Google search grounding and neural data analysis to provide superhuman dietary guidance.
            </p>
          </motion.div>

          {/* Feature Grid */}
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { icon: <Cpu size={20} />, title: "Neural Grounding", desc: "Real-time verification against clinical nutrition datasets." },
              { icon: <Zap size={20} />, title: "Instant Synthesis", desc: "Analyze months of metabolic data in milliseconds." },
              { icon: <ShieldCheck size={20} />, title: "Protocol Aware", desc: "Deep integration with your active health protocols." },
              { icon: <Sparkles size={20} />, title: "Google Powered", desc: "Live web-fetching for the latest fitness trends." }
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.04] transition-all group"
              >
                <div className="text-emerald-400 mb-4 group-hover:scale-110 transition-transform">{f.icon}</div>
                <h3 className="text-sm font-black uppercase tracking-widest mb-2">{f.title}</h3>
                <p className="text-xs text-white/30 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* System Status */}
          <div className="p-8 bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-[2.5rem]">
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Metabolic Grid Status</span>
              <span className="flex items-center gap-2 text-emerald-400 text-[10px] font-black">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                OPERATIONAL
              </span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-emerald-500" 
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
            </div>
          </div>
        </div>

        {/* Right Side: The Chat Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="lg:sticky lg:top-32 h-[900px] w-full"
        >
          <AICoachChat />
        </motion.div>

      </div>
    </main>
  );
}
