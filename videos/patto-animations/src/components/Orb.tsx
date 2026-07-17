import React from "react";
import { useCurrentFrame } from "remotion";
import { ORB, ORB_GLOW, C } from "../constants";
import { isBlink } from "../utils";

export type OrbMode = "idle" | "speaking" | "waiting" | "done";

const EYE_POS: Record<OrbMode, { dx: number; dy: number }> = {
  idle: { dx: 0, dy: 0 },
  speaking: { dx: 0, dy: -5 },
  waiting: { dx: 0, dy: 6 },
  done: { dx: 6, dy: -5 },
};

interface OrbProps {
  size?: number;
  mode?: OrbMode;
  opacity?: number;
  showSpinner?: boolean;
  x?: number;
  y?: number;
}

export const Orb: React.FC<OrbProps> = ({
  size = 220,
  mode = "idle",
  opacity = 1,
  showSpinner = true,
  x = 0,
  y = 0,
}) => {
  const frame = useCurrentFrame();
  const blinking = isBlink(frame, 200, 5);
  const eyeScaleY = blinking ? 0.1 : 1;
  const { dx, dy } = EYE_POS[mode];

  const eyeSize = size * 0.1;
  const eyeGap = size * 0.22;
  const eyeTop = size * 0.45 + dy;
  const spinAngle = (frame * 1.5) % 360;

  const eyeColor = mode === "done" ? "#6B4B00" : "#3a3f8f";

  return (
    <div
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        opacity,
      }}
    >
      {/* Outer glow */}
      <div
        style={{
          position: "absolute",
          inset: -size * 0.15,
          borderRadius: "50%",
          background: ORB[mode].replace("radial-gradient", "radial-gradient").split(",").join(","),
          filter: `blur(${size * 0.2}px)`,
          opacity: 0.35,
        }}
      />

      {/* Spinner ring */}
      {showSpinner && (
        <>
          <div
            style={{
              position: "absolute",
              inset: -10,
              borderRadius: "50%",
              border: "3px solid transparent",
              borderTop: `3px solid rgba(128,144,240,0.6)`,
              borderRight: `3px solid rgba(128,144,240,0.2)`,
              transform: `rotate(${spinAngle}deg)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: -18,
              borderRadius: "50%",
              border: "2px solid transparent",
              borderBottom: `2px solid rgba(128,144,240,0.3)`,
              borderLeft: `2px solid rgba(128,144,240,0.1)`,
              transform: `rotate(${-spinAngle * 0.7}deg)`,
            }}
          />
        </>
      )}

      {/* Main orb body */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: ORB[mode],
          boxShadow: ORB_GLOW[mode],
        }}
      />

      {/* Highlight */}
      <div
        style={{
          position: "absolute",
          top: size * 0.1,
          left: size * 0.15,
          width: size * 0.35,
          height: size * 0.25,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 100%)",
        }}
      />

      {/* Eyes */}
      <div
        style={{
          position: "absolute",
          top: eyeTop,
          left: size / 2 - eyeGap / 2 + dx - eyeSize / 2,
          width: eyeSize,
          height: eyeSize,
          borderRadius: "50%",
          background: eyeColor,
          transform: `scaleY(${eyeScaleY})`,
          transition: "transform 0.05s",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: eyeTop,
          left: size / 2 + eyeGap / 2 + dx - eyeSize / 2,
          width: eyeSize,
          height: eyeSize,
          borderRadius: "50%",
          background: eyeColor,
          transform: `scaleY(${eyeScaleY})`,
          transition: "transform 0.05s",
        }}
      />
    </div>
  );
};
