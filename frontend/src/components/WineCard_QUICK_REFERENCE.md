# WineCard Refactor - Quick Reference

## What Changed

The `WineCard` component has been refactored from touch/mouse events to Pointer Events API with significant performance and accessibility improvements.

## Key Improvements

### Performance
- **rAF transforms**: Uses `requestAnimationFrame` for smooth 60fps animations
- **Minimal re-renders**: Gesture state stored in refs, not React state
- **GPU acceleration**: `translate3d` and `will-change` for hardware acceleration

### Gestures
- **Pointer Events**: Unified handling for touch, mouse, pen, and other pointers
- **Pinch-to-zoom**: Persistent zoom (no auto-reset) with reset button
- **Momentum**: Smooth carousel swipes with velocity-based projection
- **Pan clamping**: Prevents showing blank space when zoomed

### Accessibility
- **Keyboard navigation**: Arrow keys, PageUp/Down, Home/End, Esc
- **Screen reader**: ARIA labels, live regions, proper button structure
- **Touch targets**: 32×32px minimum for dots
- **Reduced motion**: Respects user preferences

## API (Unchanged)

```jsx
<WineCard wine={wine} />
```

The `wine` prop structure is unchanged:
- `name`: string (required)
- `supermarket`: string (required)
- `wine_type`: "red" | "white" | "rose" | "sparkling" (required)
- `image_url`: string (optional, legacy)
- `image_urls`: string[] (optional, preferred)
- `rating`: string (optional)
- `influencer_source`: string (required)
- `post_url`: string (required)
- `date_found`: datetime (required)
- `description`: string (optional)

## Testing

Run unit tests:
```bash
npm test
```

Test gesture helpers:
- `clampPan()` - Prevents panning beyond bounds
- `projectMomentum()` - Calculates swipe momentum
- `pinchScale()` - Computes pinch-to-zoom scale

## Documentation

See `frontend/src/components/WineCard.md` for detailed documentation on:
- Gesture implementation decisions
- Accessibility map
- Performance optimizations
- Testing guide

