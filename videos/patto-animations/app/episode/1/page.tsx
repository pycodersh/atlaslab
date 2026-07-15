"use client";
import { Player } from "@remotion/player";
import { Episode1 } from "../../../src/videos/01-Episode1";
import Link from "next/link";

export default function Episode1Page() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0e1a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px 40px",
      }}
    >
      {/* Back */}
      <div style={{ position: "fixed", top: 20, left: 20, zIndex: 10 }}>
        <Link
          href="/"
          style={{
            color: "rgba(255,255,255,0.6)",
            textDecoration: "none",
            fontSize: 15,
            background: "rgba(255,255,255,0.08)",
            padding: "8px 18px",
            borderRadius: 20,
          }}
        >
          ← 목록으로
        </Link>
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: "rgba(255,255,255,0.6)",
          marginBottom: 24,
          letterSpacing: "0.5px",
        }}
      >
        Episode 1 · 오브 소개
      </div>

      {/* Phone frame */}
      <div
        style={{
          width: 390,
          height: 844,
          borderRadius: 40,
          overflow: "hidden",
          boxShadow:
            "0 0 0 1px rgba(255,255,255,0.08), 0 24px 80px rgba(0,0,0,0.7), 0 8px 24px rgba(92,107,192,0.2)",
          background: "#000",
          maxWidth: "90vw",
          maxHeight: "80vh",
        }}
      >
        <Player
          component={Episode1}
          durationInFrames={60 * 20}
          fps={60}
          compositionWidth={1080}
          compositionHeight={1920}
          style={{ width: "100%", height: "100%" }}
          controls
          autoPlay
          loop={false}
          clickToPlay
          acknowledgeRemotionLicense
        />
      </div>
    </div>
  );
}
