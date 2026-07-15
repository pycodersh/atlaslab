"use client";

import Link from "next/link";
import Episode2 from "../../../src/episodes/Episode2";

export default function Episode2Page() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0a0e1a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        position: "relative",
      }}
    >
      <Link
        href="/"
        style={{
          position: "absolute",
          top: "24px",
          left: "24px",
          color: "#ffffff",
          textDecoration: "none",
          fontSize: "15px",
          opacity: 0.8,
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        ← 목록으로
      </Link>

      <p
        style={{
          color: "#ffffff",
          fontSize: "14px",
          letterSpacing: "0.05em",
          opacity: 0.6,
          marginBottom: "20px",
          textAlign: "center",
        }}
      >
        Episode 2 · 패턴 vs 단어
      </p>

      <div
        style={{
          width: "390px",
          height: "844px",
          borderRadius: "40px",
          overflow: "hidden",
          boxShadow:
            "0 0 0 1px rgba(255,255,255,0.08), 0 20px 60px rgba(0,0,0,0.6), 0 8px 24px rgba(0,0,0,0.4)",
          background: "#ffffff",
          position: "relative",
          flexShrink: 0,
        }}
      >
        <div style={{ width: "390px", height: "844px" }}>
          <Episode2 />
        </div>
      </div>
    </div>
  );
}
