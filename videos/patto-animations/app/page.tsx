import Link from "next/link";

const MOTION_EPISODES = [
  {
    id: 2,
    gradient: "linear-gradient(160deg, #EEF4FF, #D6E6FF)",
    title: "패턴 vs 단어",
    subtitle: "be about to",
    emoji: "🧩",
    href: "/episode/2",
  },
  {
    id: 3,
    gradient: "linear-gradient(160deg, #E8F5E9, #C8E6C9)",
    title: "청크로 말하기",
    subtitle: "Chunk Speaking",
    emoji: "💬",
    href: "/episode/3",
  },
  {
    id: 4,
    gradient: "linear-gradient(160deg, #FFF3E0, #FFE0B2)",
    title: "핵심 패턴 5가지",
    subtitle: "Top 5 Patterns",
    emoji: "⭐",
    href: "/episode/4",
  },
  {
    id: 5,
    gradient: "linear-gradient(160deg, #F3E5F5, #E1BEE7)",
    title: "반복의 과학",
    subtitle: "Spaced Repetition",
    emoji: "🔁",
    href: "/episode/5",
  },
];

const REMOTION_EPISODES = [
  {
    id: 1,
    gradient: "linear-gradient(135deg, #667eea, #764ba2)",
    title: "오브 소개",
    subtitle: "AI Trainer",
    emoji: "🤖",
    href: "/episode/1",
  },
];

export default function HomePage() {
  return (
    <div style={{ padding: "48px 24px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 64 }}>
        <div
          style={{
            fontSize: 56,
            fontWeight: 900,
            letterSpacing: "-2px",
            background: "linear-gradient(135deg, #7c8ff0, #5C6BC0)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            lineHeight: 1.1,
            marginBottom: 8,
          }}
        >
          PATTO
        </div>
        <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 16, letterSpacing: "2px" }}>
          PROMOTIONAL VIDEOS
        </div>
      </div>

      {/* Section A: Motion Experiences */}
      <div style={{ marginBottom: 64 }}>
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: "#fff",
              marginBottom: 4,
            }}
          >
            Motion Experiences
          </div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>
            Episodes 2–5 · React + Framer Motion
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 20,
          }}
        >
          {MOTION_EPISODES.map((ep) => (
            <Link key={ep.id} href={ep.href} style={{ textDecoration: "none" }}>
              <div
                style={{
                  width: 280,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 20,
                  overflow: "hidden",
                  cursor: "pointer",
                }}
              >
                {/* Thumbnail */}
                <div
                  style={{
                    aspectRatio: "9/16",
                    maxHeight: 220,
                    background: ep.gradient,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    overflow: "hidden",
                  }}
                >
                  <div style={{ fontSize: 44 }}>{ep.emoji}</div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "rgba(0,0,0,0.5)",
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                    }}
                  >
                    Episode {ep.id}
                  </div>
                </div>

                {/* Info */}
                <div style={{ padding: "18px 20px" }}>
                  <div
                    style={{
                      fontSize: 17,
                      fontWeight: 700,
                      color: "#fff",
                      marginBottom: 4,
                    }}
                  >
                    {ep.title}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "rgba(255,255,255,0.4)",
                      marginBottom: 14,
                    }}
                  >
                    {ep.subtitle}
                  </div>
                  <div
                    style={{
                      display: "inline-block",
                      background: "linear-gradient(135deg, #5C6BC0, #3949AB)",
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 700,
                      padding: "7px 18px",
                      borderRadius: 20,
                    }}
                  >
                    ▶ 재생
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Section B: Remotion Renders */}
      <div>
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: "#fff",
              marginBottom: 4,
            }}
          >
            Remotion Renders
          </div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>
            Episode 1 · Remotion
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
          {REMOTION_EPISODES.map((ep) => (
            <Link key={ep.id} href={ep.href} style={{ textDecoration: "none" }}>
              <div
                style={{
                  width: 280,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 20,
                  overflow: "hidden",
                  cursor: "pointer",
                }}
              >
                {/* Thumbnail */}
                <div
                  style={{
                    aspectRatio: "9/16",
                    maxHeight: 220,
                    background: ep.gradient,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    overflow: "hidden",
                  }}
                >
                  <div style={{ fontSize: 44 }}>{ep.emoji}</div>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 800,
                      color: "#fff",
                      letterSpacing: "-0.5px",
                    }}
                  >
                    PATTO
                  </div>
                </div>

                {/* Info */}
                <div style={{ padding: "18px 20px" }}>
                  <div
                    style={{
                      fontSize: 17,
                      fontWeight: 700,
                      color: "#fff",
                      marginBottom: 4,
                    }}
                  >
                    {ep.title}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "rgba(255,255,255,0.4)",
                      marginBottom: 14,
                    }}
                  >
                    {ep.subtitle}
                  </div>
                  <div
                    style={{
                      display: "inline-block",
                      background: "linear-gradient(135deg, #667eea, #764ba2)",
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 700,
                      padding: "7px 18px",
                      borderRadius: 20,
                    }}
                  >
                    ▶ 재생
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
