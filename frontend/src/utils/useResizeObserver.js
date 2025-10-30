import { useEffect, useState } from 'react';

/**
 * Observe size of an element via ResizeObserver.
 * Returns { width, height } and cleans up on unmount.
 * @param {import('react').RefObject<HTMLElement>} targetRef
 */
export function useResizeObserver(targetRef) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      setSize({ width: Math.round(rect.width), height: Math.round(rect.height) });
    };

    update();

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => update());
      ro.observe(el);
      return () => {
        ro.disconnect();
      };
    } else {
      // Fallback: window resize listener
      window.addEventListener('resize', update);
      return () => window.removeEventListener('resize', update);
    }
  }, [targetRef]);

  return size;
}


