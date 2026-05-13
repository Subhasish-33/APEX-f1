# APEX-F1 — Design Freeze

**Status: Phase 2 Frozen**

The following systems are now **FROZEN**. Any changes require a formal review and must be justified by production stability or performance data.

## 1. Frozen Palette
- **Primary**: #E10600 (F1 Red)
- **Backgrounds**: #0A0A0F, #141420, #1E1E2E
- **Text**: #FFFFFF, #9CA3AF, #4B5563
- **Accents**: #C8960C (Gold)

## 2. Frozen Typography
- **Display**: Barlow Condensed (Bold/Black)
- **Interface**: Inter (Regular/Medium/Bold)
- **Data**: JetBrains Mono (Regular)

## 3. Frozen Spacing
- Geometric scale: 4px, 8px, 16px, 24px, 32px, 48px, 64px.

## 4. Frozen Motion Curves
- **Entry**: `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out)
- **Exit**: `cubic-bezier(0.4, 0, 1, 1)` (ease-in)

---

## Review Required For:
- New animation systems.
- New visualization engines.
- Global state management layers.
- New design frameworks or UI libraries.
