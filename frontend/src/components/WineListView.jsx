import { getWineTypeEmoji, formatDate } from '../utils/wine';
import { getImageUrl } from '../utils/image';
import { useFavorites } from '../context/FavoritesContext';
import { SupermarketIcon } from './icons/SupermarketIcons';
import { useInView } from '../hooks/useInView';

function WineListView({ wines, loading, onWineClick }) {
  const { isFavorite, toggleFavorite } = useFavorites();

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div key={idx} className="animate-pulse flex items-center gap-4 bg-th-surface rounded-xl border border-th-border p-3">
            <div className="w-12 bg-th-elevated rounded-lg flex-shrink-0" style={{ aspectRatio: '4/5' }} />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-th-elevated rounded w-2/3" />
              <div className="h-3 bg-th-elevated rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (wines.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center space-y-6 max-w-md bg-th-surface rounded-2xl p-10 animate-scale-in border border-th-border">
          <div className="text-7xl">🤷‍♂️</div>
          <h3 className="text-2xl font-bold text-th-text">Geen wijnen gevonden</h3>
          <p className="text-th-text-dim leading-relaxed">
            Er zijn geen wijnen gevonden met deze filters. Probeer een andere combinatie of kom later terug voor nieuwe aanbevelingen!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {wines.map((wine) => (
        <ListRow
          key={wine.id}
          wine={wine}
          isFavorite={isFavorite}
          toggleFavorite={toggleFavorite}
          onWineClick={onWineClick}
        />
      ))}
    </div>
  );
}

function ListRow({ wine, isFavorite, toggleFavorite, onWineClick }) {
  const [ref, isInView] = useInView({ threshold: 0.1 });
  const firstImage = (wine.image_urls || [])[0] || wine.image_url;
  const favorited = isFavorite(wine.id);

  return (
    <div
      ref={ref}
      className={`transition-all duration-500 ease-out ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      <div
        onClick={() => onWineClick?.(wine)}
        className="flex items-center gap-3 sm:gap-4 bg-th-surface rounded-xl border border-th-border p-3 hover:border-th-border-sub hover:shadow-md transition-all cursor-pointer group"
      >
        {/* Thumbnail */}
        <div className="w-11 sm:w-14 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-stone-100 to-stone-50" style={{ aspectRatio: '4/5' }}>
          {firstImage ? (
            <img
              src={getImageUrl(firstImage)}
              alt={wine.name}
              loading="lazy"
              className="w-full h-full object-cover"
              onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xl">
              {getWineTypeEmoji(wine.wine_type)}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-th-text truncate group-hover:text-th-accent transition-colors">
            {wine.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <SupermarketIcon name={wine.supermarket} />
            <span className="text-xs text-th-text-dim">{wine.supermarket}</span>
            <span className="text-sm">{getWineTypeEmoji(wine.wine_type)}</span>
          </div>
        </div>

        {/* Date (hidden on mobile) */}
        <div className="hidden sm:block text-xs text-th-text-dim whitespace-nowrap">
          {formatDate(wine.date_found)}
        </div>

        {/* Favorite */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleFavorite(wine.id); }}
          className="p-1.5 rounded-full hover:bg-th-elevated transition-colors flex-shrink-0"
          aria-label={favorited ? 'Verwijder uit favorieten' : 'Voeg toe aan favorieten'}
        >
          {favorited ? (
            <svg className="w-4 h-4 text-red-400 fill-red-400" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-th-text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

export default WineListView;
