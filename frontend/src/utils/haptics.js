/**
 * Haptic feedback utility for mobile devices
 * Uses the Vibration API for tactile feedback
 */

// Check if vibration is supported
const isSupported = () => {
  return 'vibrate' in navigator;
};

/**
 * Light haptic feedback (e.g., button taps, selection)
 * Single short vibration
 */
export const lightHaptic = () => {
  if (isSupported()) {
    navigator.vibrate(10);
  }
};

/**
 * Medium haptic feedback (e.g., swipe complete, toggle)
 * Slightly longer vibration
 */
export const mediumHaptic = () => {
  if (isSupported()) {
    navigator.vibrate(20);
  }
};

/**
 * Heavy haptic feedback (e.g., important action, error)
 * Two quick vibrations
 */
export const heavyHaptic = () => {
  if (isSupported()) {
    navigator.vibrate([30, 10, 30]);
  }
};

/**
 * Selection haptic feedback (e.g., carousel navigation)
 * Very light, subtle feedback
 */
export const selectionHaptic = () => {
  if (isSupported()) {
    navigator.vibrate(5);
  }
};

/**
 * Success haptic feedback (e.g., zoom complete, action confirmed)
 * Triple short vibrations
 */
export const successHaptic = () => {
  if (isSupported()) {
    navigator.vibrate([15, 10, 15, 10, 15]);
  }
};

/**
 * Custom haptic pattern
 * @param {number|number[]} pattern - Duration in ms or array of [vibrate, pause, vibrate, ...]
 */
export const customHaptic = (pattern) => {
  if (isSupported()) {
    navigator.vibrate(pattern);
  }
};

