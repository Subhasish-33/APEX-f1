# APEX F1 — State Management Policy

**Phase 2 Frozen.**

---

## Priority Order

State management follows a strict priority hierarchy. **Always use the lowest-complexity option that solves the problem.**

```
1. Local useState      → first choice, always
2. URL state           → for shareable/filterable state
3. useContext          → only if 3+ deeply nested components share state
4. [BANNED] Global stores → no Zustand, Redux, Jotai in Phase 2
```

---

## Level 1: Local `useState`

Use for all UI-local state:
- Dropdown open/closed
- Tab active index
- Modal visibility
- Form input values
- Loading/error states within a single component

```tsx
// ✅ Correct — dropdown state is local to Navbar
const [activeDropdown, setActiveDropdown] = useState<"drivers" | "teams" | null>(null);
```

---

## Level 2: URL State (`useSearchParams`)

Use for state that should:
- Be bookmarkable
- Be shareable via URL
- Survive page refresh

```tsx
// ✅ Correct — season selector persists in URL
// /standings?season=2024
const searchParams = useSearchParams();
const season = Number(searchParams.get("season")) || 2025;
```

Use `useRouter().push` to update URL state. Never duplicate URL state into `useState`.

---

## Level 3: `useContext`

Use **only** when:
- 3 or more deeply nested components need the same value
- Prop drilling would span more than 2 levels
- The shared state is truly global to a feature (not the whole app)

**Scope context to the smallest subtree that needs it.** Never put a context provider in `app/layout.tsx` unless it is genuinely needed on every page.

```tsx
// ✅ Correct — scoped to the race detail page subtree
// app/races/[id]/layout.tsx
<RaceDataProvider race={race}>
  {children}
</RaceDataProvider>

// ❌ WRONG — wrapping the entire app
// app/layout.tsx
<SomeGlobalProvider> ← never do this unless absolutely necessary
  {children}
</SomeGlobalProvider>
```

---

## Banned Patterns

| Pattern | Reason |
|---|---|
| Global orchestration context | Deleted in Phase 2 — caused full-tree re-renders |
| `setTimeout` state machines | Non-deterministic, thermal hazard |
| State that mirrors the URL | Duplication causes sync bugs |
| Context for data that comes from the API | Use RSC + props instead |
| Zustand / Redux / Jotai | Premature abstraction for Phase 2 scope |

---

## OrchestrationContext — Post-Mortem

The `OrchestrationContext` from Phase 1 was a global state machine with steps:
`IDLE → CAMERA_MOVING → SETTLE → REVEAL → FOCUSED → SUSPENSE → ERROR → RESOLVE`

**Why it was deleted:**
1. Every `setStep` call re-rendered every consumer (`AudioEngine`, `TelemetryHUD`, `CarViewer3D`)
2. The steps drove `setTimeout` chains that couldn't be cancelled safely
3. It controlled audio, camera, and UI simultaneously — no single component could be understood in isolation
4. It was never driven by real data — it was a cinematic simulation

**The replacement:** Each component manages its own local state. No shared animation orchestration.
