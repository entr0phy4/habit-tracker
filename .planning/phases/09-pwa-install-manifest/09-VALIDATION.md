---
phase: 9
slug: pwa-install-manifest
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-07-25
---

# Phase 9 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.10 + @testing-library/react 16.3.2 |
| **Config file** | `vite.config.ts` (`test.environment: 'jsdom'`, `setupFiles: ['./src/test/setup.ts']`) |
| **Quick run command** | `npm test -- src/platform/install.test.ts -x` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- src/platform/install.test.ts -x`
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 09-01-01 | 01 | 1 | PWA-01 | — | Static manifest only; no user input | unit | `npm test -- src/platform/manifest.test.ts -x` | ❌ W0 | ⬜ pending |
| 09-01-02 | 01 | 1 | PWA-01 | — | N/A | unit | `npm test -- src/platform/install.test.ts -x` | ❌ W0 | ⬜ pending |
| 09-02-01 | 02 | 2 | PWA-01 | T-09-01 | Static Spanish strings only | component | `npm test -- src/components/pwa/InstallBanner.test.tsx -x` | ❌ W0 | ⬜ pending |
| 09-02-02 | 02 | 2 | PWA-01 | — | N/A | component | `npm test -- src/components/pwa/IosInstallModal.test.tsx -x` | ❌ W0 | ⬜ pending |
| 09-03-01 | 03 | 2 | PWA-01 | — | N/A | component | `npm test -- src/pages/SettingsPage.test.tsx -x` | ❌ extend | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/platform/install.ts` — pure detection, localStorage, BIP singleton
- [ ] `src/platform/install.test.ts` — covers engagement, dismiss, standalone, iOS branch
- [ ] `src/platform/manifest.test.ts` — parse `public/manifest.webmanifest` for required fields/icons
- [ ] `src/components/pwa/InstallBanner.test.tsx` — engagement gating + dismiss
- [ ] `src/components/pwa/IosInstallModal.test.tsx` — numbered steps + reminder copy
- [ ] Extend `src/pages/SettingsPage.test.tsx` — install section visibility + Spanish labels
- [ ] `src/test/setup.ts` — mock `matchMedia`, `localStorage`, optional `beforeinstallprompt` CustomEvent helper

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Chrome installability criteria | PWA-01 | Lighthouse / real browser install flow | `npm run build && npm run preview`; verify manifest in DevTools Application tab; test Add to Home Screen |
| iOS Add to Home Screen flow | PWA-01 | Requires real Safari iOS device/simulator | Install on iOS Safari; confirm modal steps match actual Share sheet |
| Standalone theme colors | PWA-01 | OS chrome rendering | Open installed PWA; verify status bar / theme matches `#0d1117` |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
