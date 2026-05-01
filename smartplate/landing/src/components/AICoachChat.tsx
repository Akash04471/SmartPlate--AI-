"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, Sparkles, Loader2, Bot, Trash2 } from "lucide-react";
import { chatWithCoach } from "@/utils/api";
import TypedMessage from "./TypedMessage";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: "user" | "model";
  content: string;
  isNew?: boolean;
}

export default function AICoachChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", content: "Protocol synchronized. I am SmartPlate AI, your precision nutrition coach. How can I assist your metabolic journey today?", isNew: false }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    
    // Mark all previous messages as not new
    setMessages((prev) => prev.map(m => ({ ...m, isNew: false })));
    setMessages((prev) => [...prev, { role: "user", content: userMessage, isNew: true }]);
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const response = await chatWithCoach(userMessage, history);
      setMessages((prev) => [...prev, { role: "model", content: response.message, isNew: true }]);
    } catch (err: any) {
      console.error("Chat error:", err);
      setMessages((prev) => [...prev, { 
        role: "model", 
        content: err.message || "Neural link interrupted. Please verify your connection to the metabolic grid.", 
        isNew: true 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ role: "model", content: "Memory buffer cleared. System ready for new session.", isNew: true }]);
  };

  return (
    <div className="flex flex-col h-full bg-black/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Neural Network Active</span>
        </div>
        <button 
          onClick={clearChat}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/20 hover:text-white"
          title="Clear Session"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Chat Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar scroll-smooth min-h-[400px]"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex gap-4 w-full max-w-[92%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                  msg.role === "user" 
                    ? "bg-white/10 border-white/20 text-white" 
                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                }`}>
                  {msg.role === "user" ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div className={`p-6 md:p-8 rounded-[2rem] text-base md:text-lg leading-relaxed ${
                  msg.role === "user"
                    ? "bg-white text-black font-semibold rounded-tr-none shadow-xl"
                    : "bg-white/[0.04] border border-white/10 text-white/90 rounded-tl-none"
                }`}>
                  {msg.role === "model" && msg.isNew ? (
                    <TypedMessage text={msg.content} speed={8} />
                  ) : (
                    <div className="prose prose-invert prose-base md:prose-lg max-w-none font-medium">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex gap-3 items-center bg-white/[0.02] border border-white/5 p-4 rounded-2xl rounded-tl-none">
              <Loader2 size={14} className="animate-spin text-emerald-400" />
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Synthesizing Response...</span>
                <span className="text-[8px] font-bold text-emerald-500/40 animate-pulse uppercase tracking-widest">Calibrating Neural Links</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white/[0.03] border-t border-white/5 mt-auto">
        <div className="relative group">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Discuss your fitness trajectory..."
            className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-5 pr-14 text-sm focus:outline-none focus:border-emerald-500/40 transition-all resize-none h-16 custom-scrollbar text-white placeholder:text-white/20"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className={`absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl transition-all ${
              input.trim() && !loading
                ? "bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:scale-105 active:scale-95"
                : "bg-white/5 text-white/20"
            }`}
          >
            <Send size={18} />
          </button>
        </div>
        <div className="mt-4 flex justify-between items-center px-2">
          <div className="flex items-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
            <Sparkles size={10} className="text-emerald-400" />
            <span className="text-[9px] font-black uppercase tracking-widest text-white/60">Neural Analysis Active</span>
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-white/20 italic">Press Enter to Send</span>
        </div>
      </div>
    </div>
  );
}
