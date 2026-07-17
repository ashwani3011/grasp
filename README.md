# Grasp

Grasp turns a developer concept, error message, or code snippet into a live, manipulable explanation. The model chooses between two hardened archetypes—`stepper` and `playground`—and returns data only. It never returns UI code.

Each explainer follows a compact lesson arc: a concrete hook frames the developer pain, the interactive walkthrough makes the mechanism visible, an optional predict-then-reveal snippet proves it, and the takeaway anchors the idea. Learners can ask one contextual clarification from a step, chip, scenario, or seeded common question, then switch to Interview mode to test recall and application.

## Why the architecture is safe

```text
user input
  → Builder: one server-only structured model call
  → Inspector: deterministic Zod validation
      ↳ invalid: Repairer receives validation feedback once
      ↳ invalid again: return a friendly error
  → hardened React primitive
  → optional learner actions: Ask or Examiner (Interview mode)
```

For live generations, “How this was made” reports the real model, total generation duration, final deterministic checks, archetype rationale, and whether the single repair path was actually used. Cached showcases and shared links have no pipeline metadata. Every displayed stage corresponds to real work; Grasp does not simulate agent chatter, timings, planning calls, or fact-check calls.

- `lib/schema.ts` is the trust boundary for every model response.
- `lib/openai.ts` implements exactly one validation-driven repair attempt.
- The Stepper reuses stable chip IDs with Framer Motion `layoutId` transitions.
- The Playground selects explicit, precomputed scenarios. It does not execute model-authored formulas or code.
- Shared explainers encode the validated spec into the URL and require no database or OpenAI request to render.
- Eight verified showcase specs ship with the app and render instantly.
- Public AI routes use a bounded per-IP token bucket and per-instance concurrency ceiling before parsing request bodies.

## Stack

- Next.js App Router and TypeScript
- Tailwind CSS and shadcn-style UI primitives
- Zod
- Framer Motion
- Recharts
- OpenAI Node SDK and Responses API
- Vitest and React Testing Library
- ESLint, Prettier, and GitHub Actions

## Local development

Requirements: Node.js 22 and npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set `OPENAI_API_KEY` in `.env.local` for live generation and interview mode. The key is read only by server route handlers. Without a key, cached examples, the gallery, and shared links continue to work.

`OPENAI_MODEL` is optional and defaults to `gpt-5.4-mini`.

## Quality gates

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```

The same gates run in `.github/workflows/ci.yml` on pull requests and pushes to `main`.

## Routes

| Route            | Responsibility                                                               |
| ---------------- | ---------------------------------------------------------------------------- |
| `/`              | Hero, concept input, level selector, examples, explainer, and interview mode |
| `/gallery`       | Eight verified offline explainers                                            |
| `/e/[spec]`      | Validates and renders a URL-contained shared spec                            |
| `/api/generate`  | Generates, validates, repairs once, and returns an explainer spec            |
| `/api/ask`       | Answers one validated contextual follow-up about an explainer                |
| `/api/interview` | Generates three questions or grades three answers                            |

## Project map

```text
app/
  api/generate/route.ts
  api/ask/route.ts
  api/interview/route.ts
  e/[spec]/page.tsx
  gallery/page.tsx
  page.tsx
components/
  Stepper.tsx
  Playground.tsx
  ArchetypeBadge.tsx
  AskPopover.tsx
  CodeProof.tsx
  InterviewMe.tsx
  PipelineTrace.tsx
lib/
  ai-request-guard.ts
  openai.ts
  pipeline.ts
  rate-limit.ts
  schema.ts
  share.ts
  showcase.ts
```

`flow` is intentionally not included. The product scope calls for it only after both core archetypes are polished.

## Deployment

Deploy the repository as a standard Next.js project on Vercel and set `OPENAI_API_KEY` as a server-side environment variable. Optionally set `OPENAI_MODEL`. No database, authentication provider, or persistent volume is required.

Before making the deployment public:

1. Create a dedicated OpenAI project and restricted API key for Grasp.
2. In the project Limits page, allow only the deployed model and set conservative request/token rate limits.
3. Configure monthly budget alerts at multiple thresholds. OpenAI project budgets are soft alerts, not hard spending caps: requests continue after the budget is exceeded.
4. Verify that cached showcases, gallery entries, and shared URLs render without `OPENAI_API_KEY`; these paths should remain available if live generation is throttled or offline.

The application limiter permits a burst of six AI requests per client IP, refills one token every 20 seconds, and allows four concurrent AI operations per server instance. Rejections return JSON with `Retry-After`, and the existing UI displays that message. Because Vercel instances do not share memory and may restart, this is best-effort abuse resistance—not a durable global quota. A shared rate-limit store would be the next step if the no-database constraint changes.

## Engineering history

See [BUILD_LOG.md](./BUILD_LOG.md) for the per-commit implementation and decision log.
