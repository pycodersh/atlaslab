import Link from "next/link";

const VIDEO_TITLES: Record<string, string> = {
  "01-orb-intro": "오브 캐릭터 소개",
  "02-onboarding": "온보딩 소개 카드",
  "03-pattern-learning": "패턴 학습 원리",
  "04-session-flow": "세션 흐름",
  "05-writing-studio": "Writing Studio",
};

export default async function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const title = VIDEO_TITLES[id] ?? id;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      {/* Back */}
      <div style={{ position: "fixed", top: 20, left: 20 }}>
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
          ← 목록
        </Link>
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: "rgba(255,255,255,0.7)",
          marginBottom: 24,
          textAlign: "center",
        }}
      >
        {title}
      </div>

      {/* Video player — 9:16 centered */}
      <div
        style={{
          width: "min(400px, 90vw)",
          aspectRatio: "9/16",
          background: "#000",
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 20px 80px rgba(0,0,0,0.6)",
        }}
      >
        <video
          src={`/videos/${id}.mp4`}
          controls
          autoPlay
          playsInline
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>

      {/* Download */}
      <a
        href={`/videos/${id}.mp4`}
        download
        style={{
          marginTop: 20,
          color: "rgba(92,107,192,0.8)",
          textDecoration: "none",
          fontSize: 15,
        }}
      >
        ↓ MP4 다운로드
      </a>
    </div>
  );
}
