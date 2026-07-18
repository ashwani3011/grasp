import React from "react";
import { Composition } from "remotion";
import { GraspDemo } from "./GraspDemo";
import { FPS, TOTAL_SECONDS } from "./manifest";

export const Root: React.FC = () => (
  <Composition
    id="GraspDemo"
    component={GraspDemo}
    durationInFrames={TOTAL_SECONDS * FPS}
    fps={FPS}
    width={1920}
    height={1080}
  />
);
