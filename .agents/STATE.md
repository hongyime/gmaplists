# GMapLists Agent State

**Last updated:** 2026-09-24 (opencode/Sisyphus)

## Current task
Unit test coverage added for 4 previously-untested `src/services/` modules.
Task is complete — no follow-up required unless new gaps are found.

## What was done
- Added `src/services/__tests__/autoTagMeasurement.test.ts`,
  `browserStorage.test.ts`, `mapLinkService.test.ts`, `privacy.test.ts`
  (25 new test cases total, on top of the 29 pre-existing ones — 54 total now).
- No CI changes needed: `.github/workflows/ci.yml` already runs `npm test`
  (`vitest run`, auto-discovers `**/*.test.ts`) and `npm run build`
  (`tsc && vite build`) on every push/PR to `main`.
- `privacy.test.ts` deliberately treats `src/services/privacy.ts` (contributor
  PII stripping from Google Maps getlist responses) with the same rigor as a
  security-sensitive module: every guard function has both a clean-input and
  an adversarial-leak-input test.

## A subtlety worth remembering for future test-writing here
`classifyPlaceByRules` (in `categoryRules.ts`) gives a place's **note text**
priority over its name/label when the note matches ANY `RULE_FAMILIES` term —
not just when `categoryFromFoodDescriptiveNote`'s separate, smaller
`NOTE_LABELS` list matches. A first draft of the `validateAgainstFoodNotes`
test picked "Quiet Museum" + note "amazing bar scene" expecting a name-vs-note
mismatch, but the note itself matched `drink.alcohol`'s "bar" term in
`RULE_FAMILIES`, so the *actual* classification silently became "Drink" too
(matching the note-derived "expected" value) — no mismatch, test failed in CI.
Fixed by using a note ("nice view here") whose only match is in the smaller
`NOTE_LABELS` list ("view") but not in `RULE_FAMILIES` (which only has
"viewpoint"/"lookout"), so the actual classification correctly falls through
to the name match instead. If you add more `validateAgainstFoodNotes` tests,
check both term lists before assuming a note won't affect the actual
classification.

## Next steps
None required. Untested surfaces remaining if extending further:
`src/services/supabaseClient.ts` (thin client wrapper), `parser.worker.ts`
(Web Worker), and the React components under `src/components/`.
