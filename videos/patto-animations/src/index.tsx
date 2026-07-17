import { registerRoot, Composition } from "remotion";
import React from "react";
import { Episode1 } from "./videos/Episode1";
import { Episode2 } from "./videos/Episode2";
import { Episode3 } from "./videos/Episode3";
import { Episode4 } from "./videos/Episode4";
import { Episode5 } from "./videos/Episode5";

const Root: React.FC = () => (
  <>
    <Composition
      id="episode1-full"
      component={Episode1}
      durationInFrames={660}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="episode2-full"
      component={Episode2}
      durationInFrames={660}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="episode3-full"
      component={Episode3}
      durationInFrames={660}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="episode4-full"
      component={Episode4}
      durationInFrames={660}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="episode5-full"
      component={Episode5}
      durationInFrames={660}
      fps={30}
      width={1080}
      height={1920}
    />
  </>
);

registerRoot(Root);
