"use client";

import Episode5 from "../../../src/episodes/Episode5";

export default function Episode5Page() {
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
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          marginBottom: 16,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <a
          href="/"
          style={{
            color: "#a0aec0",
            textDecoration: "none",
            fontSize: 14,
            display: "inline-block",
          }}
        >
          ← 목록으로
        </a>
        <h1
          style={{
            color: "#ffffff",
            fontSize: 18,
            fontWeight: 600,
            margin: 0,
          }}
        >
          Episode 5 · 반복의 과학
        </h1>
      </div>

      <div
        style={{
          width: 390,
          height: 844,
          borderRadius: 40,
          overflow: "hidden",
          boxShadow:
            "0 0 0 1px rgba(255,255,255,0.08), 0 32px 80px rgba(0,0,0,0.6), 0 8px 24px rgba(0,0,0,0.4)",
          flexShrink: 0,
        }}
      >
        <Episode5 />
      </div>
    </div>
  );
}
