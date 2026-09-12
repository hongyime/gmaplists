# GMapLists Agent State

Current status: local `main` and `origin/main` are at `37484da`. Source contains RPC-only sync and duplicate diagnostics, and the working tree is clean.

Recent completed work:
- Removed the chunked fallback sync path. `syncListToSupabase` now requires `sync_gmaplist` and fails loudly if the RPC is unavailable.
- Added sync duplicate diagnostics: received count, unique count, removed count, and duplicate `feature_id` payload positions.
- Backed out held scope from the previous session: capture intent guard, durable sync replay notice, and queue current-place restore.
- Bumped app marker to `2026.08.10.3` and extension marker to `0.1.16`.

Next safe steps:
- `npm audit --audit-level=moderate`, `npm test`, and `npm run build` passed on 2026-08-15.
- Vercel project `gmaplists` auto-deployed recent `main` commits successfully when checked on 2026-08-15; re-check Vercel before making production claims.
- User planned to run a real sync next; do not add capture intent/list guard unless a current-code sync reproduces the wrong-count capture.


2026-09-12 — portfolio build-check repair: make the named Build check validate this application using existing fixture tests and production build/entrypoint checks. Preserve live data and existing collector behavior. No provider workflows are invoked for testing. Required-check enforcement and bot reactivation remain open because the shared heartbeat still pushes directly to main.

- [ ] Preserve original clean checkouts and work from current remote commits.
- [ ] Make GMapLists run its existing unit suite and production TypeScript/Vite build on every PR.
- [ ] Make Swiperboxd Build run the existing isolated Python and web suites; retain its legacy test workflow for manual use without duplicate automatic runs.
- [ ] Validate locally, publish small PRs, verify hosted checks and production deployments.
- [ ] Keep bot reactivation and required-check enforcement open until heartbeat direct commits are accounted for.

2026-09-12 validation: Build Check now runs 29 existing parsing, classification, RPC-sync and extension-version tests before TypeScript/Vite production compilation, on every PR and main update. Vitest/UI were patched to 4.1.11; compatible Browserslist and baseline-browser-mapping tooling updates remove all five reported dependency findings. Eighteen changed lockfile packages are development-only, the full production dependency graph is unchanged, and all 15 built assets match the pre-update baseline byte-for-byte. Locked npm ci, all 29 tests, production build and a zero-finding dependency audit pass. Application source, extension behavior, user data and Supabase configuration are unchanged by this repair. Hosted checks and production verification are next.
