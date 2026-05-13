# APEX-F1 — Mobile Layout Audit

**Status: Required for Deployment**

All pages must be verified at the following viewports before a production release.

## Viewport Checklist

### 📱 Mobile (390px - iPhone 14/15)
- [ ] No horizontal overflow-x.
- [ ] Telemetry cards are stacked or horizontally scrollable (non-breaking).
- [ ] Typography scales down (no 48px headers on mobile).
- [ ] Touch targets (buttons, links) are at least 44x44px.
- [ ] Navigation menu is accessible and usable.

### 📟 Tablet (768px - iPad)
- [ ] Grid layouts transition from 1-column to 2/3-column.
- [ ] Tables are scrollable or use condensed views.
- [ ] Header spacing collapses gracefully.

### 💻 Laptop/Desktop (1024px - 1440px)
- [ ] Maximum content width enforced (max-w-7xl).
- [ ] Sidebars and mega-menus function without clipping.
- [ ] Hover states are active and visible.

---

## Critical Audit Areas
1. **Drivers Results Table**: Verify column visibility on small screens.
2. **Team Standings**: Check for clipped names.
3. **Compare Interface**: Verify split-screen usability on mobile.
4. **Race Countdown**: Ensure font size doesn't break the layout.
