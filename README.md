# Grasp

Grasp turns a developer concept, error message, or code snippet into a live, manipulable explanation. The model chooses between two hardened archetypes—`stepper` and `playground`—and returns data only. It never returns UI code.

## Why the architecture is safe

```text
user input
  → server-only OpenAI route
  → structured JSON response
  → Zod validation
      ↳ invalid: send validation errors to the model once
      ↳ invalid again: return a friendly error
  → hardened React primitive
```

- `lib/schema.ts` is the trust boundary for every model response.
- `lib/openai.ts` implements exactly one validation-driven repair attempt.
- The Stepper reuses stable chip IDs with Framer Motion `layoutId` transitions.
- The Playground selects explicit, precomputed scenarios. It does not execute model-authored formulas or code.
- Shared explainers encode the validated spec into the URL and require no database or OpenAI request to render.
- Eight verified showcase specs ship with the app and render instantly.

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
| `/api/interview` | Generates three questions or grades three answers                            |

## Project map

```text
app/
  api/generate/route.ts
  api/interview/route.ts
  e/[spec]/page.tsx
  gallery/page.tsx
  page.tsx
components/
  Stepper.tsx
  Playground.tsx
  ArchetypeBadge.tsx
  InterviewMe.tsx
lib/
  openai.ts
  schema.ts
  share.ts
  showcase.ts
```

`flow` is intentionally not included. The product scope calls for it only after both core archetypes are polished.

## Deployment

Deploy the repository as a standard Next.js project on Vercel and set `OPENAI_API_KEY` as a server-side environment variable. Optionally set `OPENAI_MODEL`. No database, authentication provider, or persistent volume is required.

## Engineering history

See [BUILD_LOG.md](./BUILD_LOG.md) for the per-commit implementation and decision log.
