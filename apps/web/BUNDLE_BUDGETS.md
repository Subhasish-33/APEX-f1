# APEX-F1 — Bundle Governance & Budgets

**Status: Phase 2 Frozen**

To maintain a "fast and light" experience on MacBook Air and mobile devices, we enforce strict bundle budgets.

## 1. Hard Limits (Gzipped)

| Resource | Goal | Max (Critical) |
|---|---|---|
| **First Load JS** | < 150 KB | 200 KB |
| **Total JS per Route** | < 250 KB | 350 KB |
| **Common / Vendor Chunk** | < 80 KB | 100 KB |
| **Initial CSS** | < 20 KB | 30 KB |
| **Total Image Payload** | < 500 KB | 1 MB |

---

## 2. Optimization Mandates

- **Dynamic Imports**: Any client component > 20KB (e.g., charts, 3D viewers) **must** be loaded via `next/dynamic`.
- **Tree Shaking**: Verify that large libraries like `lucide-react` or `recharts` are being correctly tree-shaken.
- **Icon Strategy**: Use only specific icon imports. Avoid `import { ... } from 'lucide-react'`.
- **Image Compression**: All images in `public/` must be optimized (WebP/AVIF).

---

## 3. Governance
- CI will run `next build` and analyze bundle sizes.
- **Fail Condition**: If any route exceeds the "Max (Critical)" threshold, the PR is blocked.
- Use `pnpm build:analyze` locally to audit regressions.
