"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, User, Mail, Lock, Target, ChevronRight, Check, Wifi, ShieldCheck, Activity, KeyRound } from "lucide-react";
import BiometricScan from "@/components/BiometricScan";
import { signup as apiSignup, verifySignup as apiVerifySignup, upsertProfile } from "@/utils/api";
import gsap from "gsap";

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [isFocused, setIsFocused] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const totalSteps = 4;

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("Male");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [selectedDiet, setSelectedDiet] = useState<string | null>(null);

  const GOAL_MAP: Record<string, string> = {
    "Weight Loss": "lose_weight",
    "Muscle Gain": "gain_muscle",
    "Maintenance": "maintain_weight",
    "Endurance": "improve_endurance",
  };

  const DIET_MAP: Record<string, string> = {
    "Vegetarian": "vegetarian",
    "Vegan": "vegan",
    "Omnivore": "omnivore",
    "Ketogenic": "keto",
  };

  const nextStep = () => {
    gsap.to(".signup-content", { opacity: 0, x: -20, duration: 0.3, onComplete: () => {
      setStep(s => Math.min(s + 1, totalSteps));
      gsap.fromTo(".signup-content", { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.4 });
    }});
  };

  const prevStep = () => {
    gsap.to(".signup-content", { opacity: 0, x: 20, duration: 0.3, onComplete: () => {
      setStep(s => Math.max(s - 1, 1));
      gsap.fromTo(".signup-content", { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.4 });
    }});
  };

  const handleStep1 = async () => {
    if (!name || !email || !password) {
      setError("All fields are required");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await apiSignup(name, email, password);
      nextStep();
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await apiVerifySignup(email, otp);
      nextStep();
    } catch (err: any) {
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleStep3 = () => {
    nextStep();
  };

  const handleFinalize = async () => {
    setIsCalibrating(true);
    setError("");
    try {
      const profileData: Record<string, any> = {};
      if (age) profileData.age = Number(age);
      if (heightCm) profileData.heightCm = Number(heightCm);
      if (weightKg) profileData.weightKg = Number(weightKg);
      if (selectedGoal) profileData.goalType = GOAL_MAP[selectedGoal];
      if (selectedDiet) profileData.dietPreference = DIET_MAP[selectedDiet];
      
      if (weightKg && heightCm && age) {
        const w = Number(weightKg);
        const h = Number(heightCm);
        const a = Number(age);
        const bmr = 10 * w + 6.25 * h - 5 * a + 5;
        const tdee = bmr * 1.55;
        
        if (selectedGoal === "Weight Loss") {
          profileData.dailyCalorieTarget = Math.round(tdee - 500);
        } else if (selectedGoal === "Muscle Gain") {
          profileData.dailyCalorieTarget = Math.round(tdee + 300);
        } else {
          profileData.dailyCalorieTarget = Math.round(tdee);
        }
        profileData.dailyProteinTargetG = Math.round(w * 1.8);
        profileData.dailyCarbsTargetG = Math.round((profileData.dailyCalorieTarget * 0.4) / 4);
        profileData.dailyFatTargetG = Math.round((profileData.dailyCalorieTarget * 0.25) / 9);
        profileData.activityLevel = "moderately_active";
        profileData.baselineWeightKg = w;
      }

      await upsertProfile(profileData);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2500);
    } catch (err: any) {
      setIsCalibrating(false);
      setError(err.message || "Profile setup failed");
    }
  };

  const inputClass = "w-full pl-12 bg-white/[0.02] border border-white/5 focus:border-white/20 focus:bg-white/[0.04] transition-all outline-none py-5 text-white text-base placeholder:text-white/15 rounded-lg";
  const inputClassSimple = "w-full px-5 bg-white/[0.02] border border-white/5 focus:border-white/20 transition-all outline-none py-5 text-white text-base rounded-lg";

  return (
    <main className="min-h-screen bg-base-dark flex items-center justify-center p-4 md:p-6 lg:p-10 relative overflow-hidden selection:bg-white/10">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[1000px] h-[600px] md:h-[1000px] bg-white/[0.01] rounded-full blur-[80px] md:blur-[140px] pointer-events-none" />
      <BiometricScan active={isFocused} />
      
      <div className="absolute top-6 left-6 md:top-10 md:left-10 pointer-events-none gap-3 flex flex-col hidden sm:flex">
        <div className="flex items-center gap-3 text-white/20">
          <Wifi size={14} className="animate-pulse" />
          <span className="text-[10px] tracking-widest font-bold uppercase" style={{ fontFamily: 'var(--font-label)' }}>Secure Link</span>
        </div>
        <div className="flex items-center gap-3 text-white/20">
          <ShieldCheck size={14} />
          <span className="text-[10px] tracking-widest font-bold uppercase" style={{ fontFamily: 'var(--font-label)' }}>Encrypted</span>
        </div>
      </div>

      <AnimatePresence>
        {isCalibrating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-base-dark flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="w-48 md:w-64 h-[1px] bg-white/5 mb-8 relative overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, ease: "easeInOut" }}
                className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]"
              />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-none" style={{ fontFamily: 'var(--font-display)' }}>Setting Up SmartPlate</h2>
            <p className="text-xs md:text-sm text-white/30 mt-4 tracking-wide font-medium" style={{ fontFamily: 'var(--font-label)' }}>Personalizing your nutrition plan...</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-3xl w-full relative z-10 transition-all duration-700">
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
          <div className="flex flex-col md:flex-row justify-between items-start mb-10 md:mb-14 border-b border-white/5 pb-8 gap-6 md:gap-0">
            <div className="flex-1">
              <span className="text-[10px] text-white/40 tracking-[0.2em] font-bold block mb-3 md:mb-4 uppercase" style={{ fontFamily: 'var(--font-label)' }}>Step {step} of {totalSteps}</span>
              <h1 className="text-2xl md:text-3xl lg:text-5xl font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                {step === 1 && "Create Account"}
                {step === 2 && "Verification"}
                {step === 3 && "Your Stats"}
                {step === 4 && "Set Your Goals"}
              </h1>
            </div>
            <div className="flex flex-col items-end gap-3">
              <span className="text-xs text-white/25 font-medium tracking-wide" style={{ fontFamily: 'var(--font-label)' }}>Progress</span>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map(s => (
                  <div key={s} className={`h-[2px] w-8 rounded-full transition-all duration-700 ${s <= step ? 'bg-white shadow-[0_0_5px_rgba(255,255,255,0.5)]' : 'bg-white/5'}`} />
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-8 p-4 border border-red-500/30 bg-red-500/5 text-red-400 text-sm rounded-lg">
              {error}
            </div>
          )}
          
          <div className="signup-content min-h-[350px]">
            {step === 1 && (
              <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-xs text-white/40 tracking-wider font-semibold uppercase" style={{ fontFamily: 'var(--font-label)' }}>Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white/60 transition-colors" size={18}/>
                      <input value={name} onChange={(e) => setName(e.target.value)} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} className={inputClass} placeholder="Your Name" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs text-white/40 tracking-wider font-semibold uppercase" style={{ fontFamily: 'var(--font-label)' }}>Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white/60 transition-colors" size={18}/>
                      <input value={email} onChange={(e) => setEmail(e.target.value)} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} className={inputClass} placeholder="you@email.com" />
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-xs text-white/40 tracking-wider font-semibold uppercase" style={{ fontFamily: 'var(--font-label)' }}>Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white/60 transition-colors" size={18}/>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} className={inputClass} placeholder="Min 8 characters" />
                  </div>
                </div>
                <button onClick={handleStep1} disabled={loading} className="w-full mt-6 py-5 flex items-center justify-center gap-4 text-base bg-white text-black border border-white hover:bg-transparent hover:text-white transition-all disabled:opacity-50 font-semibold tracking-wide rounded-lg" style={{ fontFamily: 'var(--font-label)' }}>
                  {loading ? "Creating account..." : "Continue"} <ChevronRight size={20}/>
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-xs text-white/40 tracking-wider font-semibold uppercase" style={{ fontFamily: 'var(--font-label)' }}>Verification Code</label>
                  <p className="text-sm text-white/30 mb-4">We've sent a 6-digit code to <span className="text-white/60">{email}</span></p>
                  <div className="relative group">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white/60 transition-colors" size={18}/>
                    <input 
                      value={otp} 
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} 
                      onFocus={() => setIsFocused(true)} 
                      onBlur={() => setIsFocused(false)} 
                      className={inputClass} 
                      placeholder="000000" 
                      maxLength={6}
                    />
                  </div>
                </div>
                <button onClick={handleVerifyOTP} disabled={loading} className="w-full mt-6 py-5 flex items-center justify-center gap-4 text-base bg-white text-black border border-white hover:bg-transparent hover:text-white transition-all disabled:opacity-50 font-semibold tracking-wide rounded-lg" style={{ fontFamily: 'var(--font-label)' }}>
                  {loading ? "Verifying..." : "Verify & Continue"} <ChevronRight size={20}/>
                </button>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-xs text-white/40 tracking-wider font-semibold uppercase" style={{ fontFamily: 'var(--font-label)' }}>Age</label>
                    <input type="number" value={age} onChange={(e) => setAge(e.target.value)} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} className={inputClassSimple} placeholder="25"/>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs text-white/40 tracking-wider font-semibold uppercase" style={{ fontFamily: 'var(--font-label)' }}>Biological Sex</label>
                    <select value={sex} onChange={(e) => setSex(e.target.value)} className="w-full px-5 bg-[#111] border border-white/5 focus:border-white/20 transition-all outline-none py-5 text-white text-base rounded-lg">
                      <option>Male</option>
                      <option>Female</option>
                      <option>Non-Binary</option>
                    </select>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-xs text-white/40 tracking-wider font-semibold uppercase" style={{ fontFamily: 'var(--font-label)' }}>Height (cm)</label>
                    <input type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} className={inputClassSimple} placeholder="175"/>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs text-white/40 tracking-wider font-semibold uppercase" style={{ fontFamily: 'var(--font-label)' }}>Weight (kg)</label>
                    <input type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} className={inputClassSimple} placeholder="75"/>
                  </div>
                </div>
                <div className="flex gap-6">
                  <button onClick={prevStep} className="px-10 py-5 opacity-40 hover:opacity-100 transition-opacity text-sm tracking-wide text-white bg-white/5 rounded-lg font-medium" style={{ fontFamily: 'var(--font-label)' }}>Back</button>
                  <button onClick={handleStep3} className="flex-1 py-5 flex items-center justify-center gap-4 text-base bg-white text-black border border-white hover:bg-transparent hover:text-white transition-all font-semibold tracking-wide rounded-lg" style={{ fontFamily: 'var(--font-label)' }}>Continue <Activity size={20}/></button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-10">
                <div>
                  <label className="text-xs text-white/40 tracking-wider font-semibold uppercase mb-6 block" style={{ fontFamily: 'var(--font-label)' }}>Health Goal</label>
                  <div className="grid grid-cols-2 gap-4">
                    {["Weight Loss", "Muscle Gain", "Maintenance", "Endurance"].map(goal => (
                      <button 
                        key={goal} 
                        onClick={() => setSelectedGoal(goal)}
                        className={`border p-6 text-left text-sm font-semibold flex justify-between items-center group transition-all rounded-lg ${selectedGoal === goal ? 'border-white bg-white/10 text-white' : 'border-white/5 hover:border-white/40 hover:bg-white/[0.02] bg-base-dark/50'}`}
                        style={{ fontFamily: 'var(--font-label)' }}
                      >
                        {goal}
                        {selectedGoal === goal ? <Check size={18} className="text-white" /> : <Target size={18} className="opacity-0 group-hover:opacity-100 transition-opacity text-white"/>}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white/40 tracking-wider font-semibold uppercase mb-6 block" style={{ fontFamily: 'var(--font-label)' }}>Diet Preference</label>
                  <div className="grid grid-cols-2 gap-4">
                    {["Vegetarian", "Vegan", "Omnivore", "Ketogenic"].map(diet => (
                      <button 
                        key={diet} 
                        onClick={() => setSelectedDiet(diet)}
                        className={`border p-6 text-left text-sm font-semibold flex justify-between items-center group transition-all rounded-lg ${selectedDiet === diet ? 'border-white bg-white/10 text-white' : 'border-white/5 hover:border-white/40 hover:bg-white/[0.02] bg-base-dark/50'}`}
                        style={{ fontFamily: 'var(--font-label)' }}
                      >
                        {diet}
                        {selectedDiet === diet ? <Check size={18} className="text-white" /> : <Check size={18} className="opacity-0 group-hover:opacity-100 transition-opacity text-white"/>}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-6 pt-4">
                  <button onClick={prevStep} className="px-10 py-5 opacity-40 hover:opacity-100 transition-opacity text-sm tracking-wide text-white bg-white/5 rounded-lg font-medium" style={{ fontFamily: 'var(--font-label)' }}>Back</button>
                  <button onClick={handleFinalize} className="flex-1 py-5 flex items-center justify-center gap-4 text-base bg-white text-black border border-white hover:bg-transparent hover:text-white transition-all font-semibold tracking-wide rounded-lg" style={{ fontFamily: 'var(--font-label)' }}>
                    Get Started <ShieldCheck size={20}/>
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <p className="mt-14 text-center text-sm text-white/30 font-medium border-t border-white/5 pt-8" style={{ fontFamily: 'var(--font-label)' }}>
            Already have an account? <Link href="/auth/login" className="text-white font-semibold hover:underline underline-offset-4 ml-1">Sign In</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
