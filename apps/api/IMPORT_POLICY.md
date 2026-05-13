# Import Policy — APEX-F1 Monorepo

## 1. Backend (FastAPI - `apps/api`)
- **Internal Imports**: Use relative imports (`from . import x`) or simple module imports if the directory is in `PYTHONPATH`.
- **Repo Root Avoidance**: Do NOT use `from apps.api.models import X`. Use `from models import X`.
- **Shared Types**: Standardize on `@apex/types` for TypeScript. Python schemas are local to `apps/api/schemas.py`.

## 2. Frontend (Next.js - `apps/web`)
- **Alias Usage**: Always use `@/` for project root (points to `apps/web/app` or `src`).
- **Component Imports**: Use `@/components/system/Button`.
- **Lib Imports**: Use `@/lib/api`.

## 3. Policy Enforcement
- No circular imports allowed. Use dependency injection (via FastAPI `Depends`) or separate service layers to break cycles.
- Absolute paths like `/Users/subhasish/...` are strictly forbidden in code.
