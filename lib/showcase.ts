import { explainerSpecSchema, type ExplainerSpec, type PlaygroundSpec, type StepperSpec } from "@/lib/schema";

const eventLoop: StepperSpec = {
  version: 1, archetype: "stepper", title: "The JavaScript event loop", concept: "JavaScript event loop", level: "student",
  summary: "Watch work move between the call stack, browser APIs, and the task queues as the runtime decides what executes next.",
  whyThisArchetype: "Order and movement are the idea, so a step-by-step timeline makes the scheduling rules visible.",
  keyTakeaway: "After synchronous code finishes, microtasks drain completely before the next task is taken.",
  columns: [
    { id: "stack", title: "Call stack", hint: "Runs now" },
    { id: "web", title: "Web APIs", hint: "Waiting outside JS" },
    { id: "micro", title: "Microtasks", hint: "Promises" },
    { id: "tasks", title: "Task queue", hint: "Timers & events" },
  ],
  chips: [
    { id: "script", label: "main()", detail: "The top-level script", tone: "violet" },
    { id: "timer", label: "setTimeout callback", detail: "A timer schedules a future task", tone: "amber" },
    { id: "promise", label: "Promise.then", detail: "A resolved promise schedules a microtask", tone: "cyan" },
    { id: "log-a", label: "console.log('A')", tone: "slate" },
    { id: "log-d", label: "console.log('D')", tone: "rose" },
  ],
  steps: [
    { id: "sync", title: "Run the script", description: "The script enters the call stack. It registers a timer, resolves a promise, and keeps executing synchronously.", columns: [
      { columnId: "stack", chipIds: ["script", "log-a", "log-d"] }, { columnId: "web", chipIds: ["timer"] }, { columnId: "micro", chipIds: ["promise"] }, { columnId: "tasks", chipIds: [] },
    ], callout: "Synchronous work always wins first." },
    { id: "queued", title: "Callbacks become ready", description: "The timer finishes waiting and its callback joins the task queue. The promise reaction is already in the microtask queue.", columns: [
      { columnId: "stack", chipIds: ["script", "log-d"] }, { columnId: "web", chipIds: [] }, { columnId: "micro", chipIds: ["promise"] }, { columnId: "tasks", chipIds: ["timer"] },
    ] },
    { id: "microtasks", title: "Drain microtasks", description: "Once the stack is empty, the event loop drains every microtask before selecting another task.", columns: [
      { columnId: "stack", chipIds: ["promise"] }, { columnId: "web", chipIds: [] }, { columnId: "micro", chipIds: [] }, { columnId: "tasks", chipIds: ["timer"] },
    ], callout: "Promise.then runs before setTimeout(..., 0)." },
    { id: "timer-runs", title: "Take the next task", description: "Only after the microtask queue is empty can the timer callback move to the stack and run.", columns: [
      { columnId: "stack", chipIds: ["timer"] }, { columnId: "web", chipIds: [] }, { columnId: "micro", chipIds: [] }, { columnId: "tasks", chipIds: [] },
    ] },
  ],
};

function makeStepper(input: { title: string; concept: string; summary: string; takeaway: string; columns: [string, string, string]; chips: [string, string, string]; steps: [string, string, string][] }): StepperSpec {
  const columnIds = ["left", "middle", "right"] as const;
  return {
    version: 1, archetype: "stepper", title: input.title, concept: input.concept, level: "student", summary: input.summary,
    whyThisArchetype: "The concept changes state in a fixed order, so following the same objects across stages reveals the mechanism.", keyTakeaway: input.takeaway,
    columns: input.columns.map((title, index) => ({ id: columnIds[index], title })),
    chips: input.chips.map((label, index) => ({ id: `item-${index + 1}`, label, tone: (["violet", "cyan", "amber"] as const)[index] })),
    steps: input.steps.map(([title, description, positions], index) => ({
      id: `step-${index + 1}`, title, description,
      columns: columnIds.map((columnId, columnIndex) => ({ columnId, chipIds: positions.split("").map(Number).map((position, chipIndex) => position === columnIndex ? `item-${chipIndex + 1}` : "").filter(Boolean) })),
    })),
  };
}

const closures = makeStepper({
  title: "Closures keep scope alive", concept: "JavaScript closures", summary: "Follow a function and its captured variable after the outer call has returned.",
  takeaway: "A closure retains access to the lexical environment where it was created, not a frozen copy of each value.",
  columns: ["Outer call", "Lexical environment", "Returned function"], chips: ["count = 0", "increment()", "count = 1"],
  steps: [["Create the scope", "Calling makeCounter creates a new lexical environment and initializes count.", "010"], ["Create the inner function", "increment closes over the environment that contains count.", "011"], ["Return and call", "The outer call ends, but increment still reaches the captured environment and updates count.", "122"]],
});

const oauth = makeStepper({
  title: "OAuth authorization code flow", concept: "OAuth 2.0 authorization code flow", summary: "Trace the browser, authorization code, and tokens without confusing who should see each secret.",
  takeaway: "The short-lived code travels through the browser; the backend exchanges it for tokens using a protected channel.",
  columns: ["Browser", "Authorization server", "App backend"], chips: ["User session", "Authorization code", "Access token"],
  steps: [["Ask for consent", "The browser is redirected to the authorization server, where the user signs in and approves access.", "010"], ["Return a code", "The authorization server redirects back with a short-lived, single-use code.", "100"], ["Exchange server-side", "The backend validates state and exchanges the code for an access token away from the browser.", "202"]],
});

const caching = makeStepper({
  title: "A cache hit and miss", concept: "Application caching", summary: "See the same request take the fast cache path or the slower origin path.",
  takeaway: "A cache improves latency only when keys, freshness, invalidation, and fallback behavior are all correct.",
  columns: ["Client", "Cache", "Database"], chips: ["GET /profile", "Cached value", "Fresh value"],
  steps: [["Check the key", "The request is translated into a deterministic cache key.", "010"], ["Miss: fetch origin", "With no usable entry, the application asks the database for the current value.", "202"], ["Populate and return", "The fresh value is stored with a policy, then returned to the client.", "110"]],
});

function makePlayground(input: { title: string; concept: string; summary: string; takeaway: string; controlLabel: string; unit: string; values: number[]; series: [string, string]; multiplier: [number, number]; explanations: string[] }): PlaygroundSpec {
  return {
    version: 1, archetype: "playground", title: input.title, concept: input.concept, level: "student", summary: input.summary,
    whyThisArchetype: "Changing one input and seeing the curve respond makes the trade-off easier to feel than a static definition.", keyTakeaway: input.takeaway,
    controls: [{ id: "size", kind: "slider", label: input.controlLabel, min: 0, max: input.values.length - 1, step: 1, defaultValue: 1 }],
    series: [{ id: "baseline", label: input.series[0], color: "rose" }, { id: "optimized", label: input.series[1], color: "violet" }], xAxisLabel: "Input scale", yAxisLabel: input.unit,
    scenarios: input.values.map((value, index) => ({ id: `case-${index}`, when: { size: index }, explanation: input.explanations[index], metrics: [
      { id: "input", label: input.controlLabel, value: value.toLocaleString(), tone: "neutral" },
      { id: "difference", label: "Relative gap", value: `${Math.max(1, Math.round(input.multiplier[0] / input.multiplier[1]))}×`, note: `${input.series[1]} at this scale`, tone: "good" },
    ], chartData: [1, 2, 3, 4, 5].map((scale) => ({ x: `${scale}×`, values: { baseline: Number((value * scale * input.multiplier[0]).toFixed(2)), optimized: Number((value * scale * input.multiplier[1]).toFixed(2)) } })) })),
  };
}

const indexing = makePlayground({ title: "Database indexing", concept: "Database indexes", summary: "Change table size and compare a full scan with a logarithmic index lookup.", takeaway: "Indexes trade write cost and storage for dramatically less read work on selective queries.", controlLabel: "Table size", unit: "Rows examined", values: [1000, 10000, 100000], series: ["Full scan", "B-tree lookup"], multiplier: [1, 0.05], explanations: ["At small sizes both feel quick, though the scan already touches much more data.", "As the table grows, the index narrows the search while the scan grows linearly.", "At production scale, selectivity and access pattern determine whether the index pays off."] });
const bigO = makePlayground({ title: "Big-O growth", concept: "Big-O time complexity", summary: "Increase input size and compare linear work with a quadratic algorithm.", takeaway: "Big-O describes how work grows; constants matter locally, but growth dominates at scale.", controlLabel: "Input n", unit: "Relative operations", values: [10, 50, 100], series: ["O(n²)", "O(n)"], multiplier: [1, 0.1], explanations: ["For tiny inputs, either implementation can be acceptable.", "Growth starts to dominate constant-factor differences.", "Doubling n roughly quadruples quadratic work but only doubles linear work."] });
const cacheRates = makePlayground({ title: "Cache hit-rate economics", concept: "Cache hit rate", summary: "Change request volume and see why even a small miss rate can keep the origin busy.", takeaway: "At high traffic, improving hit rate by a few points can remove a large amount of origin load.", controlLabel: "Requests / sec", unit: "Backend work", values: [100, 1000, 10000], series: ["No cache", "90% hit rate"], multiplier: [1, 0.1], explanations: ["The origin can easily absorb this load, but the cache still reduces latency.", "A 90% hit rate removes nine out of ten origin reads.", "At high volume, the remaining 10% miss stream is still substantial and must be capacity-planned."] });
const debounce = makePlayground({ title: "Debounce noisy input", concept: "Debouncing", summary: "Increase the event burst and compare one request per keystroke with a debounced handler.", takeaway: "Debouncing waits for quiet before acting, trading a small delay for far fewer repeated calls.", controlLabel: "Events in burst", unit: "Handler calls", values: [5, 20, 100], series: ["Immediate", "Debounced"], multiplier: [1, 0.08], explanations: ["A short burst creates a little duplicate work.", "Debouncing collapses a typical typing burst into roughly one useful action.", "For noisy sources, the reduction protects both the browser and downstream services."] });

const rawSpecs: ExplainerSpec[] = [eventLoop, indexing, closures, oauth, caching, bigO, cacheRates, debounce];

export const showcaseSpecs = rawSpecs.map((spec) => explainerSpecSchema.parse(spec));
export const showcaseBySlug = Object.fromEntries([
  "event-loop", "database-indexing", "closures", "oauth", "caching", "big-o", "cache-hit-rate", "debouncing",
].map((slug, index) => [slug, showcaseSpecs[index]])) as Record<string, ExplainerSpec>;

export function findShowcase(concept: string, level?: string) {
  const normalized = concept.trim().toLowerCase();
  const match = showcaseSpecs.find((spec) => spec.concept.toLowerCase() === normalized || spec.title.toLowerCase() === normalized);
  return match && (!level || match.level === level) ? match : undefined;
}
