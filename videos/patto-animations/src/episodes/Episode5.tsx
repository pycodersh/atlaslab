"use client";
import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FMOrb, GCard, EpisodeFrame, EpisodeControls, SceneBadge, Particles,
  PattoLogo, StatsBar, Txt, useEpisodePlayer,
  BLUE, BLUE_MID, BLUE_LIGHT, BLUE_PALE, ACCENT_RED, TEXT_DARK, TEXT_MID, GLASS,
  fadeUp, fadeIn, scaleIn, stagger, staggerChild, EASE,
} from "./shared";

const SCENES = [
  { start: 0, duration: 4000 },
  { start: 4000, duration: 4000 },
  { start: 8000, duration: 4000 },
  { start: 12000, duration: 4000 },
  { start: 16000, duration: 4000 },
];

const MUSIC = "/nastelbom-tech-410669.mp3";

/* ─── Scene 1: 훅 ─────────────────────────────────────────────── */
function Scene1() {
  const words = [
    { label: "remember", opacity: 1, blur: 0 },
    { label: "remem...", opacity: 0.55, blur: 1 },
    { label: "???", opacity: 0.25, blur: 3 },
  ];

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{
        position: "absolute", inset: 0,
        padding: "28px 24px",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 20,
      }}
    >
      <SceneBadge label="Episode 5 · 망각" />
      <Particles />

      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{ fontSize: 56, lineHeight: 1 }}
      >
        💭
      </motion.div>

      <motion.div
        variants={fadeUp}
        style={{
          fontSize: 24, fontWeight: 700,
          color: TEXT_DARK, textAlign: "center",
          lineHeight: 1.45, whiteSpace: "pre-line",
        }}
      >
        {"분명히 배웠는데\n왜 잊어버릴까요?"}
      </motion.div>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        style={{ display: "flex", gap: 10, alignItems: "center" }}
      >
        {words.map((w, i) => (
          <motion.div
            key={i}
            variants={staggerChild}
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              background: `rgba(26,115,232,${0.12 - i * 0.03})`,
              border: `1px solid rgba(26,115,232,${0.4 - i * 0.12})`,
              color: BLUE,
              fontSize: 13,
              fontWeight: 600,
              opacity: w.opacity,
              filter: `blur(${w.blur}px)`,
              transition: "all 0.3s",
            }}
          >
            {w.label}
          </motion.div>
        ))}
      </motion.div>

      <motion.p
        variants={fadeIn}
        style={{
          fontSize: 13, color: TEXT_MID,
          textAlign: "center", lineHeight: 1.6, margin: 0,
        }}
      >
        사람은 누구나 잊어버려요. 그게 정상이에요.
      </motion.p>
    </motion.div>
  );
}

/* ─── Scene 2: 에빙하우스 망각 곡선 ───────────────────────────── */
function Scene2() {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{
        position: "absolute", inset: 0,
        padding: "28px 24px",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 16,
      }}
    >
      <SceneBadge label="Episode 5 · 망각 곡선" />

      <motion.div
        variants={fadeUp}
        style={{
          fontSize: 16, fontWeight: 700,
          color: TEXT_DARK, textAlign: "center",
        }}
      >
        에빙하우스 망각 곡선
      </motion.div>

      <GCard style={{ width: "100%", padding: "16px 12px", borderRadius: 20 }}>
        <svg viewBox="0 0 300 170" style={{ width: "100%", height: "auto" }}>
          <defs>
            <linearGradient id="curveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={BLUE} />
              <stop offset="100%" stopColor="#9CA3AF" />
            </linearGradient>
            <linearGradient id="redFill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FEE2E2" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FEE2E2" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Red fill zone */}
          <path
            d="M 30 10 Q 80 70 130 110 Q 180 130 260 140 L 260 155 L 30 155 Z"
            fill="url(#redFill)"
          />

          {/* Axes */}
          <line x1="30" y1="10" x2="30" y2="155" stroke="#E5E7EB" strokeWidth="1.5" />
          <line x1="30" y1="155" x2="270" y2="155" stroke="#E5E7EB" strokeWidth="1.5" />

          {/* Forgetting curve */}
          <motion.path
            d="M 30 10 Q 80 70 130 110 Q 180 130 260 140"
            fill="none"
            stroke="url(#curveGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          />

          {/* Y-axis labels */}
          <text x="4" y="14" fontSize="9" fill={TEXT_MID} fontWeight="600">100%</text>
          <text x="4" y="144" fontSize="9" fill={TEXT_MID}>20%</text>

          {/* X-axis labels */}
          <text x="110" y="168" fontSize="9" fill={TEXT_MID} textAnchor="middle">1일</text>
          <text x="175" y="168" fontSize="9" fill={TEXT_MID} textAnchor="middle">7일</text>
          <text x="245" y="168" fontSize="9" fill={TEXT_MID} textAnchor="middle">30일</text>

          {/* Dashed x-axis tick lines */}
          <line x1="110" y1="150" x2="110" y2="158" stroke="#D1D5DB" strokeWidth="1" />
          <line x1="175" y1="150" x2="175" y2="158" stroke="#D1D5DB" strokeWidth="1" />
          <line x1="245" y1="150" x2="245" y2="158" stroke="#D1D5DB" strokeWidth="1" />

          {/* Start dot */}
          <motion.circle
            cx="30" cy="10" r="4"
            fill={BLUE}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          />
          {/* End dot */}
          <motion.circle
            cx="260" cy="140" r="4"
            fill="#9CA3AF"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.4 }}
          />
        </svg>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            justifyContent: "center",
            marginTop: 6,
            fontSize: 12, color: ACCENT_RED, fontWeight: 600,
          }}
        >
          ❌ 반복 없이는 잊어버려요
        </motion.div>
      </GCard>
    </motion.div>
  );
}

/* ─── Scene 3: 반복의 마법 ────────────────────────────────────── */
function Scene3() {
  const markers = [
    { x: 80, label: "D1" },
    { x: 130, label: "D3" },
    { x: 180, label: "D7" },
    { x: 230, label: "D14" },
  ];

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{
        position: "absolute", inset: 0,
        padding: "28px 24px",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 14,
      }}
    >
      <SceneBadge label="Episode 5 · 반복" />

      <motion.div
        variants={fadeUp}
        style={{
          fontSize: 18, fontWeight: 700,
          color: TEXT_DARK, textAlign: "center",
        }}
      >
        반복하면 기억이 강화돼요
      </motion.div>

      <GCard style={{ width: "100%", padding: "16px 12px", borderRadius: 20 }}>
        <svg viewBox="0 0 300 170" style={{ width: "100%", height: "auto" }}>
          <defs>
            <linearGradient id="greenFill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#D1FAE5" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#D1FAE5" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Green zone fill */}
          <rect x="30" y="20" width="230" height="100" fill="url(#greenFill)" rx="4" />

          {/* Axes */}
          <line x1="30" y1="10" x2="30" y2="155" stroke="#E5E7EB" strokeWidth="1.5" />
          <line x1="30" y1="155" x2="270" y2="155" stroke="#E5E7EB" strokeWidth="1.5" />

          {/* Dotted high retention line */}
          <motion.line
            x1="30" y1="28" x2="260" y2="28"
            stroke="#10B981"
            strokeWidth="2"
            strokeDasharray="6 4"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          />

          {/* Original forgetting curve (faded) */}
          <path
            d="M 30 10 Q 80 70 130 110 Q 180 130 260 140"
            fill="none"
            stroke="#D1D5DB"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />

          {/* Spaced repetition markers */}
          {markers.map((m, i) => (
            <motion.g
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.2 }}
            >
              <line
                x1={m.x} y1="28"
                x2={m.x} y2="155"
                stroke="#10B981"
                strokeWidth="1"
                strokeDasharray="3 2"
                opacity="0.5"
              />
              <circle cx={m.x} cy="28" r="5" fill="#10B981" />
              <text
                x={m.x} y="22"
                fontSize="8" fill="#059669"
                textAnchor="middle" fontWeight="700"
              >복습!</text>
              <text
                x={m.x} y="166"
                fontSize="8" fill={TEXT_MID}
                textAnchor="middle"
              >{m.label}</text>
            </motion.g>
          ))}

          {/* 80%+ label */}
          <text x="265" y="32" fontSize="8" fill="#10B981" fontWeight="700">80%+</text>
        </svg>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            justifyContent: "center",
            marginTop: 4,
            fontSize: 12, color: "#059669", fontWeight: 600,
          }}
        >
          ✅ 반복하면 기억이 유지돼요
        </motion.div>
      </GCard>

      <motion.p
        variants={fadeIn}
        style={{
          fontSize: 13, color: BLUE,
          textAlign: "center", fontWeight: 600, margin: 0,
        }}
      >
        간격을 두고 반복하면 = Spaced Repetition
      </motion.p>
    </motion.div>
  );
}

/* ─── Scene 4: PATTO 5단계 반복 ──────────────────────────────── */
function Scene4() {
  const steps = [
    { icon: "👁️", title: "보기", desc: "패턴 인식" },
    { icon: "🎧", title: "듣기", desc: "음성 인식" },
    { icon: "🗣️", title: "말하기", desc: "발화 연습" },
    { icon: "✍️", title: "쓰기", desc: "타이핑 확인" },
    { icon: "🧩", title: "응용", desc: "새 문장 만들기" },
  ];

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{
        position: "absolute", inset: 0,
        padding: "28px 24px",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 12,
      }}
    >
      <SceneBadge label="Episode 5 · PATTO 반복" />

      <FMOrb size={95} style={{ marginBottom: -4 }} />

      <motion.div
        variants={fadeUp}
        style={{
          fontSize: 15, fontWeight: 700,
          color: BLUE, textAlign: "center",
        }}
      >
        PATTO의 5단계 반복 시스템
      </motion.div>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        style={{ display: "flex", flexDirection: "column", gap: 7, width: "100%" }}
      >
        {steps.map((s, i) => (
          <motion.div
            key={i}
            variants={staggerChild}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(12px)",
              border: `1px solid ${BLUE_PALE}`,
              borderRadius: 14,
              padding: "9px 14px",
            }}
          >
            <span style={{ fontSize: 20 }}>{s.icon}</span>
            <div style={{ display: "flex", gap: 6, alignItems: "baseline" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: TEXT_DARK }}>
                Step {i + 1}
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: BLUE }}>
                {s.title}
              </span>
              <span style={{ fontSize: 11, color: TEXT_MID }}>—</span>
              <span style={{ fontSize: 11, color: TEXT_MID }}>{s.desc}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.p
        variants={fadeIn}
        style={{
          fontSize: 12, color: TEXT_MID,
          textAlign: "center", margin: 0,
        }}
      >
        각 단계마다 뇌에 새로운 자극
      </motion.p>
    </motion.div>
  );
}

/* ─── Scene 5: 마무리 ─────────────────────────────────────────── */
function Scene5() {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{
        position: "absolute", inset: 0,
        padding: "28px 24px",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 14,
      }}
    >
      <SceneBadge label="Episode 5 · PATTO" />
      <Particles count={8} />

      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <FMOrb size={110} />
      </motion.div>

      <motion.p
        variants={fadeIn}
        style={{
          fontSize: 18, color: TEXT_MID,
          textAlign: "center", fontWeight: 500, margin: 0,
        }}
      >
        반복이 쌓이면
      </motion.p>

      <motion.div
        variants={scaleIn}
        style={{
          fontSize: 28, fontWeight: 800,
          textAlign: "center",
          background: `linear-gradient(135deg, ${TEXT_DARK} 0%, ${BLUE_MID} 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          lineHeight: 1.3,
        }}
      >
        영어가 내 것이 됩니다
      </motion.div>

      <motion.p
        variants={fadeIn}
        style={{
          fontSize: 14, color: BLUE,
          textAlign: "center", fontWeight: 600, margin: 0,
        }}
      >
        PATTO와 함께 매일 5분씩
      </motion.p>

      <motion.div
        animate={{
          boxShadow: [
            `0 0 0px ${BLUE_LIGHT}`,
            `0 0 24px ${BLUE_LIGHT}`,
            `0 0 0px ${BLUE_LIGHT}`,
          ],
        }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        style={{ borderRadius: 50 }}
      >
        <PattoLogo size={34} />
      </motion.div>

      <StatsBar />
    </motion.div>
  );
}

/* ─── Main Export ─────────────────────────────────────────────── */
export default function Episode5() {
  const { playing, currentScene, progress, play, pause, restart, audioRef } =
    useEpisodePlayer(SCENES, MUSIC);

  return (
    <EpisodeFrame>
      <audio ref={audioRef} src={MUSIC} loop />
      <AnimatePresence mode="wait">
        {currentScene === 0 && <Scene1 key="s1" />}
        {currentScene === 1 && <Scene2 key="s2" />}
        {currentScene === 2 && <Scene3 key="s3" />}
        {currentScene === 3 && <Scene4 key="s4" />}
        {currentScene === 4 && <Scene5 key="s5" />}
      </AnimatePresence>
      <EpisodeControls
        playing={playing}
        progress={progress}
        onPlayPause={playing ? pause : play}
        onRestart={restart}
      />
    </EpisodeFrame>
  );
}
