# APEX-F1 — Rendering Architecture Policy

**Status: Phase 2 Frozen**

## Core Principle
APEX-F1 uses a **Server-First** architecture. The frontend must remain available and interactive even if the backend is slow or the user has a low-powered device.

---

## 1. Component Strategy

### Server Components (Default)
- All pages and layout components **must** be Server Components by default.
- Data fetching for static or historical F1 data (e.g., season results, team lists) **must** happen on the server.
- No "use client" at the page level unless orchestration is required.

### Client Components ("use client")
Only use when:
- **Interactivity**: Event listeners (`onClick`, `onChange`).
- **State/Hooks**: `useState`, `useReducer`, `useEffect`.
- **Browser APIs**: `window`, `localStorage`, `IntersectionObserver`.
- **Motion**: Complex `framer-motion` animations that require layout projection.

---

## 2. Boundary Rules

- **Strict Separation**: Keep client components at the leaves of the tree.
- **Forbidden**: 
  - Nested client boundaries (Client component inside a Client component where one could be Server).
  - Giant "Provider" wrappers that wrap the entire `layout.tsx` (unless absolutely required for global state).
  - Client-side fetching for data that is available at build time.
- **Prop Drilling**: Max 3 levels. If you need more, consider a specialized Context or a Server Component refactor.

---

## 3. Data Integrity & Safety

- **Null-Safe Rendering**: Every component must handle `undefined` or `null` data gracefully.
- **Skeletons**: Every data-heavy route must have a corresponding `loading.tsx` or `Suspense` boundary.
- **Error Handling**: Every major feature area must be wrapped in an `ErrorBoundary` or use a route-level `error.tsx`.

---

## 4. API Usage

- All data fetching must go through the `apiSafe` layer in `lib/api-safe.ts`.
- Use `fetch` with appropriate caching headers (Next.js `tags` and `revalidate`).
- **Build Safety**: Data fetching during `pnpm build` must never crash the build. Use fallbacks for environment variables.

---

## 5. Performance Gate

- **Hydration**: Zero hydration warnings permitted.
- **Layout Shift**: Ensure all images and dynamic containers have reserved space.
- **Bundle Size**: Monitor the impact of third-party libraries (e.g., `recharts`, `framer-motion`). Use `dynamic()` imports for heavy client components.
