# Grasp Build Log

This running log records what the owner requested, what Codex implemented, uncertainties, direction changes, and the related Conventional Commit.

## 2026-07-16 — Formatting baseline

- **Asked:** Keep code quality high from the start and split engineering safeguards into small, focused commits.
- **Implemented:** Added Prettier, Tailwind class sorting, repository formatting rules, ignore rules, and format/check scripts.
- **Challenges / uncertainty:** The earlier milestone commit mixed unrelated changes. It was undone while preserving the working tree so the history could be rebuilt cleanly.
- **Direction changes:** The owner explicitly requested one logical change per commit.
- **Commit:** `chore: configure automated formatting`

## 2026-07-16 — Lint cleanup

- **Asked:** Keep linting as its own logical change.
- **Implemented:** Removed the anonymous default export warning from the PostCSS configuration so ESLint completes with zero warnings.
- **Challenges / uncertainty:** ESLint was already present in the initial repository commit; this commit isolates the remaining configuration warning rather than rewriting older history.
- **Direction changes:** None beyond the newly requested granular commit policy.
- **Commit:** `fix: eliminate lint configuration warning`

## 2026-07-16 — Testing harness

- **Asked:** Keep testing setup independent from product features.
- **Implemented:** Added Vitest, jsdom, React Testing Library, DOM matchers, user-event support, path aliases, and test/watch scripts.
- **Challenges / uncertainty:** Product tests remain with the features they verify; this commit contains only the reusable harness.
- **Direction changes:** None.
- **Commit:** `test: configure component testing harness`

## 2026-07-16 — Dependency security override

- **Asked:** Apply production-grade safeguards from the beginning.
- **Implemented:** Forced the transitive PostCSS dependency to a patched release and refreshed the lockfile.
- **Challenges / uncertainty:** npm reported a moderate transitive vulnerability through Next.js; its automatic suggestion was an unsafe framework downgrade, so a narrow patched-version override was used instead.
- **Direction changes:** None.
- **Commit:** `fix(deps): pin patched postcss version`

## 2026-07-16 — Foundation formatting pass

- **Asked:** Keep formatting changes isolated from product behavior.
- **Implemented:** Applied the repository formatter to the existing tracked configuration, UI helpers, schemas, and showcase fixtures without changing runtime behavior.
- **Challenges / uncertainty:** The initial repository commit predated the formatting setup, so these existing files needed a one-time mechanical pass.
- **Direction changes:** None.
- **Commit:** `style: format existing foundation files`

## 2026-07-16 — Next.js TypeScript alignment

- **Asked:** Keep meaningful configuration changes focused.
- **Implemented:** Accepted Next.js-generated JSX and development type include settings while preserving strict TypeScript and the `@/` alias.
- **Challenges / uncertainty:** Next.js updated these settings when the development server first started.
- **Direction changes:** None.
- **Commit:** `chore: align typescript config with nextjs`

## 2026-07-16 — Application design foundation

- **Asked:** Build a clean, tasteful, minimal, responsive interface with real typography and reliable production behavior.
- **Implemented:** Added the root metadata, self-hosted Manrope and JetBrains Mono fonts, global color/typography rules, responsive motion preferences, and the ambient page background.
- **Challenges / uncertainty:** Remote Google font fetching broke offline production builds, so the fonts are packaged locally.
- **Direction changes:** None.
- **Commit:** `feat: add application design foundation`

## 2026-07-16 — Explainer render primitives

- **Asked:** Make the hardcoded Stepper and Playground visible before wiring AI, with stable chip IDs and Framer Motion `layoutId` movement as the key visual.
- **Implemented:** Added the shared explainer frame, visible archetype rationale badge, animated Stepper navigation, scenario-only Playground controls and Recharts visualization, responsive layouts, and a focused Stepper interaction test.
- **Challenges / uncertainty:** Playground interactivity is intentionally data-driven; model-authored code and formulas are never executed.
- **Direction changes:** Flow remains excluded until both required archetypes are polished.
- **Commit:** `feat: add hardened explainer renderers`

## 2026-07-16 — Home explainer experience

- **Asked:** Add the hero, concept input, visible level selector, cached example chips, loading skeletons, friendly errors, and the rendered result.
- **Implemented:** Added the responsive primary flow with the Event Loop explainer visible by default, instant cached-example switching, level controls, generation request states, retry handling, navigation, and product copy.
- **Challenges / uncertainty:** The live endpoint is intentionally committed separately after this UI milestone; all cached examples already work without it.
- **Direction changes:** None.
- **Commit:** `feat: add home explainer experience`

## 2026-07-16 — Schema invariant coverage

- **Asked:** Treat every model-produced spec as untrusted and protect renderer assumptions.
- **Implemented:** Added tests covering all eight verified fixtures, unknown chip references, and rejection of arbitrary model fields.
- **Challenges / uncertainty:** None.
- **Direction changes:** None.
- **Commit:** `test: cover explainer schema invariants`

## 2026-07-16 — Offline sharing and gallery

- **Asked:** Make explainers shareable by URL alone, render shared links with the API offline, and provide a grid of eight verified cached examples.
- **Implemented:** Added validated base64url encoding/decoding, share-copy UI, defensive invalid-link rendering, the dynamic shared route, route loading state, and the eight-card verified gallery.
- **Challenges / uncertainty:** Shared payload size is bounded before parsing to avoid excessive untrusted input.
- **Direction changes:** None.
- **Commit:** `feat: add offline sharing and gallery`

## 2026-07-16 — Validated AI generation

- **Asked:** Add the server-only OpenAI route after the visible primitives, validate every response, send validation errors back once for repair, and return a friendly error if repair fails.
- **Implemented:** Added the Responses API integration, strict structured-output request, independent Zod trust-boundary validation, exactly one validation-driven repair attempt, bounded request validation, server-only key protection, and friendly missing-key, rate-limit, network, and repeated-invalid-output responses.
- **Challenges / uncertainty:** The OpenAI docs MCP required a local API key, so the current official docs and installed SDK types were used. The model is configurable through `OPENAI_MODEL`.
- **Direction changes:** Interview-specific model calls remain in their own later commit.
- **Commit:** `feat: add validated AI generation route`

## 2026-07-16 — Interview mode

- **Asked:** Add a small, high-impact interview panel with three concept-specific questions, at least one code-output question, user answers, and short verdicts with corrections.
- **Implemented:** Added strict question and assessment schemas, validated interview generation and grading through the same one-repair trust boundary, semantic question/result ID checks, bounded request validation, and the responsive answer-and-feedback panel.
- **Challenges / uncertainty:** Interview data is intentionally ephemeral because accounts and persistence are out of scope.
- **Direction changes:** None.
- **Commit:** `feat: add concept interview mode`

## 2026-07-16 — Continuous integration

- **Asked:** Keep CI checks as a separate logical commit and enforce formatting, linting, type checking, tests, and production builds.
- **Implemented:** Added a GitHub Actions workflow using Node 22 and lockfile caching that runs all five quality gates on pushes to main and pull requests.
- **Challenges / uncertainty:** The build receives a nonfunctional placeholder API key only to prove that build-time code never requires a real secret.
- **Direction changes:** None.
- **Commit:** `ci: enforce repository quality gates`

## 2026-07-16 — Production documentation

- **Asked:** Keep the repository readable for a senior reviewer and include a real README.
- **Implemented:** Documented the trust-boundary architecture, local setup, offline behavior, quality gates, routes, project map, scope decision, and Vercel deployment.
- **Challenges / uncertainty:** None.
- **Direction changes:** None.
- **Commit:** `docs: add production setup and architecture guide`

## 2026-07-16 — Playground cross-field validation

- **Asked:** Validate that Playground controls and scenarios are safe and complete rather than relying on prompt compliance.
- **Implemented:** Added discrete slider validation, valid defaults, unique select values, bounded state-space checks, complete and unique scenario coverage, exact control domains, unique scenario and metric IDs, and exact chart-series references, with regression tests.
- **Challenges / uncertainty:** Complete coverage can grow combinatorially, so Playground control state spaces are capped at 24 combinations to match the schema’s scenario bound.
- **Direction changes:** None.
- **Commit:** `fix: enforce playground scenario invariants`

## 2026-07-16 — Schema-aligned generation prompt

- **Asked:** Align the explainer prompt with the implemented schema, add explicit audience-level behavior, keep narration concise, and preserve the one-retry repair contract.
- **Implemented:** Updated the system prompt to use exact field vocabulary, define stable Stepper identity rules, require complete bounded Playground scenarios, define all four learning levels, prohibit extra checkpoint-style fields, and require JSON-only structured output.
- **Challenges / uncertainty:** Checkpoints remain in the separate Interview flow to avoid duplicating or invalidating the strict explainer spec.
- **Direction changes:** The existing repair prompt was retained because it already includes the requested validation issues plus the invalid response and a minimal-change instruction.
- **Commit:** `feat: align generation prompt with explainer schema`

## 2026-07-16 — Self-repair context hardening

- **Asked:** Complete the remaining improvements identified while validating the one-generation, one-repair architecture.
- **Implemented:** Preserved the original concept and level prompt in repair requests, normalized malformed JSON and Zod failures into one bounded issue format, capped repair feedback at 16 issues, and added regression tests for context retention, malformed JSON repair, feedback bounds, and the two-call ceiling.
- **Challenges / uncertainty:** SDK transport retries remain enabled independently of the single semantic repair because they improve resilience to transient network failures.
- **Direction changes:** None.
- **Commit:** `fix: preserve context in bounded self-repair`

## 2026-07-16 — Interview request integrity

- **Asked:** Complete the remaining interview-mode validation improvements while preserving one optional batch grading call.
- **Implemented:** Required easy-to-hard question ordering in the model prompt, enforced unique question IDs, and rejected grading requests unless answer keys match all three question IDs exactly, with schema and route tests.
- **Challenges / uncertainty:** Difficulty is a semantic teaching property, so ordering is prompt-enforced while structural identity and answer coverage are Zod-enforced.
- **Direction changes:** The mandatory code-output question remains unconditional to match the original product specification.
- **Commit:** `fix: enforce interview request invariants`

## 2026-07-16 — Focused interview progression

- **Asked:** Present one interview question at a time without adding multiple grading calls.
- **Implemented:** Added a three-stage easy-to-hard progression, answer-gated navigation, animated question transitions, one batch grading request after question three, result-by-result review, and reference answers revealed only after grading, with an end-to-end component interaction test.
- **Challenges / uncertainty:** The ideal answers already existed in the browser response; the UI now reveals them only after submission so the learning flow is explicit without increasing API calls.
- **Direction changes:** Batch grading remains one optional extra model call rather than one call per question.
- **Commit:** `feat: add focused interview progression`
