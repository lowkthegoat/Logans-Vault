import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  Plus, 
  Lock, 
  Sparkles, 
  Tv, 
  ShieldAlert,
  Terminal,
  Database,
  RefreshCw,
  Eye,
  Sliders
} from "lucide-react";
import PasswordScreen from "./components/PasswordScreen.jsx";
import GameCard from "./components/GameCard.jsx";
import GamePlayer from "./components/GamePlayer.jsx";
import AddGameModal from "./components/AddGameModal.jsx";
import staticGames from "./games.json";

export default function App() {
  // Gate check state (sessionStorage registers unlocked role: 'player' or 'admin')
  const [role, setRole] = useState(() => {
    return sessionStorage.getItem("arcade_unlocked_role") || null;
  });

  const [selectedGame, setSelectedGame] = useState(null);
  const [customGames, setCustomGames] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showDevControls, setShowDevControls] = useState(false);

  // Sync session storage on unlock
  const handleUnlock = (assignedRole) => {
    sessionStorage.setItem("arcade_unlocked_role", assignedRole);
    setRole(assignedRole);
  };

  // Force re-lock
  const handleLock = () => {
    sessionStorage.removeItem("arcade_unlocked_role");
    setRole(null);
    setSelectedGame(null);
  };

  // Load custom user games from local storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("custom_unblocked_games_data");
      if (stored) {
        setCustomGames(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Could not parse saved custom cabinet codes", e);
    }
  }, []);

  // Save user games back to storage
  const saveCustomGames = (updatedList) => {
    setCustomGames(updatedList);
    try {
      localStorage.setItem("custom_unblocked_games_data", JSON.stringify(updatedList));
    } catch (e) {
      console.error("Failure storing custom cabinet code changes", e);
    }
  };

  // Add custom game handler
  const handleAddCustomGame = (input) => {
    const newGame = {
      ...input,
      id: `custom-${Date.now()}`,
      isCustom: true
    };
    const updated = [newGame, ...customGames];
    saveCustomGames(updated);
  };

  // Delete custom game handler (Admin can delete BOTH custom and preset games!)
  const handleDeleteGame = (id) => {
    // If custom, delete from custom list
    if (customGames.some(g => g.id === id)) {
      const filtered = customGames.filter((g) => g.id !== id);
      saveCustomGames(filtered);
    } else if (role === "admin") {
      // If default game, we can hide/block it! Store hidden list in localStorage
      try {
        const hiddenStored = localStorage.getItem("hidden_default_games") || "[]";
        const hiddenList = JSON.parse(hiddenStored);
        if (!hiddenList.includes(id)) {
          hiddenList.push(id);
          localStorage.setItem("hidden_default_games", JSON.stringify(hiddenList));
          // Force active state refresh
          setCustomGames([...customGames]); // Simple trigger
        }
      } catch (e) {
        console.error("Error hiding default game", e);
      }
    }

    if (selectedGame?.id === id) {
      setSelectedGame(null);
    }
  };

  // Restore factory settings: clear all custom games AND restore deleted default ones
  const handleRestoreDefaults = () => {
    if (window.confirm("Developer Override: Clear registry changes & restore defaults?")) {
      localStorage.removeItem("custom_unblocked_games_data");
      localStorage.removeItem("hidden_default_games");
      setCustomGames([]);
      setSelectedGame(null);
    }
  };

  // Quick preset loading helper for owner convenience
  const handleLoadPreset = (presetUrl, title, category, description) => {
    handleAddCustomGame({
      title,
      category,
      description,
      iframeUrl: presetUrl,
      instructions: "Enjoy testing this preset frame inside Shadow.Vault!"
    });
  };

  // Combine static predefined JSON catalog and custom user games
  const allGames = useMemo(() => {
    let hiddenList = [];
    try {
      const hiddenStored = localStorage.getItem("hidden_default_games");
      if (hiddenStored) hiddenList = JSON.parse(hiddenStored);
    } catch (e) {}

    const presets = staticGames.filter(g => !hiddenList.includes(g.id));
    return [...customGames, ...presets];
  }, [customGames]);

  // Derive unique categories from available items
  const categories = useMemo(() => {
    const list = new Set();
    list.add("All");
    allGames.forEach((g) => {
      if (g.category) list.add(g.category);
    });
    return Array.from(list);
  }, [allGames]);

  // Filter games checklist based on query and selected category tab
  const filteredGames = useMemo(() => {
    return allGames.filter((game) => {
      const matchesSearch = 
        game.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        game.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = 
        activeCategory === "All" || 
        game.category.toLowerCase() === activeCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [allGames, searchQuery, activeCategory]);

  // Guard Lock Screen rendering
  if (!role) {
    return <PasswordScreen onUnlock={handleUnlock} />;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] flex flex-col font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      
      {/* Background Mesh Grid (Decorative) */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none elegant-bg-grid z-0" />

      {/* Main Elegant Header */}
      <header className="sticky top-0 z-30 bg-[#080808] border-b border-white/5 select-none h-16 flex items-center">
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div 
            onClick={() => setSelectedGame(null)} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-6 h-6 bg-indigo-500 rounded-sm rotate-45 transition-transform group-hover:rotate-90 duration-300 shadow-[0_0_12px_rgba(99,102,241,0.3)]" />
            <span className="font-mono font-bold tracking-[0.3em] text-sm uppercase text-white hover:text-indigo-400 transition-colors">
              Shadow.Vault
            </span>
          </div>

          {/* Header Action Tools */}
          <div className="flex gap-4 sm:gap-6 items-center">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[9px] uppercase tracking-widest text-white/30 font-mono">CURRENT CATALOG</span>
              <span className="font-mono text-[11px] text-[#e0e0e0]">{allGames.length} TITLES LOADED</span>
            </div>
            
            {/* ONLY SHOW "HOOK GAME" for SuperPower (admin role!) */}
            {role === "admin" && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                id="header-add-game-btn"
                className="px-4 py-2 bg-[#111] border border-white/10 text-[10px] tracking-[0.2em] font-mono uppercase hover:bg-white hover:text-black transition-all cursor-pointer rounded-sm text-white"
              >
                HOOK GAME
              </button>
            )}

            <button
              onClick={handleLock}
              id="header-lock-btn"
              title="Lock system gate"
              className="p-2 border border-white/10 hover:border-red-500/50 hover:bg-red-950/20 text-white/40 hover:text-red-400 rounded transition-all cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>

            <div 
              title={role === "admin" ? "Role: Owner / SuperPower" : "Role: Player / Applejack"}
              className={`w-8 h-8 rounded-full border flex items-center justify-center text-[10px] font-mono select-none px-1.5 ${
                role === "admin" 
                  ? "bg-amber-950/40 border-amber-500/40 text-amber-400 font-bold shadow-[0_0_8px_rgba(245,158,11,0.2)]" 
                  : "bg-white/5 border-white/10 text-white/80"
              }`}
            >
              {role === "admin" ? "SP" : "AJ"}
            </div>
          </div>

        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 sm:px-10 py-6 sm:py-10 z-10">
        
        {selectedGame ? (
          /* Active Game Player Module */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
          >
            <GamePlayer 
              game={selectedGame} 
              onBack={() => setSelectedGame(null)} 
              role={role}
            />
          </motion.div>
        ) : (
          /* Main Games Browse Directory */
          <div className="space-y-8">
            
            {/* Visual Hero Banner */}
            <div className="relative overflow-hidden rounded bg-gradient-to-br from-[#0c0c0c] to-[#040404] p-8 sm:p-10 border border-white/5 select-none shadow-2xl">
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none elegant-bg-grid" />
              
              <div className="max-w-3xl text-left space-y-3 relative z-10">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 text-[9px] font-mono text-indigo-400 bg-indigo-950/20 border border-indigo-900/30 uppercase tracking-widest rounded-sm">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  GATEWAY UNLOCKED [{role === "admin" ? "SUPERPOWER" : "AJ"}]
                </div>
                <h1 className="text-xl sm:text-2xl font-light tracking-[0.1em] text-white uppercase font-sans">
                  The Shadow.Vault Registry
                </h1>
                <p className="text-xs sm:text-xs text-white/50 font-mono tracking-wide leading-relaxed max-w-2xl">
                  {role === "admin" 
                    ? "Welcome Owner. Developer console bypass validated successfully. Complete execution rights initialized. Toggle admin instruments pool below."
                    : "A premium secure container of bypass frames and physics layouts. Zero local dependencies or execution permissions requested."
                  }
                </p>

                {/* Owner Only Dev Features Button */}
                {role === "admin" && (
                  <div className="pt-2">
                    <button
                      onClick={() => setShowDevControls(!showDevControls)}
                      className="px-4 py-1.5 bg-indigo-950/40 hover:bg-indigo-950/90 border border-indigo-900 text-[10px] font-mono tracking-wider text-indigo-300 uppercase rounded cursor-pointer transition-colors flex items-center gap-2"
                    >
                      <Database className="w-3.5 h-3.5" />
                      {showDevControls ? "Hide Admin Instruments" : "Show Admin Instruments"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Collapsible Admin Instruments Control Deck */}
            {role === "admin" && showDevControls && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-6 bg-[#080808] border border-indigo-900/40 rounded-sm font-mono text-xs space-y-4"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-2">
                    <Terminal className="w-4 h-4 animate-pulse" />
                    Admin Control Deck (Bypass Terminal)
                  </span>
                  <span className="text-[10px] text-white/20 select-none">
                    LEVEL-1 CODES ENABLED
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Registry Controls */}
                  <div className="p-4 bg-black/40 border border-white/5 rounded space-y-3">
                    <span className="text-white/60 font-semibold uppercase text-[10px] tracking-wider block border-b border-white/5 pb-1">
                      REGISTRY PROTOCOLS
                    </span>
                    <p className="text-[11px] text-white/40">
                      Wipe the local client-side memory to recreate original catalog file assets.
                    </p>
                    <button
                      onClick={handleRestoreDefaults}
                      className="w-full py-2 bg-red-950/20 hover:bg-red-950 border border-red-900 text-[10px] text-red-400 hover:text-white uppercase tracking-wider rounded transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Restore Factory Defaults
                    </button>
                  </div>

                  {/* Built-in quick loaders */}
                  <div className="p-4 bg-black/40 border border-white/5 rounded space-y-3 col-span-2">
                    <span className="text-white/60 font-semibold uppercase text-[10px] tracking-wider block border-b border-white/5 pb-1">
                      QUICK LOAD SANDBOX TARGETS (TESTING FRAMEWORKS)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        onClick={() => handleLoadPreset(
                          "https://bellard.org/jslinux/",
                          "V8 Linux Terminal",
                          "Sandbox",
                          "Full Linux emulator inside canvas created by Fabrice Bellard. Direct x86 stack parsing."
                        )}
                        className="p-2 text-[10px] text-indigo-300 hover:text-white bg-indigo-950/10 hover:bg-indigo-950/40 border border-indigo-900/30 hover:border-indigo-800 rounded transition-all text-left truncate"
                      >
                        ⚡ Mount V8 Linux Terminal
                      </button>
                      <button
                        onClick={() => handleLoadPreset(
                          "https://classicreload.com/dosbox-java-applet-doom-classic.html",
                          "Doom MS-DOS Live",
                          "Retro",
                          "Classic Doom DOS emulator loading within shadow iframe structures."
                        )}
                        className="p-2 text-[10px] text-indigo-300 hover:text-white bg-indigo-950/10 hover:bg-indigo-950/40 border border-indigo-900/30 hover:border-indigo-800 rounded transition-all text-left truncate"
                      >
                        ⚡ Mount Doom MS-DOS Emulator
                      </button>
                      <button
                        onClick={() => handleLoadPreset(
                          "https://playclassic.games/games/action-dos-games-online/play-prince-of-persia-online/play/",
                          "Prince of Persia Online",
                          "Classic",
                          "Traditional 1989 platformer running in a simulated PC DOS frame environment."
                        )}
                        className="p-2 text-[10px] text-indigo-300 hover:text-white bg-indigo-950/10 hover:bg-indigo-950/40 border border-indigo-900/30 hover:border-indigo-800 rounded transition-all text-left truncate"
                      >
                        ⚡ Mount Prince of Persia
                      </button>
                      <button
                        onClick={() => handleLoadPreset(
                          "https://archive.org/embed/arcade_pacman",
                          "Pacman Archive Cab",
                          "Arcade",
                          "Pre-configured reference arcade cabinet hosted on archive.org"
                        )}
                        className="p-2 text-[10px] text-indigo-300 hover:text-white bg-indigo-950/10 hover:bg-indigo-950/40 border border-indigo-900/30 hover:border-indigo-800 rounded transition-all text-left truncate"
                      >
                        ⚡ Mount Pac-Man (Archive Preset)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Simulated Telemetry info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-white/5 text-[10px] text-white/30">
                  <div>SESSION_ID: <span className="text-indigo-400">ADMIN_NODE_09X</span></div>
                  <div>RESTRICTION_LEVEL: <span className="text-indigo-400">BYPASS_PASSIVE_CLEAR</span></div>
                  <div>FRAME_INJECTION_CAPS: <span className="text-emerald-400">SECURE_VERIFIED</span></div>
                  <div>JSON_STORES_COUNT: <span className="text-indigo-400">{allGames.length}</span></div>
                </div>
              </motion.div>
            )}

            {/* Portal Search & Categories Filtration Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#080808] p-4 rounded border border-white/5">
              
              {/* Category Quick Filter Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none shrink-0 max-w-full">
                {categories.map((cat) => {
                  const isActive = activeCategory.toLowerCase() === cat.toLowerCase();
                  return (
                    <button
                      key={cat}
                      id={`category-tab-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-3 py-1 text-[11px] font-mono tracking-widest uppercase transition-all duration-300 cursor-pointer rounded-sm ${
                        isActive 
                          ? "bg-white text-black font-semibold shadow-md border border-white"
                          : "bg-transparent border border-white/10 text-white/40 hover:text-white hover:border-white/30"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* Text Search Input */}
              <div className="relative flex-1 md:max-w-xs">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-white/20">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  id="game-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="SEARCH VAULT..."
                  className="w-full bg-transparent border border-white/10 focus:border-indigo-500 rounded py-2 pl-9 pr-4 text-xs text-[#e0e0e0] font-mono placeholder:text-white/10 focus:outline-none transition-all"
                />
              </div>

            </div>

            {/* Games Infinite Responsive Grid Dashboard */}
            <AnimatePresence mode="popLayout">
              {filteredGames.length > 0 ? (
                <motion.div 
                  layout
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                  {filteredGames.map((game) => (
                    <GameCard
                      key={game.id}
                      game={game}
                      onPlay={setSelectedGame}
                      onDeleteCustom={handleDeleteGame}
                      role={role}
                    />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-16 bg-[#080808] border border-dashed border-white/10 rounded"
                >
                  <Tv className="w-8 h-8 text-white/10 mx-auto mb-3 animate-pulse" />
                  <h3 className="text-xs font-mono tracking-[0.2em] text-white/40 uppercase">NO ENGINES REGISTERED</h3>
                  <p className="text-xs text-white/20 font-mono mt-1 max-w-xs mx-auto">
                    {role === "admin" 
                      ? "Mount custom frames using the 'HOOK GAME' action tool in top console bar."
                      : "Adjust filter criteria or request system unblock credentials."
                    }
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        )}

      </main>

      {/* Modal Add Game Dialog */}
      {role === "admin" && (
        <AddGameModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddCustomGame}
        />
      )}

      {/* Elegant Dark Footer Stats */}
      <footer className="border-t border-white/5 bg-[#050505] select-none h-16 flex items-center">
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 flex items-center justify-between text-[10px] text-white/20 font-mono tracking-widest">
          <span>ENCRYPTION: AES-256-GCM</span>
          <span>ROLE: {role ? role.toUpperCase() : "UNAUTHENTICATED"}</span>
          <span>STATUS: SECURE_ENVIRONMENT</span>
        </div>
      </footer>

    </div>
  );
}
