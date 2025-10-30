# WineCard Component - Gesture Implementation & Accessibility

## Overview

The `WineCard` component has been refactored to use Pointer Events API with rAF-driven transforms for smooth, performant gestures while maintaining full accessibility support.

## Gesture Decisions

### Pointer Events vs Touch/Mouse Events

We use **Pointer Events API** (`pointerdown`, `pointermove`, `pointerup`, `pointercancel`) instead of separate touch and mouse handlers because:

- **Unified handling**: One code path handles touch, mouse, pen, and other pointer types
- **Multi-touch support**: Easier to track multiple pointers simultaneously (essential for pinch-to-zoom)
- **Better browser support**: Modern browsers have excellent Pointer Events support
- **setPointerCapture**: Allows capturing pointer events even outside the element bounds

### Performance: rAF + Refs vs React State

During drag and zoom operations, we **avoid React state updates** and use refs + `requestAnimationFrame`:

- **Refs for gesture state**: `scaleRef`, `txRef`, `tyRef`, `isDraggingRef`, etc.
- **rAF loop**: Continuously updates `style.transform` directly
- **React state only for discrete events**: Index changes, zoom reset visibility, scale (for UI reactivity)

**Why**: React state updates cause re-renders. During a drag gesture, we might have 60+ updates per second. Using refs + rAF allows smooth 60fps animations without React overhead.

### Touch-Action Strategy

We dynamically toggle `touch-action` CSS property:

- **When `scale <= 1`**: `touch-action: pan-y pinch-zoom`
  - Allows vertical page scrolling (`pan-y`)
  - Enables native pinch gestures (`pinch-zoom`) as fallback
  - Horizontal panning is handled by our Pointer Events
- **When `scale > 1`**: `touch-action: none`
  - We fully control panning when zoomed
  - Prevents browser from interfering with our pan gestures

### Pinch-to-Zoom Implementation

- **Two-pointer detection**: Track pointers in a `Map<pointerId, {x, y}>`
- **Distance calculation**: `getPointerDistance()` computes Euclidean distance
- **Scale calculation**: `pinchScale()` uses ratio of distances with min/max clamping (1-3x)
- **Pan anchoring**: Adjust translate to keep pinch center point fixed
- **No auto-reset**: Zoom persists until user clicks "Reset zoom" button

### Momentum Calculation

For carousel swipes:

- **Velocity tracking**: Compute `vx` from recent pointer movements (`deltaX / deltaTime`)
- **Momentum projection**: `projectMomentum()` projects distance using `velocity * duration * 0.5` (ease-out approximation)
- **Bounds clamping**: Clamp projected distance to container width
- **Disabled for reduced motion**: Respects `prefers-reduced-motion` media query

### Pan Clamping

When zoomed, we clamp panning using `clampPan()`:

- **Prevents blank gutters**: Never allows panning that would reveal empty space
- **Formula**: `maxOffset = (contentWidth - containerWidth) / 2`
- **Applied each frame**: Ensures smooth clamping even during rapid gestures

### Wheel Zoom

Desktop zoom via Ctrl/Cmd + scroll:

- **Cursor anchoring**: Computes cursor position relative to container center
- **Scale adjustment**: Adjusts translate before/after scale change
- **Formula**: `translate += cursorOffset * scaleDelta`

## Accessibility Map

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `ArrowLeft` / `PageUp` | Previous image |
| `ArrowRight` / `PageDown` | Next image |
| `Home` | First image |
| `End` | Last image |
| `Escape` | Reset zoom (when zoomed) |

### ARIA Attributes

- **Carousel container**: 
  - `role="region"` (when multiple images)
  - `aria-label="Afbeeldingcarrousel, {count} afbeeldingen"`
  - `tabIndex={hasMultipleImages ? 0 : -1}` (focusable only when navigable)

- **Dots navigation**:
  - Wrapped in `<nav aria-label="Afbeeldingnavigatie">`
  - Each dot is a `<button>` in a `<ul><li>` structure
  - `aria-label="Afbeelding {index} van {total}"`
  - `aria-current="true"` for active dot
  - Minimum 32×32px hit target (via inline styles)

- **Announcements**:
  - `aria-live="polite"` region announces slide changes
  - Text: "Afbeelding {current} van {total}"

### Focus Management

- When dots are clicked, focus moves to carousel container
- Keyboard navigation maintains focus on carousel
- Reset zoom button is keyboard accessible

### Reduced Motion Support

- Checks `prefers-reduced-motion` media query at mount
- Disables momentum animations when reduced motion is preferred
- Shortens transition durations (0.15s vs 0.3s/0.5s)
- Maintains functionality without jarring motion

## Data Robustness

Safe fallbacks for missing data:

- **Influencer source**: `influencer_source || 'Onbekend'` (strips `@` prefix)
- **Date**: `formatDate()` returns `'Datum onbekend'` for invalid dates
- **Post URL**: Link hidden if URL is invalid or missing

## Performance Optimizations

1. **Refs for gesture state**: Avoid React re-renders during drag
2. **rAF loop**: Efficient animation loop
3. **will-change**: Applied to active image and carousel track
4. **translate3d**: Forces GPU acceleration
5. **Lazy loading**: Non-first images use `loading="lazy"`
6. **fetchpriority**: First image uses `fetchpriority="high"`

## Testing

Gesture helpers are unit tested with Vitest:
- `clampPan()` - Edge cases including -0 normalization
- `projectMomentum()` - Velocity calculations and bounds
- `pinchScale()` - Scale calculations and clamping

Run tests: `npm test`

