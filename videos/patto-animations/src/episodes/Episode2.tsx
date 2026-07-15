"use client";
import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FMOrb,
  GCard,
  EpisodeFrame,
  EpisodeControls,
  SceneBadge,
  Particles,
  PattoLogo,
  StatsBar,
  PText,
  useEpisodePlayer,
  BLUE,
  BLUE_MID,
  BLUE_LIGHT,
  BLUE_PALE,
  ACCENT_RED,
  TEXT_DARK,
  TEXT_MID,
  GLASS,
  fadeUp,
  fadeIn,
  scaleIn,
  stagger,
  staggerChild,
  EASE,
} from "./shared";

const SCENES = [
  { start: 0, duration: 4000 },
  { start: 4000, duration: 4000 },
  { start: 8000, duration: 4000 },
  { start: 12000, duration: 4000 },
  { start: 16000, duration: 4000 },
];

const MUSIC = "/joyinsound-app-vision-398377.mp3";

/* ─── Scene 1 ─────────────────────────────────────────────────────────────── */
function Scene1() {
  const floatingWords = ["study", "hard", "speak", "try", "learn", "tiny"];
  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{
        position: "absolute",
        inset: 0,
        padding: "28px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
      }}
    >
      <SceneBadge label="Episode 2 · 문제" />
      <Particles />

      {/* Floating words */}
      {floatingWords.map((word, i) => (
        <motion.span
          key={word}
          animate={{
            y: [0, -10 + i * 3, 0],
            x: [0, 5 - i * 2, 0],
            opacity: [0.35, 0.65, 0.35],
          }}
          transition={{
            duration: 2.8 + i * 0.3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.25,
          }}
          style={{
            position: "absolute",
            top: `${18 + i * 10}%`,
            left: i % 2 === 0 ? `${8 + i * 6}%` : undefined,
            right: i % 2 !== 0 ? `${8 + (i - 1) * 5}%` : undefined,
            fontSize: 13,
            fontWeight: 600,
            color: BLUE_MID,
            opacity: 0.45,
            userSelect: "none",
            fontFamily: '-apple-system, "SF Pro Display", "Pretendard", sans-serif',
          }}
        >
          {word}
        </motion.span>
      ))}

      {/* Large question mark */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{ marginBottom: 8 }}
      >
        <motion.div
          animate={{
            boxShadow: [
              `0 0 0px ${BLUE_LIGHT}`,
              `0 0 32px ${BLUE_LIGHT}`,
              `0 0 0px ${BLUE_LIGHT}`,
            ],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${BLUE} 0%, ${BLUE_MID} 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: 64,
              fontWeight: 900,
              color: "#fff",
              lineHeight: 1,
              fontFamily: '-apple-system, "SF Pro Display", sans-serif',
            }}
          >
            ?
          </span>
        </motion.div>
      </motion.div>

      {/* Bottom text card */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" style={{ width: "100%" }}>
        <GCard style={{ textAlign: "center", padding: "20px 24px" }}>
          <p
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: TEXT_DARK,
              lineHeight: 1.45,
              margin: "0 0 8px",
              fontFamily: '-apple-system, "SF Pro Display", "Pretendard", "Noto Sans KR", sans-serif',
            }}
          >
            단어를 아무리 외워도
            <br />
            왜 말이 안 나올까요?
          </p>
          <p
            style={{
              fontSize: 14,
              color: TEXT_MID,
              margin: 0,
              fontFamily: '-apple-system, "SF Pro Display", "Pretendard", "Noto Sans KR", sans-serif',
            }}
          >
            열심히 공부했는데... 막상 영어로 말하면?
          </p>
        </GCard>
      </motion.div>
    </motion.div>
  );
}

/* ─── Scene 2 ─────────────────────────────────────────────────────────────── */
const WORD_PILLS = ["I", "am", "going", "to", "leave"];
const PILL_COLORS = ["#FFD6D6", "#FFE8CC", "#FFF5CC", "#D6FFE8", "#D6E8FF"];

function Scene2() {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{
        position: "absolute",
        inset: 0,
        padding: "28px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
      }}
    >
      <SceneBadge label="Episode 2 · 이유" />

      <motion.p
        variants={fadeUp}
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: TEXT_DARK,
          textAlign: "center",
          margin: "32px 0 4px",
          fontFamily: '-apple-system, "SF Pro Display", "Pretendard", "Noto Sans KR", sans-serif',
        }}
      >
        이렇게 생각하고 계신가요?
      </motion.p>

      {/* Two cards side by side */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        style={{ display: "flex", gap: 10, width: "100%", alignItems: "stretch" }}
      >
        {/* Left: 단어 단위 */}
        <motion.div variants={staggerChild} style={{ flex: 1 }}>
          <GCard style={{ padding: "14px 12px", height: "100%", boxSizing: "border-box" }}>
            <div
              style={{
                display: "inline-block",
                background: "#FFE8E8",
                color: ACCENT_RED,
                fontSize: 11,
                fontWeight: 700,
                borderRadius: 6,
                padding: "3px 8px",
                marginBottom: 10,
                fontFamily: '-apple-system, "SF Pro Display", "Pretendard", sans-serif',
              }}
            >
              단어 단위
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 5,
                marginBottom: 10,
              }}
            >
              {WORD_PILLS.map((w, i) => (
                <motion.span
                  key={w}
                  animate={{ rotate: [-3 + i * 2, 2 - i, -3 + i * 2] }}
                  transition={{ duration: 2 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    background: PILL_COLORS[i],
                    borderRadius: 8,
                    padding: "5px 9px",
                    fontSize: 12,
                    fontWeight: 700,
                    color: TEXT_DARK,
                    fontFamily: '-apple-system, "SF Pro Display", sans-serif',
                  }}
                >
                  {w}
                </motion.span>
              ))}
            </div>
            <p
              style={{
                fontSize: 11,
                color: ACCENT_RED,
                margin: 0,
                fontWeight: 600,
                fontFamily: '-apple-system, "SF Pro Display", "Pretendard", "Noto Sans KR", sans-serif',
              }}
            >
              조합해야 해서 느려요
            </p>
          </GCard>
        </motion.div>

        {/* VS divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${ACCENT_RED}, ${BLUE})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 900,
              color: "#fff",
              fontFamily: '-apple-system, "SF Pro Display", sans-serif',
            }}
          >
            VS
          </motion.div>
        </div>

        {/* Right: 패턴 단위 */}
        <motion.div variants={staggerChild} style={{ flex: 1 }}>
          <GCard style={{ padding: "14px 12px", height: "100%", boxSizing: "border-box" }}>
            <div
              style={{
                display: "inline-block",
                background: BLUE_PALE,
                color: BLUE,
                fontSize: 11,
                fontWeight: 700,
                borderRadius: 6,
                padding: "3px 8px",
                marginBottom: 10,
                fontFamily: '-apple-system, "SF Pro Display", "Pretendard", sans-serif',
              }}
            >
              패턴 단위
            </div>
            <motion.div
              animate={{
                boxShadow: [
                  `0 0 0px ${BLUE_LIGHT}`,
                  `0 0 14px ${BLUE_LIGHT}`,
                  `0 0 0px ${BLUE_LIGHT}`,
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{
                background: `linear-gradient(135deg, ${BLUE_PALE}, #EEF4FF)`,
                borderRadius: 10,
                padding: "8px 10px",
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: BLUE,
                  fontFamily: '-apple-system, "SF Pro Display", sans-serif',
                }}
              >
                I'm about to leave.
              </span>
            </motion.div>
            <p
              style={{
                fontSize: 11,
                color: BLUE,
                margin: 0,
                fontWeight: 600,
                fontFamily: '-apple-system, "SF Pro Display", "Pretendard", "Noto Sans KR", sans-serif',
              }}
            >
              이미 묶여있어서 바로 나와요
            </p>
          </GCard>
        </motion.div>
      </motion.div>

      {/* Arrow hint */}
      <motion.div
        variants={fadeUp}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(255,255,255,0.75)",
          borderRadius: 12,
          padding: "10px 18px",
          border: `1px solid ${BLUE_PALE}`,
        }}
      >
        <span style={{ fontSize: 13, color: ACCENT_RED, fontWeight: 700 }}>❌ 느림</span>
        <span style={{ fontSize: 16, color: TEXT_MID }}>→</span>
        <span
          style={{
            fontSize: 13,
            color: BLUE,
            fontWeight: 700,
            fontFamily: '-apple-system, "SF Pro Display", "Pretendard", "Noto Sans KR", sans-serif',
          }}
        >
          ✅ 자연스럽게
        </span>
      </motion.div>
    </motion.div>
  );
}

/* ─── Scene 3 ─────────────────────────────────────────────────────────────── */
function Scene3() {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{
        position: "absolute",
        inset: 0,
        padding: "28px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
      }}
    >
      <SceneBadge label="Episode 2 · 패턴" />

      <div style={{ marginTop: 32 }}>
        <FMOrb size={110} />
      </div>

      <motion.div
        variants={fadeUp}
        style={{ width: "100%", position: "relative" }}
      >
        {/* Glow behind card */}
        <motion.div
          animate={{
            opacity: [0.4, 0.9, 0.4],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            inset: -8,
            borderRadius: 22,
            background: `radial-gradient(ellipse at center, ${BLUE_PALE} 0%, transparent 70%)`,
            zIndex: 0,
          }}
        />
        <GCard style={{ padding: "20px 22px", position: "relative", zIndex: 1 }}>
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: TEXT_MID,
              textTransform: "uppercase",
              letterSpacing: 1.2,
              margin: "0 0 10px",
              fontFamily: '-apple-system, "SF Pro Display", sans-serif',
            }}
          >
            오늘의 핵심 패턴
          </p>

          <motion.p
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{
              fontSize: 32,
              fontWeight: 900,
              color: ACCENT_RED,
              margin: "0 0 4px",
              fontFamily: '-apple-system, "SF Pro Display", sans-serif',
            }}
          >
            be about to
          </motion.p>

          <p
            style={{
              fontSize: 14,
              color: TEXT_MID,
              margin: "0 0 14px",
              fontFamily: '-apple-system, "SF Pro Display", "Pretendard", "Noto Sans KR", sans-serif',
            }}
          >
            ~하려고 하다 / 막 ~하려는 참이다
          </p>

          <div
            style={{
              height: 1,
              background: `linear-gradient(90deg, transparent, ${BLUE_PALE}, transparent)`,
              margin: "0 0 14px",
            }}
          />

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <p style={{ fontSize: 16, margin: 0, fontWeight: 600 }}>
              <PText text="I'm about to leave." highlight="about to" color={ACCENT_RED} />
            </p>
            <p style={{ fontSize: 16, margin: 0, fontWeight: 600 }}>
              <PText text="She's about to start." highlight="about to" color={ACCENT_RED} />
            </p>
          </div>
        </GCard>
      </motion.div>
    </motion.div>
  );
}

/* ─── Scene 4 ─────────────────────────────────────────────────────────────── */
const EXAMPLE_CARDS = [
  {
    emoji: "📅",
    label: "약속 전",
    text: "I'm [about to] meet my friend.",
  },
  {
    emoji: "🚗",
    label: "출발할 때",
    text: "We're [about to] leave now.",
  },
  {
    emoji: "💻",
    label: "시작할 때",
    text: "The class is [about to] begin.",
  },
];

function Scene4() {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{
        position: "absolute",
        inset: 0,
        padding: "28px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <SceneBadge label="Episode 2 · 예문" />

      <motion.p
        variants={fadeUp}
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: TEXT_DARK,
          textAlign: "center",
          margin: "32px 0 4px",
          fontFamily: '-apple-system, "SF Pro Display", "Pretendard", "Noto Sans KR", sans-serif',
        }}
      >
        이런 상황에서 써보세요!
      </motion.p>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        style={{ display: "flex", flexDirection: "column", gap: 10 }}
      >
        {EXAMPLE_CARDS.map((card) => (
          <motion.div key={card.label} variants={staggerChild}>
            <GCard style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 28, flexShrink: 0 }}>{card.emoji}</span>
                <div>
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: TEXT_MID,
                      margin: "0 0 4px",
                      fontFamily:
                        '-apple-system, "SF Pro Display", "Pretendard", "Noto Sans KR", sans-serif',
                    }}
                  >
                    {card.label}
                  </p>
                  <PText
                    text={card.text}
                    highlight="about to"
                    color={ACCENT_RED}
                  />
                </div>
              </div>
            </GCard>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

/* ─── Scene 5 ─────────────────────────────────────────────────────────────── */
function Scene5() {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{
        position: "absolute",
        inset: 0,
        padding: "28px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
      }}
    >
      <SceneBadge label="Episode 2 · PATTO" />
      <Particles count={10} />

      <FMOrb size={120} />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 6 }}
      >
        <motion.p
          variants={staggerChild}
          style={{
            fontSize: 20,
            color: TEXT_MID,
            margin: 0,
            fontFamily:
              '-apple-system, "SF Pro Display", "Pretendard", "Noto Sans KR", sans-serif',
          }}
        >
          패턴으로 배우면
        </motion.p>

        <motion.p
          variants={staggerChild}
          style={{
            fontSize: 28,
            fontWeight: 800,
            margin: 0,
            background: `linear-gradient(135deg, ${TEXT_DARK} 0%, ${BLUE} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            fontFamily:
              '-apple-system, "SF Pro Display", "Pretendard", "Noto Sans KR", sans-serif',
          }}
        >
          영어가 입에서 나옵니다
        </motion.p>

        <motion.p
          variants={staggerChild}
          style={{
            fontSize: 13,
            color: TEXT_MID,
            margin: 0,
            fontFamily:
              '-apple-system, "SF Pro Display", "Pretendard", "Noto Sans KR", sans-serif',
          }}
        >
          500개 핵심 패턴 · 5단계 반복
        </motion.p>
      </motion.div>

      <motion.div variants={fadeUp}>
        <PattoLogo size={36} />
      </motion.div>

      <motion.div variants={fadeUp} style={{ width: "100%" }}>
        <StatsBar />
      </motion.div>
    </motion.div>
  );
}

/* ─── Main Export ──────────────────────────────────────────────────────────── */
export default function Episode2() {
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
