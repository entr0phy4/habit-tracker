# Phase 4: Data Backup & Restore - Pattern Map

**Mapped:** 2026-07-22
**Files analyzed:** 14
**Analogs found:** 14 / 14

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/domain/types.ts` | types | — | self (add `BackupPayload`) | exact |
| `src/domain/backupSchema.ts` | utility | transform | `src/domain/types.ts` + Zod (new) | partial |
| `src/domain/backupSchema.test.ts` | test | — | `src/domain/streak.test.ts` | role-match |
| `src/infrastructure/backupService.ts` | service | CRUD | `src/infrastructure/habitRepository.ts` | role-match |
| `src/infrastructure/backupService.test.ts` | test | CRUD | `src/infrastructure/habitRepository.test.ts` | exact |
| `src/pages/SettingsPage.tsx` | route | event-driven | `src/pages/ManageHabitsPage.tsx` + `HabitEditPage.tsx` | role-match |
| `src/pages/SettingsPage.test.tsx` | test | event-driven | `src/pages/TodayPage.test.tsx` | role-match |
| `src/App.tsx` | config | request-response | self | exact |
| `src/pages/TodayPage.tsx` | route | — | self (headerAction) | exact |
| `src/pages/TodayPage.test.tsx` | test | — | self | exact |
| `package.json` | config | — | self (add zod) | exact |
| `src/components/habits/ConfirmDialog.tsx` | component | — | self (reuse) | exact |
| `src/components/layout/AppShell.tsx` | layout | — | self (reuse) | exact |
| `src/domain/dates.ts` | utility | — | self (`getLocalDateString` for filename) | exact |

---

## Pattern Assignments

### `src/domain/types.ts` — MODIFY

**Analog:** self

Add:
```typescript
export interface BackupPayload {
  version: 1;
  exportedAt: string;
  habits: Habit[];
  completions: Completion[];
}
```

---

### `src/domain/backupSchema.ts` (utility, transform) — CREATE

**Analog:** domain pure modules (`streak.ts`, `stats.ts`) + STACK Zod convention

**Rules:**
- Zero imports from `infrastructure/` or React
- Export Zod schemas + `parseBackupJson(raw: string): ParseBackupResult`
- Discriminated result: `{ ok: true, data } | { ok: false, error: 'invalid' | 'unsupported_version' }`

**Frequency schema mirrors types.ts:**
```typescript
const frequencySchema = z.union([
  z.object({ type: z.literal('daily') }),
  z.object({
    type: z.literal('weekly'),
    days: z.array(z.number().int().min(0).max(6)),
  }),
]);
```

**Version short-circuit:** After successful `JSON.parse`, if value is object with own `version` and `version !== 1`, return `unsupported_version` before full Zod parse (D-15).

---

### `src/infrastructure/backupService.ts` (service, CRUD) — CREATE

**Analog:** `habitRepository.ts` transaction pattern

```typescript
// habitRepository.delete — reuse this transaction shape
await db.transaction('rw', db.habits, db.completions, async () => {
  await db.habits.clear();
  await db.completions.clear();
  await db.habits.bulkAdd(payload.habits);
  await db.completions.bulkAdd(payload.completions);
});
```

**Exports:**
- `exportBackup(): Promise<BackupPayload>` — `toArray()` both tables; `version: 1`; `exportedAt: new Date().toISOString()`
- `importBackup(payload: BackupPayload): Promise<void>` — assumes already validated; transactional replace
- `buildBackupFilename(today?: Date): string` — `habit-tracker-backup-${getLocalDateString(today)}.json`
- `downloadBackupJson(payload, filename): void` — Blob + object URL + `<a download>` + revoke

**Do not** filter archived habits on export (D-07).

---

### `src/infrastructure/backupService.test.ts` — CREATE

**Analog:** `habitRepository.test.ts`

```typescript
beforeEach(async () => {
  await db.delete();
  await db.open();
  await db.habits.clear();
  await db.completions.clear();
});
```

Cover: empty export; round-trip replace; import leaves prior data when transaction throws (mock `bulkAdd` to throw after clear is inside same txn — assert prior rows remain); filename local date.

---

### `src/pages/SettingsPage.tsx` (route) — CREATE

**Analog:** `ManageHabitsPage` shell + `HabitEditPage` ConfirmDialog

**Structure:**
```tsx
<AppShell title="Ajustes">
  <Link to="/">… Volver</Link>
  <section>
    <h2>Copia de seguridad</h2>
    <Button>Exportar datos</Button>
    <Button variant="outline">Importar backup</Button>
    <input type="file" accept=".json,application/json" className="hidden" />
  </section>
  <ConfirmDialog destructive … />
</AppShell>
```

**Flow:**
1. Export → `exportBackup` → `downloadBackupJson` → `toast.success('Backup exportado')`
2. Import click → trigger hidden file input
3. File selected → `FileReader` / `file.text()` → `parseBackupJson`
4. invalid → `toast.error('Archivo no válido')`; unsupported → `toast.error('Versión de backup no compatible')`
5. ok → store pending payload in state → open ConfirmDialog with counts
6. Confirm → `importBackup` → success toast → `navigate('/')`; failure → Spanish error toast, keep current route

---

### `src/App.tsx` — MODIFY

Add outside MainLayout:
```tsx
<Route path="/settings" element={<SettingsPage />} />
```

---

### `src/pages/TodayPage.tsx` — MODIFY

**headerAction** becomes flex row:
- Existing `Link` to `/habits/manage` ("Manage habits")
- New `Link` to `/settings` with `Settings` icon from lucide-react, `aria-label="Ajustes"`, `min-h-11 min-w-11` touch target

Do **not** add gear to DashboardPage.

---

## Anti-Patterns to Avoid

| Anti-pattern | Instead |
|--------------|---------|
| Clear tables then validate | Validate → confirm → transaction |
| Import via habitRepository.create loops | `bulkAdd` inside one transaction |
| English Settings copy | Spanish per UI-SPEC |
| `services/backupService.ts` new folder | `infrastructure/backupService.ts` |
| Gear replaces Manage link | Keep both |

## Pattern Completeness

- [x] All planned new files have an analog
- [x] Transaction pattern cited from habitRepository
- [x] Route visibility pattern matches Phase 3 MainLayout split
- [x] ConfirmDialog reuse documented
