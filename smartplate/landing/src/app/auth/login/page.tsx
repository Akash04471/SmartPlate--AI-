"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Mail, Lock, LogIn, Cpu, Database, KeyRound, ChevronRight } from "lucide-react";
import BiometricScan from "@/components/BiometricScan";
import { login as apiLogin, verify2FA as apiVerify2FA } from "@/utils/api";

export default function LoginPage() {
  const [isFocused, setIsFocused] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [mfaRequired, setMfaRequired] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleInitialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await apiLogin(email, password);
      if (res.mfaRequired) {
        setMfaRequired(true);
      } else {
        // Fallback for if MFA is somehow skipped by server (shouldn't happen with new logic)
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiVerify2FA(email, otp);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "2FA Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full pl-14 bg-white/[0.02] border border-white/5 focus:border-white/20 focus:bg-white/[0.04] transition-all outline-none py-5 text-white text-base placeholder:text-white/15 rounded-lg";

  return (
    <main className="min-h-screen bg-base-dark flex items-center justify-center p-4 md:p-6 relative overflow-hidden selection:bg-white/10">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[800px] h-[600px] md:h-[800px] bg-white/[0.02] rounded-full blur-[100px] md:blur-[120px] pointer-events-none" />
      
      <BiometricScan active={isFocused} />
      
      <div className="absolute top-6 right-6 md:top-10 md:right-10 pointer-events-none flex flex-col items-end gap-2 hidden sm:flex">
        <div className="flex items-center gap-3 text-white/15">
          <span className="text-[10px] tracking-wider font-semibold uppercase" style={{ fontFamily: 'var(--font-label)' }}>Secure Connection</span>
          <Cpu size={14} />
        </div>
        <div className="flex items-center gap-3 text-white/15">
          <span className="text-[10px] tracking-wider font-semibold uppercase" style={{ fontFamily: 'var(--font-label)' }}>SmartPlate Cloud</span>
          <Database size={14} />
        </div>
      </div>

      <div className="max-w-xl w-full relative z-10 transition-all duration-700">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-white/40 text-xs md:text-sm mb-8 md:mb-12 hover:text-white transition-all tracking-wide group font-medium"
          style={{ fontFamily: 'var(--font-label)' }}
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-2 transition-transform" /> Back to Home
        </Link>
        
        <div className="obsidian-card p-8 md:p-12 bg-base-dark/60 backdrop-blur-3xl border-white/5">
          <div className="mb-10 flex justify-center">
            <Image 
              src="/images/smartplate-logo.jpg" 
              alt="SmartPlate Logo" 
              width={180} 
              height={60}
              className="w-44 h-auto object-contain"
            />
          </div>
          <div className="mb-10 md:mb-14 border-b border-white/5 pb-8">
            <span className="text-[10px] text-white/25 tracking-wider font-medium block mb-3 md:mb-4 uppercase" style={{ fontFamily: 'var(--font-label)' }}>
              {mfaRequired ? "Verification Required" : "Welcome Back"}
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              {mfaRequired ? "Enter OTP" : "Sign In"}
            </h1>
          </div>

          {error && (
            <div className="mb-8 p-4 border border-red-500/30 bg-red-500/5 text-red-400 text-sm rounded-lg">
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            {!mfaRequired ? (
              <motion.form 
                key="login-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleInitialLogin} 
                className="space-y-8"
              >
                <div className="space-y-3">
                  <label className="text-xs text-white/40 tracking-wider font-semibold uppercase" style={{ fontFamily: 'var(--font-label)' }}>Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white/60 transition-colors" size={18}/>
                    <input 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      className={inputClass} 
                      placeholder="you@email.com" 
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs text-white/40 tracking-wider font-semibold uppercase" style={{ fontFamily: 'var(--font-label)' }}>Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white/60 transition-colors" size={18}/>
                    <input 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      className={inputClass} 
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
              </motion.form>
            ) : (
              <motion.form 
                key="mfa-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleMfaVerify} 
                className="space-y-8"
              >
                <div className="space-y-3">
                  <label className="text-xs text-white/40 tracking-wider font-semibold uppercase" style={{ fontFamily: 'var(--font-label)' }}>2FA Code</label>
                  <p className="text-sm text-white/30 mb-4">A unique code has been sent to your registered email.</p>
                  <div className="relative group">
                    <KeyRound className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white/60 transition-colors" size={18}/>
                    <input 
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      className={inputClass} 
                      placeholder="000000" 
                      maxLength={6}
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setMfaRequired(false)}
                    className="px-8 py-5 text-sm bg-white/5 text-white/60 hover:text-white transition-all rounded-lg font-medium"
                  >
                    Back
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="flex-1 py-5 flex items-center justify-center gap-4 text-base bg-white text-black border border-white hover:bg-transparent hover:text-white transition-all disabled:opacity-50 font-semibold tracking-wide rounded-lg"
                    style={{ fontFamily: 'var(--font-label)' }}
                  >
                    {loading ? "Verifying..." : "Verify & Login"} <ChevronRight size={20}/>
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
          
          <div className="mt-14 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
            <p className="text-xs text-white/40 tracking-widest font-bold uppercase" style={{ fontFamily: 'var(--font-label)' }}>
              Data Encrypted & Secure
            </p>
            {!mfaRequired && (
              <p className="text-sm text-white/40 font-medium" style={{ fontFamily: 'var(--font-label)' }}>
                New here? <Link href="/auth/signup" className="text-white hover:underline underline-offset-4 ml-1 font-semibold">Create Account</Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
