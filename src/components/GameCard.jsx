import React from "react";
import { motion } from "motion/react";
import { 
  Sparkles, 
  Play, 
  Trash2
} from "lucide-react";

export default function GameCard({ game, onPlay, onDeleteCustom, role }) {
  // Admin role gets developer superpowers (can delete any game, custom or default)
  const canDelete = (game.isCustom || role === "admin") && onDeleteCustom;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
      className="relative flex flex-col justify-between h-56 rounded bg-[#0a0a0a] border border-white/5 transition-all duration-300 p-6 hover:bg-[#111] hover:border-white/10 overflow-hidden group shadow-lg"
      id={`game-card-${game.id}`}
    >
      {/* Visual Accent Glow Top Border */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-indigo-500/20 group-hover:bg-indigo-500 transition-colors duration-300" />

      <div>
        {/* Header Badges Row */}
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center gap-1 text-[10px] font-mono tracking-wider uppercase text-white/40 select-none">
            {game.category}
          </span>

          <div className="flex items-center gap-1.5">
            {game.isFeatured && (
              <span className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-mono bg-white/5 text-white/60 border border-white/10 rounded-sm select-none tracking-widest">
                HOT
              </span>
            )}
            {game.isCustom && (
              <span className="px-2 py-0.5 text-[9px] font-mono bg-indigo-950/20 text-indigo-300 border border-indigo-900/40 rounded-sm select-none tracking-widest">
                CUSTOM
              </span>
            )}
            {role === "admin" && !game.isCustom && (
              <span className="px-2 py-0.5 text-[9px] font-mono bg-amber-950/20 text-amber-300 border border-amber-900/40 rounded-sm select-none tracking-widest">
                SYSTEM
              </span>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="text-base font-medium text-white/80 group-hover:text-white transition-colors line-clamp-1 uppercase tracking-wide">
          {game.title}
        </h3>
        <p className="text-xs text-white/40 font-mono tracking-wide mt-2 line-clamp-3 leading-relaxed">
          {game.description}
        </p>
      </div>

      {/* Card Action Footer */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
        <button
          onClick={() => onPlay(game)}
          id={`play-${game.id}-btn`}
          className="flex items-center gap-1.5 text-xs text-white/60 font-mono tracking-widest hover:text-indigo-400 group-hover:translate-x-0.5 transition-all text-left uppercase"
        >
          <Play className="w-3 h-3 text-white/50 group-hover:text-indigo-400" />
          PLAY CODE
        </button>

        {/* Delete button (for custom games or if user is admin) */}
        {canDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteCustom(game.id);
            }}
            id={`delete-custom-${game.id}`}
            title={game.isCustom ? "Remove game from cabinet" : "Developer: Override & delete default system game"}
            className="p-1 rounded text-white/20 hover:text-red-500 hover:bg-red-950/20 border border-transparent hover:border-red-900/30 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Subtle corner vector arcade decoration */}
      <div className="absolute right-0 bottom-0 pointer-events-none opacity-[0.01] group-hover:opacity-[0.03] transition-opacity p-2 select-none text-white">
        <Sparkles className="w-16 h-16" />
      </div>
    </motion.div>
  );
}
