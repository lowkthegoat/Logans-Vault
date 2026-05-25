import React, { useState, useRef } from "react";
import { 
  ArrowLeft, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  BookOpen, 
  Wifi, 
  Tv, 
  Share2, 
  Copy,
  Check,
  Terminal,
  Play
} from "lucide-react";

export default function GamePlayer({ game: initialGame, onBack, role }) {
  const [game, setGame] = useState(initialGame);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [key, setKey] = useState(0); 
  const containerRef = useRef(null);

  // Dev feature state
  const [overrideUrl, setOverrideUrl] = useState(game.iframeUrl);
  const [isUrlOverridden, setIsUrlOverridden] = useState(false);

  const handleReload = () => {
    setKey((prev) => prev + 1);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  const handleCopyIframe = () => {
    const iframeCode = `<iframe src="${game.iframeUrl}" width="100%" height="600px" frameborder="0" allowfullscreen></iframe>`;
    navigator.clipboard.writeText(iframeCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Developer URL Live Hot-Reload override function
  const handleApplyOverrideUrl = (e) => {
    e.preventDefault();
    setGame(prev => ({
      ...prev,
      iframeUrl: overrideUrl
    }));
    setIsUrlOverridden(true);
    setKey(prev => prev + 1);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto px-4 py-3" id="arcade-player">
      {/* Navigation & Stats header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <button
          onClick={onBack}
          id="back-to-catalog-btn"
          className="inline-flex items-center gap-2.5 font-mono text-[11px] tracking-wider text-white/40 hover:text-indigo-400 cursor-pointer transition-colors w-fit uppercase"
        >
          <ArrowLeft className="w-4 h-4" />
          RETURN TO CABINET LIST
        </button>

        <div className="flex items-center gap-2.5 select-none text-[10px] font-mono text-indigo-400 bg-indigo-950/20 border border-indigo-900/20 rounded px-4 py-1.5 w-fit uppercase tracking-widest">
          <Wifi className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          {role === "admin" ? "PORTAL DEV CONSOLE ENABLED" : "CABINET CONNECTED &bull; LATENCY 12MS"}
        </div>
      </div>

      {/* Playback Container Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* The Frame Player Screen */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          {/* Main Frame Wrapper */}
          <div 
            ref={containerRef}
            className={`relative rounded overflow-hidden bg-black border border-white/5 shadow-2xl flex flex-col ${
              isFullscreen ? "w-screen h-screen rounded-none border-0 animate-none" : "aspect-video min-h-[460px]"
            }`}
          >
            {/* Top Cabinet Status Hub */}
            <div className="bg-[#080808] border-b border-white/5 px-4 py-2.5 flex items-center justify-between select-none shrink-0 font-mono text-[10px] text-white/40">
              <div className="flex items-center gap-2">
                <Tv className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-white/80 uppercase tracking-wider font-medium">
                  {game.title} {isUrlOverridden && <span className="text-amber-500 font-mono text-[9px] lowercase italic">(dev override)</span>}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleReload}
                  id="reload-game-btn"
                  title="Reload Game Frame"
                  className="flex items-center gap-1.5 hover:text-white transition-colors uppercase py-1 px-1.5 rounded cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3 text-white/40 hover:text-white" />
                  <span className="hidden sm:inline">RELOAD</span>
                </button>
                <div className="h-3 w-[1px] bg-white/5" />
                <button
                  onClick={toggleFullscreen}
                  id="fullscreen-toggle-btn"
                  title="Toggle Fullscreen"
                  className="flex items-center gap-1.5 hover:text-white transition-colors uppercase py-1 px-1.5 rounded cursor-pointer"
                >
                  {isFullscreen ? (
                    <>
                      <Minimize2 className="w-3.5 h-3.5 text-white/40 hover:text-white" />
                      <span className="hidden sm:inline">MINIMIZE</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-3.5 h-3.5 text-white/40 hover:text-white" />
                      <span className="hidden sm:inline">EXPAND</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Iframe element */}
            <div className="relative flex-1 w-full h-full bg-[#050505]">
              <iframe
                key={`${game.id}-${key}`}
                src={game.iframeUrl}
                title={game.title}
                referrerPolicy="no-referrer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; gamepad; focus-without-user-activation; pointer-lock"
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals allow-pointer-lock"
              />
            </div>
          </div>

          {/* Quick Stats Panel Below Player */}
          <div className="flex items-center justify-between px-2 text-[10px] font-mono text-white/20 select-none tracking-wider">
            <span>IFRAME HOST: <span className="text-white/40 truncate max-w-xs inline-block align-bottom">{new URL(game.iframeUrl).hostname}</span></span>
            <span className="hidden sm:inline">STATUS: BYPASS CONTAINER SANDBOX-PASSIVE</span>
          </div>

          {/* DEV FEATURES: Developer URL Hot-Reload & Status Panel (ONLY visible for SuperPower password) */}
          {role === "admin" && (
            <div className="mt-4 p-5 bg-[#0a0a0a] border border-indigo-900/40 rounded space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <span className="font-mono text-xs uppercase text-indigo-300 tracking-wider font-semibold">
                  DEVELOPER TUNNEL OVERRIDE & DEBUGGER
                </span>
              </div>
              <form onSubmit={handleApplyOverrideUrl} className="flex gap-2">
                <input
                  type="text"
                  value={overrideUrl}
                  onChange={(e) => setOverrideUrl(e.target.value)}
                  placeholder="Insert custom dev target iframe URL..."
                  className="flex-1 bg-[#050505] border border-white/10 rounded px-3 py-1.5 text-white text-xs font-mono focus:border-indigo-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-indigo-950 text-indigo-300 border border-indigo-900 px-4 py-1.5 rounded text-xs font-mono hover:bg-indigo-900 hover:text-white transition-colors cursor-pointer uppercase flex items-center gap-1.5"
                >
                  <Play className="w-3 h-3" />
                  Override Frame
                </button>
              </form>
              <div className="grid grid-cols-2 gap-4 text-[11px] font-mono text-white/40">
                <div className="bg-[#050505] p-3 rounded border border-white/5">
                  <span className="text-indigo-400/80 font-bold block mb-1">LOCAL_SECURE_STORAGE</span>
                  KEYS_ACCESSIBLE: TRUE <br />
                  INDEXED_DB: STATE_RESTORED
                </div>
                <div className="bg-[#050505] p-3 rounded border border-white/5">
                  <span className="text-indigo-400/80 font-bold block mb-1">SYSTEM_BYPASS_MODE</span>
                  RESTRICTIONS: NULLIFIED <br />
                  EMBED_GENERATION: ACTIVE
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Info & Side Instructions Column */}
        <div className="lg:col-span-1 space-y-5">
          {/* About game panel */}
          <div className="rounded bg-[#0a0a0a] p-5 border border-white/5 shadow-md">
            <span className="inline-block px-2 py-0.5 text-[9px] font-mono tracking-widest text-[#e0e0e0] bg-white/5 border border-white/10 rounded uppercase mb-3 select-none">
              {game.category}
            </span>
            <h2 className="text-base font-medium text-white uppercase tracking-wider">
              {game.title}
            </h2>
            <p className="text-xs text-white/40 font-mono mt-3 leading-relaxed">
              {game.description}
            </p>
          </div>

          {/* Game controls / bindings */}
          <div className="rounded bg-[#0a0a0a] p-5 border border-white/5 shadow-md">
            <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2.5">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <h3 className="text-[10px] font-mono tracking-widest text-white/60 uppercase select-none">
                INSTRUCTIONS
              </h3>
            </div>
            
            <p className="text-xs text-white/50 font-mono leading-relaxed whitespace-pre-wrap">
              {game.instructions || "Click anywhere inside the game boundary to initialize keyboard/mouse focus, then use normal action inputs to play."}
            </p>
          </div>

          {/* Share/Embed Code panel */}
          <div className="rounded bg-[#0a0a0a] p-5 border border-white/5 shadow-md space-y-3">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
              <Share2 className="w-4 h-4 text-indigo-400" />
              <h3 className="text-[10px] font-mono tracking-widest text-white/60 uppercase select-none">
                SHARE GAME
              </h3>
            </div>

            <p className="text-[10px] text-white/30 font-mono">
              Copy raw HTML embed code to host this pre-configured game card.
            </p>

            <button
              onClick={handleCopyIframe}
              id="copy-iframe-embed-btn"
              className="flex items-center justify-between w-full p-2.5 rounded bg-transparent border border-white/10 hover:border-white/20 font-mono text-[10px] text-white/50 hover:text-white transition-all text-left cursor-pointer"
            >
              <span className="truncate pr-2">{"<iframe ... /> snippet"}</span>
              {copiedCode ? (
                <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-white/20 shrink-0" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
