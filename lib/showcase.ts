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

function sampleInputs(max: number) {
  return [
    ...new Set(
      [1, 0.25, 0.5, 0.75, 1].map((part) =>
        Math.max(1, Math.round(max * part)),
      ),
    ),
  ].sort((left, right) => left - right);
}

const tableSizes = [1_000, 10_000, 100_000];
const indexing: PlaygroundSpec = {
  version: 1,
  archetype: "playground",
  title: "Database indexing",
  concept: "Database indexes",
  level: "student",
  summary:
    "Change table size and compare a full scan with a logarithmic index lookup.",
  whyThisArchetype:
    "Changing table size makes the widening gap between linear scanning and logarithmic lookup visible.",
  keyTakeaway:
    "Indexes trade write cost and storage for dramatically less read work on selective queries.",
  controls: [
    {
      id: "size",
      kind: "slider",
      label: "Table size",
      min: 0,
      max: tableSizes.length - 1,
      step: 1,
      defaultValue: 1,
    },
  ],
  series: [
    { id: "baseline", label: "Full scan — O(n)", color: "rose" },
    { id: "optimized", label: "B-tree lookup — O(log n)", color: "violet" },
  ],
  xAxisLabel: "Rows in table",
  yAxisLabel: "Relative lookup work",
  scenarios: tableSizes.map((tableSize, index) => {
    const logarithmicWork = Math.ceil(Math.log2(tableSize));
    return {
      id: `table-${tableSize}`,
      when: { size: index },
      explanation: [
        "Even at 1,000 rows, a selective index lookup grows far more slowly than a scan. Real B-trees use a high branching factor, so their height is often smaller than this log₂ illustration.",
        "At 10,000 rows, scan work is ten times larger than at 1,000 while logarithmic lookup work increases only modestly.",
        "At 100,000 rows, the growth-rate gap is dramatic, though selectivity and access pattern still determine whether an index is useful.",
      ][index],
      metrics: [
        {
          id: "input",
          label: "Table size",
          value: tableSize.toLocaleString(),
          tone: "neutral" as const,
        },
        {
          id: "difference",
          label: "Scan / index work",
          value: `${Math.round(tableSize / logarithmicWork).toLocaleString()}×`,
          note: "Theoretical n ÷ ⌈log₂ n⌉",
          tone: "good" as const,
        },
      ],
      chartData: sampleInputs(tableSize).map((rows) => ({
        x: String(rows),
        values: {
          baseline: rows,
          optimized: Math.ceil(Math.log2(rows)),
        },
      })),
    };
  }),
};

const inputSizes = [10, 50, 100];
const bigO: PlaygroundSpec = {
  version: 1,
  archetype: "playground",
  title: "Big-O growth",
  concept: "Big-O time complexity",
  level: "student",
  summary:
    "Increase input size and compare linear work with a quadratic algorithm.",
  whyThisArchetype:
    "Adjusting n reveals how a quadratic curve bends away from linear growth.",
  keyTakeaway:
    "Big-O describes how work grows; constants matter locally, but growth dominates at scale.",
  controls: [
    {
      id: "size",
      kind: "slider",
      label: "Input n",
      min: 0,
      max: inputSizes.length - 1,
      step: 1,
      defaultValue: 1,
    },
  ],
  series: [
    { id: "baseline", label: "O(n²)", color: "rose" },
    { id: "optimized", label: "O(n)", color: "violet" },
  ],
  xAxisLabel: "Input n",
  yAxisLabel: "Relative operations",
  scenarios: inputSizes.map((maxInput, index) => ({
    id: `input-${maxInput}`,
    when: { size: index },
    explanation: [
      "For tiny inputs, both algorithms may be fast, but the quadratic curve is already bending upward.",
      "At n = 50, quadratic work is 50 times the linear work in this growth-rate comparison.",
      "Doubling n from 50 to 100 doubles linear work but quadruples quadratic work.",
    ][index],
    metrics: [
      {
        id: "input",
        label: "Input n",
        value: String(maxInput),
        tone: "neutral" as const,
      },
      {
        id: "difference",
        label: "n² / n gap",
        value: `${maxInput}×`,
        note: "At the selected n",
        tone: "good" as const,
      },
    ],
    chartData: sampleInputs(maxInput).map((input) => ({
      x: String(input),
      values: { baseline: input ** 2, optimized: input },
    })),
  })),
};

const requestRates = [100, 1_000, 10_000];
const cacheRates: PlaygroundSpec = {
  version: 1,
  archetype: "playground",
  title: "Cache hit-rate economics",
  concept: "Cache hit rate",
  level: "student",
  summary:
    "Change request volume and see why even a small miss rate can keep the origin busy.",
  whyThisArchetype:
    "Adjusting traffic makes the origin work avoided by a fixed cache hit rate tangible.",
  keyTakeaway:
    "At high traffic, improving hit rate by a few points can remove a large amount of origin load.",
  controls: [
    {
      id: "size",
      kind: "slider",
      label: "Requests / sec",
      min: 0,
      max: requestRates.length - 1,
      step: 1,
      defaultValue: 1,
    },
  ],
  series: [
    { id: "baseline", label: "No cache", color: "rose" },
    { id: "optimized", label: "90% hit rate", color: "violet" },
  ],
  xAxisLabel: "Requests / second",
  yAxisLabel: "Origin requests / second",
  scenarios: requestRates.map((requests, index) => ({
    id: `requests-${requests}`,
    when: { size: index },
    explanation: [
      "At 100 requests per second, a 90% hit rate leaves 10 origin requests per second.",
      "A 90% hit rate removes nine out of ten origin reads, leaving 100 requests per second at the origin.",
      "At high volume, the remaining 10% miss stream is still substantial and must be capacity-planned.",
    ][index],
    metrics: [
      {
        id: "input",
        label: "Requests / sec",
        value: requests.toLocaleString(),
        tone: "neutral" as const,
      },
      {
        id: "difference",
        label: "Origin work avoided",
        value: "90%",
        note: `${(requests * 0.1).toLocaleString()} requests/sec still miss`,
        tone: "good" as const,
      },
    ],
    chartData: sampleInputs(requests).map((rate) => ({
      x: String(rate),
      values: { baseline: rate, optimized: rate * 0.1 },
    })),
  })),
};

const burstSizes = [5, 20, 100];
const debounce: PlaygroundSpec = {
  version: 1,
  archetype: "playground",
  title: "Debounce noisy input",
  concept: "Debouncing",
  level: "student",
  summary:
    "Increase the event burst and compare one request per keystroke with a debounced handler.",
  whyThisArchetype:
    "Changing burst size shows how trailing-edge debounce collapses a continuous burst into one call.",
  keyTakeaway:
    "Debouncing waits for quiet before acting, trading a small delay for far fewer repeated calls.",
  controls: [
    {
      id: "size",
      kind: "slider",
      label: "Events in burst",
      min: 0,
      max: burstSizes.length - 1,
      step: 1,
      defaultValue: 1,
    },
  ],
  series: [
    { id: "baseline", label: "Immediate", color: "rose" },
    { id: "optimized", label: "Trailing debounce", color: "violet" },
  ],
  xAxisLabel: "Events in one continuous burst",
  yAxisLabel: "Handler calls",
  scenarios: burstSizes.map((events, index) => ({
    id: `burst-${events}`,
    when: { size: index },
    explanation: [
      "If all five events arrive before the debounce delay expires, an immediate handler runs five times while trailing debounce runs once after the burst.",
      "For one continuous 20-event burst, trailing debounce resets its timer on every event and runs once after input becomes quiet.",
      "For one continuous 100-event burst, trailing debounce still runs once; separate bursts or pauses longer than the delay would create additional calls.",
    ][index],
    metrics: [
      {
        id: "input",
        label: "Events in burst",
        value: String(events),
        tone: "neutral" as const,
      },
      {
        id: "difference",
        label: "Call reduction",
        value: `${events}×`,
        note: "Assumes one burst within the delay window",
        tone: "good" as const,
      },
    ],
    chartData: sampleInputs(events).map((burstEvents) => ({
      x: String(burstEvents),
      values: { baseline: burstEvents, optimized: 1 },
    })),
  })),
};

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
