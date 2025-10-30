import { describe, it, expect } from 'vitest';
import { clampPan, projectMomentum, pinchScale, clamp } from './gesture.js';

describe('gesture helpers', () => {
  describe('clamp', () => {
    it('clamps within bounds', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });
  });

  describe('clampPan', () => {
    it('returns 0 offsets when scale=1 (no pan allowed)', () => {
      const out = clampPan({ tx: 100, ty: -50 }, { cw: 300, ch: 400 }, {}, 1);
      expect(out).toEqual({ tx: 0, ty: 0 });
    });

    it('clamps offsets symmetrically when scaled', () => {
      // container 200x200, scale 2 => content 400x400, max offset = (400-200)/2 = 100
      const max = 100;
      const within = clampPan({ tx: 80, ty: -90 }, { cw: 200, ch: 200 }, {}, 2);
      expect(within).toEqual({ tx: 80, ty: -90 });

      const over = clampPan({ tx: 180, ty: -150 }, { cw: 200, ch: 200 }, {}, 2);
      expect(over).toEqual({ tx: max, ty: -max });
    });
  });

  describe('projectMomentum', () => {
    it('projects distance from velocity and duration and clamps to bounds', () => {
      const vx = 0.5; // px/ms
      const duration = 200; // ms
      const maxPx = 60;
      const projected = projectMomentum(vx, duration, maxPx);
      // raw = 0.5 * 200 * 0.5 = 50, below max
      expect(projected).toBeCloseTo(50, 5);

      const big = projectMomentum(2.0, 200, 60); // raw=200, clamped to 60
      expect(big).toBe(60);
      const neg = projectMomentum(-2.0, 200, 60);
      expect(neg).toBe(-60);
    });
  });

  describe('pinchScale', () => {
    it('scales proportionally to distance and clamps between min/max', () => {
      expect(pinchScale(100, 150, 1, 1, 3)).toBeCloseTo(1.5, 5);
      expect(pinchScale(100, 400, 1, 1, 3)).toBe(3); // clamped max
      expect(pinchScale(100, 25, 1, 1, 3)).toBe(1); // clamped min
    });

    it('handles invalid inputs by returning clamped base scale', () => {
      expect(pinchScale(0, 150, 2, 1, 3)).toBe(2);
      expect(pinchScale(NaN, 150, 4, 1, 3)).toBe(3);
    });
  });
});


