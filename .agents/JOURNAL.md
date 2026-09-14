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

2026-09-12 portfolio checkpoint v44 is published and hash-verified at https://aoo181uudk96.postplan.dev; desktop/mobile, keyboard, calculator, no-JavaScript and HTML-structure checks pass. All 26 deployed Vercel projects are READY, 26 public homepages return HTTP 200 and the requested one-hour runtime summaries report no errors. GMapLists PR #142 remains open at e514948eb7595aaec738b46ad1f5ee1666c9a281. Its final Vercel preview is READY, but seven GitHub workflows fail at startup under the unchanged local-only policy. The owner's choice on the exact pinned-action allowlist remains pending; do not infer approval or merge without successful hosted checks. Required-check enforcement, heartbeat compatibility and bot reactivation remain open. Continue the broader repository rotation.

2026-09-14 — Owner approved Gmaplists A: applied exactly the reviewed 11 external Action commit pins to this repository, with mandatory SHA pinning retained and both blanket publisher permissions false. Release PR #142 only after its final hosted build/security validation passes; verify exact production revision. No paid services or data changes.
