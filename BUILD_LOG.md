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

## 2026-07-16 — Correct showcase process states

- **Asked:** Fix release-blocking correctness errors in the OAuth, closures, caching, and event-loop showcase diagrams before further feature work.
- **Implemented:** Removed the position-string Stepper factory and replaced its three generated examples with explicit lifecycle-aware specs where artifacts may be absent; corrected the event-loop stack to contain only the executing script; and added regression tests for token boundaries, closure binding identity, cache value creation, and stack-frame accuracy.
- **Challenges / uncertainty:** The Stepper chip label is immutable across steps, so the closure uses one stable `count binding` chip while narration describes its value changing from 0 to 1. This accurately visualizes binding identity without implying a copied value.
- **Direction changes:** Replaced the generic compact encoding with deliberate hand-authored states, as requested.
- **Commit:** `fix: correct showcase process states`

## 2026-07-16 — Correct showcase playground math

- **Asked:** Replace fake constant-multiplier charts in the showcase with mathematically faithful, concept-specific curves.
- **Implemented:** Removed the generic Playground factory; modeled Big-O as n² versus n, indexing as n versus ⌈log₂ n⌉ with a scale-dependent gap, trailing debounce as one call per continuous burst, and the 90% cache hit rate as 10% origin load. Added regression tests for every mathematical invariant.
- **Challenges / uncertainty:** A production B-tree has a high branching factor and usually less work than log₂ n; the chart is explicitly labeled as relative theoretical work and the explanation states that simplification. Debounce explicitly assumes events remain inside one delay window.
- **Direction changes:** Retained the cache hit-rate relationship because validation confirmed it was already mathematically correct, but rewrote it as an explicit concept-owned spec.
- **Commit:** `fix: correct showcase playground math`

## 2026-07-16 — Align caching showcase promise

- **Asked:** Correct the incoherent caching showcase as part of the release-blocking content audit.
- **Implemented:** Renamed and rewrote the showcase summary to promise the cache-miss lifecycle it actually visualizes, with a regression assertion alongside the lifecycle checks.
- **Challenges / uncertainty:** A linear Stepper cannot honestly present both hit and miss branches without a branching archetype, so the copy now precisely scopes the existing explorable.
- **Direction changes:** Chose accurate scope over implying a cache-hit branch that is not rendered.
- **Commit:** `fix: align caching showcase promise`

## 2026-07-17 — Add bounded AI request limiters

- **Asked:** Protect the public AI endpoints from judge traffic and casual abuse without adding infrastructure outside the hackathon scope.
- **Implemented:** Added a dependency-free, bounded-memory token bucket and an idempotent per-instance concurrency limiter, with deterministic tests for bursts, refill timing, client isolation, memory bounds, and lease release.
- **Challenges / uncertainty:** Serverless instances do not share memory and may recycle at any time, so this is intentionally documented as best-effort protection rather than a distributed quota.
- **Direction changes:** Kept the implementation in-memory as requested; no database or external rate-limit service was introduced.
- **Commit:** `feat: add bounded AI request limiters`

## 2026-07-17 — Protect public AI routes

- **Asked:** Enforce the launch safeguards on live generation and Interview mode, with graceful behavior under load.
- **Implemented:** Added a shared per-IP admission guard with a six-request burst, one-token-per-20-second refill, and four-request per-instance concurrency ceiling; applied it before body parsing on both AI routes; returned friendly `429` or `503` JSON with `Retry-After`; exposed remaining quota headers; and guaranteed lease release with `finally` blocks.
- **Challenges / uncertainty:** IP-based limiting can group users behind a shared NAT, so the burst permits a complete generation-plus-interview flow and a level rerun before throttling sustained traffic.
- **Direction changes:** Protected `/api/interview` as well as `/api/generate` because question generation and grading both spend model capacity.
- **Commit:** `feat: protect public AI routes`

## 2026-07-17 — Document AI deployment safeguards

- **Asked:** Keep the OpenAI key funded and the public demo dependable through judging traffic.
- **Implemented:** Documented the in-app limits and their serverless boundaries, plus the manual launch checklist for a dedicated restricted OpenAI project, model-level rate limits, layered budget alerts, and offline-path verification.
- **Challenges / uncertainty:** OpenAI project monthly budgets are monitoring thresholds rather than hard caps, so the documentation explicitly avoids presenting them as an enforcement boundary.
- **Direction changes:** Separated account-level configuration from repository code because those controls require the project owner in the OpenAI dashboard.
- **Commit:** `docs: document AI deployment safeguards`

## 2026-07-17 — Repair live structured generation

- **Asked:** Exercise the locally configured OpenAI key through the real Grasp UI and verify the production flow.
- **Implemented:** Reproduced the live failures across generation and Interview mode; added an object-rooted generation envelope; represented dynamic Playground maps as bounded identifier/value arrays on the model wire; normalized them back into renderer records; made optional model fields required-but-nullable; and added SDK conversion plus normalization regression tests.
- **Challenges / uncertainty:** The key, quota, model, and plain Responses API path were healthy. Grasp's schemas violated three structured-output constraints: a root union, arbitrary-key records that emit unsupported `propertyNames`, and optional fields that were not nullable.
- **Direction changes:** Added a transport-only schema tailored to OpenAI's strict JSON Schema subset while preserving the existing renderer schema, Zod trust boundary, complete scenario validation, and one-repair behavior.
- **Commit:** `fix: repair live structured generation`

## 2026-07-17 — Support local live quality diagnostics

- **Asked:** Keep production limits unchanged while allowing the local quality harness to exercise many real generations and reveal why repaired outputs still fail.
- **Implemented:** Added an explicit AI-guard bypass that works only outside production, returned compact Zod validation issues only in non-production generation errors, and added regression tests proving the bypass and diagnostics cannot leak into production behavior.
- **Challenges / uncertainty:** The harness needs enough throughput for stochastic sampling, but the production limiter is a launch safeguard and must remain impossible to bypass through deployment configuration.
- **Direction changes:** Kept all bypass and diagnostic behavior runtime-gated to local/non-production environments; no production limit was altered.
- **Commit:** `test: support local live quality diagnostics`

## 2026-07-17 — Add local live generation harness

- **Asked:** Keep and improve the throwaway harness used locally to sample real model outputs and turn discovered quality problems into product fixes.
- **Implemented:** Added 28 diverse generation cases, per-result JSON artifacts, a Markdown summary, Stepper and Playground heuristics, focused reruns, local-target enforcement, bounded concurrency, validated case selection, immediate result persistence, and compact validation diagnostics. Added a dedicated npm command and ignored generated run artifacts.
- **Challenges / uncertainty:** Live generations are stochastic and billable, so the harness is intentionally local-only and remains outside CI; semantic correctness still requires human review after automated structural flags.
- **Direction changes:** Explicitly separated comprehensive local quality runs from production rate-limit smoke testing; the harness cannot target a deployed host.
- **Commit:** `test: add local live generation harness`

## 2026-07-17 — Enforce generated explainer quality

- **Asked:** Use the local harness findings to improve the product while keeping all testing bypasses out of production.
- **Implemented:** Strengthened archetype selection and Stepper construction guidance, required live-generated steppers to move at least one stable chip, rejected declared chips that never appear, and added regression tests for both generation-only invariants.
- **Challenges / uncertainty:** Structural validation can guarantee visible movement and internal consistency, but semantic correctness remains a human-review concern; the rules therefore target the repeated, objectively detectable failures without over-constraining valid explanations.
- **Direction changes:** Applied stricter invariants only to fresh model output so verified showcase specs and offline shared URLs retain their stable compatibility boundary.
- **Commit:** `fix: enforce generated explainer quality`
