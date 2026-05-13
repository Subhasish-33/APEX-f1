# APEX-F1 Media Pipeline Governance

## 1. Structure
All driver assets are stored in: `apps/web/public/assets/drivers/[ref]/`

Each folder MUST contain:
- `hero.webp`: High-fidelity render for profile headers.
- `casual.webp`: Lifestyle/Editorial shot for biographies.
- `blur.webp`: 20px wide low-res placeholder for lazy loading.

## 2. Naming Conventions
- All paths must be lowercase.
- Use snake_case for driver references (e.g., `verstappen`, `lewis_hamilton`).
- No spaces or special characters in filenames.

## 3. Performance Budgets
- **Hero Image**: Max 450kb (Target 250kb).
- **Casual Image**: Max 350kb (Target 180kb).
- **Blur Placeholder**: Max 5kb.
- **LCP Target**: < 2.0s on 4G.

## 4. Optimization Workflow
1. Upload raw images to `scratch/driver_uploads/` using the format `[ref]_[type].[ext]`.
2. Run `pnpm ts-node scripts/media/optimize-driver-images.ts`.
3. Verify with `pnpm ts-node scripts/media/verify-driver-assets.ts`.

## 5. Fallback Strategy
If an asset is missing:
- Registry returns `/assets/drivers/_placeholder.webp`.
- `DriverImage` component renders a themed silhouette.
- Never allow a 404 image icon to appear in the UI.
