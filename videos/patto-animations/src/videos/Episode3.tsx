import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  useCurrentFrame,
} from "remotion";

import { Background } from "../components/Background";
import { GlassCard } from "../components/GlassCard";
import { Logo } from "../components/Logo";
import { FONT } from "../constants";

const BLUE = "#3A7BFF";
const BLUE_DARK = "#1A73E8";
const BLUE_LIGHT = "#7DB8FF";
const NAVY = "#0A1628";
const GRAY = "#7F8CA3";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const fi = (
  frame: number,
  input: [number, number],
  output: [number, number],
) =>
  interpolate(frame, input, output, {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

const fadeWindow = (
  frame: number,
  fadeIn: [number, number],
  fadeOut?: [number, number],
) => {
  const value = fi(frame, fadeIn, [0, 1]);
  return fadeOut ? value * fi(frame, fadeOut, [1, 0]) : value;
};

const CONTENT = {
  scene1: {
    title: ["PATTO는", "패턴으로 가르칩니다."],
    body: ["단어를 하나씩 조립하는 대신,", "자주 쓰는 표현을 하나로 익힙니다."],
    words: ["want", "to", "go", "home"],
  },
  scene2: {
    title: ["단어가 모이면", "하나의 패턴이 됩니다."],
    body: ["따로 떠오르던 단어가", "말할 수 있는 하나의 덩어리로 연결됩니다."],
    pattern: "want to go",
  },
  scene3: {
    title: ["패턴 하나로", "문장은 계속 확장됩니다."],
    body: ["고정된 표현은 그대로 두고,", "필요한 말만 바꿉니다."],
    examples: [
      "I want to go home.",
      "I want to go shopping.",
      "I want to go abroad.",
    ],
  },
  scene4: {
    title: "Listen → Speak → Remember",
    body: ["듣고, 따라 말하고, 다시 떠올리며", "패턴을 입에 익힙니다."],
    steps: [
      { label: "Listen", sub: "패턴을 듣고 이해하기" },
      { label: "Speak", sub: "직접 소리 내어 말하기" },
      { label: "Remember", sub: "빈칸을 채우며 떠올리기" },
    ],
  },
  scene5: {
    slogan1: "Repeat patterns,",
    slogan2: "build fluency.",
  },
};

const SoftDecor: React.FC = () => (
  <>
    <div
      style={{
        position: "absolute",
        width: 560,
        height: 560,
        borderRadius: "50%",
        top: 120,
        right: -160,
        background:
          "radial-gradient(circle, rgba(125,184,255,0.17) 0%, rgba(125,184,255,0) 72%)",
      }}
    />
    <div
      style={{
        position: "absolute",
        width: 700,
        height: 700,
        borderRadius: "50%",
        left: -300,
        bottom: -50,
        background:
          "radial-gradient(circle, rgba(146,176,255,0.13) 0%, rgba(146,176,255,0) 72%)",
      }}
    />
  </>
);

const GlassOrb: React.FC<{
  size?: number;
  style?: React.CSSProperties;
}> = ({ size = 190, style }) => (
  <div style={{ position: "relative", width: size, height: size, ...style }}>
    <div
      style={{
        position: "absolute",
        left: size * 0.12,
        right: size * 0.12,
        bottom: -size * 0.08,
        height: size * 0.17,
        borderRadius: "50%",
        background: "rgba(46,91,184,0.15)",
        filter: `blur(${size * 0.085}px)`,
        transform: "scaleX(1.2)",
      }}
    />
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        borderRadius: "50%",
        background:
          "radial-gradient(circle at 31% 25%, #FFFFFF 0%, #ECF6FF 16%, #CEE5FF 38%, #A9CEFF 61%, #84ACEF 81%, #6386D8 100%)",
        border: "1.5px solid rgba(255,255,255,0.94)",
        boxShadow:
          "inset -16px -20px 34px rgba(48,92,185,0.16), inset 15px 14px 28px rgba(255,255,255,0.64), 0 24px 48px rgba(58,123,255,0.17), 0 0 38px rgba(125,184,255,0.19)",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: size * 0.15,
          top: size * 0.09,
          width: size * 0.45,
          height: size * 0.24,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.5) 45%, rgba(255,255,255,0) 74%)",
          transform: "rotate(-24deg)",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: size * 0.045,
          top: size * 0.18,
          width: size * 0.12,
          height: size * 0.58,
          borderRadius: "50%",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.64), rgba(255,255,255,0.08))",
          filter: `blur(${size * 0.012}px)`,
        }}
      />
      {[0.35, 0.58].map((left, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            left: size * left,
            top: size * 0.38,
            width: size * 0.092,
            height: size * 0.125,
            borderRadius: 99,
            background:
              "radial-gradient(circle at 32% 25%, #354D77 0%, #0A1628 56%, #020711 100%)",
            boxShadow: "inset 1px 1px 2px rgba(255,255,255,0.35)",
          }}
        />
      ))}
    </div>
  </div>
);

const WordChip: React.FC<{
  text: string;
  x: number;
  y: number;
  opacity?: number;
  scale?: number;
}> = ({ text, x, y, opacity = 1, scale = 1 }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      opacity,
      transform: `scale(${scale})`,
      padding: "14px 28px",
      borderRadius: 999,
      whiteSpace: "nowrap",
      fontFamily: FONT,
      fontSize: 36,
      fontWeight: 760,
      color: NAVY,
      background: "rgba(255,255,255,0.9)",
      border: "1.5px solid rgba(125,184,255,0.26)",
      boxShadow: "0 12px 30px rgba(58,123,255,0.10)",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
    }}
  >
    {text}
  </div>
);

const Heading: React.FC<{
  title: string[];
  body?: string[];
  center?: boolean;
  style?: React.CSSProperties;
}> = ({ title, body = [], center = false, style }) => (
  <div
    style={{
      position: "absolute",
      left: center ? 100 : 78,
      right: center ? 100 : undefined,
      width: center ? undefined : 860,
      textAlign: center ? "center" : "left",
      fontFamily: FONT,
      ...style,
    }}
  >
    {title.map((line, index) => (
      <div
        key={`${line}-${index}`}
        style={{
          fontSize: index === 0 ? 66 : 58,
          lineHeight: 1.14,
          letterSpacing: "-0.04em",
          fontWeight: index === 0 ? 900 : 800,
          color: index === 0 ? NAVY : BLUE_DARK,
        }}
      >
        {line}
      </div>
    ))}
    {body.length > 0 && (
      <div style={{ marginTop: 26 }}>
        {body.map((line, index) => (
          <div
            key={`${line}-${index}`}
            style={{
              fontSize: 29,
              lineHeight: 1.58,
              fontWeight: 500,
              color: GRAY,
            }}
          >
            {line}
          </div>
        ))}
      </div>
    )}
  </div>
);

const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const positions = [
    [150, 620],
    [390, 760],
    [675, 610],
    [720, 890],
  ] as const;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Background />
      <SoftDecor />
      <Heading
        title={CONTENT.scene1.title}
        body={CONTENT.scene1.body}
        style={{
          top: 155,
          opacity: fadeWindow(frame, [0, 18], [108, 128]),
          transform: `translateY(${fi(frame, [0, 18], [24, 0])}px)`,
        }}
      />

      {CONTENT.scene1.words.map((word, index) => {
        const [x, y] = positions[index];
        return (
          <WordChip
            key={word}
            text={word}
            x={x}
            y={y}
            opacity={fadeWindow(
              frame,
              [14 + index * 7, 32 + index * 7],
              [104, 126],
            )}
            scale={fi(frame, [14 + index * 7, 32 + index * 7], [0.78, 1])}
          />
        );
      })}

      <div
        style={{
          position: "absolute",
          right: 220,
          bottom: 300,
          opacity: fadeWindow(frame, [26, 46], [108, 128]),
          transform: `translateY(${Math.sin(frame * 0.07) * 7}px)`,
        }}
      >
        <GlassOrb size={194} />
      </div>
    </AbsoluteFill>
  );
};

const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const merge = fi(frame, [30, 72], [0, 1]);

  const starts = [
    [120, 700],
    [360, 530],
    [660, 720],
  ] as const;

  const targets = [
    [300, 920],
    [470, 920],
    [615, 920],
  ] as const;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Background />
      <SoftDecor />
      <Heading
        title={CONTENT.scene2.title}
        body={CONTENT.scene2.body}
        style={{
          top: 155,
          opacity: fadeWindow(frame, [0, 18], [108, 128]),
        }}
      />

      {["want", "to", "go"].map((word, index) => {
        const [sx, sy] = starts[index];
        const [tx, ty] = targets[index];
        return (
          <WordChip
            key={word}
            text={word}
            x={sx + (tx - sx) * merge}
            y={sy + (ty - sy) * merge}
            opacity={
              fadeWindow(frame, [14 + index * 6, 32 + index * 6]) *
              (1 - merge * 0.82)
            }
            scale={1 - merge * 0.08}
          />
        );
      })}

      <div
        style={{
          position: "absolute",
          left: 150,
          right: 150,
          top: 790,
          opacity: fadeWindow(frame, [60, 82], [108, 128]),
          transform: `scale(${fi(frame, [60, 82], [0.94, 1])})`,
        }}
      >
        <GlassCard
          radius={36}
          blur={18}
          bg="rgba(255,255,255,0.87)"
          border="2px solid rgba(125,184,255,0.62)"
          style={{
            padding: "64px 60px",
            textAlign: "center",
            boxShadow:
              "0 24px 60px rgba(58,123,255,0.15), 0 5px 16px rgba(10,22,40,0.05)",
          }}
        >
          <div
            style={{
              fontFamily: FONT,
              fontSize: 27,
              fontWeight: 760,
              color: BLUE_DARK,
              letterSpacing: "0.07em",
              marginBottom: 20,
            }}
          >
            PATTERN
          </div>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 82,
              lineHeight: 1.08,
              fontWeight: 920,
              color: BLUE,
              letterSpacing: "-0.045em",
            }}
          >
            {CONTENT.scene2.pattern}
          </div>
        </GlassCard>
      </div>
    </AbsoluteFill>
  );
};

const Scene3: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Background />
      <SoftDecor />
      <Heading
        title={CONTENT.scene3.title}
        body={CONTENT.scene3.body}
        style={{
          top: 150,
          opacity: fadeWindow(frame, [0, 18], [108, 128]),
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 95,
          right: 95,
          top: 585,
          display: "flex",
          flexDirection: "column",
          gap: 28,
        }}
      >
        {CONTENT.scene3.examples.map((sentence, index) => {
          const [before, after = ""] = sentence.split("want to go");
          return (
            <div
              key={sentence}
              style={{
                opacity: fadeWindow(
                  frame,
                  [18 + index * 22, 38 + index * 22],
                  [106, 128],
                ),
                transform: `translateY(${fi(
                  frame,
                  [18 + index * 22, 38 + index * 22],
                  [28, 0],
                )}px)`,
              }}
            >
              <GlassCard
                radius={28}
                blur={16}
                bg="rgba(255,255,255,0.85)"
                border="1.5px solid rgba(224,236,255,0.92)"
                style={{
                  padding: "30px 36px",
                  boxShadow:
                    "0 16px 42px rgba(58,123,255,0.10), 0 3px 12px rgba(10,22,40,0.04)",
                }}
              >
                <div
                  style={{
                    fontFamily: FONT,
                    fontSize: 43,
                    lineHeight: 1.45,
                    fontWeight: 710,
                    color: NAVY,
                    letterSpacing: "-0.025em",
                  }}
                >
                  {before}
                  <span style={{ color: BLUE, fontWeight: 860 }}>
                    want to go
                  </span>
                  {after}
                </div>
              </GlassCard>
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          left: 220,
          bottom: 205,
          opacity: fadeWindow(frame, [54, 74], [108, 128]),
          transform: `translateY(${Math.sin(frame * 0.07) * 7}px)`,
        }}
      >
        <GlassOrb size={176} />
      </div>
    </AbsoluteFill>
  );
};

const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const icons = ["◉", "◌", "✦"];

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Background />
      <SoftDecor />
      <Heading
        title={[CONTENT.scene4.title]}
        body={CONTENT.scene4.body}
        center
        style={{
          top: 190,
          opacity: fadeWindow(frame, [0, 18], [108, 128]),
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 88,
          right: 88,
          top: 800,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          gap: 16,
          opacity: fadeWindow(frame, [24, 46], [108, 128]),
        }}
      >
        {CONTENT.scene4.steps.map((step, index) => (
          <React.Fragment key={step.label}>
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                opacity: fi(
                  frame,
                  [24 + index * 16, 44 + index * 16],
                  [0, 1],
                ),
                transform: `scale(${fi(
                  frame,
                  [24 + index * 16, 44 + index * 16],
                  [0.9, 1],
                )})`,
              }}
            >
              <div
                style={{
                  width: 116,
                  height: 116,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(58,123,255,0.08)",
                  border: "2px solid rgba(125,184,255,0.62)",
                  color: BLUE_DARK,
                  fontFamily: FONT,
                  fontSize: 46,
                  fontWeight: 760,
                }}
              >
                {icons[index]}
              </div>
              <div
                style={{
                  marginTop: 20,
                  fontFamily: FONT,
                  fontSize: 34,
                  fontWeight: 840,
                  color: NAVY,
                }}
              >
                {step.label}
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontFamily: FONT,
                  fontSize: 23,
                  lineHeight: 1.46,
                  fontWeight: 500,
                  color: GRAY,
                  textAlign: "center",
                }}
              >
                {step.sub}
              </div>
            </div>

            {index < CONTENT.scene4.steps.length - 1 && (
              <div
                style={{
                  paddingTop: 38,
                  fontFamily: FONT,
                  fontSize: 42,
                  fontWeight: 400,
                  color: BLUE_LIGHT,
                  opacity: fi(
                    frame,
                    [40 + index * 16, 56 + index * 16],
                    [0, 1],
                  ),
                }}
              >
                →
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const Scene5: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Background />
      <SoftDecor />

      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          top: 520,
          textAlign: "center",
          opacity: fadeWindow(frame, [0, 22]),
          transform: `scale(${fi(frame, [0, 22], [0.96, 1])})`,
        }}
      >
        <Logo size={132} />
      </div>

      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          top: 860,
          textAlign: "center",
          opacity: fadeWindow(frame, [26, 48]),
          fontFamily: FONT,
        }}
      >
        <div
          style={{
            fontSize: 52,
            lineHeight: 1.3,
            fontWeight: 850,
            color: NAVY,
          }}
        >
          {CONTENT.scene5.slogan1}
        </div>
        <div
          style={{
            marginTop: 6,
            fontSize: 42,
            lineHeight: 1.45,
            fontWeight: 620,
            color: BLUE_DARK,
          }}
        >
          {CONTENT.scene5.slogan2}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Episode3: React.FC = () => (
  <AbsoluteFill>
    <Sequence from={0} durationInFrames={135}>
      <Scene1 />
    </Sequence>
    <Sequence from={135} durationInFrames={135}>
      <Scene2 />
    </Sequence>
    <Sequence from={270} durationInFrames={135}>
      <Scene3 />
    </Sequence>
    <Sequence from={405} durationInFrames={135}>
      <Scene4 />
    </Sequence>
    <Sequence from={540} durationInFrames={120}>
      <Scene5 />
    </Sequence>
  </AbsoluteFill>
);

export default Episode3;
