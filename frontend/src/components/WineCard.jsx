import { useEffect, useRef, useState } from 'react';
import ImageCarousel from './ImageCarousel';
import { getWineTypeEmoji, wineTypes } from '../utils/wine';
import WineReview from './WineReview';
import { useFavorites } from '../context/FavoritesContext';
import { SupermarketIcon } from './icons/SupermarketIcons';

function WineCard({ wine, onClick }) {
  const images = wine.image_urls || (wine.image_url ? [wine.image_url] : []);
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(wine.id);
  const hasImages = images.length > 0;
  const type = wineTypes[wine.wine_type];
  const source = (wine.influencer_source || '').replace(/_tiktok$/, '');
  const captionRef = useRef(null);
  const [captionTruncated, setCaptionTruncated] = useState(false);

  useEffect(() => {
    const caption = captionRef.current;
    if (!caption) return;
    const measure = () => setCaptionTruncated(caption.scrollHeight > caption.clientHeight + 1);
    const observer = new ResizeObserver(measure);
    observer.observe(caption);
    measure();
    return () => observer.disconnect();
  }, [source, wine.rating]);

  const renderActions = (indicators) => (
    <div className="relative flex items-center h-11 px-2">
      <button
        onClick={(e) => { e.stopPropagation(); toggleFavorite(wine.id); }}
        className="flex items-center justify-center w-11 h-11 -ml-3 rounded-full bg-transparent text-th-text-sub hover:text-burgundy-700 hover:bg-th-elevated transition-colors focus-visible:bg-th-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy-700/50"
        aria-pressed={favorited}
        aria-label={favorited ? 'Verwijder uit favorieten' : 'Voeg toe aan favorieten'}
      >
        {favorited ? (
          <svg className="w-5 h-5 text-burgundy-700 fill-burgundy-700" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-current" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        )}
      </button>
      {indicators}
    </div>
  );

  return (
    <div
      className="flex flex-col h-full cursor-pointer"
      onClick={() => onClick?.(wine)}
    >
      <div className="flex items-center justify-between gap-3 mb-3 px-2 text-xs text-th-text-sub">
        <span className="inline-flex items-center gap-2 min-w-0">
          <SupermarketIcon name={wine.supermarket} />
          <span>{wine.supermarket}</span>
        </span>
        {type && (
          <span className="inline-flex items-center gap-1.5 flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: type.color }} aria-hidden="true" />
            {type.label}
          </span>
        )}
      </div>

      {hasImages ? (
        <ImageCarousel
          images={images}
          wineName={wine.name}
          wineType={wine.wine_type}
          bottleImage={wine.bottle_image_url}
          bottlePresentation={wine.bottle_image_presentation}
          bottleLayout="catalogue"
          overlay
          renderFooter={renderActions}
        />
      ) : (
        <>
          <div className="aspect-square rounded-lg bg-th-elevated flex items-center justify-center">
            <span className="text-7xl opacity-40">{getWineTypeEmoji(wine.wine_type)}</span>
          </div>
          {renderActions(null)}
        </>
      )}

      <div className="flex flex-col flex-1 pt-1 px-2">
        <h3 className="font-fraunces font-semibold text-xl text-th-text leading-snug break-words">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onClick?.(wine); }}
            aria-haspopup="dialog"
            className="text-left rounded-sm hover:text-th-accent hover:underline underline-offset-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-th-accent"
          >
            {wine.name}
          </button>
        </h3>

        {(wine.rating || source) && (
          <div className="mt-1.5 text-sm leading-relaxed">
            <WineReview wine={wine} captionRef={captionRef} className="line-clamp-2" />
            {captionTruncated && (
              <button
                onClick={(e) => { e.stopPropagation(); onClick?.(wine); }}
                className="text-th-text-sub hover:text-th-text hover:underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-th-accent rounded-sm"
                aria-label={`Lees de volledige recensie van ${wine.name}`}
              >
                meer
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default WineCard;
