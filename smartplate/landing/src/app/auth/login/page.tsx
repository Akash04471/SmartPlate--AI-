"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Lock, LogIn, Cpu, Database } from "lucide-react";
import BiometricScan from "@/components/BiometricScan";
import { login as apiLogin } from "@/utils/api";

export default function LoginPage() {
  const [isFocused, setIsFocused] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiLogin(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-base-dark flex items-center justify-center p-6 relative overflow-hidden selection:bg-white/10">
      {/* Background Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.02] rounded-full blur-[120px] pointer-events-none" />
      
      <BiometricScan active={isFocused} />
      
      {/* Login HUD */}
      <div className="absolute top-10 right-10 pointer-events-none flex flex-col items-end gap-2">
        <div className="flex items-center gap-3 text-white/15">
          <span className="text-xs tracking-wider font-semibold uppercase" style={{ fontFamily: 'var(--font-label)' }}>Secure Connection</span>
          <Cpu size={14} />
        </div>
        <div className="flex items-center gap-3 text-white/15">
          <span className="text-xs tracking-wider font-semibold uppercase" style={{ fontFamily: 'var(--font-label)' }}>SmartPlate Cloud</span>
          <Database size={14} />
        </div>
      </div>

      <div className="max-w-xl w-full relative z-10 transition-all duration-700">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-white/40 text-sm mb-12 hover:text-white transition-all tracking-wide group font-medium"
          style={{ fontFamily: 'var(--font-label)' }}
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-2 transition-transform" /> Back to Home
        </Link>
        
        <div className="obsidian-card p-12 bg-base-dark/60 backdrop-blur-3xl border-white/5">
          <div className="mb-14 border-b border-white/5 pb-8">
            <span className="text-xs text-white/25 tracking-wider font-medium block mb-4" style={{ fontFamily: 'var(--font-label)' }}>Welcome Back</span>
            <h1 className="text-5xl font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>Sign In</h1>
          </div>

          {error && (
            <div className="mb-8 p-4 border border-red-500/30 bg-red-500/5 text-red-400 text-sm rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-3">
              <div className="flex justify-between items-center pr-2">
                <label className="text-xs text-white/40 tracking-wider font-semibold uppercase" style={{ fontFamily: 'var(--font-label)' }}>Email</label>
              </div>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white/60 transition-colors" size={18}/>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="w-full pl-14 bg-white/[0.02] border border-white/5 focus:border-white/20 focus:bg-white/[0.04] transition-all outline-none py-5 text-white text-base placeholder:text-white/15 rounded-lg" 
                  placeholder="you@email.com" 
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center pr-2">
                <label className="text-xs text-white/40 tracking-wider font-semibold uppercase" style={{ fontFamily: 'var(--font-label)' }}>Password</label>
              </div>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white/60 transition-colors" size={18}/>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="w-full pl-14 bg-white/[0.02] border border-white/5 focus:border-white/20 focus:bg-white/[0.04] transition-all outline-none py-5 text-white text-base placeholder:text-white/15 rounded-lg" 
                  placeholder="••••••••••••" 
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-8 py-5 flex items-center justify-center gap-4 text-base bg-white text-black border border-white hover:bg-transparent hover:text-white transition-all disabled:opacity-50 font-semibold tracking-wide rounded-lg"
              style={{ fontFamily: 'var(--font-label)' }}
            >
              {loading ? "Signing in..." : "Sign In"} <LogIn size={20}/>
            </button>
          </form>
          
          <div className="mt-14 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
            <p className="text-xs text-white/40 tracking-widest font-bold uppercase" style={{ fontFamily: 'var(--font-label)' }}>
              Data Encrypted & Secure
            </p>
            <p className="text-sm text-white/40 font-medium" style={{ fontFamily: 'var(--font-label)' }}>
              New here? <Link href="/auth/signup" className="text-white hover:underline underline-offset-4 ml-1 font-semibold">Create Account</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
