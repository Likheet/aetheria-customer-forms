# CLEANUP REPORT

## Deleted Files
| Path | Reason |
| --- | --- |
| app/layout.tsx | Unused Next.js layout scaffolding |
| app/page.tsx | Unused Next.js entry page |
| components/(form-*, fields/*, ui/*, greeting.tsx, header.tsx, lights.tsx, logo.tsx, thank-you.tsx, theme-provider.tsx, v0-setup.tsx) | Legacy Next.js form demo assets no longer referenced |
| src/components/UpdatedConsultForm.backup.tsx | Legacy backup of updated consult UI |
| src/components/UpdatedConsultFormNew.tsx | Experimental form variant never linked |
| src/components/UpdatedConsultFormWithConcerns.tsx | Experimental form variant never linked |
| src/components/DecisionEngineDemo.tsx | Demo harness, unused at runtime |
| src/components/DecisionEngineTestPage.tsx | Demo harness, unused at runtime |
| src/components/RealTimeConflictTest.tsx | Conflict test harness, unused |
| src/components/WelcomePage.tsx | Legacy New Client Consultation welcome view |
| src/components/ProgressBar.tsx | Legacy New Client Consultation progress UI |
| src/components/steps/* | Legacy New Client Consultation step components |
| src/services/consultationService.ts | Legacy Supabase API for removed flow |

## Config Fixes
| Path | Change |
| --- | --- |
| postcss.config.mjs | Switched to Tailwind v3 plugins (`tailwindcss`, `autoprefixer`) instead of `@tailwindcss/postcss` |
| eslint.config.mjs | Replaced Next.js flat-compat setup with TypeScript/React flat config to unblock lint/knip |
| package.json | Added dev dependency `tsx` and `eslint-plugin-react` for updated tooling |
| package-lock.json | Regenerated after dependency additions/removals |
| src/lib/decisionRules.ts | Removed default export to avoid duplicate export warnings |
| src/lib/decisionRulesUtil.ts | Updated to use named import for `RULE_SPECS` |
| src/lib/decisionEngine.ts | Updated to use named import for `RULE_SPECS` |
| knip.json | Added `src/workers/productSearch.worker.ts` to ignore list |

## Dependencies Removed
| Package | Scope | Reason |
| --- | --- | --- |
| @coreui/coreui | dependencies | Unused after legacy form removal |
| @coreui/react-pro | dependencies | Unused after legacy form removal |
| @radix-ui/react-popover | dependencies | UI primitive no longer referenced |
| @radix-ui/react-slot | dependencies | UI primitive no longer referenced |
| class-variance-authority | dependencies | Style helper unused post-cleanup |
| clsx | dependencies | Style helper unused post-cleanup |
| date-fns | dependencies | Legacy form helper unused |
| flexsearch | dependencies | Legacy search helper unused |
| react-day-picker | dependencies | Legacy UI component unused |
| tailwind-merge | dependencies | Style helper unused post-cleanup |

## Remaining Ignores
| Pattern | Reason |
| --- | --- |
| node_modules/** | Exclude installed dependencies from analysis |
| .next/** | Historical Next.js output directory (kept for tooling parity) |
| dist/** | Vite build artifacts |
| **/*.d.ts | Generated declaration files |
| src/workers/productSearch.worker.ts | Worker bundled by Vite and consumed in production |
| app/**/*.{ts,tsx,js,jsx} | Legacy glob retained for tooling consistency |
| components/**/*.{ts,tsx,js,jsx} | Legacy glob retained for tooling consistency |
| pages/**/*.{ts,tsx,js,jsx} | Legacy glob retained for tooling consistency |
