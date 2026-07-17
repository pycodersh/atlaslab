import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Background } from "../components/Background";
import { Logo } from "../components/Logo";
import { GlassCard } from "../components/GlassCard";
import { FONT } from "../constants";

const Scene1 = () => (
  <AbsoluteFill>
    <Background />
    <div style={{position:"absolute",top:180,left:80,right:80,textAlign:"center",
      fontFamily:FONT,fontSize:64,fontWeight:900}}>
      Patterns become habits.
    </div>
  </AbsoluteFill>
);

const Scene2 = () => (
  <AbsoluteFill>
    <Background />
    <GlassCard style={{position:"absolute",left:90,right:90,top:480,padding:48}}>
      <div style={{fontFamily:FONT,fontSize:54,fontWeight:800,textAlign:"center"}}>
        Listen → Speak → Remember
      </div>
    </GlassCard>
  </AbsoluteFill>
);

const Scene3 = () => (
  <AbsoluteFill>
    <Background />
    <div style={{position:"absolute",left:90,right:90,top:420,fontFamily:FONT,
    fontSize:56,fontWeight:800,textAlign:"center"}}>
      Repeat every day.
    </div>
  </AbsoluteFill>
);

const Scene4 = () => (
  <AbsoluteFill>
    <Background />
    <div style={{position:"absolute",left:90,right:90,top:420,fontFamily:FONT,
    fontSize:56,fontWeight:800,textAlign:"center"}}>
      Speak with confidence.
    </div>
  </AbsoluteFill>
);

const Scene5 = () => (
  <AbsoluteFill>
    <Background />
    <div style={{position:"absolute",left:0,right:0,top:460,textAlign:"center"}}>
      <Logo size={150}/>
    </div>
    <div style={{position:"absolute",left:80,right:80,top:820,textAlign:"center",
      fontFamily:FONT}}>
      <div style={{fontSize:54,fontWeight:900}}>Repeat patterns,</div>
      <div style={{fontSize:44,fontWeight:700}}>build fluency.</div>
    </div>
  </AbsoluteFill>
);

export const Episode5 = () => (
  <AbsoluteFill>
    <Sequence from={0} durationInFrames={135}><Scene1/></Sequence>
    <Sequence from={135} durationInFrames={135}><Scene2/></Sequence>
    <Sequence from={270} durationInFrames={135}><Scene3/></Sequence>
    <Sequence from={405} durationInFrames={135}><Scene4/></Sequence>
    <Sequence from={540} durationInFrames={120}><Scene5/></Sequence>
  </AbsoluteFill>
);

export default Episode5;
