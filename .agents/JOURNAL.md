# GMapLists Agent Journal

- 2026-08-15: Sync is intentionally RPC-only; the app must fail loudly if `sync_gmaplist` is unavailable instead of using partial chunked writes. Duplicate feature IDs are surfaced with payload positions after sync.
- 2026-08-15: `.agents/` is shared durable state per AGENTS.md, so `.gitignore` allows `.agents/` while continuing to ignore other dot-directories.


2026-09-12 — portfolio build-check repair: make the named Build check validate this application using existing fixture tests and production build/entrypoint checks. Preserve live data and existing collector behavior. No provider workflows are invoked for testing. Required-check enforcement and bot reactivation remain open because the shared heartbeat still pushes directly to main.

- [ ] Preserve original clean checkouts and work from current remote commits.
- [ ] Make GMapLists run its existing unit suite and production TypeScript/Vite build on every PR.
- [ ] Make Swiperboxd Build run the existing isolated Python and web suites; retain its legacy test workflow for manual use without duplicate automatic runs.
- [ ] Validate locally, publish small PRs, verify hosted checks and production deployments.
- [ ] Keep bot reactivation and required-check enforcement open until heartbeat direct commits are accounted for.

2026-09-12 validation: Build Check now runs 29 existing parsing, classification, RPC-sync and extension-version tests before TypeScript/Vite production compilation, on every PR and main update. Vitest/UI were patched to 4.1.11; compatible Browserslist and baseline-browser-mapping tooling updates remove all five reported dependency findings. Eighteen changed lockfile packages are development-only, the full production dependency graph is unchanged, and all 14 built assets match the pre-update baseline byte-for-byte. Locked npm ci, all 29 tests, production build and a zero-finding dependency audit pass. Application source, extension behavior, user data and Supabase configuration are unchanged by this repair. Hosted checks and production verification are next.

2026-09-12 release gate: repository Actions policy is local_only with SHA pinning required. Both PR revisions failed at workflow startup, including untouched security workflows. All 14 distinct external action references are now resolved to their existing tags' full commit SHAs for review; action versions and job behavior are preserved. Production release remains pending. A proposed allowlist contains only these exact revisions and keeps mandatory SHA pinning. The local-only restriction has not been changed. Source synchronization must preserve these pins before this can be considered durable; all currently scoped repositories' required-check enforcement and bot reactivation remain open.
