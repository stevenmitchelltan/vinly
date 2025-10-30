// Gesture math helpers: clamping, momentum projection, and pinch scaling

/**
 * Clamp the pan translation so scaled content never reveals blank space.
 * Assumes the content fits the container at scale=1 (object-cover style),
 * and grows symmetrically as scale increases.
 *
 * @param {{tx:number, ty:number}} translate current translate in pixels
 * @param {{cw:number, ch:number}} container container size in pixels
 * @param {{iw?:number, ih?:number}} image base image size (optional; ignored for object-cover)
 * @param {number} scale current scale factor
 * @returns {{tx:number, ty:number}}
 */
export function clampPan(translate, container, image, scale) {
  const { tx, ty } = translate;
  const { cw, ch } = container;

  // Content visible size at this scale (assume base content = container at scale 1)
  const contentW = cw * Math.max(1, scale);
  const contentH = ch * Math.max(1, scale);

  const maxOffsetX = Math.max(0, (contentW - cw) / 2);
  const maxOffsetY = Math.max(0, (contentH - ch) / 2);

  const clampedX = Math.max(-maxOffsetX, Math.min(maxOffsetX, tx));
  const clampedY = Math.max(-maxOffsetY, Math.min(maxOffsetY, ty));

  // Normalize -0 to +0 (Object.is(-0, 0) is false, but we want them equal)
  return { 
    tx: Object.is(clampedX, -0) ? 0 : clampedX, 
    ty: Object.is(clampedY, -0) ? 0 : clampedY 
  };
}

/**
 * Project momentum distance from a horizontal velocity.
 * Simple model: distance = velocity * duration * 0.5 (ease-out approximation), clamped to bounds.
 * @param {number} vx velocity in px/ms (negative for left)
 * @param {number} durationMs duration window to project (e.g., 200-300ms)
 * @param {number} maxPx maximum magnitude allowed in pixels
 * @returns {number} projected delta in pixels (signed)
 */
export function projectMomentum(vx, durationMs, maxPx) {
  if (!isFinite(vx) || !isFinite(durationMs) || durationMs <= 0) return 0;
  const raw = vx * durationMs * 0.5; // basic ease-out factor
  if (!isFinite(maxPx) || maxPx <= 0) return raw;
  return Math.max(-maxPx, Math.min(maxPx, raw));
}

/**
 * Compute new pinch scale from distances, clamped between min and max.
 * @param {number} startDist initial two-pointer distance in px
 * @param {number} currentDist current two-pointer distance in px
 * @param {number} baseScale scale at gesture start
 * @param {number} [min=1]
 * @param {number} [max=3]
 * @returns {number}
 */
export function pinchScale(startDist, currentDist, baseScale, min = 1, max = 3) {
  if (!isFinite(startDist) || startDist <= 0 || !isFinite(currentDist) || !isFinite(baseScale)) {
    return Math.max(min, Math.min(max, baseScale || 1));
  }
  const ratio = currentDist / startDist;
  const next = baseScale * ratio;
  return Math.max(min, Math.min(max, next));
}

/**
 * Utility: clamp a number between min and max
 * @param {number} v
 * @param {number} min
 * @param {number} max
 */
export function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}


