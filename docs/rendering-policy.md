# APEX F1 — Rendering Policy

**Phase 2 Frozen — All component decisions must follow these rules.**

---

## Rule 1: Server Components by Default

Every new file in `app/` is a **React Server Component (RSC)** unless it explicitly requires:
- `useState` / `useReducer`
- `useEffect` / `useCallback` / `useRef`
- Browser-only APIs (`window`, `document`, `localStorage`)
- Event handlers (`onClick`, `onMouseEnter`, etc.)

If none of the above apply, **do not add `"use client"`.**

---

## Rule 2: `"use client"` Boundary Rules

- Place `"use client"` as **low** in the tree as possible.
- Never put `"use client"` on a page-level file if only one child needs it.
- A client component can still render server component children via `children` prop.

**Correct pattern:**
```tsx
// app/drivers/page.tsx — Server Component (no "use client")
import { DriverList } from "@/components/DriverList"; // Server
import { DriverSearch } from "@/components/DriverSearch"; // Client

export default async function DriversPage() {
  const drivers = await api.getDrivers();
  return (
    <>
      <DriverSearch /> {/* Client island */}
      <DriverList drivers={drivers} /> {/* Server renders */}
    </>
  );
}
```

---

## Rule 3: Charts Must Be Dynamically Imported

All Recharts components **must** use `next/dynamic` with `ssr: false`.

```tsx
// ✅ CORRECT
const BarChart = dynamic(() => import("recharts").then((m) => m.BarChart), { ssr: false });

// ❌ BANNED
import { BarChart } from "recharts";
```

Rationale: Recharts is ~300KB. Including it in the SSR bundle adds it to every page's initial load.

---

## Rule 4: 3D Components Must Be Dynamically Imported

All Three.js / R3F Canvas components **must** use `next/dynamic` with `ssr: false`.

```tsx
const Car3D = dynamic(() => import("@/components/Car3D"), { ssr: false });
```

**Additional R3F rules (thermal safety):**
- `frameloop="demand"` — MANDATORY on all `<Canvas>` elements
- `dpr={[1, 1.5]}` — MANDATORY. Never `dpr={[1, 2]}`.
- `powerPreference="default"` — NOT `"high-performance"` (forces discrete GPU)
- No `<View>` tunneling architecture (deleted in Phase 2)
- No `<Preload all />` (loads all assets eagerly)

---

## Rule 5: No Global Canvas Architecture

The singleton `SceneCanvas` with `View.Port` tunneling is **permanently deleted**.

- Each 3D component creates its own `<Canvas>` mounted only when the component is visible
- Use `IntersectionObserver` (via `react-intersection-observer`) to gate Canvas mounting
- Unmount Canvas when component leaves the viewport

---

## Rule 6: No Animation Wrapper Pyramids

```tsx
// ❌ BANNED — nested animation providers
<AnimatePresence>
  <motion.div>
    <AnimatePresence>
      <motion.div>
        <AnimatePresence>
          ...
```

- Max 1 level of `AnimatePresence` per feature
- Prefer CSS transitions for hover states and simple show/hide
- Framer Motion reserved for: page transitions, data reveals, complex gesture interactions

---

## Rule 7: No Auto-Playing Animations

All animations triggered by:
- ✅ User action (click, hover, focus)
- ✅ `IntersectionObserver` (element enters viewport)
- ❌ Page load (no auto-playing loops)
- ❌ `setInterval`-driven animation (except countdown timers)

**Banned patterns:**
```tsx
// ❌ Infinite CSS animation on static elements
className="animate-[dash_8s_linear_infinite]"
className="animate-pulse" // on decorative, non-status elements

// ❌ setTimeout chain for "cinematic sequences"
setTimeout(() => setStep("SETTLE"), 800);
setTimeout(() => setStep("REVEAL"), 1200);
```

---

## Rule 8: Suspense Boundaries

- Every async RSC that fetches data must have a `<Suspense>` wrapper with a `<Skeleton>` fallback
- Skeleton heights must **exactly match** the rendered content height (prevents CLS)
- Do not nest multiple `<Suspense>` boundaries for the same data dependency

---

## Summary Table

| Pattern | Status |
|---|---|
| RSC by default | ✅ Required |
| Dynamic Recharts import | ✅ Required |
| Dynamic Three.js import | ✅ Required |
| `frameloop="demand"` on Canvas | ✅ Required |
| `dpr={[1, 1.5]}` on Canvas | ✅ Required |
| CSS transitions for nav/hover | ✅ Required |
| Global canvas (`SceneCanvas`) | ❌ Deleted |
| `dpr={[1, 2]}` on Canvas | ❌ Banned |
| `animate-pulse` on decorative UI | ❌ Banned |
| Infinite CSS animation loops | ❌ Banned |
| Nested AnimatePresence pyramids | ❌ Banned |
| `Math.random()` in render | ❌ Banned |
| setTimeout animation chains | ❌ Banned |
