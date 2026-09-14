# GMapLists Agent State

Current task: release PR #142 after successful hosted validation. Application changes add an always-present Build check and patch development dependencies; production dependencies and generated application assets remain unchanged.

2026-09-14: The owner explicitly approved Gmaplists A. Applied the allowlist for the 11 reviewed external Action repositories to this repository only. GitHub requires full sub-action paths: the four already-reviewed CodeQL paths at the same commit replace the ineffective repository-only entry, giving 14 exact patterns for those same 11 repositories. GitHub-owned and verified publisher blanket permissions are both disabled. Every entry is a full commit SHA, and mandatory SHA pinning remains enabled. No new repository or revision was permitted.

Local validation already passed: locked npm ci, all 29 existing parsing/classification/RPC-sync/extension-version tests, TypeScript/Vite production build, and zero-finding dependency audit. Production dependency graph and all 14 built assets match the baseline.

Next steps:
- Verify all applicable hosted build/security workflows for the final PR head before merging. Build (29 tests and production compilation), Dependency Review, LFS Guard and TruffleHog passed the first approved-policy run. CodeQL and Semgrep need rerunning after the sub-action syntax correction.
- The administrative Labeler uses pull_request_target and therefore reads the still-unpinned main workflow until these reviewed pins reach main. Do not disable pinning or permit its tag to force it through.
- Verify Vercel production at the resulting merge revision with one targeted homepage check. A READY deployment does not establish monthly quota headroom.
- Preserve this repository's approved pins during shared configuration sync. Required-check enforcement, heartbeat compatibility and bot reactivation remain separate portfolio work; no protections are weakened for this release.
- Do not add capture-intent/list guards unless current sync reproduces the previously investigated wrong-count capture.

Working changes and history in the original checkout remain preserved. Supabase records, extension behavior and application runtime are unchanged by this release.
