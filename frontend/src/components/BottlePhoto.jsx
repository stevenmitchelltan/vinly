import { useId } from 'react';
import { getImageUrl } from '../utils/image';

// Frame the original packshot without changing the photograph or clipping the bottle.
function BottlePhoto({ src, alt, presentation, layout = 'detail', onError }) {
  const clipId = useId().replace(/:/g, '');
  if (!presentation) {
    return <img src={getImageUrl(src)} alt={alt} className="w-full h-full object-contain bg-white" onError={onError} />;
  }

  const { width, height, bounds } = presentation;
  const [x, y, w, h] = bounds;
  const margin = h * 0.025;

  const padding = { card: '2.75rem 0.75rem 7.5rem', mobile: '3.5rem 0.75rem 35dvh', thumbnail: '0.15rem', detail: '0.75rem' };

  return (
    <svg
      role="img"
      aria-label={alt}
      className="w-full h-full bg-white pointer-events-none"
      style={{ padding: padding[layout] || padding.detail }}
      viewBox={`${x - margin} ${y - margin} ${w + margin * 2} ${h + margin * 2}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <clipPath id={clipId}>
          <rect x={x} y={y} width={w} height={h} />
        </clipPath>
      </defs>
      <image href={getImageUrl(src)} width={width} height={height} clipPath={`url(#${clipId})`} onError={onError} />
    </svg>
  );
}

export default BottlePhoto;
