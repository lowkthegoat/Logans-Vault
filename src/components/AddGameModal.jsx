import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Plus, Terminal } from "lucide-react";

const CATEGORY_PRESETS = [
  "Arcade",
  "Puzzle",
  "Classic",
  "Retro",
  "Sports & Racing",
  "Action"
];

export default function AddGameModal({ isOpen, onClose, onAdd }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Arcade");
  const [iframeUrl, setIframeUrl] = useState("");
  const [instructions, setInstructions] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");

    // Simple URL validation
    try {
      const parsedUrl = new URL(iframeUrl);
      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        setErrorMsg("URL must begin with http:// or https://");
        return;
      }
    } catch (_) {
      setErrorMsg("Please enter a valid absolute web URL for the iframe.");
      return;
    }

    onAdd({
      title: title.trim(),
      description: description.trim(),
      category,
      iframeUrl: iframeUrl.trim(),
      instructions: instructions.trim() || undefined
    });

    // Reset Form
    setTitle("");
    setDescription("");
    setCategory("Arcade");
    setIframeUrl("");
    setInstructions("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#050505]/95 backdrop-blur-sm pointer-events-auto"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ type: "tween", duration: 0.3 }}
            className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded overflow-hidden z-10 m-auto shadow-2xl"
            id="add-game-modal-body"
          >
            {/* Ambient indicator top line */}
            <div className="h-[2px] bg-indigo-500 w-full" />

            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-white/5 bg-[#080808]">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <h2 className="text-xs font-mono tracking-widest text-white uppercase select-none">
                  HOOK GAME SOURCE
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded text-white/40 hover:text-white transition-colors cursor-pointer"
                id="close-modal-btn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest">
                  Game Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. PACMAN REVENGE"
                  maxLength={50}
                  className="w-full bg-[#050505] border border-white/10 focus:border-indigo-500/80 rounded px-3.5 py-2.5 text-white placeholder:text-white/10 text-xs font-mono uppercase tracking-wider focus:outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#050505] border border-white/10 focus:border-indigo-500 rounded px-3.5 py-2.5 text-white/80 text-xs font-mono focus:outline-none transition-all"
                  >
                    {CATEGORY_PRESETS.map((preset) => (
                      <option key={preset} value={preset} className="bg-[#050505] text-[#e0e0e0]">
                        {preset.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest">
                    Iframe Source URL *
                  </label>
                  <input
                    type="text"
                    required
                    value={iframeUrl}
                    onChange={(e) => setIframeUrl(e.target.value)}
                    placeholder="https://example.com/game/"
                    className="w-full bg-[#050505] border border-white/10 focus:border-indigo-500 rounded px-3.5 py-2.5 text-white placeholder:text-white/10 text-xs font-mono focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest">
                  Description *
                </label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="WRITE BRIEF OVERVIEW OVER TARGET GRAPHICS OR GAMEPLAY MOTIVES..."
                  maxLength={180}
                  rows={2}
                  className="w-full bg-[#050505] border border-white/10 focus:border-indigo-500 rounded px-3.5 py-2.5 text-white placeholder:text-white/10 text-xs font-mono uppercase tracking-wide focus:outline-none transition-all resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest">
                  Controls & Instructions (Optional)
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="E.G. USE ARROWS TO NAVIGATE."
                  maxLength={400}
                  rows={2}
                  className="w-full bg-[#050505] border border-white/10 focus:border-indigo-500 rounded px-3.5 py-2.5 text-white placeholder:text-white/10 text-xs font-mono uppercase tracking-wide focus:outline-none transition-all resize-none"
                />
              </div>

              {errorMsg && (
                <p className="text-[10px] font-mono text-red-500 bg-red-950/10 border border-red-900/20 py-2 px-3 rounded uppercase tracking-widest">
                  {errorMsg}
                </p>
              )}

              {/* Action row */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-white/10 hover:border-white/30 text-white/40 hover:text-white rounded-sm transition-all cursor-pointer text-[10px] font-mono tracking-widest"
                >
                  ABORT
                </button>
                <button
                  type="submit"
                  id="submit-game-btn"
                  className="px-5 py-2 bg-[#111] border border-white/10 text-[10px] tracking-widest font-mono uppercase hover:bg-white hover:text-black transition-all cursor-pointer rounded-sm text-white flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2px]" />
                  MOUNT GAME
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
