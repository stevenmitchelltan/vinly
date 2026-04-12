import ImageCarousel from './ImageCarousel';
import { getWineTypeEmoji, formatDate } from '../utils/wine';
import { useFavorites } from '../context/FavoritesContext';
import { SupermarketIcon } from './icons/SupermarketIcons';

const typeGradients = {
  red: 'from-rose-950/90 via-rose-950/60',
  white: 'from-amber-900/90 via-amber-900/60',
  rose: 'from-pink-900/90 via-pink-900/60',
  sparkling: 'from-yellow-900/90 via-yellow-900/60',
};

function WineCard({ wine, onClick }) {
  const images = wine.image_urls || (wine.image_url ? [wine.image_url] : []);
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(wine.id);
  const hasImages = images.length > 0;
  const gradient = typeGradients[wine.wine_type] || typeGradients.red;

  return (
    <div
      className="group relative rounded-2xl overflow-hidden cursor-pointer border border-white/10 dark:border-white/5"
      style={{ aspectRatio: '3/4' }}
      onClick={() => onClick?.(wine)}
    >
      {/* Image layer — scales on hover */}
      {hasImages ? (
        <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-105">
          <ImageCarousel images={images} wineName={wine.name} wineType={wine.wine_type} overlay hideIndicators />
        </div>
      ) : (
        <div className="absolute inset-0 bg-th-elevated flex items-center justify-center">
          <span className="text-7xl opacity-40 transition-transform duration-500 group-hover:scale-110">{getWineTypeEmoji(wine.wine_type)}</span>
        </div>
      )}

      {/* Top bar: supermarket badge + heart */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-start justify-between p-3">
        <span className="inline-flex items-center gap-1.5 bg-black/40 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium">
          <SupermarketIcon name={wine.supermarket} />
          {wine.supermarket}
          <span className="ml-0.5">{getWineTypeEmoji(wine.wine_type)}</span>
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); toggleFavorite(wine.id); }}
          className="p-2 rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 transition-all active:scale-125"
          aria-label={favorited ? 'Verwijder uit favorieten' : 'Voeg toe aan favorieten'}
        >
          {favorited ? (
            <svg className="w-4 h-4 text-red-400 fill-red-400" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          )}
        </button>
      </div>

      {/* Gradient scrim + content at bottom */}
      <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t ${gradient} to-transparent pt-24 pb-4 px-4 transition-all duration-300 group-hover:pb-5`}>
        {/* Influencer + date */}
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] text-white/60 font-medium">
            @{wine.influencer_source}
          </p>
          <p className="text-[11px] text-white/40">
            {formatDate(wine.date_found)}
          </p>
        </div>

        {/* Wine name */}
        <h3 className="font-fraunces font-bold text-lg text-white leading-snug line-clamp-2 drop-shadow-sm">
          {wine.name}
        </h3>

        {/* Quote */}
        {wine.rating && (
          <p className="text-sm text-white/75 italic mt-1.5 line-clamp-1 drop-shadow-sm">
            &ldquo;{wine.rating}&rdquo;
          </p>
        )}
      </div>
    </div>
  );
}

export default WineCard;
