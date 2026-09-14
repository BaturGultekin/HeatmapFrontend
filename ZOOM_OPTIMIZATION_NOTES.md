# Zoom Performance Optimization Notes

## Date: 2026-01-04

## Problem
Mouse wheel zoom is laggy/stuttery. The heatmap doesn't scroll smoothly when zooming in/out.

## Root Causes Identified

### 1. Console.log statements running on every render (FIXED)
- **File:** `DeckGLHeatmap.tsx` line ~1745
- **Issue:** `console.log('🎯 VIEWPORT DEBUG...')` with `new Date().toISOString()` ran on every render
- **Fix:** Removed the console.log

- **File:** `layers/heatmapGrid/getHeatmapGridLayer.ts` lines 554-564
- **Issue:** 4 debug console.logs ran on every layer creation
- **Fix:** Removed the console.logs

### 2. DeckGL Controller not configured for smooth zoom (FIXED)
- **File:** `DeckGLHeatmap.tsx` line ~2112
- **Before:** `controller={!isCropping}` (just a boolean)
- **After:**
```javascript
controller={!isCropping ? {
  scrollZoom: {
    speed: 0.01,
    smooth: true  // Enable smooth zoom transitions
  },
  inertia: 300,  // Momentum after gestures (ms)
  dragPan: true,
  doubleClickZoom: true,  // Double click = zoom in
  keyboard: true  // Shift + Double click = zoom out
} : false}
```

### 3. Layers useMemo dependency array causes recreation on every zoom frame (TO FIX)
- **File:** `DeckGLHeatmap.tsx` lines ~1478-1500
- **Issue:** `viewStates` and `visibleIndices` are in the dependency array
  - These change on EVERY zoom frame
  - This causes `getLayers()` to run on every frame
  - Expensive layer recreation happens 60+ times per second during zoom

- **Proposed Fix:** Remove `viewStates` and `visibleIndices` from dependency array
  - Replace `visibleIndices` with `visibleBounds` (more stable, changes less frequently)
  - Remove `viewStates` entirely - DeckGL handles viewState internally
  - The layers still receive the latest values (passed as props), but memoization won't be invalidated

### 4. Multiple state updates per zoom event (MEDIUM priority)
- **File:** `state/useViewStates.ts` in `onViewStateChange` callback
- **Issue:** Each zoom event triggers 3 state updates:
  1. `setVisibleBounds()`
  2. `setVisibleIndices()` (in requestAnimationFrame)
  3. `setViewStates()`
- **Potential Fix:** Throttle the bounds/indices updates, or batch them

## Changes Made

### DeckGLHeatmap.tsx
1. Removed VIEWPORT DEBUG console.log (line ~1745)
2. Updated controller with smooth zoom options (line ~2112)
3. TODO: Update useMemo dependency array (lines ~1478-1500)

### layers/heatmapGrid/getHeatmapGridLayer.ts
1. Removed 4 debug console.logs (lines 554-564)

### layers/labels/getLabelsLayer.ts
1. Added `isAggregated` logic to hide labels when zoomed out (for aggregation indicator feature)

## Aggregation Indicator Feature (Also implemented)
- When `zoom < BASE_ZOOM` (zoom < 0), aggregation happens
- Labels are hidden and a badge shows "Aggregated view - Zoom in for gene-level detail"
- Badge position: bottom -30px, right 10px

## Files Modified
- `/src/DeckGLHeatmap.tsx`
- `/src/layers/heatmapGrid/getHeatmapGridLayer.ts`
- `/src/layers/labels/getLabelsLayer.ts`
- `/src/state/useViewStates.ts` (potential future optimization)
- `/src/components/Slider.tsx` (cluster slider legend)
