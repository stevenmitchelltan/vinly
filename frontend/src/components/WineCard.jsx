import ImageCarousel from './ImageCarousel';
import { getWineTypeEmoji, formatDate } from '../utils/wine';
import { useFavorites } from '../context/FavoritesContext';
import { SupermarketIcon } from './icons/SupermarketIcons';

function WineCard({ wine, onClick }) {
  const images = wine.image_urls || (wine.image_url ? [wine.image_url] : []);
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(wine.id);

  return (
    <div className="wine-card cursor-pointer" onClick={() => onClick?.(wine)}>
      {/* Image Carousel */}
      <div className="p-3 relative">
        <ImageCarousel images={images} wineName={wine.name} wineType={wine.wine_type} />
        {/* Favorite heart */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleFavorite(wine.id); }}
          className="absolute top-5 right-5 z-10 p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-all active:scale-125"
          aria-label={favorited ? 'Verwijder uit favorieten' : 'Voeg toe aan favorieten'}
        >
          {favorited ? (
            <svg className="w-5 h-5 text-red-400 fill-red-400" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-3">
        {/* Supermarket badge */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2 bg-th-elevated text-th-text-sub px-4 py-1.5 rounded-full text-sm font-medium tracking-wide">
            <SupermarketIcon name={wine.supermarket} />
            {wine.supermarket}
          </span>
          <span className="text-3xl">{getWineTypeEmoji(wine.wine_type)}</span>
        </div>

        {/* Wine name */}
        <h3 className="font-bold text-2xl text-th-text leading-snug min-h-[3rem] flex items-center">
          {wine.name}
        </h3>

        {/* Quote */}
        {wine.rating && (
          <p className="text-sm font-medium text-th-text-sub italic leading-relaxed border-l-2 border-th-accent pl-3">
            &ldquo;{wine.rating}&rdquo;
          </p>
        )}

        {/* Description */}
        {wine.description && (
          <p className="text-sm text-th-text-dim line-clamp-4 leading-loose">
            {wine.description}
          </p>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-th-border space-y-2">
          <p className="text-xs text-th-text-dim font-medium">
            📸 van <span className="font-semibold text-th-accent">@{wine.influencer_source}</span>
          </p>
          <p className="text-xs text-th-text-dim">
            {formatDate(wine.date_found)}
          </p>

          <a
            href={(wine.post_url || '').split('#')[0]}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs text-th-accent hover:text-th-accent-h font-semibold hover:gap-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-th-accent/50 rounded"
          >
            Bekijk originele post
            <span className="text-base">&rarr;</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default WineCard;
