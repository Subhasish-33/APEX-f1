# APEX-F1 — Data Rendering Policy

**Status: Phase 2 Frozen**

## Rules for Safe Data Display

### 1. No Undefined Rendering
- Never render raw values from API responses without a fallback.
- **Wrong**: `<span>{driver.name}</span>`
- **Right**: `<span>{driver.name ?? "Unknown Driver"}</span>`

### 2. Null-Safe Tables
- Tables must handle empty rows and missing columns gracefully.
- Use the `DataTable` primitive which enforces null-safety through accessor functions.

### 3. Standardized Skeletons
- Use the `Skeleton` primitive for all loading states.
- Match the dimensions of the final content to prevent Layout Shift (CLS).

### 4. Standardized Empty States
- When data is missing (e.g., no results for a specific filter), use a consistent `EmptyState` component.
- Provide a clear call to action or explanation.

### 5. Graceful API Failure Rendering
- If a fetch fails, the UI should not crash.
- Use the `apiSafe` fallback pattern to provide cached or placeholder data.
- Inform the user with a subtle inline warning if data is stale.
