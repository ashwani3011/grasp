export const FPS = 30;

/**
 * One entry per scene. `start`/`dur` in seconds.
 * `clip` files live in demo-video/public/assets/.
 * `clipFrom` trims the source clip (seconds into the recording).
 * `points` are staggered callouts; `at` is seconds after the scene starts.
 * Every scene's voiceover is public/assets/vo-<n>.mp3.
 */
export type ScenePoint = { at: number; text: string };

export type Scene = {
  n: number;
  start: number;
  dur: number;
  clip?: string;
  clipFrom?: number;
  playbackRate?: number;
  caption?: string;
  chapter?: string;
  points?: ScenePoint[];
  kind: "hook" | "clip" | "close";
};

const sceneInputs: Array<Omit<Scene, "start">> = [
  { n: 1, dur: 10, kind: "hook" },
  {
    n: 2,
    dur: 34,
    kind: "clip",
    clip: "clip-generate.mov",
    clipFrom: 2,
    playbackRate: 1.43,
    chapter: "01 · Generate",
    caption: "One prompt → an explainer you can manipulate",
    points: [
      { at: 6, text: "Strict JSON — never generated UI code" },
      { at: 13, text: "Zod validates every relationship" },
      { at: 22, text: "Stable IDs make state move" },
    ],
  },
  {
    n: 3,
    dur: 20,
    kind: "clip",
    clip: "clip-playground.mov",
    playbackRate: 0.96,
    chapter: "02 · Feel the trade-off",
    caption: "Change the input. See the trade-off.",
    points: [
      { at: 6, text: "A full scan grows with the table" },
      { at: 12, text: "A B-tree lookup grows slowly" },
    ],
  },
  {
    n: 4,
    dur: 23,
    kind: "clip",
    clip: "clip-code-paste.mov",
    clipFrom: 5,
    playbackRate: 1.15,
    chapter: "03 · Paste real code",
    caption: "Your code. A concrete explanation.",
    points: [
      { at: 7, text: "Paste code or an error" },
      { at: 16, text: "Predict first. Then reveal." },
    ],
  },
  {
    n: 5,
    dur: 24,
    kind: "clip",
    clip: "clip-ask-interview.mov",
    clipFrom: 1,
    playbackRate: 1.39,
    chapter: "04 · Ask & get tested",
    caption: "Ask in context. Practice under pressure.",
    points: [
      { at: 5, text: "Answers stay grounded in this explainer" },
      { at: 13, text: "Three questions, easy to hard" },
      { at: 19, text: "Answer in your own words" },
    ],
  },
  {
    n: 6,
    dur: 24,
    kind: "clip",
    clip: "clip-trace-share.mov",
    playbackRate: 1.08,
    chapter: "05 · Under the hood",
    caption: "Inspectable pipeline. Shareable result.",
    points: [
      { at: 6, text: "Strict JSON → Zod → hardened primitives" },
      { at: 12, text: "One repair. Safety still fails hard." },
      { at: 18, text: "The shared URL renders without the API" },
    ],
  },
  {
    n: 7,
    dur: 11,
    kind: "close",
    clip: "clip-trace-share.mov",
    clipFrom: 24,
  },
];

export const SCENES: Scene[] = sceneInputs.map((scene, index) => ({
  ...scene,
  start: sceneInputs
    .slice(0, index)
    .reduce((total, previous) => total + previous.dur, 0),
}));

export const TOTAL_SECONDS = sceneInputs.reduce(
  (total, scene) => total + scene.dur,
  0,
); // 2:26
export const CROSSFADE_FRAMES = 12;

/** Flip to true once vo-1.mp3 … vo-7.mp3 exist in public/assets/. */
export const INCLUDE_AUDIO = false;

/** Flip to true once music.mp3 exists in public/assets/ (soft, no vocals). */
export const INCLUDE_MUSIC = false;
