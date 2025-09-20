# MIGRATION NOTES

## Commands & Findings
- `npx knip` -> reports remaining unused files/dependencies (see CLEANUP_REPORT.md). No config load errors after ESLint/PostCSS fixes.
- `npm run tsprune` -> clean (no unused exports detected by ts-prune).
- `npx tsc --noEmit` -> type-check passes.
- `npm run build` -> success (Vite build; bundle size warning persists >500 kB).
- `npx depcheck --skip-missing` -> basis for removing unused deps (now uninstalled).
- `rg`/`ast-grep` validations confirmed removal of legacy Next.js scaffolding and updated-consult backups.
- `rg -n "New Client Consultation"` & subtitle -> no matches (legacy UI fully removed).

## Assets Deleted
Tracked in `delete_manifest.json` and summarized in `CLEANUP_REPORT.md`.

## Notes & Follow-ups
- `src/components/ConflictResolutionDialog.tsx`, `src/hooks/useConflictResolution.ts`, and other decision-engine demo utilities remain unused per knip; validate before future removal.
- Tooling globs (`app/**`, `components/**`, `pages/**`) remain in `knip.json` to preserve historical coverage; prune once directory layout stabilizes.
- Bundle size warning from Vite still needs addressing (consider chunk splitting or manual chunks).
