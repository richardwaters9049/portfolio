"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type AnimatedDemoWindowProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  demoUrl: string;
};

type LaunchMode = "fullscreen" | null;
type WindowMode = "windowed" | "fullscreen";
type LaunchChoice = "new-tab" | "fullscreen";

function WindowControls({
  canUseAppControls,
  isMinimized,
  isFullscreen,
  onClose,
  onMinimize,
  onToggleFullscreen,
}: {
  canUseAppControls: boolean;
  isMinimized: boolean;
  isFullscreen: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onToggleFullscreen: () => void;
}) {
  const controlClass =
    "group relative flex h-3.5 w-3.5 items-center justify-center rounded-full transition-transform duration-200 hover:scale-110";

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close window"
        className={`${controlClass} bg-[#ff5f57] shadow-[0_0_16px_rgba(255,95,87,0.38)]`}
      >
        <span className="text-[8px] font-bold text-black/70 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          ×
        </span>
      </button>
      <button
        type="button"
        onClick={onMinimize}
        aria-label={isMinimized ? "Restore window" : "Minimize window"}
        disabled={!canUseAppControls}
        className={`${controlClass} bg-[#febc2e] shadow-[0_0_16px_rgba(254,188,46,0.38)] disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none`}
      >
        <span className="text-[8px] font-bold text-black/70 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          -
        </span>
      </button>
      <button
        type="button"
        onClick={onToggleFullscreen}
        aria-label={isFullscreen ? "Exit full screen" : "Enter full screen"}
        disabled={!canUseAppControls}
        className={`${controlClass} bg-[#28c840] shadow-[0_0_16px_rgba(40,200,64,0.38)] disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none`}
      >
        <span className="text-[8px] font-bold text-black/70 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          +
        </span>
      </button>
    </div>
  );
}

export default function AnimatedDemoWindow({
  isOpen,
  onClose,
  title,
  demoUrl,
}: AnimatedDemoWindowProps) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [videoFinished, setVideoFinished] = useState(false);
  const [videoKey, setVideoKey] = useState(0);
  const [launchMode, setLaunchMode] = useState<LaunchMode>(null);
  const [windowMode, setWindowMode] = useState<WindowMode>("windowed");
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<LaunchChoice>("fullscreen");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setIframeLoaded(false);
    setVideoFinished(false);
    setLaunchMode(null);
    setWindowMode("windowed");
    setIsMinimized(false);
    setSelectedChoice("fullscreen");
    setVideoKey((current) => current + 1);
  }, [isOpen, demoUrl]);

  const isAppReady = iframeLoaded && videoFinished;
  const shouldShowChooser = isAppReady && launchMode === null;
  const shouldShowFullscreenApp =
    isAppReady && launchMode === "fullscreen" && !isMinimized;
  const isFullscreen = windowMode === "fullscreen" && !isMinimized;

  const statusLabel = useMemo(() => {
    if (!videoFinished) {
      return "Running terminal intro";
    }

    if (!iframeLoaded) {
      return "Application is still finishing startup";
    }

    if (launchMode === null) {
      return "Launch mode ready";
    }

    if (isMinimized) {
      return "Window minimized";
    }

    return isFullscreen ? "Application in full screen" : "Application in window";
  }, [iframeLoaded, isFullscreen, isMinimized, launchMode, videoFinished]);

  const handleOpenNewTab = () => {
    window.open(demoUrl, "_blank", "noopener,noreferrer");
    onClose();
  };

  const handleLaunchFullscreen = () => {
    setLaunchMode("fullscreen");
    setWindowMode("fullscreen");
    setIsMinimized(false);
  };

  useEffect(() => {
    if (!isOpen || !shouldShowChooser) {
      return;
    }

    const toggleChoice = () => {
      setSelectedChoice((current) =>
        current === "fullscreen" ? "new-tab" : "fullscreen",
      );
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "ArrowLeft" ||
        event.key === "ArrowRight" ||
        event.key === "ArrowUp" ||
        event.key === "ArrowDown" ||
        event.key === "Tab"
      ) {
        event.preventDefault();
        toggleChoice();
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (selectedChoice === "new-tab") {
          handleOpenNewTab();
        } else {
          handleLaunchFullscreen();
        }
        return;
      }

      if (event.key.toLowerCase() === "f") {
        event.preventDefault();
        setSelectedChoice("fullscreen");
        return;
      }

      if (event.key.toLowerCase() === "n") {
        event.preventDefault();
        setSelectedChoice("new-tab");
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, selectedChoice, shouldShowChooser]);

  const chooserButtonClass = (choice: LaunchChoice, tone: "cyan" | "emerald") => {
    const isSelected = selectedChoice === choice;

    if (tone === "cyan") {
      return `group relative overflow-hidden rounded-[1.4rem] border p-5 text-left transition duration-300 ${
        isSelected
          ? "border-cyan-200/80 bg-[linear-gradient(180deg,rgba(34,211,238,0.24),rgba(8,47,73,0.34))] shadow-[0_0_38px_rgba(34,211,238,0.22)]"
          : "border-cyan-400/35 bg-[linear-gradient(180deg,rgba(34,211,238,0.12),rgba(8,47,73,0.18))] hover:-translate-y-1 hover:border-cyan-300/60 hover:shadow-[0_0_30px_rgba(34,211,238,0.16)]"
      }`;
    }

    return `group relative overflow-hidden rounded-[1.4rem] border p-5 text-left transition duration-300 ${
      isSelected
        ? "border-emerald-200/80 bg-[linear-gradient(180deg,rgba(16,185,129,0.24),rgba(5,46,22,0.34))] shadow-[0_0_38px_rgba(16,185,129,0.24)]"
        : "border-emerald-400/35 bg-[linear-gradient(180deg,rgba(16,185,129,0.12),rgba(5,46,22,0.22))] hover:-translate-y-1 hover:border-emerald-300/60 hover:shadow-[0_0_30px_rgba(16,185,129,0.16)]"
    }`;
  };

  const handleToggleFullscreen = () => {
    if (!isAppReady || launchMode !== "fullscreen") {
      return;
    }

    setWindowMode((current) =>
      current === "fullscreen" ? "windowed" : "fullscreen",
    );
    setIsMinimized(false);
  };

  const handleMinimize = () => {
    if (!isAppReady || launchMode !== "fullscreen") {
      return;
    }

    setIsMinimized((current) => !current);
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className={`fixed inset-0 z-50 ${
            isMinimized
              ? "pointer-events-none flex items-end justify-end bg-transparent p-5"
              : `flex items-center justify-center bg-black/70 ${
                  shouldShowFullscreenApp ? "p-0" : "p-4"
                }`
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          <motion.div
            className={`pointer-events-auto w-full overflow-hidden border border-emerald-500/35 bg-[#081008] shadow-[0_0_45px_rgba(16,185,129,0.18)] ${
              isMinimized
                ? "max-w-sm rounded-2xl"
                : shouldShowFullscreenApp
                  ? "h-[100dvh] max-w-none rounded-none border-x-0 border-b-0"
                  : "max-w-6xl rounded-2xl"
            }`}
            onClick={(event) => event.stopPropagation()}
            initial={{ opacity: 0, y: 28, scale: 0.97, rotateX: -6 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, y: 18, scale: 0.98, rotateX: 5 }}
            transition={{ type: "spring", stiffness: 320, damping: 26, mass: 0.95 }}
          >
            <div className="flex items-center justify-between border-b border-emerald-500/30 bg-[#101810] px-4 py-3">
              <WindowControls
                canUseAppControls={isAppReady && launchMode === "fullscreen"}
                isMinimized={isMinimized}
                isFullscreen={isFullscreen}
                onClose={onClose}
                onMinimize={handleMinimize}
                onToggleFullscreen={handleToggleFullscreen}
              />
              <div className="text-center">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-emerald-200/90">
                  {title}
                </p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-300/60">
                  {statusLabel}
                </p>
              </div>
              <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-200/80">
                {isAppReady ? "Ready" : "Booting"}
              </div>
            </div>

            {isMinimized ? (
              <div className="space-y-4 bg-[#050805] p-5">
                <p className="font-mono text-sm uppercase tracking-[0.18em] text-emerald-200">
                  Password Cracker is minimized
                </p>
                <p className="font-mono text-sm leading-7 text-emerald-100/80">
                  Restore the window when you want to continue inside the app.
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsMinimized(false)}
                    className="rounded-full border border-emerald-500/35 bg-emerald-500/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-emerald-100 transition hover:bg-emerald-500/20"
                  >
                    Restore Window
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenNewTab}
                    className="rounded-full border border-cyan-400/35 bg-cyan-400/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-cyan-100 transition hover:bg-cyan-400/20"
                  >
                    Open In New Tab
                  </button>
                </div>
              </div>
            ) : (
              <div
                className={`grid gap-0 ${
                  shouldShowFullscreenApp
                    ? "grid-cols-1"
                    : "lg:grid-cols-[0.8fr_1.2fr]"
                }`}
              >
                <AnimatePresence initial={false}>
                  {!shouldShowFullscreenApp ? (
                    <motion.div
                      className="border-b border-emerald-500/20 bg-[#060b06] p-5 lg:border-b-0 lg:border-r"
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -40, scale: 0.98 }}
                      transition={{ duration: 0.45, ease: "easeOut" }}
                    >
                      <div className="relative overflow-hidden rounded-xl border border-emerald-500/20 bg-black">
                        <video
                          key={videoKey}
                          src="/animations/jason-hack.mp4"
                          autoPlay
                          muted
                          playsInline
                          onEnded={() => setVideoFinished(true)}
                          className="h-full min-h-[360px] w-full object-cover"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(3,7,4,0.12),rgba(3,7,4,0.82))]" />
                        <div className="absolute inset-x-0 bottom-0 p-5">
                          <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4 backdrop-blur-sm">
                            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-emerald-200/80">
                              Password Cracker Demo
                            </p>
                            <p className="mt-3 font-mono text-sm leading-7 text-emerald-100/90">
                              We keep the terminal intro on screen until the application has
                              loaded and the animation has finished.
                            </p>
                            <div className="mt-4 flex items-center gap-2">
                              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-300" />
                              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400 [animation-delay:180ms]" />
                              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500 [animation-delay:360ms]" />
                            </div>
                            <p className="mt-4 font-mono text-xs uppercase tracking-[0.16em] text-emerald-200/85">
                              {statusLabel}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <div
                  className={`relative bg-[#050805] ${
                    shouldShowFullscreenApp
                      ? "min-h-[calc(100dvh-55px)]"
                      : "min-h-[520px]"
                  }`}
                >
                  <iframe
                    src={demoUrl}
                    title={`${title} live demo`}
                    className={`w-full bg-white transition-all duration-700 ${
                      shouldShowFullscreenApp
                        ? "h-[calc(100dvh-55px)] min-h-[calc(100dvh-55px)] opacity-100"
                        : launchMode === "fullscreen"
                          ? "h-full min-h-[520px] opacity-100"
                          : "h-full min-h-[520px] opacity-20 blur-[1px]"
                    }`}
                    onLoad={() => setIframeLoaded(true)}
                  />

                  {!isAppReady ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_32%),linear-gradient(180deg,rgba(5,8,5,0.3),rgba(5,8,5,0.92))] px-8 text-center">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 animate-pulse rounded-full bg-emerald-300" />
                        <span className="h-3 w-3 animate-pulse rounded-full bg-emerald-400 [animation-delay:180ms]" />
                        <span className="h-3 w-3 animate-pulse rounded-full bg-emerald-500 [animation-delay:360ms]" />
                      </div>
                      <div className="space-y-3">
                        <p className="font-mono text-sm uppercase tracking-[0.24em] text-emerald-200">
                          Preparing Application
                        </p>
                        <p className="max-w-lg font-mono text-sm leading-7 text-emerald-100/82">
                          The app is loading behind the terminal sequence. We reveal launch options
                          only when the intro has finished and the live page is ready.
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {shouldShowChooser ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.14),transparent_34%),linear-gradient(180deg,rgba(1,6,8,0.32),rgba(1,6,8,0.88))] px-6">
                      <div className="w-full max-w-xl rounded-[1.75rem] border border-emerald-500/30 bg-[#071108]/90 p-6 shadow-[0_0_50px_rgba(16,185,129,0.14)] backdrop-blur-xl">
                        <div className="mb-6 flex items-center gap-3">
                          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-300" />
                          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-cyan-300 [animation-delay:180ms]" />
                          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500 [animation-delay:360ms]" />
                          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-emerald-200/90">
                            Choose Launch Mode
                          </p>
                        </div>

                        <p className="max-w-lg font-mono text-sm leading-7 text-emerald-100/85">
                          The application is live. Pick how you want to enter it: open a fresh tab
                          in the browser, or launch it inside this full-screen workspace.
                        </p>

                        <div className="mt-6 grid gap-4 md:grid-cols-2">
                          <button
                            type="button"
                            onClick={handleOpenNewTab}
                            onMouseEnter={() => setSelectedChoice("new-tab")}
                            className={chooserButtonClass("new-tab", "cyan")}
                          >
                            <span
                              className={`pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent,rgba(255,255,255,0.18),transparent)] transition-transform duration-700 ${
                                selectedChoice === "new-tab"
                                  ? "translate-x-full"
                                  : "-translate-x-full"
                              }`}
                            />
                            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-cyan-200/85">
                              Browser Launch
                            </p>
                            <p className="mt-3 font-mono text-lg uppercase tracking-[0.12em] text-cyan-50">
                              New Tab
                            </p>
                            <p className="mt-3 font-mono text-sm leading-7 text-cyan-100/75">
                              Opens the demo directly in its own browser tab so the user can start
                              using it immediately.
                            </p>
                            <div className="mt-4 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.18em] text-cyan-100/70">
                              <span>Press N</span>
                              <span>{selectedChoice === "new-tab" ? "Selected" : "Ready"}</span>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={handleLaunchFullscreen}
                            onMouseEnter={() => setSelectedChoice("fullscreen")}
                            className={chooserButtonClass("fullscreen", "emerald")}
                          >
                            <span
                              className={`pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent,rgba(255,255,255,0.16),transparent)] transition-transform duration-700 ${
                                selectedChoice === "fullscreen"
                                  ? "translate-x-full"
                                  : "-translate-x-full"
                              }`}
                            />
                            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-emerald-200/85">
                              Immersive Launch
                            </p>
                            <p className="mt-3 font-mono text-lg uppercase tracking-[0.12em] text-emerald-50">
                              Full Screen
                            </p>
                            <p className="mt-3 font-mono text-sm leading-7 text-emerald-100/75">
                              Expands the demo into a dedicated workspace with working close,
                              minimize, and zoom controls.
                            </p>
                            <div className="mt-4 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.18em] text-emerald-100/70">
                              <span>Press F</span>
                              <span>{selectedChoice === "fullscreen" ? "Selected" : "Ready"}</span>
                            </div>
                          </button>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] uppercase tracking-[0.16em] text-emerald-100/65">
                          <span>Arrow Keys / Tab to switch</span>
                          <span>Enter to launch</span>
                          <span>Esc to close</span>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
