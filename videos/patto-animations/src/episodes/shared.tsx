"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";

// ─── Design Tokens ───────────────────────────────────────────────────────────
export const BLUE = "#1A73E8";
export const BLUE_MID = "#3A7BFF";
export const BLUE_LIGHT = "#6EA8FF";
export const BLUE_PALE = "#D6E6FF";
export const ACCENT_RED = "#E53935";
export const TEXT_DARK = "#111827";
export const TEXT_MID = "#4a5568";
export const TEXT_LIGHT = "#8898a8";
export const BG = "linear-gradient(160deg, #EEF4FF 0%, #F6F9FF 55%, #FFFFFF 100%)";

export const GLASS: React.CSSProperties = {
  background: "rgba(255,255,255,0.8)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  borderRadius: 20,
  border: "1px solid rgba(200,220,255,0.7)",
  boxShadow: "0 8px 32px rgba(92,107,192,0.10), 0 2px 8px rgba(0,0,0,0.04)",
};

// ─── Animation Variants ───────────────────────────────────────────────────────
export const EASE = [0.25, 0.46, 0.45, 0.94] as const;

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.4, ease: EASE } },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: EASE } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.3 } },
};

export const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

export const staggerChild = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

// ─── Glass Card ───────────────────────────────────────────────────────────────
export const GCard: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({
  children,
  style,
}) => (
  <div style={{ ...GLASS, ...style }}>
    {children}
  </div>
);

// ─── Framer Motion Orb ───────────────────────────────────────────────────────
export const FMOrb: React.FC<{ size?: number; style?: React.CSSProperties }> = ({
  size = 140,
  style,
}) => (
  <motion.div
    animate={{ y: [0, -12, 0] }}
    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    style={{ width: size, height: size, position: "relative", ...style }}
  >
    {/* Glow */}
    <motion.div
      animate={{ opacity: [0.25, 0.45, 0.25], scale: [1, 1.08, 1] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      style={{
        position: "absolute",
        inset: -size * 0.18,
        borderRadius: "50%",
        background: `radial-gradient(circle, rgba(110,168,255,0.35) 0%, transparent 70%)`,
      }}
    />
    {/* Outer ring */}
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      style={{
        position: "absolute",
        inset: -10,
        borderRadius: "50%",
        border: "2px solid transparent",
        borderTop: "2px solid rgba(110,168,255,0.5)",
        borderRight: "2px solid rgba(110,168,255,0.15)",
      }}
    />
    {/* Inner ring */}
    <motion.div
      animate={{ rotate: -360 }}
      transition={{ duration: 5.5, repeat: Infinity, ease: "linear" }}
      style={{
        position: "absolute",
        inset: -18,
        borderRadius: "50%",
        border: "1.5px solid transparent",
        borderBottom: "1.5px solid rgba(110,168,255,0.25)",
        borderLeft: "1.5px solid rgba(110,168,255,0.08)",
      }}
    />
    {/* Body */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: "50%",
        background: "radial-gradient(circle at 38% 32%, #ffffff 0%, #e8eeff 45%, #c8d8f8 80%, #a8c0f0 100%)",
        boxShadow: "0 8px 32px rgba(92,107,192,0.25), inset 0 -4px 12px rgba(92,107,192,0.15), 0 0 0 1px rgba(200,220,255,0.5)",
      }}
    />
    {/* Highlight */}
    <div
      style={{
        position: "absolute",
        top: "12%",
        left: "15%",
        width: "38%",
        height: "28%",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,255,255,0.75) 0%, transparent 100%)",
      }}
    />
    {/* Satellite */}
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
      style={{
        position: "absolute",
        inset: -size * 0.28,
        borderRadius: "50%",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "4%",
          left: "50%",
          transform: "translateX(-50%)",
          width: size * 0.14,
          height: size * 0.14,
          borderRadius: "50%",
          background: "radial-gradient(circle at 35% 30%, #ffffff 0%, #b0c8f8 100%)",
          boxShadow: "0 2px 8px rgba(92,107,192,0.3)",
        }}
      />
    </motion.div>
    {/* Eyes */}
    <div
      style={{
        position: "absolute",
        top: "44%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        display: "flex",
        gap: size * 0.2,
      }}
    >
      {[0, 1].map((i) => (
        <motion.div
          key={i}
          animate={{ scaleY: [1, 1, 0.08, 1, 1] }}
          transition={{ duration: 4, repeat: Infinity, times: [0, 0.45, 0.5, 0.55, 1], ease: "easeInOut", delay: i * 0.05 }}
          style={{
            width: size * 0.1,
            height: size * 0.1,
            borderRadius: "50%",
            background: "#3a3f8f",
          }}
        />
      ))}
    </div>
  </motion.div>
);

// ─── Episode Layout (390×844 mobile frame) ────────────────────────────────────
export const EpisodeFrame: React.FC<{ children: React.ReactNode; bg?: string }> = ({
  children,
  bg = BG,
}) => (
  <div
    style={{
      width: "100%",
      height: "100%",
      background: bg,
      position: "relative",
      overflow: "hidden",
      fontFamily: `-apple-system, BlinkMacSystemFont, "SF Pro Display", "Pretendard", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif`,
    }}
  >
    {/* Ambient blobs */}
    <div
      style={{
        position: "absolute",
        top: -80,
        right: -60,
        width: 260,
        height: 260,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(110,168,255,0.12) 0%, transparent 70%)",
        pointerEvents: "none",
      }}
    />
    <div
      style={{
        position: "absolute",
        bottom: -60,
        left: -40,
        width: 220,
        height: 220,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }}
    />
    {children}
  </div>
);

// ─── Episode Player Hook ──────────────────────────────────────────────────────
export interface SceneDef {
  start: number; // ms
  duration: number; // ms
}

export function useEpisodePlayer(scenes: SceneDef[], audioSrc?: string) {
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [currentScene, setCurrentScene] = useState(0);
  const startRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const totalDuration = scenes[scenes.length - 1].start + scenes[scenes.length - 1].duration;

  const tick = useCallback(() => {
    const now = Date.now();
    const t = now - startRef.current;
    if (t >= totalDuration) {
      setElapsed(totalDuration);
      setPlaying(false);
      return;
    }
    setElapsed(t);
    const idx = scenes.findLastIndex((s) => t >= s.start);
    setCurrentScene(Math.max(0, idx));
    rafRef.current = requestAnimationFrame(tick);
  }, [scenes, totalDuration]);

  const play = useCallback(() => {
    startRef.current = Date.now() - elapsed;
    setPlaying(true);
    rafRef.current = requestAnimationFrame(tick);
    if (audioRef.current) {
      audioRef.current.currentTime = elapsed / 1000;
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(() => {});
    }
  }, [elapsed, tick]);

  const pause = useCallback(() => {
    setPlaying(false);
    cancelAnimationFrame(rafRef.current);
    if (audioRef.current) audioRef.current.pause();
  }, []);

  const restart = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setElapsed(0);
    setCurrentScene(0);
    startRef.current = Date.now();
    setPlaying(true);
    rafRef.current = requestAnimationFrame(tick);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(() => {});
    }
  }, [tick]);

  useEffect(() => () => { cancelAnimationFrame(rafRef.current); }, []);

  const progress = elapsed / totalDuration;
  const sceneElapsed = elapsed - scenes[currentScene].start;
  const sceneProgress = sceneElapsed / scenes[currentScene].duration;

  return {
    playing, elapsed, currentScene, sceneElapsed, sceneProgress, progress,
    play, pause, restart, audioRef,
  };
}

// ─── Episode Controls ─────────────────────────────────────────────────────────
export const EpisodeControls: React.FC<{
  playing: boolean;
  progress: number;
  onPlayPause: () => void;
  onRestart: () => void;
}> = ({ playing, progress, onPlayPause, onRestart }) => (
  <div
    style={{
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      padding: "12px 20px 20px",
      background: "linear-gradient(to top, rgba(238,244,255,0.95) 0%, transparent 100%)",
      display: "flex",
      alignItems: "center",
      gap: 12,
      zIndex: 100,
    }}
  >
    {/* Progress bar */}
    <div
      style={{
        flex: 1,
        height: 3,
        background: "rgba(110,168,255,0.2)",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${progress * 100}%`,
          background: `linear-gradient(90deg, ${BLUE_LIGHT}, ${BLUE})`,
          borderRadius: 2,
          transition: "width 0.1s linear",
        }}
      />
    </div>
    {/* Restart */}
    <button
      onClick={onRestart}
      style={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        border: "1.5px solid rgba(110,168,255,0.4)",
        background: "rgba(255,255,255,0.8)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14,
        color: BLUE,
      }}
    >
      ↺
    </button>
    {/* Play/Pause */}
    <button
      onClick={onPlayPause}
      style={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        border: "none",
        background: `linear-gradient(135deg, ${BLUE_LIGHT}, ${BLUE})`,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 16,
        color: "#fff",
        boxShadow: "0 4px 16px rgba(26,115,232,0.35)",
      }}
    >
      {playing ? "⏸" : "▶"}
    </button>
  </div>
);

// ─── Pattern Highlight ────────────────────────────────────────────────────────
export const PText: React.FC<{ text: string; highlight: string; color?: string }> = ({
  text,
  highlight,
  color = ACCENT_RED,
}) => {
  const parts = text.split(new RegExp(`(${highlight})`, "gi"));
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span key={i} style={{ color, fontWeight: 700 }}>
            {part}
          </span>
        ) : (
          part
        )
      )}
    </span>
  );
};

// ─── Generic Text ────────────────────────────────────────────────────────────
export const Txt: React.FC<{
  children: React.ReactNode;
  size?: number;
  weight?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ children, size = 16, weight = 400, color = TEXT_DARK, style }) => (
  <p
    style={{
      fontSize: size,
      fontWeight: weight,
      color,
      margin: 0,
      fontFamily: `-apple-system, BlinkMacSystemFont, "SF Pro Display", "Pretendard", "Noto Sans KR", sans-serif`,
      ...style,
    }}
  >
    {children}
  </p>
);

// ─── Scene Badge ──────────────────────────────────────────────────────────────
export const SceneBadge: React.FC<{ label?: string; children?: React.ReactNode }> = ({ label, children }) => (
  <motion.div
    initial={{ opacity: 0, x: -16 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.4 }}
    style={{
      position: "absolute",
      top: 20,
      left: 20,
      background: "rgba(255,255,255,0.75)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      border: "1px solid rgba(200,220,255,0.6)",
      borderRadius: 20,
      padding: "4px 14px",
      fontSize: 12,
      fontWeight: 600,
      color: BLUE,
      letterSpacing: "0.5px",
    }}
  >
    {label ?? children}
  </motion.div>
);

// ─── Floating Particles ───────────────────────────────────────────────────────
export const Particles: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <>
    {Array.from({ length: count }, (_, i) => (
      <motion.div
        key={i}
        animate={{
          y: [0, -20 - i * 8, 0],
          opacity: [0.15, 0.4, 0.15],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 3 + i * 0.5,
          repeat: Infinity,
          delay: i * 0.6,
          ease: "easeInOut",
        }}
        style={{
          position: "absolute",
          width: 4 + (i % 3) * 2,
          height: 4 + (i % 3) * 2,
          borderRadius: "50%",
          background: `rgba(110,168,255,${0.3 + (i % 3) * 0.15})`,
          left: `${10 + i * 14}%`,
          top: `${15 + (i % 4) * 18}%`,
          pointerEvents: "none",
        }}
      />
    ))}
  </>
);

// ─── PATTO Logo strip ─────────────────────────────────────────────────────────
export const PattoLogo: React.FC<{ size?: number }> = ({ size = 28 }) => (
  <div
    style={{
      fontSize: size,
      fontWeight: 900,
      letterSpacing: "-1px",
      background: `linear-gradient(135deg, ${BLUE_LIGHT}, ${BLUE})`,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      lineHeight: 1,
    }}
  >
    PATTO
  </div>
);

// ─── Bottom Stats Bar ─────────────────────────────────────────────────────────
export const StatsBar: React.FC = () => (
  <div
    style={{
      display: "flex",
      gap: 8,
      justifyContent: "center",
      flexWrap: "wrap",
    }}
  >
    {["500+ 패턴", "5단계 반복", "100 스토리"].map((label) => (
      <div
        key={label}
        style={{
          background: "rgba(255,255,255,0.8)",
          border: "1px solid rgba(200,220,255,0.7)",
          borderRadius: 20,
          padding: "4px 14px",
          fontSize: 12,
          fontWeight: 600,
          color: BLUE,
        }}
      >
        {label}
      </div>
    ))}
  </div>
);
