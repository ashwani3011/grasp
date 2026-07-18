import React from "react";
import {
  AbsoluteFill,
  Audio,
  Html5Video,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  CROSSFADE_FRAMES,
  FPS,
  INCLUDE_AUDIO,
  INCLUDE_MUSIC,
  SCENES,
  TOTAL_SECONDS,
  type Scene,
} from "./manifest";

const INK = "#0F172A";
const VIOLET = "#7C3AED";
const VIOLET_LIGHT = "#A78BFA";
const SLATE = "#94A3B8";
const FONT =
  "'Manrope', 'Arial', -apple-system, BlinkMacSystemFont, sans-serif";

/* ---------- scene wrapper: fade + slide entrance ---------- */

const SceneShell: React.FC<{
  durFrames: number;
  slideFrom?: "left" | "right";
  children: React.ReactNode;
}> = ({ durFrames, slideFrom = "right", children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Entrance-only fade: the incoming scene fades in OVER the still-opaque
  // outgoing scene (later sequences stack on top). Fading both at once causes
  // a visible dip-to-dark "flicker" at every transition.
  const opacity = interpolate(frame, [0, CROSSFADE_FRAMES], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const slide = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: 24,
  });
  const x = (1 - slide) * (slideFrom === "right" ? 60 : -60);
  return (
    <AbsoluteFill style={{ opacity, backgroundColor: INK }}>
      <AbsoluteFill style={{ transform: `translateX(${x}px)` }}>
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- caption pill (bottom-left) ---------- */

const CaptionPill: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({
    frame: frame - 10,
    fps,
    config: { damping: 14 },
    durationInFrames: 26,
  });
  const exit = interpolate(frame, [5 * fps, 6 * fps], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        bottom: 48,
        opacity: Math.min(1, pop) * exit,
        transform: `translateY(${(1 - pop) * 22}px) scale(${0.96 + pop * 0.04})`,
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        borderRadius: 999,
        padding: "16px 30px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        boxShadow: "0 12px 40px rgba(15,23,42,0.35)",
      }}
    >
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: 99,
          backgroundColor: VIOLET_LIGHT,
        }}
      />
      <span
        style={{
          fontFamily: FONT,
          fontSize: 30,
          fontWeight: 700,
          color: "white",
        }}
      >
        {text}
      </span>
    </div>
  );
};

/* ---------- chapter chip (top-right) ---------- */

const ChapterChip: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({
    frame: frame - 4,
    fps,
    config: { damping: 16 },
    durationInFrames: 24,
  });
  return (
    <div
      style={{
        position: "absolute",
        right: 60,
        top: 44,
        opacity: Math.min(1, pop),
        transform: `translateY(${(1 - pop) * -16}px)`,
        backgroundColor: "rgba(124, 58, 237, 0.92)",
        borderRadius: 999,
        padding: "10px 22px",
      }}
    >
      <span
        style={{
          fontFamily: FONT,
          fontSize: 22,
          fontWeight: 800,
          color: "white",
          letterSpacing: 1.5,
        }}
      >
        {text}
      </span>
    </div>
  );
};

/* ---------- staggered key-point callouts (right side) ---------- */

const PointStack: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!scene.points?.length) return null;
  return (
    <div
      style={{
        position: "absolute",
        right: 60,
        top: 130,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        alignItems: "flex-end",
      }}
    >
      {scene.points.map((point, i) => {
        const local = frame - point.at * fps;
        const pop = spring({
          frame: local,
          fps,
          config: { damping: 13 },
          durationInFrames: 26,
        });
        if (local < 0 || local > 6.2 * fps) return null;
        const exit = interpolate(local, [5.2 * fps, 6.2 * fps], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div
            key={i}
            style={{
              opacity: Math.min(1, pop) * exit,
              transform: `translateX(${(1 - pop) * 46}px)`,
              backgroundColor: "rgba(255,255,255,0.96)",
              border: "1px solid #E2E8F0",
              borderRadius: 16,
              padding: "13px 22px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              boxShadow: "0 10px 30px rgba(15,23,42,0.16)",
              maxWidth: 620,
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 99,
                backgroundColor: VIOLET,
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: FONT,
                fontSize: 16,
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              ✓
            </div>
            <span
              style={{
                fontFamily: FONT,
                fontSize: 25,
                fontWeight: 700,
                lineHeight: 1.2,
                color: INK,
              }}
            >
              {point.text}
            </span>
          </div>
        );
      })}
    </div>
  );
};

/* ---------- scene 1: wall of text -> title ---------- */

const WALL = Array.from(
  { length: 60 },
  (_, i) =>
    [
      "The event loop is a runtime construct that coordinates the execution of the call stack,",
      "the task queue, and the microtask queue. When the stack unwinds, pending jobs are drained",
      "according to the specification ordering. Note that setTimeout(fn, 0) does not execute",
      "immediately; the callback is enqueued as a macrotask after the minimum clamped delay.",
      "Promise reactions, by contrast, are scheduled as microtasks, which drain completely",
      "before the next task is selected. Rendering may be interleaved between tasks. However,",
    ][i % 6],
);

const HookScene: React.FC<{ durFrames: number }> = ({ durFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scroll = interpolate(frame, [0, durFrames], [0, -1500]);
  const wallFade = interpolate(frame, [4.6 * FPS, 5.6 * FPS], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titlePop = spring({
    frame: frame - Math.round(5.2 * FPS),
    fps,
    config: { damping: 13 },
    durationInFrames: 34,
  });
  const tagPop = spring({
    frame: frame - Math.round(5.9 * FPS),
    fps,
    config: { damping: 14 },
    durationInFrames: 30,
  });
  const glow = interpolate(frame, [5.2 * FPS, 8 * FPS], [0, 0.55], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ backgroundColor: "#F8FAFC" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "0 240px",
          transform: `translateY(${scroll}px)`,
          opacity: wallFade * 0.85,
        }}
      >
        {WALL.map((line, i) => (
          <p
            key={i}
            style={{
              fontFamily: "Georgia, serif",
              fontSize: 30,
              lineHeight: 1.75,
              color: "#334155",
              margin: "0 0 14px",
            }}
          >
            {line}
          </p>
        ))}
      </div>
      <AbsoluteFill
        style={{
          backgroundColor: INK,
          opacity: interpolate(frame, [5.2 * FPS, 6 * FPS], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 900,
            height: 900,
            borderRadius: 9999,
            background: `radial-gradient(circle, rgba(124,58,237,${glow}) 0%, rgba(124,58,237,0) 65%)`,
          }}
        />
        <div style={{ textAlign: "center", position: "relative" }}>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 116,
              fontWeight: 800,
              color: "white",
              letterSpacing: -3,
              transform: `scale(${0.9 + titlePop * 0.1})`,
              opacity: Math.min(1, titlePop),
            }}
          >
            Grasp
          </div>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 44,
              fontWeight: 800,
              marginTop: 18,
              opacity: Math.min(1, tagPop),
              transform: `translateY(${(1 - tagPop) * 18}px)`,
            }}
          >
            <span style={{ color: "white" }}>Don’t just read it. </span>
            <span style={{ color: VIOLET_LIGHT }}>
              Move it. Change it. Grasp it.
            </span>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- clip scene ---------- */

const ClipScene: React.FC<{ scene: Scene; durFrames: number }> = ({
  scene,
  durFrames,
}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, durFrames], [1.0, 1.035]);
  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        <Html5Video
          src={staticFile(`assets/${scene.clip}`)}
          startFrom={Math.round((scene.clipFrom ?? 0) * FPS)}
          playbackRate={scene.playbackRate ?? 1}
          muted
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>
      {scene.chapter ? <ChapterChip text={scene.chapter} /> : null}
      <PointStack scene={scene} />
      {scene.caption ? <CaptionPill text={scene.caption} /> : null}
    </AbsoluteFill>
  );
};

/* ---------- scene 7: clip + end card ---------- */

const EndBadge: React.FC<{ text: string; delayFrames: number }> = ({
  text,
  delayFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({
    frame: frame - delayFrames,
    fps,
    config: { damping: 13 },
    durationInFrames: 24,
  });
  return (
    <div
      style={{
        opacity: Math.min(1, pop),
        transform: `translateY(${(1 - pop) * 14}px)`,
        border: "1px solid rgba(148,163,184,0.4)",
        borderRadius: 999,
        padding: "10px 24px",
        fontFamily: FONT,
        fontSize: 22,
        fontWeight: 700,
        color: SLATE,
      }}
    >
      {text}
    </div>
  );
};

const CloseScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cardIn = interpolate(frame, [2.6 * FPS, 3.5 * FPS], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cardStart = Math.round(3 * FPS);
  const titlePop = spring({
    frame: frame - cardStart,
    fps,
    config: { damping: 13 },
    durationInFrames: 30,
  });
  const urlPop = spring({
    frame: frame - cardStart - 14,
    fps,
    config: { damping: 11 },
    durationInFrames: 28,
  });
  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      <Html5Video
        src={staticFile(`assets/${scene.clip}`)}
        startFrom={Math.round((scene.clipFrom ?? 0) * FPS)}
        playbackRate={scene.playbackRate ?? 1}
        muted
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      <AbsoluteFill
        style={{
          backgroundColor: INK,
          opacity: cardIn,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 100,
              fontWeight: 800,
              color: "white",
              letterSpacing: -2,
              transform: `scale(${0.92 + titlePop * 0.08})`,
              opacity: Math.min(1, titlePop),
            }}
          >
            Grasp
          </div>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 38,
              fontWeight: 800,
              color: VIOLET_LIGHT,
              marginTop: 10,
              opacity: Math.min(1, titlePop),
            }}
          >
            Don’t just read it. Move it. Change it. Grasp it.
          </div>
          <div
            style={{
              display: "inline-block",
              marginTop: 42,
              backgroundColor: VIOLET,
              color: "white",
              fontFamily: FONT,
              fontSize: 32,
              fontWeight: 700,
              borderRadius: 999,
              padding: "18px 44px",
              transform: `scale(${0.9 + Math.min(1, urlPop) * 0.1})`,
              opacity: Math.min(1, urlPop),
              boxShadow: "0 18px 60px rgba(124,58,237,0.45)",
            }}
          >
            grasp-flame.vercel.app
          </div>
          <div
            style={{
              display: "flex",
              gap: 16,
              justifyContent: "center",
              marginTop: 36,
            }}
          >
            <EndBadge text="No account" delayFrames={cardStart + 26} />
            <EndBadge text="No database" delayFrames={cardStart + 34} />
            <EndBadge text="Shareable offline" delayFrames={cardStart + 42} />
            <EndBadge
              text="Built with OpenAI Codex"
              delayFrames={cardStart + 50}
            />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- global progress bar ---------- */

const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const width = interpolate(frame, [0, TOTAL_SECONDS * FPS], [0, 100]);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        bottom: 0,
        height: 6,
        width: `${width}%`,
        backgroundColor: VIOLET,
        opacity: 0.85,
      }}
    />
  );
};

/* ---------- root composition ---------- */

export const GraspDemo: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      {SCENES.map((scene) => {
        const from =
          Math.round(scene.start * fps) - (scene.n > 1 ? CROSSFADE_FRAMES : 0);
        const durFrames =
          Math.round(scene.dur * fps) + (scene.n > 1 ? CROSSFADE_FRAMES : 0);
        return (
          <Sequence
            key={scene.n}
            from={from}
            durationInFrames={durFrames}
            style={{
              translate: "15.5px 0px",
            }}
          >
            <SceneShell
              durFrames={durFrames}
              slideFrom={scene.n % 2 === 0 ? "right" : "left"}
            >
              {scene.kind === "hook" ? (
                <HookScene durFrames={durFrames} />
              ) : scene.kind === "close" ? (
                <CloseScene scene={scene} />
              ) : (
                <ClipScene scene={scene} durFrames={durFrames} />
              )}
            </SceneShell>
            {INCLUDE_AUDIO ? (
              <Audio src={staticFile(`assets/vo-${scene.n}.mp3`)} />
            ) : null}
          </Sequence>
        );
      })}
      {INCLUDE_MUSIC ? (
        <Audio src={staticFile("assets/music.mp3")} volume={0.07} loop />
      ) : null}
      <ProgressBar />
    </AbsoluteFill>
  );
};
