import React from "react";
import { FONT, C } from "../constants";

interface Props {
  size?: number;
  opacity?: number;
  subtitle?: string;
}

export const Logo: React.FC<Props> = ({ size = 80, opacity = 1, subtitle }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity }}>
    <div
      style={{
        fontFamily: FONT,
        fontSize: size,
        fontWeight: 900,
        letterSpacing: "-3px",
        background: `linear-gradient(135deg, ${C.indigo} 0%, ${C.indigoDark} 100%)`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        lineHeight: 1,
      }}
    >
      PATTO
    </div>
    {subtitle && (
      <div
        style={{
          fontFamily: FONT,
          fontSize: size * 0.22,
          fontWeight: 500,
          color: C.textSub,
          letterSpacing: "0.5px",
        }}
      >
        {subtitle}
      </div>
    )}
  </div>
);
