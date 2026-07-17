import { interpolate } from "remotion";

export const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), max);

/** Fade in over `dur` frames starting at `start` */
export const fadeIn = (frame: number, start: number, dur = 30) =>
  interpolate(frame, [start, start + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

/** Fade out over `dur` frames starting at `start` */
export const fadeOut = (frame: number, start: number, dur = 30) =>
  interpolate(frame, [start, start + dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

/** Slide in from Y offset */
export const slideUp = (frame: number, start: number, dur = 40, offset = 60) =>
  interpolate(frame, [start, start + dur], [offset, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

/** Scale in from `from` to 1 */
export const scaleIn = (frame: number, start: number, dur = 30, from = 0.7) =>
  interpolate(frame, [start, start + dur], [from, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

/** Count up from 0 to target */
export const countUp = (frame: number, start: number, end: number, target: number) =>
  Math.floor(interpolate(frame, [start, end], [0, target], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

/** Typewriter: return how many chars to show */
export const typewriter = (frame: number, start: number, dur: number, text: string) =>
  text.slice(0, Math.floor(interpolate(frame, [start, start + dur], [0, text.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));

/** Periodic blink: true during blink frames */
export const isBlink = (frame: number, period = 180, dur = 6) =>
  frame % period < dur;

/** Music volume with fade in/out */
export const musicVol = (frame: number, totalFrames: number, fps: number) => {
  const fadeInFrames = fps * 1;
  const fadeOutFrames = fps * 2;
  const fadeIn = interpolate(frame, [0, fadeInFrames], [0, 0.4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [totalFrames - fadeOutFrames, totalFrames], [0.4, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return Math.min(fadeIn, fadeOut, 0.4);
};
