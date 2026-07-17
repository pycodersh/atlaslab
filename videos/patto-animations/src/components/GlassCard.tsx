import React from "react";

interface Props {
  children: React.ReactNode;
  style?: React.CSSProperties;
  bg?: string;
  blur?: number;
  radius?: number;
  border?: string;
}

export const GlassCard: React.FC<Props> = ({
  children,
  style,
  bg = "rgba(255,255,255,0.85)",
  blur = 16,
  radius = 24,
  border = "1px solid rgba(255,255,255,0.7)",
}) => (
  <div
    style={{
      background: bg,
      backdropFilter: `blur(${blur}px)`,
      WebkitBackdropFilter: `blur(${blur}px)`,
      borderRadius: radius,
      border,
      boxShadow: "0 8px 40px rgba(92,107,192,0.12), 0 2px 8px rgba(0,0,0,0.06)",
      ...style,
    }}
  >
    {children}
  </div>
);
