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

const MUSIC = "/huailux-energetic-blaze-intro-jingle-240602.mp3";

/* ─── Scene 1 ─── */
function Scene1() {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{
        position: "absolute", inset: 0, padding: "28px 24px",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 20,
      }}
    >
      <SceneBadge label="Episode 4 · 비밀" />
      <Particles />

      <FMOrb size={80} style={{ position: "absolute", top: 36, right: 20, opacity: 0.7 }} />

      <motion.div variants={scaleIn} style={{ textAlign: "center" }}>
        <Txt
          style={{
            fontSize: 38, fontWeight: 800, lineHeight: 1.15,
            background: `linear-gradient(135deg, ${BLUE} 0%, ${BLUE_MID} 60%, ${BLUE_LIGHT} 100%)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          원어민의 비밀
        </Txt>
      </motion.div>

      <motion.div variants={fadeIn} style={{ textAlign: "center" }}>
        <Txt style={{ fontSize: 18, color: TEXT_DARK, lineHeight: 1.65, whiteSpace: "pre-line" }}>
          {"그들이 매일 쓰는 패턴은\n사실 정해져 있어요"}
        </Txt>
      </motion.div>

      <motion.div
        variants={fadeIn}
        style={{
          marginTop: 8,
          background: BLUE_PALE,
          border: `1.5px solid ${BLUE_LIGHT}`,
          borderRadius: 999,
          padding: "6px 18px",
        }}
      >
        <Txt style={{ fontSize: 13, color: BLUE, fontWeight: 700 }}>
          전체 대화의 50% 이상
        </Txt>
      </motion.div>
    </motion.div>
  );
}

/* ─── Scene 2 ─── */
const PATTERNS = [
  { en: "I want to ~", ko: "나는 ~하고 싶어" },
  { en: "I'm going to ~", ko: "나는 ~할 거야" },
  { en: "Can you ~?", ko: "~해줄 수 있어?" },
  { en: "I think ~", ko: "나는 ~라고 생각해" },
  { en: "Let me ~", ko: "내가 ~할게" },
];

function Scene2() {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{
        position: "absolute", inset: 0, padding: "28px 24px",
        display: "flex", flexDirection: "column", gap: 14,
      }}
    >
      <SceneBadge label="Episode 4 · 핵심 5가지" />

      <motion.div variants={fadeIn} style={{ textAlign: "center", marginTop: 28, marginBottom: 4 }}>
        <Txt style={{ fontSize: 18, fontWeight: 700, color: TEXT_DARK }}>
          이 5가지만 알면 됩니다
        </Txt>
      </motion.div>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        style={{ display: "flex", flexDirection: "column", gap: 9 }}
      >
        {PATTERNS.map((p, i) => (
          <motion.div key={i} variants={staggerChild}>
            <GCard style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${BLUE} 0%, ${BLUE_MID} 100%)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Txt style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{i + 1}</Txt>
              </div>
              <Txt style={{ fontSize: 15, fontWeight: 700, color: BLUE_MID, flex: 1 }}>{p.en}</Txt>
              <Txt style={{ fontSize: 13, color: TEXT_MID }}>{p.ko}</Txt>
            </GCard>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

/* ─── Scene 3 ─── */
const EXAMPLES = [
  "I want to eat pizza.",
  "I want to study English.",
  "I want to go home.",
];

function Scene3() {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{
        position: "absolute", inset: 0, padding: "28px 24px",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 18,
      }}
    >
      <SceneBadge label="Episode 4 · 확장" />

      <motion.div
        variants={scaleIn}
        style={{
          background: `linear-gradient(135deg, ${BLUE} 0%, ${BLUE_MID} 100%)`,
          borderRadius: 999,
          padding: "10px 28px",
        }}
      >
        <Txt style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: 0.5 }}>
          I want to ~
        </Txt>
      </motion.div>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}
      >
        {EXAMPLES.map((ex, i) => (
          <motion.div key={i} variants={staggerChild}>
            <GCard style={{ padding: "11px 16px" }}>
              <Txt style={{ fontSize: 15, fontWeight: 600, color: TEXT_DARK }}>{ex}</Txt>
            </GCard>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={fadeIn} style={{ textAlign: "center", marginTop: 4 }}>
        <Txt style={{ fontSize: 14, fontWeight: 700, color: BLUE }}>
          패턴 하나 → 무한한 문장
        </Txt>
        <Txt style={{ fontSize: 12, color: TEXT_MID, marginTop: 4 }}>
          나머지 4개도 마찬가지예요
        </Txt>
      </motion.div>
    </motion.div>
  );
}

/* ─── Scene 4 ─── */
const FEATURES = [
  { icon: "🎧", text: "원어민 음성으로 듣기" },
  { icon: "🔁", text: "5단계 반복 학습" },
  { icon: "✅", text: "실전 예문으로 완성" },
];

function Scene4() {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{
        position: "absolute", inset: 0, padding: "28px 24px",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 20,
      }}
    >
      <SceneBadge label="Episode 4 · 학습" />

      <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
        <FMOrb size={100} />
      </motion.div>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        style={{ display: "flex", flexDirection: "column", gap: 11, width: "100%" }}
      >
        {FEATURES.map((f, i) => (
          <motion.div key={i} variants={staggerChild}>
            <GCard style={{ padding: "12px 18px", display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 22 }}>{f.icon}</span>
              <Txt style={{ fontSize: 15, fontWeight: 600, color: TEXT_DARK }}>{f.text}</Txt>
            </GCard>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        variants={fadeIn}
        style={{
          background: `linear-gradient(135deg, ${BLUE} 0%, ${BLUE_MID} 100%)`,
          borderRadius: 999,
          padding: "7px 22px",
        }}
      >
        <Txt style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
          500개 패턴을 같은 방식으로
        </Txt>
      </motion.div>
    </motion.div>
  );
}

/* ─── Scene 5 ─── */
function Scene5() {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{
        position: "absolute", inset: 0, padding: "28px 24px",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 18,
      }}
    >
      <SceneBadge label="Episode 4 · PATTO" />
      <Particles count={10} />

      <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
        <FMOrb size={115} />
      </motion.div>

      <motion.div variants={fadeIn} style={{ textAlign: "center" }}>
        <Txt style={{ fontSize: 18, color: TEXT_MID, marginBottom: 6 }}>
          5가지 패턴으로 시작해서
        </Txt>
        <Txt
          style={{
            fontSize: 30, fontWeight: 800,
            background: `linear-gradient(135deg, ${BLUE} 0%, ${BLUE_MID} 60%, ${BLUE_LIGHT} 100%)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          영어가 달라집니다
        </Txt>
      </motion.div>

      <motion.div variants={scaleIn}>
        <PattoLogo size={36} />
      </motion.div>

      <motion.div variants={fadeIn} style={{ width: "100%" }}>
        <StatsBar />
      </motion.div>
    </motion.div>
  );
}

/* ─── Main ─── */
export default function Episode4() {
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
