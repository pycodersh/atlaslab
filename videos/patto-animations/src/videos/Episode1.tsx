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
const ICE = "#EDF4FF";

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
  const fadeInValue = fi(frame, fadeIn, [0, 1]);
  if (!fadeOut) return fadeInValue;
  return fadeInValue * fi(frame, fadeOut, [1, 0]);
};

const CONTENT = {
  scene1: {
    title: ["왜 영어는 배웠는데", "말이 안 나올까?"],
    body: ["단어도 알고 문법도 아는데,", "막상 말하려면 생각이 멈춥니다."],
    words: ["know", "have", "go", "take", "want", "think"],
  },
  scene2: {
    title: ["머릿속에는", "단어가 많습니다."],
    body: ["하지만 단어들은 서로 연결되지 않고", "하나씩 따로 떠오릅니다."],
    words: ["I", "want", "to", "say", "what", "I", "mean"],
  },
  scene3: {
    title: ["생각은 많은데,", "입이 멈춥니다."],
    body: ["문장을 만들려는 순간마다", "단어 순서를 다시 찾게 됩니다."],
    words: ["I", "know", "what", "I", "want", "to", "say"],
  },
  scene4: {
    title: ["많이 아는 것과", "말할 수 있는 것은 다릅니다."],
    body: ["영어 실력의 문제라기보다,", "말이 나오는 방식의 문제일 수 있습니다."],
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

      <div
        style={{
          position: "absolute",
          left: size * 0.08,
          right: size * 0.08,
          bottom: size * 0.025,
          height: size * 0.17,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(47,98,221,0.25), rgba(47,98,221,0) 72%)",
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
  rotate?: number;
  accent?: boolean;
}> = ({
  text,
  x,
  y,
  opacity = 1,
  scale = 1,
  rotate = 0,
  accent = false,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      opacity,
      transform: `scale(${scale}) rotate(${rotate}deg)`,
      padding: "13px 27px",
      borderRadius: 999,
      whiteSpace: "nowrap",
      fontFamily: FONT,
      fontSize: 34,
      fontWeight: 720,
      color: accent ? BLUE_DARK : NAVY,
      background: accent
        ? "rgba(237,244,255,0.96)"
        : "rgba(255,255,255,0.9)",
      border: accent
        ? "1.5px solid rgba(58,123,255,0.27)"
        : "1.5px solid rgba(255,255,255,0.84)",
      boxShadow: accent
        ? "0 10px 28px rgba(58,123,255,0.13)"
        : "0 10px 30px rgba(24,45,78,0.07)",
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
      width: center ? undefined : 850,
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

    {body.length ? (
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
    ) : null}
  </div>
);

const Scene1: React.FC = () => {
  const frame = useCurrentFrame();

  const headingOpacity = fadeWindow(frame, [0, 18], [108, 128]);
  const headingY = fi(frame, [0, 18], [24, 0]);
  const orbOpacity = fadeWindow(frame, [30, 50], [108, 128]);
  const orbFloat = Math.sin(frame * 0.07) * 7;

  const positions = [
    [120, 560, -6],
    [740, 500, 4],
    [470, 715, -3],
    [790, 875, 5],
    [180, 1010, 4],
    [620, 1130, -4],
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
          opacity: headingOpacity,
          transform: `translateY(${headingY}px)`,
        }}
      />

      {CONTENT.scene1.words.map((word, index) => {
        const opacity = fadeWindow(
          frame,
          [12 + index * 5, 30 + index * 5],
          [102, 124],
        );
        const scale = fi(frame, [12 + index * 5, 30 + index * 5], [0.78, 1]);
        const [x, y, rotate] = positions[index];

        return (
          <WordChip
            key={`${word}-${index}`}
            text={word}
            x={x}
            y={y}
            rotate={rotate}
            opacity={opacity}
            scale={scale}
            accent={index === 0 || index === 3}
          />
        );
      })}

      <div
        style={{
          position: "absolute",
          right: 215,
          bottom: 330,
          opacity: orbOpacity,
          transform: `translateY(${orbFloat}px)`,
        }}
      >
        <GlassOrb size={198} />
      </div>

      <div
        style={{
          position: "absolute",
          left: 90,
          right: 90,
          bottom: 225,
          textAlign: "center",
          opacity: fadeWindow(frame, [52, 72], [108, 128]),
          transform: `translateY(${fi(frame, [52, 72], [14, 0])}px)`,
          fontFamily: FONT,
          fontSize: 46,
          lineHeight: 1.3,
          fontWeight: 850,
          color: NAVY,
          letterSpacing: "-0.025em",
        }}
      >
        아는데… 왜 말이 안 나올까?
      </div>
    </AbsoluteFill>
  );
};

const Scene2: React.FC = () => {
  const frame = useCurrentFrame();

  const headingOpacity = fadeWindow(frame, [0, 18], [108, 128]);
  const headingY = fi(frame, [0, 18], [22, 0]);

  const positions = [
    [140, 615],
    [410, 530],
    [745, 620],
    [195, 900],
    [520, 830],
    [800, 980],
    [375, 1140],
  ] as const;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Background />
      <SoftDecor />

      <Heading
        title={CONTENT.scene2.title}
        body={CONTENT.scene2.body}
        style={{
          top: 160,
          opacity: headingOpacity,
          transform: `translateY(${headingY}px)`,
        }}
      />

      {CONTENT.scene2.words.map((word, index) => {
        const opacity = fadeWindow(
          frame,
          [18 + index * 6, 36 + index * 6],
          [104, 126],
        );
        const scale = fi(frame, [18 + index * 6, 36 + index * 6], [0.8, 1]);
        const [x, y] = positions[index];

        return (
          <WordChip
            key={`${word}-${index}`}
            text={word}
            x={x}
            y={y}
            opacity={opacity}
            scale={scale}
            accent={index === 1 || index === 4}
          />
        );
      })}

      <div
        style={{
          position: "absolute",
          left: 160,
          right: 160,
          bottom: 175,
          opacity: fadeWindow(frame, [60, 82], [108, 128]),
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
              fontSize: 36,
              lineHeight: 1.45,
              fontWeight: 760,
              color: NAVY,
            }}
          >
            단어는 떠오르지만,
          </div>
          <div
            style={{
              marginTop: 6,
              fontFamily: FONT,
              fontSize: 36,
              lineHeight: 1.45,
              fontWeight: 820,
              color: BLUE_DARK,
            }}
          >
            문장은 아직 만들어지지 않습니다.
          </div>
        </GlassCard>
      </div>
    </AbsoluteFill>
  );
};

const Scene3: React.FC = () => {
  const frame = useCurrentFrame();

  const headingOpacity = fadeWindow(frame, [0, 18], [108, 128]);
  const headingY = fi(frame, [0, 18], [22, 0]);
  const orbOpacity = fadeWindow(frame, [20, 40], [108, 128]);
  const orbFloat = Math.sin(frame * 0.07) * 7;

  const startPositions = [
    [120, 590],
    [280, 710],
    [460, 570],
    [640, 745],
    [805, 600],
    [285, 1030],
    [690, 1010],
  ] as const;

  const targetPositions = [
    [170, 790],
    [285, 790],
    [415, 790],
    [540, 790],
    [650, 790],
    [770, 790],
    [885, 790],
  ] as const;

  const connect = fi(frame, [42, 70], [0, 1]);
  const fail = fi(frame, [72, 98], [0, 1]);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Background />
      <SoftDecor />

      <Heading
        title={CONTENT.scene3.title}
        body={CONTENT.scene3.body}
        style={{
          top: 155,
          opacity: headingOpacity,
          transform: `translateY(${headingY}px)`,
        }}
      />

      <svg
        width={1080}
        height={1920}
        style={{
          position: "absolute",
          inset: 0,
          opacity: fi(frame, [48, 66], [0, 0.75]) * (1 - fail),
        }}
      >
        <path
          d="M190 815 C300 780, 390 800, 470 790 S650 790, 760 790 S860 790, 920 790"
          fill="none"
          stroke={BLUE_LIGHT}
          strokeWidth="4"
          strokeDasharray="12 14"
          strokeLinecap="round"
        />
      </svg>

      {CONTENT.scene3.words.map((word, index) => {
        const opacity = fadeWindow(
          frame,
          [12 + index * 5, 30 + index * 5],
          [108, 128],
        );
        const [startX, startY] = startPositions[index];
        const [targetX, targetY] = targetPositions[index];

        const x =
          startX +
          (targetX - startX) * connect +
          (startX - targetX) * fail * 0.9;
        const y =
          startY +
          (targetY - startY) * connect +
          (startY - targetY) * fail * 0.9;

        return (
          <WordChip
            key={`${word}-${index}`}
            text={word}
            x={x}
            y={y}
            opacity={opacity}
            scale={1 - fail * 0.05}
            accent={index === 1 || index === 4}
          />
        );
      })}

      <div
        style={{
          position: "absolute",
          left: 235,
          bottom: 250,
          opacity: orbOpacity,
          transform: `translateY(${orbFloat}px)`,
        }}
      >
        <GlassOrb size={184} />
      </div>

      <div
        style={{
          position: "absolute",
          left: 405,
          right: 90,
          bottom: 275,
          opacity: fadeWindow(frame, [62, 82], [108, 128]),
        }}
      >
        <GlassCard
          radius={28}
          blur={16}
          bg="rgba(255,255,255,0.84)"
          border="1.5px solid rgba(224,236,255,0.92)"
          style={{
            padding: "28px 36px",
          }}
        >
          <div
            style={{
              fontFamily: FONT,
              fontSize: 42,
              lineHeight: 1.38,
              fontWeight: 850,
              color: NAVY,
              letterSpacing: "-0.025em",
            }}
          >
            입이 멈춥니다.
          </div>
        </GlassCard>
      </div>
    </AbsoluteFill>
  );
};

const Scene4: React.FC = () => {
  const frame = useCurrentFrame();

  const firstOpacity = fadeWindow(frame, [0, 22], [106, 126]);
  const firstScale = fi(frame, [0, 22], [0.96, 1]);

  const secondOpacity = fadeWindow(frame, [30, 52], [106, 126]);
  const secondScale = fi(frame, [30, 52], [0.96, 1]);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Background />
      <SoftDecor />

      <div
        style={{
          position: "absolute",
          left: 95,
          right: 95,
          top: 440,
          textAlign: "center",
          opacity: firstOpacity,
          transform: `scale(${firstScale})`,
          fontFamily: FONT,
        }}
      >
        <div
          style={{
            fontSize: 72,
            lineHeight: 1.2,
            fontWeight: 920,
            color: NAVY,
            letterSpacing: "-0.045em",
          }}
        >
          {CONTENT.scene4.title[0]}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 95,
          right: 95,
          top: 690,
          textAlign: "center",
          opacity: secondOpacity,
          transform: `scale(${secondScale})`,
          fontFamily: FONT,
        }}
      >
        <div
          style={{
            fontSize: 66,
            lineHeight: 1.25,
            fontWeight: 900,
            color: BLUE_DARK,
            letterSpacing: "-0.04em",
          }}
        >
          {CONTENT.scene4.title[1]}
        </div>

        <div style={{ marginTop: 42 }}>
          {CONTENT.scene4.body.map((line, index) => (
            <div
              key={`${line}-${index}`}
              style={{
                fontSize: 31,
                lineHeight: 1.62,
                fontWeight: 520,
                color: GRAY,
              }}
            >
              {line}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Scene5: React.FC = () => {
  const frame = useCurrentFrame();

  const logoOpacity = fadeWindow(frame, [0, 22]);
  const logoScale = fi(frame, [0, 22], [0.96, 1]);
  const sloganOpacity = fadeWindow(frame, [26, 48]);

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
          opacity: logoOpacity,
          transform: `scale(${logoScale})`,
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
          opacity: sloganOpacity,
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

export const Episode1: React.FC = () => (
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

export default Episode1;
