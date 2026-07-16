import {
  explainerSpecSchema,
  type ExplainerSpec,
  type PlaygroundSpec,
  type StepperSpec,
} from "@/lib/schema";

const eventLoop: StepperSpec = {
  version: 1,
  archetype: "stepper",
  title: "The JavaScript event loop",
  concept: "JavaScript event loop",
  level: "student",
  summary:
    "Watch work move between the call stack, browser APIs, and the task queues as the runtime decides what executes next.",
  whyThisArchetype:
    "Order and movement are the idea, so a step-by-step timeline makes the scheduling rules visible.",
  keyTakeaway:
    "After synchronous code finishes, microtasks drain completely before the next task is taken.",
  columns: [
    { id: "stack", title: "Call stack", hint: "Runs now" },
    { id: "web", title: "Web APIs", hint: "Waiting outside JS" },
    { id: "micro", title: "Microtasks", hint: "Promises" },
    { id: "tasks", title: "Task queue", hint: "Timers & events" },
  ],
  chips: [
    {
      id: "script",
      label: "main()",
      detail: "Logs A, schedules both callbacks, then logs D",
      tone: "violet",
    },
    {
      id: "timer",
      label: "setTimeout callback",
      detail: "A timer schedules a future task",
      tone: "amber",
    },
    {
      id: "promise",
      label: "Promise.then",
      detail: "A resolved promise schedules a microtask",
      tone: "cyan",
    },
  ],
  steps: [
    {
      id: "sync",
      title: "Run the script",
      description:
        "main() logs A, registers a timer, queues a promise reaction, then logs D. Statements execute inside the script; they are not separate stack frames.",
      columns: [
        { columnId: "stack", chipIds: ["script"] },
        { columnId: "web", chipIds: ["timer"] },
        { columnId: "micro", chipIds: ["promise"] },
        { columnId: "tasks", chipIds: [] },
      ],
      callout: "Synchronous work always wins first.",
    },
    {
      id: "queued",
      title: "Callbacks become ready",
      description:
        "The timer finishes waiting and its callback joins the task queue. The promise reaction is already in the microtask queue.",
      columns: [
        { columnId: "stack", chipIds: [] },
        { columnId: "web", chipIds: [] },
        { columnId: "micro", chipIds: ["promise"] },
        { columnId: "tasks", chipIds: ["timer"] },
      ],
    },
    {
      id: "microtasks",
      title: "Drain microtasks",
      description:
        "Once the stack is empty, the event loop drains every microtask before selecting another task.",
      columns: [
        { columnId: "stack", chipIds: ["promise"] },
        { columnId: "web", chipIds: [] },
        { columnId: "micro", chipIds: [] },
        { columnId: "tasks", chipIds: ["timer"] },
      ],
      callout: "Promise.then runs before setTimeout(..., 0).",
    },
    {
      id: "timer-runs",
      title: "Take the next task",
      description:
        "Only after the microtask queue is empty can the timer callback move to the stack and run.",
      columns: [
        { columnId: "stack", chipIds: ["timer"] },
        { columnId: "web", chipIds: [] },
        { columnId: "micro", chipIds: [] },
        { columnId: "tasks", chipIds: [] },
      ],
    },
  ],
};

const closures: StepperSpec = {
  version: 1,
  archetype: "stepper",
  title: "Closures keep scope alive",
  concept: "JavaScript closures",
  level: "student",
  summary:
    "Follow a function and its captured variable after the outer call has returned.",
  whyThisArchetype:
    "Following the function separately from its lexical environment shows what survives the outer call.",
  keyTakeaway:
    "A closure retains access to the lexical environment where it was created, not a frozen copy of each value.",
  columns: [
    { id: "active", title: "Active call", hint: "Executing now" },
    { id: "environment", title: "Lexical environment", hint: "Bindings" },
    { id: "returned", title: "Returned value", hint: "Held by caller" },
  ],
  chips: [
    {
      id: "make-counter",
      label: "makeCounter()",
      detail: "The outer function call",
      tone: "violet",
    },
    {
      id: "count-binding",
      label: "count binding",
      detail: "A mutable binding initialized to 0",
      tone: "cyan",
    },
    {
      id: "increment",
      label: "increment closure",
      detail: "A function linked to its defining environment",
      tone: "amber",
    },
  ],
  steps: [
    {
      id: "create-scope",
      title: "Create the scope",
      description:
        "Calling makeCounter creates a lexical environment and initializes its count binding to 0.",
      columns: [
        { columnId: "active", chipIds: ["make-counter"] },
        { columnId: "environment", chipIds: ["count-binding"] },
        { columnId: "returned", chipIds: [] },
      ],
    },
    {
      id: "create-closure",
      title: "Create the inner function",
      description:
        "increment is created with a reference to this lexical environment, where the count binding lives.",
      columns: [
        { columnId: "active", chipIds: ["make-counter"] },
        {
          columnId: "environment",
          chipIds: ["count-binding", "increment"],
        },
        { columnId: "returned", chipIds: [] },
      ],
    },
    {
      id: "return-closure",
      title: "Return the closure",
      description:
        "makeCounter returns, but increment keeps its defining environment reachable. The count binding is not copied into the function.",
      columns: [
        { columnId: "active", chipIds: [] },
        { columnId: "environment", chipIds: ["count-binding"] },
        { columnId: "returned", chipIds: ["increment"] },
      ],
    },
    {
      id: "call-closure",
      title: "Call the returned function",
      description:
        "Calling increment follows the environment reference and changes the same count binding from 0 to 1.",
      columns: [
        { columnId: "active", chipIds: ["increment"] },
        { columnId: "environment", chipIds: ["count-binding"] },
        { columnId: "returned", chipIds: [] },
      ],
      callout: "The binding persists; its value can change.",
    },
  ],
};

const oauth: StepperSpec = {
  version: 1,
  archetype: "stepper",
  title: "OAuth authorization code flow",
  concept: "OAuth 2.0 authorization code flow",
  level: "student",
  summary:
    "Trace the browser, authorization code, and tokens without confusing who should see each secret.",
  whyThisArchetype:
    "Following each artifact across trust boundaries makes the server-side code exchange explicit.",
  keyTakeaway:
    "The short-lived code travels through the browser; the backend exchanges it for tokens using a protected channel.",
  columns: [
    { id: "browser", title: "Browser", hint: "User agent" },
    {
      id: "authorization",
      title: "Authorization server",
      hint: "Issues code & token",
    },
    { id: "backend", title: "App backend", hint: "Confidential client" },
  ],
  chips: [
    { id: "session", label: "User session", tone: "violet" },
    {
      id: "authorization-code",
      label: "Authorization code",
      detail: "Short-lived and single-use",
      tone: "cyan",
    },
    {
      id: "access-token",
      label: "Access token",
      detail: "Returned to the app backend",
      tone: "amber",
    },
  ],
  steps: [
    {
      id: "authorize",
      title: "Ask for authorization",
      description:
        "The browser follows a redirect to the authorization server, where the user signs in and approves access.",
      columns: [
        { columnId: "browser", chipIds: ["session"] },
        { columnId: "authorization", chipIds: [] },
        { columnId: "backend", chipIds: [] },
      ],
    },
    {
      id: "redirect-code",
      title: "Return a code",
      description:
        "After approval, the authorization server redirects the browser to the registered callback with a short-lived code.",
      columns: [
        {
          columnId: "browser",
          chipIds: ["session", "authorization-code"],
        },
        { columnId: "authorization", chipIds: [] },
        { columnId: "backend", chipIds: [] },
      ],
    },
    {
      id: "deliver-code",
      title: "Validate the callback",
      description:
        "The backend receives the code and validates the callback state before attempting an exchange.",
      columns: [
        { columnId: "browser", chipIds: ["session"] },
        { columnId: "authorization", chipIds: [] },
        { columnId: "backend", chipIds: ["authorization-code"] },
      ],
    },
    {
      id: "exchange-code",
      title: "Exchange server-side",
      description:
        "The backend sends the code directly to the token endpoint. The authorization server validates it and returns an access token to the backend.",
      columns: [
        { columnId: "browser", chipIds: ["session"] },
        { columnId: "authorization", chipIds: [] },
        { columnId: "backend", chipIds: ["access-token"] },
      ],
      callout: "The access token never passes through the browser.",
    },
  ],
};

const caching: StepperSpec = {
  version: 1,
  archetype: "stepper",
  title: "A cache hit and miss",
  concept: "Application caching",
  level: "student",
  summary:
    "See the same request take the fast cache path or the slower origin path.",
  whyThisArchetype:
    "Following a cache miss shows when a value exists at the origin, enters the cache, and reaches the client.",
  keyTakeaway:
    "A cache improves latency only when keys, freshness, invalidation, and fallback behavior are all correct.",
  columns: [
    { id: "client", title: "Client" },
    { id: "cache", title: "Cache" },
    { id: "database", title: "Database" },
  ],
  chips: [
    { id: "request", label: "GET /profile", tone: "violet" },
    {
      id: "cache-entry",
      label: "New cache entry",
      detail: "A copy stored with a freshness policy",
      tone: "cyan",
    },
    {
      id: "fresh-value",
      label: "Fresh value",
      detail: "The value read from the database",
      tone: "amber",
    },
  ],
  steps: [
    {
      id: "request",
      title: "Receive the request",
      description:
        "The client asks for a profile. No response value exists in this flow yet.",
      columns: [
        { columnId: "client", chipIds: ["request"] },
        { columnId: "cache", chipIds: [] },
        { columnId: "database", chipIds: [] },
      ],
    },
    {
      id: "cache-miss",
      title: "Check the cache",
      description:
        "The request maps to a deterministic key, but the cache has no usable entry: this is a miss.",
      columns: [
        { columnId: "client", chipIds: [] },
        { columnId: "cache", chipIds: ["request"] },
        { columnId: "database", chipIds: [] },
      ],
    },
    {
      id: "fetch-origin",
      title: "Fetch from the origin",
      description:
        "After the miss, the application queries the database and receives the current value.",
      columns: [
        { columnId: "client", chipIds: [] },
        { columnId: "cache", chipIds: [] },
        {
          columnId: "database",
          chipIds: ["request", "fresh-value"],
        },
      ],
    },
    {
      id: "populate-return",
      title: "Populate and return",
      description:
        "The application stores a copy with a freshness policy and returns the fresh value to the client.",
      columns: [
        { columnId: "client", chipIds: ["fresh-value"] },
        { columnId: "cache", chipIds: ["cache-entry"] },
        { columnId: "database", chipIds: [] },
      ],
      callout: "The cache entry appears only after the origin read succeeds.",
    },
  ],
};

function makePlayground(input: {
  title: string;
  concept: string;
  summary: string;
  takeaway: string;
  controlLabel: string;
  unit: string;
  values: number[];
  series: [string, string];
  multiplier: [number, number];
  explanations: string[];
}): PlaygroundSpec {
  return {
    version: 1,
    archetype: "playground",
    title: input.title,
    concept: input.concept,
    level: "student",
    summary: input.summary,
    whyThisArchetype:
      "Changing one input and seeing the curve respond makes the trade-off easier to feel than a static definition.",
    keyTakeaway: input.takeaway,
    controls: [
      {
        id: "size",
        kind: "slider",
        label: input.controlLabel,
        min: 0,
        max: input.values.length - 1,
        step: 1,
        defaultValue: 1,
      },
    ],
    series: [
      { id: "baseline", label: input.series[0], color: "rose" },
      { id: "optimized", label: input.series[1], color: "violet" },
    ],
    xAxisLabel: "Input scale",
    yAxisLabel: input.unit,
    scenarios: input.values.map((value, index) => ({
      id: `case-${index}`,
      when: { size: index },
      explanation: input.explanations[index],
      metrics: [
        {
          id: "input",
          label: input.controlLabel,
          value: value.toLocaleString(),
          tone: "neutral",
        },
        {
          id: "difference",
          label: "Relative gap",
          value: `${Math.max(1, Math.round(input.multiplier[0] / input.multiplier[1]))}×`,
          note: `${input.series[1]} at this scale`,
          tone: "good",
        },
      ],
      chartData: [1, 2, 3, 4, 5].map((scale) => ({
        x: `${scale}×`,
        values: {
          baseline: Number((value * scale * input.multiplier[0]).toFixed(2)),
          optimized: Number((value * scale * input.multiplier[1]).toFixed(2)),
        },
      })),
    })),
  };
}

const indexing = makePlayground({
  title: "Database indexing",
  concept: "Database indexes",
  summary:
    "Change table size and compare a full scan with a logarithmic index lookup.",
  takeaway:
    "Indexes trade write cost and storage for dramatically less read work on selective queries.",
  controlLabel: "Table size",
  unit: "Rows examined",
  values: [1000, 10000, 100000],
  series: ["Full scan", "B-tree lookup"],
  multiplier: [1, 0.05],
  explanations: [
    "At small sizes both feel quick, though the scan already touches much more data.",
    "As the table grows, the index narrows the search while the scan grows linearly.",
    "At production scale, selectivity and access pattern determine whether the index pays off.",
  ],
});
const bigO = makePlayground({
  title: "Big-O growth",
  concept: "Big-O time complexity",
  summary:
    "Increase input size and compare linear work with a quadratic algorithm.",
  takeaway:
    "Big-O describes how work grows; constants matter locally, but growth dominates at scale.",
  controlLabel: "Input n",
  unit: "Relative operations",
  values: [10, 50, 100],
  series: ["O(n²)", "O(n)"],
  multiplier: [1, 0.1],
  explanations: [
    "For tiny inputs, either implementation can be acceptable.",
    "Growth starts to dominate constant-factor differences.",
    "Doubling n roughly quadruples quadratic work but only doubles linear work.",
  ],
});
const cacheRates = makePlayground({
  title: "Cache hit-rate economics",
  concept: "Cache hit rate",
  summary:
    "Change request volume and see why even a small miss rate can keep the origin busy.",
  takeaway:
    "At high traffic, improving hit rate by a few points can remove a large amount of origin load.",
  controlLabel: "Requests / sec",
  unit: "Backend work",
  values: [100, 1000, 10000],
  series: ["No cache", "90% hit rate"],
  multiplier: [1, 0.1],
  explanations: [
    "The origin can easily absorb this load, but the cache still reduces latency.",
    "A 90% hit rate removes nine out of ten origin reads.",
    "At high volume, the remaining 10% miss stream is still substantial and must be capacity-planned.",
  ],
});
const debounce = makePlayground({
  title: "Debounce noisy input",
  concept: "Debouncing",
  summary:
    "Increase the event burst and compare one request per keystroke with a debounced handler.",
  takeaway:
    "Debouncing waits for quiet before acting, trading a small delay for far fewer repeated calls.",
  controlLabel: "Events in burst",
  unit: "Handler calls",
  values: [5, 20, 100],
  series: ["Immediate", "Debounced"],
  multiplier: [1, 0.08],
  explanations: [
    "A short burst creates a little duplicate work.",
    "Debouncing collapses a typical typing burst into roughly one useful action.",
    "For noisy sources, the reduction protects both the browser and downstream services.",
  ],
});

const rawSpecs: ExplainerSpec[] = [
  eventLoop,
  indexing,
  closures,
  oauth,
  caching,
  bigO,
  cacheRates,
  debounce,
];

export const showcaseSpecs = rawSpecs.map((spec) =>
  explainerSpecSchema.parse(spec),
);
export const showcaseBySlug = Object.fromEntries(
  [
    "event-loop",
    "database-indexing",
    "closures",
    "oauth",
    "caching",
    "big-o",
    "cache-hit-rate",
    "debouncing",
  ].map((slug, index) => [slug, showcaseSpecs[index]]),
) as Record<string, ExplainerSpec>;

export function findShowcase(concept: string, level?: string) {
  const normalized = concept.trim().toLowerCase();
  const match = showcaseSpecs.find(
    (spec) =>
      spec.concept.toLowerCase() === normalized ||
      spec.title.toLowerCase() === normalized,
  );
  return match && (!level || match.level === level) ? match : undefined;
}
