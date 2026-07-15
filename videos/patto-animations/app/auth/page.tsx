"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function AuthForm() {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get("from") ?? "/";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    if (res.ok) {
      router.push(from);
    } else {
      setErr(true);
      setPw("");
    }
  };

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <input
        type="password"
        value={pw}
        onChange={(e) => { setPw(e.target.value); setErr(false); }}
        placeholder="비밀번호"
        autoFocus
        style={{
          background: "rgba(255,255,255,0.07)",
          border: err ? "1px solid #f87171" : "1px solid rgba(255,255,255,0.12)",
          borderRadius: 12,
          padding: "16px 20px",
          color: "#fff",
          fontSize: 18,
          outline: "none",
          textAlign: "center",
          letterSpacing: "4px",
        }}
      />
      {err && <div style={{ color: "#f87171", fontSize: 14 }}>비밀번호가 틀렸어요</div>}
      <button
        type="submit"
        style={{
          background: "#5C6BC0",
          color: "#fff",
          border: "none",
          borderRadius: 12,
          padding: "16px",
          fontSize: 17,
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        입장하기
      </button>
    </form>
  );
}

export default function AuthPage() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24 }}>
      <div
        style={{
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 24,
          padding: "48px 56px",
          width: "100%",
          maxWidth: 420,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontWeight: 900,
            letterSpacing: "-2px",
            background: "linear-gradient(135deg, #7c8ff0, #5C6BC0)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: 8,
          }}
        >
          PATTO
        </div>
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, marginBottom: 36 }}>
          Promo Videos
        </div>
        <Suspense fallback={null}>
          <AuthForm />
        </Suspense>
      </div>
    </div>
  );
}
