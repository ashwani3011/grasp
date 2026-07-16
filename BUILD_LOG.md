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
