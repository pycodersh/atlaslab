"use client";

import Episode4 from "../../../src/episodes/Episode4";
import Link from "next/link";

export default function Episode4Page() {
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
          maxWidth: 500,
          marginBottom: 24,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <Link
          href="/"
          style={{
            color: "#a0aec0",
            textDecoration: "none",
            fontSize: 14,
            display: "inline-block",
          }}
        >
          ← 목록으로
        </Link>
        <h1
          style={{
            color: "#ffffff",
            fontSize: 20,
            fontWeight: 600,
            margin: 0,
          }}
        >
          Episode 4 · 핵심 패턴 5가지
        </h1>
      </div>

      <div
        style={{
          width: 390,
          height: 844,
          borderRadius: 40,
          overflow: "hidden",
          boxShadow:
            "0 0 0 2px #2d3748, 0 20px 60px rgba(0,0,0,0.8), 0 0 80px rgba(99,102,241,0.15)",
          flexShrink: 0,
        }}
      >
        <Episode4 />
      </div>
    </div>
  );
}
