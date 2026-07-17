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
const GREEN = "#4CAF90";

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
    title: ["같은 패턴을", "다른 상황에 사용합니다."],
    body: ["패턴의 뼈대는 그대로 두고,", "상황에 맞는 말만 바꿉니다."],
    pattern: "I'm about to ___",
  },
  scene2: {
    title: ["한 부분만 바꾸면", "새 문장이 됩니다."],
    body: ["패턴을 다시 만들 필요 없이", "빈칸에 필요한 말만 넣습니다."],
    words: ["leave", "eat", "start", "call"],
  },
  scene3: {
    title: ["하나의 패턴으로", "여러 상황을 말합니다."],
    body: ["패턴이 익숙해질수록", "문장은 더 빠르게 나옵니다."],
    examples: [
      { text: "I'm about to leave.", label: "출발" },
      { text: "I'm about to eat.", label: "식사" },
      { text: "I'm about to start.", label: "시작" },
      { text: "I'm about to call her.", label: "연락" },
    ],
  },
  scene4: {
    title: ["반복할수록", "생각하는 시간이 줄어듭니다."],
    body: ["단어를 다시 조립하지 않고,", "익숙한 패턴에서 바로 말이 시작됩니다."],
  },
  scene5: {
    slogan1: "One pattern.",
    slogan2: "Many moments.",
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
        top: 110,
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
        bottom: -60,
        background:
          "radial-gradient(circle, rgba(146,176,255,0.13) 0%, rgba(146,176,255,0) 72%)",
      }}
    />
  </>
);

const GlassOrb: React.FC<{
  size?: number;
  style?: React.CSSProperties;
}> = ({ size = 188, style }) => (
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
      width: center ? undefined : 870,
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

const PatternText: React.FC<{
  sentence: string;
  size?: number;
}> = ({ sentence, size = 48 }) => {
  const [before, after = ""] = sentence.split("about to");
  return (
    <div
      style={{
        fontFamily: FONT,
        fontSize: size,
        lineHeight: 1.42,
        fontWeight: 720,
        color: NAVY,
        letterSpacing: "-0.025em",
      }}
    >
      {before}
      <span style={{ color: BLUE, fontWeight: 880 }}>about to</span>
      {after}
    </div>
  );
};

const Scene1: React.FC = () => {
  const frame = useCurrentFrame();

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

      <div
        style={{
          position: "absolute",
          left: 120,
          right: 120,
          top: 690,
          opacity: fadeWindow(frame, [20, 42], [108, 128]),
          transform: `scale(${fi(frame, [20, 42], [0.94, 1])})`,
        }}
      >
        <GlassCard
          radius={36}
          blur={18}
          bg="rgba(255,255,255,0.87)"
          border="2px solid rgba(125,184,255,0.62)"
          style={{
            padding: "64px 58px",
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
              marginBottom: 22,
            }}
          >
            PATTERN
          </div>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 76,
              lineHeight: 1.1,
              fontWeight: 920,
              color: NAVY,
              letterSpacing: "-0.045em",
            }}
          >
            I'm <span style={{ color: BLUE }}>about to</span> ___
          </div>
        </GlassCard>
      </div>

      <div
        style={{
          position: "absolute",
          right: 220,
          bottom: 245,
          opacity: fadeWindow(frame, [48, 68], [108, 128]),
          transform: `translateY(${Math.sin(frame * 0.07) * 7}px)`,
        }}
      >
        <GlassOrb size={190} />
      </div>
    </AbsoluteFill>
  );
};

const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const activeIndex = Math.min(3, Math.floor(fi(frame, [24, 100], [0, 3.99])));
  const words = CONTENT.scene2.words;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Background />
      <SoftDecor />
      <Heading
        title={CONTENT.scene2.title}
        body={CONTENT.scene2.body}
        style={{
          top: 150,
          opacity: fadeWindow(frame, [0, 18], [108, 128]),
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 110,
          right: 110,
          top: 620,
        }}
      >
        <GlassCard
          radius={34}
          blur={18}
          bg="rgba(255,255,255,0.87)"
          border="2px solid rgba(125,184,255,0.58)"
          style={{
            padding: "52px 48px",
            boxShadow:
              "0 22px 56px rgba(58,123,255,0.14), 0 4px 14px rgba(10,22,40,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontFamily: FONT,
                fontSize: 58,
                fontWeight: 860,
                color: NAVY,
              }}
            >
              I'm
            </span>
            <span
              style={{
                fontFamily: FONT,
                fontSize: 58,
                fontWeight: 900,
                color: BLUE,
              }}
            >
              about to
            </span>
            <div
              style={{
                minWidth: 260,
                height: 86,
                borderRadius: 22,
                border: "2px solid rgba(58,123,255,0.28)",
                background: "rgba(237,244,255,0.9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {words.map((word, index) => (
                <div
                  key={word}
                  style={{
                    position: "absolute",
                    opacity: activeIndex === index ? 1 : 0,
                    transform: `translateY(${
                      activeIndex === index
                        ? 0
                        : index < activeIndex
                          ? -28
                          : 28
                    }px)`,
                    fontFamily: FONT,
                    fontSize: 48,
                    fontWeight: 850,
                    color: BLUE_DARK,
                  }}
                >
                  {word}
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      <div
        style={{
          position: "absolute",
          left: 100,
          right: 100,
          top: 1030,
          display: "flex",
          justifyContent: "center",
          gap: 18,
        }}
      >
        {words.map((word, index) => {
          const opacity = fadeWindow(
            frame,
            [20 + index * 12, 38 + index * 12],
            [106, 128],
          );
          return (
            <div
              key={word}
              style={{
                opacity,
                transform: `scale(${activeIndex === index ? 1.08 : 1})`,
                padding: "14px 26px",
                borderRadius: 999,
                background:
                  activeIndex === index
                    ? "rgba(58,123,255,0.13)"
                    : "rgba(255,255,255,0.86)",
                border:
                  activeIndex === index
                    ? "1.5px solid rgba(58,123,255,0.38)"
                    : "1.5px solid rgba(224,236,255,0.9)",
                fontFamily: FONT,
                fontSize: 32,
                fontWeight: 760,
                color: activeIndex === index ? BLUE_DARK : GRAY,
              }}
            >
              {word}
            </div>
          );
        })}
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
          top: 145,
          opacity: fadeWindow(frame, [0, 18], [108, 128]),
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 84,
          right: 84,
          top: 555,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
        }}
      >
        {CONTENT.scene3.examples.map((item, index) => (
          <div
            key={item.text}
            style={{
              opacity: fadeWindow(
                frame,
                [18 + index * 18, 36 + index * 18],
                [108, 128],
              ),
              transform: `translateY(${fi(
                frame,
                [18 + index * 18, 36 + index * 18],
                [24, 0],
              )}px)`,
            }}
          >
            <GlassCard
              radius={28}
              blur={16}
              bg="rgba(255,255,255,0.85)"
              border="1.5px solid rgba(224,236,255,0.92)"
              style={{
                minHeight: 245,
                padding: "28px 30px",
                boxShadow:
                  "0 16px 42px rgba(58,123,255,0.10), 0 3px 12px rgba(10,22,40,0.04)",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  padding: "7px 16px",
                  borderRadius: 999,
                  background: "rgba(58,123,255,0.09)",
                  color: BLUE_DARK,
                  fontFamily: FONT,
                  fontSize: 22,
                  fontWeight: 760,
                  marginBottom: 18,
                }}
              >
                {item.label}
              </div>
              <PatternText sentence={item.text} size={38} />
            </GlassCard>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const nodes = [0, 1, 2, 3, 4];
  const progress = fi(frame, [24, 96], [0, 4]);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Background />
      <SoftDecor />

      <Heading
        title={CONTENT.scene4.title}
        body={CONTENT.scene4.body}
        center
        style={{
          top: 210,
          opacity: fadeWindow(frame, [0, 18], [108, 128]),
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 110,
          right: 110,
          top: 910,
          height: 150,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 64,
            right: 64,
            top: 54,
            height: 8,
            borderRadius: 99,
            background: "rgba(125,184,255,0.18)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 64,
            top: 54,
            width: `${(Math.min(progress, 4) / 4) * 760}px`,
            height: 8,
            borderRadius: 99,
            background: `linear-gradient(90deg, ${BLUE_LIGHT}, ${BLUE})`,
            boxShadow: "0 0 22px rgba(58,123,255,0.22)",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          {nodes.map((node) => {
            const active = progress >= node;
            return (
              <div
                key={node}
                style={{
                  width: 116,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: 78,
                    height: 78,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: active ? BLUE : "rgba(255,255,255,0.92)",
                    border: active
                      ? `2px solid ${BLUE}`
                      : "2px solid rgba(125,184,255,0.35)",
                    boxShadow: active
                      ? "0 10px 28px rgba(58,123,255,0.22)"
                      : "0 8px 24px rgba(10,22,40,0.05)",
                    color: active ? "#FFFFFF" : BLUE_LIGHT,
                    fontFamily: FONT,
                    fontSize: 28,
                    fontWeight: 850,
                  }}
                >
                  {node + 1}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 150,
          right: 150,
          bottom: 255,
          opacity: fadeWindow(frame, [58, 80], [108, 128]),
        }}
      >
        <GlassCard
          radius={28}
          blur={16}
          bg="rgba(255,255,255,0.84)"
          border="1.5px solid rgba(224,236,255,0.92)"
          style={{
            padding: "30px 38px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: FONT,
              fontSize: 42,
              lineHeight: 1.4,
              fontWeight: 850,
              color: NAVY,
            }}
          >
            패턴이 준비되면,
          </div>
          <div
            style={{
              marginTop: 4,
              fontFamily: FONT,
              fontSize: 38,
              lineHeight: 1.45,
              fontWeight: 760,
              color: BLUE_DARK,
            }}
          >
            문장은 더 빠르게 나옵니다.
          </div>
        </GlassCard>
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

export const Episode4: React.FC = () => (
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

export default Episode4;
