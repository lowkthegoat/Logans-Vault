import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck, ShieldAlert } from "lucide-react";

export default function PasswordScreen({ onUnlock }) {
  const [password, setPassword] = useState("");
  const [errorCount, setErrorCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === "Applejack") {
      setIsSuccess(true);
      setErrorMsg("");
      setTimeout(() => {
        onUnlock("player");
      }, 800);
    } else if (password === "SuperPower") {
      setIsSuccess(true);
      setErrorMsg("");
      setTimeout(() => {
        onUnlock("admin");
      }, 800);
    } else {
      setErrorCount((prev) => prev + 1);
      setErrorMsg("Signature mismatch. Access denied.");
      setPassword("");
      const timer = setTimeout(() => setErrorMsg(""), 3000);
      return () => clearTimeout(timer);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505] text-[#e0e0e0] overflow-hidden font-sans">
      {/* Background Mesh Grid (Decorative) */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none elegant-bg-grid"
      />

      <div className="absolute top-4 left-4 font-mono text-[10px] text-white/20 select-none z-0 hidden sm:block">
        SECURE_TUNNEL: COMPLETED // LEVEL-1A
      </div>
      <div className="absolute top-4 right-4 font-mono text-[10px] text-white/20 select-none z-0 hidden sm:block">
        LOC_TIME: {new Date().toLocaleTimeString()}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg p-10 text-center z-10 m-4 relative flex flex-col items-center"
        id="password-cabinet"
      >
        {/* Lock Icon Circle */}
        <div className="mb-8 inline-block p-6 rounded-full border border-white/10 bg-[#0a0a0a] shadow-2xl shadow-indigo-900/10 transition-colors duration-300">
          {isSuccess ? (
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 360, 360] }}
              transition={{ duration: 0.5 }}
            >
              <ShieldCheck className="w-10 h-10 text-indigo-400" />
            </motion.div>
          ) : errorMsg ? (
            <motion.div
              animate={{ x: [-10, 10, -10, 10, 0] }}
              transition={{ duration: 0.3 }}
            >
              <ShieldAlert className="w-10 h-10 text-red-500" />
            </motion.div>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          )}
        </div>

        <h1 className="text-3xl font-light tracking-[0.2em] uppercase text-white mb-2">
          System Lock
        </h1>
        <p className="text-xs text-white/40 tracking-[0.3em] uppercase mb-10">
          Authentication required for portal access
        </p>

        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-8">
          <div className="relative">
            <input
              id="main-password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-transparent border-b border-white/20 py-4 text-center text-2xl tracking-[0.5em] focus:outline-none focus:border-indigo-500 transition-all placeholder:text-white/5 uppercase text-white font-mono"
              autoComplete="off"
              autoFocus
            />
          </div>

          <AnimatePresence mode="wait">
            {errorMsg && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center text-[10px] font-mono text-red-500 uppercase tracking-widest"
              >
                Signature mismatch. Access denied.
              </motion.p>
            )}
          </AnimatePresence>

          <div className="mt-8">
            <button
              type="submit"
              id="password-submit-btn"
              disabled={isSuccess}
              className="px-12 py-3 bg-[#111] border border-white/10 text-[11px] tracking-[0.4em] uppercase hover:bg-white hover:text-black transition-all active:scale-95 cursor-pointer text-white font-mono"
            >
              {isSuccess ? "LINK SECURED..." : "Establish Link"}
            </button>
          </div>
        </form>

        {/* Hints or Easter eggs */}
        {errorCount >= 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-12 text-center text-[10px] font-mono text-white/30 border-t border-white/5 pt-4 max-w-xs"
          >
            💡 <span className="text-white/50 font-semibold italic">Hint:</span> Standard password is an orange pony starting with capital A. Dev credentials are super.
          </motion.div>
        )}
      </motion.div>

      {/* Retro bottom watermark info */}
      <div className="absolute bottom-4 text-center text-[9px] font-mono text-white/20 select-none z-0 tracking-widest">
        ENCRYPTION: AES-256-GCM &bull; STATUS: SECURE_ENVIRONMENT
      </div>
    </div>
  );
}
