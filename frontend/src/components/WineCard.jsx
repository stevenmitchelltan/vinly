import ImageCarousel from './ImageCarousel';
import { getWineTypeEmoji } from '../utils/wine';
import { useFavorites } from '../context/FavoritesContext';
import { SupermarketIcon } from './icons/SupermarketIcons';

const wineTypes = {
  red: { label: 'Rood', color: '#a64b52' },
  white: { label: 'Wit', color: '#ae8d42' },
  rose: { label: 'Rosé', color: '#c47c8b' },
  sparkling: { label: 'Bubbels', color: '#8c9561' },
};

function WineCard({ wine, onClick }) {
  const images = wine.image_urls || (wine.image_url ? [wine.image_url] : []);
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(wine.id);
  const hasImages = images.length > 0;
  const type = wineTypes[wine.wine_type];
  const source = (wine.influencer_source || '').replace(/_tiktok$/, '');

  return (
    <div
      className="group flex flex-col h-full rounded-2xl overflow-hidden cursor-pointer border border-th-border bg-th-surface transition-shadow duration-300 hover:shadow-lg hover:shadow-stone-900/5"
      onClick={() => onClick?.(wine)}
    >
      <div className="relative aspect-[6/5] overflow-hidden bg-white">
        {hasImages ? (
          <div className="absolute inset-0 transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.025]">
            <ImageCarousel images={images} wineName={wine.name} wineType={wine.wine_type} bottleImage={wine.bottle_image_url} bottlePresentation={wine.bottle_image_presentation} bottleLayout="catalogue" overlay hideIndicators />
          </div>
        ) : (
          <div className="absolute inset-0 bg-th-elevated flex items-center justify-center">
            <span className="text-7xl opacity-40 transition-transform duration-500 motion-safe:group-hover:scale-110">{getWineTypeEmoji(wine.wine_type)}</span>
          </div>
        )}

        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={(e) => { e.stopPropagation(); toggleFavorite(wine.id); }}
            className="flex items-center justify-center w-11 h-11 rounded-full border border-stone-200/80 bg-white/90 text-stone-500 hover:text-burgundy-700 hover:bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy-700/50"
            aria-pressed={favorited}
            aria-label={favorited ? 'Verwijder uit favorieten' : 'Voeg toe aan favorieten'}
          >
            {favorited ? (
              <svg className="w-4 h-4 text-burgundy-700 fill-burgundy-700" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-current" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            )}
          </button>
        </div>

        {/* A light wash keeps the wine colour without tinting the bottle. */}
        <div
          className="absolute inset-x-0 bottom-0 h-10 pointer-events-none"
          style={{ background: `linear-gradient(to top, ${type?.color || '#a64b52'}12, transparent)` }}
          aria-hidden="true"
        />
      </div>

      <div className="flex flex-col flex-1 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3 mb-3 text-xs text-th-text-sub">
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

        <h3 className="font-fraunces font-semibold text-xl text-th-text leading-snug break-words">
          {wine.name}
        </h3>

        {wine.rating && (
          <p className="text-sm text-th-text-sub italic mt-2 line-clamp-2">
            &ldquo;{wine.rating}&rdquo;
          </p>
        )}

        {source && (
          <p className="text-xs text-th-text-dim mt-auto pt-4">
            Aanbevolen door <span className="text-th-text-sub">@{source}</span>
          </p>
        )}
      </div>
    </div>
  );
}

export default WineCard;
