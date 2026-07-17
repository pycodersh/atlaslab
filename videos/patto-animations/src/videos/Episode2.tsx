import React from "react";
import {AbsoluteFill, Sequence, interpolate, useCurrentFrame, Easing} from "remotion";
import {GlassCard} from "../components/GlassCard";
import {Logo} from "../components/Logo";
import {Background} from "../components/Background";
import {t, ta} from "../locales";
import {FONT} from "../constants";

const BLUE = "#3A7BFF";
const BLUE_DARK = "#1A73E8";
const BLUE_LIGHT = "#7DB8FF";
const ICE = "#EDF4FF";
const NAVY = "#0A1628";
const GRAY = "#7F8CA3";

const clamp = {extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const};
const fi = (f:number, input:[number,number], output:[number,number]) =>
  interpolate(f, input, output, {...clamp, easing:Easing.out(Easing.cubic)});

const fade = (f:number, start=0, end=18, outStart?:number, outEnd?:number) => {
  const fadeIn = fi(f,[start,end],[0,1]);
  return outStart === undefined || outEnd === undefined
    ? fadeIn
    : fadeIn * fi(f,[outStart,outEnd],[1,0]);
};

const Orb: React.FC<{size?:number; style?:React.CSSProperties}> = ({size=168, style}) => (
  <div style={{position:"relative",width:size,height:size,...style}}>
    <div style={{
      position:"absolute",
      left:size*.13,
      right:size*.13,
      bottom:-size*.08,
      height:size*.17,
      borderRadius:"50%",
      background:"rgba(46,91,184,.16)",
      filter:`blur(${size*.085}px)`,
      transform:"scaleX(1.18)",
    }}/>
    <div style={{
      position:"absolute",
      inset:0,
      borderRadius:"50%",
      overflow:"hidden",
      background:"radial-gradient(circle at 31% 25%,#FFFFFF 0%,#E9F4FF 16%,#C7DFFF 39%,#96BFFF 64%,#6E9CF2 82%,#4A72D8 100%)",
      border:"1.5px solid rgba(255,255,255,.92)",
      boxShadow:"inset -16px -20px 34px rgba(48,92,185,.18),inset 15px 14px 28px rgba(255,255,255,.62),0 24px 48px rgba(58,123,255,.18),0 0 38px rgba(125,184,255,.20)",
    }}>
      <div style={{
        position:"absolute",
        left:size*.16,
        top:size*.10,
        width:size*.44,
        height:size*.23,
        borderRadius:"50%",
        background:"radial-gradient(ellipse,rgba(255,255,255,.95) 0%,rgba(255,255,255,.48) 46%,rgba(255,255,255,0) 75%)",
        transform:"rotate(-24deg)",
      }}/>
      <div style={{
        position:"absolute",
        right:size*.045,
        top:size*.18,
        width:size*.12,
        height:size*.58,
        borderRadius:"50%",
        background:"linear-gradient(180deg,rgba(255,255,255,.62),rgba(255,255,255,.08))",
        filter:`blur(${size*.012}px)`,
      }}/>
      <div style={{
        position:"absolute",
        left:size*.08,
        right:size*.08,
        bottom:size*.025,
        height:size*.17,
        borderRadius:"50%",
        background:"radial-gradient(ellipse,rgba(47,98,221,.28),rgba(47,98,221,0) 72%)",
      }}/>
      {[.35,.58].map((left,i)=><div key={i} style={{
        position:"absolute",
        left:size*left,
        top:size*.38,
        width:size*.092,
        height:size*.125,
        borderRadius:99,
        background:"radial-gradient(circle at 32% 25%,#354D77 0%,#0A1628 56%,#020711 100%)",
        boxShadow:"inset 1px 1px 2px rgba(255,255,255,.35)",
      }}/>)}
    </div>
  </div>
);

const Glow: React.FC = () => (
  <>
    <div style={{position:"absolute",width:560,height:560,borderRadius:"50%",right:-170,top:160,
      background:"radial-gradient(circle,rgba(125,184,255,.18),rgba(125,184,255,0) 70%)"}}/>
    <div style={{position:"absolute",width:700,height:700,borderRadius:"50%",left:-300,bottom:0,
      background:"radial-gradient(circle,rgba(156,182,255,.14),rgba(156,182,255,0) 72%)"}}/>
  </>
);

const Heading: React.FC<{title:string[]; body?:string[]; opacity:number; y?:number; center?:boolean}> =
({title, body=[], opacity, y=0, center=false}) => (
  <div style={{
    position:"absolute",left:78,right:78,top:145,opacity,transform:`translateY(${y}px)`,
    textAlign:center?"center":"left",fontFamily:FONT
  }}>
    {title.map((line,i)=><div key={i} style={{
      fontSize:i===0?68:58,lineHeight:1.12,fontWeight:i===0?900:760,
      letterSpacing:"-.035em",color:i===0?NAVY:BLUE_DARK
    }}>{line}</div>)}
    {body.length>0 && <div style={{marginTop:26}}>
      {body.map((line,i)=><div key={i} style={{
        fontSize:29,lineHeight:1.58,fontWeight:500,color:GRAY
      }}>{line}</div>)}
    </div>}
  </div>
);

const Chip: React.FC<{text:string;x:number;y:number;opacity:number;scale?:number;rotate?:number;accent?:boolean}> =
({text,x,y,opacity,scale=1,rotate=0,accent=false}) => (
  <div style={{
    position:"absolute",left:x,top:y,opacity,transform:`scale(${scale}) rotate(${rotate}deg)`,
    fontFamily:FONT,fontSize:34,fontWeight:720,color:accent?BLUE_DARK:NAVY,
    padding:"13px 26px",borderRadius:999,whiteSpace:"nowrap",
    background:accent?"rgba(237,244,255,.96)":"rgba(255,255,255,.9)",
    border:accent?"1.5px solid rgba(58,123,255,.28)":"1.5px solid rgba(255,255,255,.82)",
    boxShadow:"0 10px 30px rgba(24,45,78,.07)"
  }}>{text}</div>
);

const Scene1:React.FC = () => {
  const f=useCurrentFrame();
  const words=ta("ep2.scene1.words");
  const pos=[[120,520,-6],[705,425,4],[520,700,-3],[790,840,5],[190,960,4],[630,1120,-4]] as const;
  const orbFloat=Math.sin(f*.07)*7;
  return <AbsoluteFill style={{overflow:"hidden"}}><Background/><Glow/>
    <Heading title={ta("ep2.scene1.subtitle")} body={ta("ep2.scene1.body")}
      opacity={fade(f,0,18,108,128)} y={fi(f,[0,18],[24,0])}/>
    {words.slice(0,6).map((word,i)=>{
      const [x,y,r]=pos[i];
      return <Chip key={i} text={word} x={x} y={y} rotate={r}
        opacity={fade(f,12+i*5,30+i*5,102,124)}
        scale={fi(f,[12+i*5,30+i*5],[.78,1])}
        accent={i===0||i===3}/>;
    })}
    <div style={{position:"absolute",right:220,bottom:330,opacity:fade(f,24,44,108,128),
      transform:`translateY(${orbFloat}px)`}}><Orb size={188}/></div>
    <div style={{position:"absolute",left:78,right:78,bottom:235,textAlign:"center",
      fontFamily:FONT,fontSize:45,lineHeight:1.3,fontWeight:820,color:NAVY,
      opacity:fade(f,48,68,108,128)}}>{t("ep2.scene1.headline")}</div>
  </AbsoluteFill>;
};

const Scene2:React.FC = () => {
  const f=useCurrentFrame();
  const leftWords=ta("ep2.scene2.leftWords");
  const start=[[115,760],[290,700],[465,790],[660,710],[775,830]] as const;
  const merge=fi(f,[38,66],[0,1]);
  const sentence=t("ep2.scene2.rightSentence");
  const [before,after=""]=sentence.split("about to");
  return <AbsoluteFill style={{overflow:"hidden"}}><Background/><Glow/>
    <Heading title={ta("ep2.scene2.subtitle")} body={ta("ep2.scene2.body")}
      opacity={fade(f,0,18,108,128)} y={fi(f,[0,18],[20,0])}/>
    {leftWords.map((word,i)=>{
      const [sx,sy]=start[i]??[160+i*160,780];
      const tx=260+i*125, ty=1030;
      return <Chip key={i} text={word}
        x={sx+(tx-sx)*merge} y={sy+(ty-sy)*merge}
        opacity={fade(f,18,34,102,120)*(1-merge*.82)}
        scale={1-merge*.08} accent={i===0||i===2}/>;
    })}
    <div style={{position:"absolute",left:135,right:135,top:845,
      opacity:fade(f,62,82,108,128),transform:`scale(${fi(f,[62,82],[.94,1])})`}}>
      <GlassCard blur={18} radius={34} border="2px solid rgba(125,184,255,.64)"
        bg="rgba(255,255,255,.86)" style={{padding:"56px 64px",
          boxShadow:"0 22px 54px rgba(58,123,255,.16),0 4px 14px rgba(10,22,40,.05)"}}>
        <div style={{fontFamily:FONT,fontSize:30,fontWeight:760,color:BLUE_DARK,marginBottom:18}}>
          {t("ep2.scene2.rightLabel")}
        </div>
        <div style={{fontFamily:FONT,fontSize:64,lineHeight:1.3,fontWeight:860,color:NAVY,
          letterSpacing:"-.035em"}}>
          {before}<span style={{color:BLUE,fontStyle:"italic"}}>about to</span>{after}
        </div>
        <div style={{marginTop:20,fontFamily:FONT,fontSize:28,lineHeight:1.5,fontWeight:500,color:GRAY}}>
          {t("ep2.scene2.rightNote")}
        </div>
      </GlassCard>
    </div>
  </AbsoluteFill>;
};

const Scene3:React.FC = () => {
  const f=useCurrentFrame();
  const example=t("ep2.scene3.example");
  const [before,after=""]=example.split("about to");
  return <AbsoluteFill style={{overflow:"hidden"}}><Background/><Glow/>
    <Heading title={ta("ep2.scene3.subtitle")} body={ta("ep2.scene3.body")}
      opacity={fade(f,0,18,108,128)}/>
    <div style={{position:"absolute",left:115,right:115,top:575,
      opacity:fade(f,18,40,108,128),
      transform:`translateY(${fi(f,[18,40],[28,0])}px) scale(${fi(f,[18,40],[.95,1])})`}}>
      <GlassCard blur={18} radius={36} border="2px solid rgba(125,184,255,.58)"
        bg="rgba(255,255,255,.86)" style={{padding:"62px 66px",
          boxShadow:"0 24px 60px rgba(58,123,255,.15),0 5px 16px rgba(10,22,40,.05)"}}>
        <div style={{display:"inline-flex",padding:"10px 24px",borderRadius:999,
          background:"rgba(58,123,255,.10)",color:BLUE_DARK,fontFamily:FONT,
          fontSize:24,fontWeight:760,marginBottom:24}}>
          {t("ep2.scene3.patternLabel")}
        </div>
        <div style={{fontFamily:FONT,fontSize:82,lineHeight:1.05,fontWeight:920,
          color:BLUE,letterSpacing:"-.045em"}}>{t("ep2.scene3.pattern")}</div>
        <div style={{fontFamily:FONT,fontSize:31,fontWeight:520,color:GRAY,marginTop:18,
          paddingBottom:26,borderBottom:"1px solid rgba(58,123,255,.13)",
          opacity:fade(f,42,62,108,128)}}>{t("ep2.scene3.patternMeaning")}</div>
        <div style={{marginTop:28,opacity:fade(f,42,62,108,128)}}>
          <div style={{fontFamily:FONT,fontSize:23,fontWeight:760,color:BLUE_DARK,marginBottom:12}}>
            {t("ep2.scene3.exampleLabel")}
          </div>
          <div style={{fontFamily:FONT,fontSize:48,lineHeight:1.42,fontWeight:760,color:NAVY}}>
            {before}<span style={{color:BLUE}}>about to</span>{after}
          </div>
        </div>
      </GlassCard>
    </div>
    <div style={{position:"absolute",left:220,bottom:230,opacity:fade(f,56,74,108,128),
      transform:`translateY(${Math.sin(f*.07)*8}px)`}}><Orb size={176}/></div>
  </AbsoluteFill>;
};

const Scene4:React.FC = () => {
  const f=useCurrentFrame();
  const sentences=ta("ep2.scene4.sentences");
  const labels=ta("ep2.scene4.situationLabels");
  return <AbsoluteFill style={{overflow:"hidden"}}><Background/><Glow/>
    <Heading title={ta("ep2.scene4.subtitle")} body={ta("ep2.scene4.body")}
      opacity={fade(f,0,18,108,128)}/>
    <div style={{position:"absolute",left:92,right:92,top:530,display:"flex",
      flexDirection:"column",gap:30}}>
      {sentences.map((sentence,i)=>{
        const [before,after=""]=sentence.split("about to");
        return <div key={i} style={{
          opacity:fade(f,16+i*22,34+i*22,104,126),
          transform:`translateY(${fi(f,[16+i*22,34+i*22],[28,0])}px)`}}>
          <GlassCard blur={16} radius={28} bg="rgba(255,255,255,.84)"
            border="1.5px solid rgba(224,236,255,.92)"
            style={{padding:"28px 34px",boxShadow:"0 16px 42px rgba(58,123,255,.10)"}}>
            <div style={{display:"inline-flex",padding:"8px 18px",borderRadius:999,
              background:"rgba(58,123,255,.09)",color:BLUE_DARK,fontFamily:FONT,
              fontSize:22,fontWeight:760,marginBottom:12}}>{labels[i]}</div>
            <div style={{fontFamily:FONT,fontSize:40,lineHeight:1.45,fontWeight:680,color:NAVY}}>
              {before}<span style={{color:BLUE,fontWeight:860,fontStyle:"italic"}}>about to</span>{after}
            </div>
          </GlassCard>
        </div>;
      })}
    </div>
  </AbsoluteFill>;
};

const Scene5:React.FC = () => {
  const f=useCurrentFrame();
  return <AbsoluteFill style={{overflow:"hidden"}}><Background/><Glow/>
    <div style={{
      position:"absolute",
      left:80,
      right:80,
      top:500,
      textAlign:"center",
      opacity:fade(f,0,22),
      transform:`scale(${fi(f,[0,22],[.96,1])})`
    }}>
      <Logo size={132}/>
    </div>
    <div style={{
      position:"absolute",
      left:80,
      right:80,
      top:820,
      textAlign:"center",
      opacity:fade(f,26,46),
      fontFamily:FONT
    }}>
      <div style={{
        fontSize:52,
        lineHeight:1.3,
        fontWeight:850,
        color:NAVY
      }}>Repeat patterns,</div>
      <div style={{
        marginTop:6,
        fontSize:42,
        lineHeight:1.45,
        fontWeight:620,
        color:BLUE_DARK
      }}>build fluency.</div>
    </div>
  </AbsoluteFill>;
};

export const Episode2:React.FC = () => (
  <AbsoluteFill>
    <Sequence from={0} durationInFrames={135}><Scene1/></Sequence>
    <Sequence from={135} durationInFrames={135}><Scene2/></Sequence>
    <Sequence from={270} durationInFrames={135}><Scene3/></Sequence>
    <Sequence from={405} durationInFrames={135}><Scene4/></Sequence>
    <Sequence from={540} durationInFrames={120}><Scene5/></Sequence>
  </AbsoluteFill>
);

export default Episode2;
