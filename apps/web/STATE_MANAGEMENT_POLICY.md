# APEX-F1 — State Management Policy

**Status: Phase 2 Frozen**

To prevent "Context Abuse" and "Prop Drilling Entropy," we follow a strict state hierarchy.

## 1. State Hierarchy

| Type | When to Use | Tool |
|---|---|---|
| **Server State** | Data from the F1 API. | Server Components / `fetch` |
| **URL State** | Filters, active driver, selected season, tabs. | `useSearchParams`, `usePathname` |
| **Local State** | UI toggles, temporary input, hover states. | `useState`, `useReducer` |
| **Global State** | Authentication, user preferences, high-freq telemetry. | **Forbidden** (until explicitly approved) |

---

## 2. Rules

- **URL as Truth**: Any state that should survive a page refresh (e.g., "Selected Season") **must** be stored in the URL.
- **No Redux/Zustand**: Do not introduce global state libraries without a formal architectural review.
- **Context Boundaries**: Keep Context providers localized to the routes that need them (e.g., a `RaceContext` only for `/race/[id]`).
- **Server Propagation**: Pass data from Server Components to Client Components via props. If drilling exceeds 3 levels, reconsider the component split.
