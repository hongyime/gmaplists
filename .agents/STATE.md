# GMapLists Agent State

Current task: expanded Vitest unit-test coverage over previously-untested service modules. Four new specs under `src/services/__tests__/` cover `autoTagMeasurement.ts`, `browserStorage.ts`, `mapLinkService.ts` and `privacy.ts` (the contributor-PII stripper). Application source, extension behavior, Supabase configuration and production dependency graph are unchanged; this is a test-only change and gates on the always-present Build check.

Prior context — 2026-09-14: The owner explicitly approved Gmaplists A. Applied the allowlist for the 11 reviewed external Action repositories to this repository only. GitHub requires full sub-action paths: the four already-reviewed CodeQL paths at the same commit replace the ineffective repository-only entry, giving 14 exact patterns for those same 11 repositories. GitHub-owned and verified publisher blanket permissions are both disabled. Every entry is a full commit SHA, and mandatory SHA pinning remains enabled. No new repository or revision was permitted.

Local validation (2026-09-24): all 4 new specs and the 8 pre-existing specs run green under `vitest run` (56 tests total; the untouched `versionConsistency.test.ts` only fails when executed from a copied-out temp checkout because it reads `extension/manifest.json` relative to `process.cwd()` — inside the real repo checkout it passes as before). TypeScript `--noEmit` is clean for the new test files. The push flowed through the GitHub git DB API because local git/npm commands hang on this SMB-mounted checkout.

Next steps:
- Verify the automatic push-triggered Build workflow on `main` reports success for the new test suite. If a hosted rerun surfaces environment-specific flakiness in any of the new specs, adjust that spec only — do not weaken assertions to make it green.
- Preserve this repository's approved SHA pins during shared configuration sync. Required-check enforcement, heartbeat compatibility and bot reactivation remain separate portfolio work; no protections are weakened for this test coverage change.
- Continue the broader repository rotation. Do not add capture-intent/list guards unless current sync reproduces the previously investigated wrong-count capture.

Working changes and history in the original checkout remain preserved. Supabase records, extension behavior and application runtime are unchanged by this test-only change.
