import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { W, H } from "../constants";

interface Props {
  fadeFromBlack?: boolean;
  globalFadeOut?: number;
}

export const Background: React.FC<Props> = ({ fadeFromBlack = false, globalFadeOut }) => {
  const frame = useCurrentFrame();
  const bgOpacity = fadeFromBlack
    ? interpolate(frame, [0, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 1;
  const blackBg = fadeFromBlack
    ? interpolate(frame, [0, 40], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;
  const fadeOut = globalFadeOut
    ? interpolate(frame, [globalFadeOut, globalFadeOut + 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;

  return (
    <div style={{ position: "absolute", width: W, height: H }}>
      <div style={{ position: "absolute", inset: 0, background: "#000", opacity: blackBg }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(160deg, #d8dff5 0%, #e4e8f5 50%, #dde3f5 100%)",
          opacity: bgOpacity,
        }}
      />
      {fadeOut > 0 && (
        <div style={{ position: "absolute", inset: 0, background: "#000", opacity: fadeOut }} />
      )}
    </div>
  );
};
