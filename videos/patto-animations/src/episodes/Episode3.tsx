"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FMOrb, GCard, EpisodeFrame, EpisodeControls, SceneBadge, Particles,
  PattoLogo, StatsBar, Txt, useEpisodePlayer,
  BLUE, BLUE_MID, BLUE_LIGHT, BLUE_PALE, ACCENT_RED, TEXT_DARK, TEXT_MID,
  fadeUp, fadeIn, stagger, staggerChild,
} from "./shared";

const SCENES = [
  { start: 0, duration: 4000 },
  { start: 4000, duration: 4000 },
  { start: 8000, duration: 4000 },
  { start: 12000, duration: 4000 },
  { start: 16000, duration: 4000 },
];

/* ─── Scene 1 ─────────────────────────────────────────────────────────────── */
function Scene1() {
  const words = ["I", "want", "to", "go"];
  return (
    <motion.div
      variants={fadeUp} initial="hidden" animate="visible" exit="exit"
      style={{ position: "absolute", inset: 0, padding: "28px 24px", display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <SceneBadge label="Episode 3 · 습관" />
      <Particles />
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{ fontSize: 64, marginTop: 52, marginBottom: 20 }}
      >
        🧠
      </motion.div>
      <GCard style={{ width: "100%", marginBottom: 24, padding: "20px", textAlign: "center" }}>
        <Txt size={22} weight={700} color={TEXT_DARK} style={{ lineHeight: 1.5 }}>
          우리는 단어를 조합해서{"\n"}말하려고 해요
        </Txt>
      </GCard>
      <motion.div
        variants={stagger} initial="hidden" animate="visible"
        style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", justifyContent: "center", marginBottom: 16 }}
      >
        {words.map((w, i) => (
          <React.Fragment key={w}>
            <motion.div
              variants={staggerChild}
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2 + i * 0.3, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }}
              style={{ background: BLUE_PALE, border: `1.5px solid ${BLUE_LIGHT}`, borderRadius: 10, padding: "6px 14px", fontSize: 16, fontWeight: 700, color: BLUE }}
            >
              {w}
            </motion.div>
            {i < words.length - 1 && (
              <span style={{ fontSize: 14, color: TEXT_MID, fontWeight: 600 }}>+</span>
            )}
          </React.Fragment>
        ))}
      </motion.div>
      <motion.div variants={fadeIn} initial="hidden" animate="visible" transition={{ delay: 0.8 }}>
        <Txt size={13} color={TEXT_MID} style={{ textAlign: "center" }}>
          머릿속에서 조합... 시간이 걸려요
        </Txt>
      </motion.div>
    </motion.div>
  );
}

/* ─── Scene 2 ─────────────────────────────────────────────────────────────── */
function Scene2() {
  return (
    <motion.div
      variants={fadeUp} initial="hidden" animate="visible" exit="exit"
      style={{ position: "absolute", inset: 0, padding: "28px 24px", display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <SceneBadge label="Episode 3 · 원어민" />
      <motion.div variants={fadeUp} style={{ marginTop: 52, marginBottom: 20, textAlign: "center" }}>
        <Txt size={18} weight={700} color={TEXT_DARK}>원어민은 이렇게 말해요</Txt>
      </motion.div>

      {/* 우리 방식 */}
      <motion.div
        variants={fadeUp}
        style={{ width: "100%", background: "rgba(255,255,255,0.6)", border: "1.5px solid rgba(200,220,255,0.7)", borderRadius: 16, padding: "14px 16px", marginBottom: 10 }}
      >
        <Txt size={11} color={TEXT_MID} style={{ marginBottom: 8, fontWeight: 600 }}>우리 → 단어 하나씩 조합</Txt>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          {["I", "want", "to", "go"].map((w) => (
            <span key={w} style={{ background: "#FFF3F3", border: "1px solid #FFCDD2", borderRadius: 8, padding: "4px 10px", fontSize: 13, fontWeight: 700, color: ACCENT_RED }}>{w}</span>
          ))}
          <span style={{ fontSize: 18 }}>🧩</span>
        </div>
      </motion.div>

      {/* Arrow */}
      <motion.div
        animate={{ y: [0, 4, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        style={{ fontSize: 22, color: BLUE_MID, margin: "4px 0" }}
      >
        ↓
      </motion.div>

      {/* 원어민 방식 */}
      <GCard style={{ width: "100%", border: `2px solid ${BLUE_MID}`, marginTop: 4, marginBottom: 14, padding: "16px" }}>
        <Txt size={11} color={BLUE} style={{ marginBottom: 8, fontWeight: 600 }}>원어민 → 청크(Chunk) = 하나의 덩어리</Txt>
        <motion.div
          animate={{ boxShadow: [`0 0 0px ${BLUE_LIGHT}`, `0 0 18px ${BLUE_LIGHT}`, `0 0 0px ${BLUE_LIGHT}`] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ background: BLUE_PALE, borderRadius: 12, padding: "10px 18px", display: "inline-block" }}
        >
          <Txt size={18} weight={800} color={BLUE}>I want to go</Txt>
        </motion.div>
      </GCard>

      <motion.div variants={fadeUp} transition={{ delay: 0.6 }}>
        <Txt size={14} color={BLUE} style={{ textAlign: "center", fontWeight: 600 }}>
          원어민은 &apos;청크&apos;라는 덩어리로 기억해요
        </Txt>
      </motion.div>
    </motion.div>
  );
}

/* ─── Scene 3 ─────────────────────────────────────────────────────────────── */
const CHUNKS = [
  { en: "I want to →", ko: "나는 ~하고 싶어" },
  { en: "Let me →", ko: "내가 ~할게" },
  { en: "I'm going to →", ko: "나는 ~할 거야" },
];

function Scene3() {
  return (
    <motion.div
      variants={fadeUp} initial="hidden" animate="visible" exit="exit"
      style={{ position: "absolute", inset: 0, padding: "28px 24px", display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <SceneBadge label="Episode 3 · 청크" />
      <div style={{ marginTop: 48, marginBottom: 16 }}>
        <FMOrb size={100} />
      </div>
      <motion.div
        variants={stagger} initial="hidden" animate="visible"
        style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}
      >
        {CHUNKS.map((chunk, i) => (
          <motion.div key={i} variants={staggerChild}>
            <GCard style={{ padding: "14px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Txt size={16} weight={800} color={BLUE}>{chunk.en}</Txt>
                <Txt size={13} color={TEXT_MID}>{chunk.ko}</Txt>
              </div>
            </GCard>
          </motion.div>
        ))}
      </motion.div>
      <motion.div
        variants={fadeIn} initial="hidden" animate="visible" transition={{ delay: 0.7 }}
        style={{ marginTop: 14 }}
      >
        <Txt size={13} color={BLUE} style={{ textAlign: "center", fontWeight: 600 }}>
          패턴 하나 = 수십 가지 문장
        </Txt>
      </motion.div>
    </motion.div>
  );
}

/* ─── Scene 4 ─────────────────────────────────────────────────────────────── */
const STEPS = [
  { emoji: "🎧", title: "듣기", desc: "원어민 발음으로 청크 인식" },
  { emoji: "🗣️", title: "따라하기", desc: "입에 익히기" },
  { emoji: "💬", title: "사용하기", desc: "실전 문장 만들기" },
];

function Scene4() {
  return (
    <motion.div
      variants={fadeUp} initial="hidden" animate="visible" exit="exit"
      style={{ position: "absolute", inset: 0, padding: "28px 24px", display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <SceneBadge label="Episode 3 · 방법" />
      <motion.div variants={fadeUp} style={{ marginTop: 52, marginBottom: 24, textAlign: "center" }}>
        <Txt size={16} weight={700} color={TEXT_DARK}>PATTO는 이렇게 가르쳐요</Txt>
      </motion.div>
      <motion.div
        variants={stagger} initial="hidden" animate="visible"
        style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}
      >
        {STEPS.map((step, i) => (
          <motion.div key={i} variants={staggerChild}>
            <GCard style={{ padding: "16px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: BLUE_PALE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                  {step.emoji}
                </div>
                <div>
                  <Txt size={15} weight={700} color={TEXT_DARK}>{step.title}</Txt>
                  <Txt size={13} color={TEXT_MID}>{step.desc}</Txt>
                </div>
                <div style={{ marginLeft: "auto", width: 28, height: 28, borderRadius: "50%", background: BLUE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#fff", fontWeight: 900 }}>
                  {i + 1}
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
      variants={fadeUp} initial="hidden" animate="visible" exit="exit"
      style={{ position: "absolute", inset: 0, padding: "28px 24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}
    >
      <SceneBadge label="Episode 3 · PATTO" />
      <Particles count={8} />
      <FMOrb size={110} />
      <div style={{ textAlign: "center" }}>
        <Txt size={18} color={TEXT_MID} style={{ marginBottom: 8 }}>청크가 쌓이면</Txt>
        <p style={{
          fontSize: 30, fontWeight: 900, margin: "0 0 20px",
          background: `linear-gradient(135deg, ${BLUE_MID}, ${BLUE})`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          fontFamily: `-apple-system, "SF Pro Display", "Pretendard", sans-serif`,
        }}>
          영어가 술술 나옵니다
        </p>
      </div>
      <PattoLogo size={34} />
      <StatsBar />
    </motion.div>
  );
}

/* ─── Main Component ──────────────────────────────────────────────────────── */
export default function Episode3() {
  const { playing, currentScene, progress, play, pause, restart, audioRef } =
    useEpisodePlayer(SCENES, "/cloud_purple-guitar-rush-316179.mp3");

  return (
    <EpisodeFrame>
      <audio ref={audioRef} src="/cloud_purple-guitar-rush-316179.mp3" loop />
      <AnimatePresence mode="wait">
        {currentScene === 0 && <Scene1 key="s1" />}
        {currentScene === 1 && <Scene2 key="s2" />}
        {currentScene === 2 && <Scene3 key="s3" />}
        {currentScene === 3 && <Scene4 key="s4" />}
        {currentScene === 4 && <Scene5 key="s5" />}
      </AnimatePresence>
      <EpisodeControls
        playing={playing} progress={progress}
        onPlayPause={playing ? pause : play}
        onRestart={restart}
      />
    </EpisodeFrame>
  );
}
