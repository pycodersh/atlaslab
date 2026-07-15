"use client";

import Link from "next/link";
import Episode3 from "../../../src/episodes/Episode3";

export default function Episode3Page() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0a0e1a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
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
          fontSize: "14px",
          opacity: 0.8,
        }}
      >
        ← 목록으로
      </Link>

      <p
        style={{
          color: "#ffffff",
          fontSize: "16px",
          fontWeight: 600,
          marginBottom: "20px",
          opacity: 0.9,
        }}
      >
        Episode 3 · 청크로 말하기
      </p>

      <div
        style={{
          width: "390px",
          height: "844px",
          borderRadius: "40px",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)",
          overflow: "hidden",
          backgroundColor: "#ffffff",
        }}
      >
        <div style={{ width: "390px", height: "844px" }}>
          <Episode3 />
        </div>
      </div>
    </div>
  );
}
