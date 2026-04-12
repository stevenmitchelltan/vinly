import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import ImageCarousel from './ImageCarousel';
import { getWineTypeEmoji, formatDate } from '../utils/wine';
import { useFavorites } from '../context/FavoritesContext';
import { SupermarketIcon } from './icons/SupermarketIcons';

function WineDetailModal({ wine, onClose }) {
  const { isFavorite, toggleFavorite } = useFavorites();

  if (!wine) return null;

  const images = wine.image_urls || (wine.image_url ? [wine.image_url] : []);
  const favorited = isFavorite(wine.id);

  // Lock body scroll and handle Escape
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);

    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-2xl bg-th-surface rounded-2xl overflow-hidden border border-th-border shadow-2xl animate-scale-in">
        {/* Close button */}
        <div className="sticky top-0 z-10 flex justify-end p-3">
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-th-elevated/80 backdrop-blur-sm hover:bg-th-elevated text-th-text-sub hover:text-th-text transition-colors"
            aria-label="Sluiten"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Image Gallery */}
        <div className="px-4 -mt-8">
          <ImageCarousel images={images} wineName={wine.name} wineType={wine.wine_type} />
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-5">
          {/* Header: badges + favorite */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 bg-th-elevated text-th-text-sub px-4 py-1.5 rounded-full text-sm font-medium">
                <SupermarketIcon name={wine.supermarket} />
                {wine.supermarket}
              </span>
              <span className="text-2xl">{getWineTypeEmoji(wine.wine_type)}</span>
            </div>
            <button
              onClick={() => toggleFavorite(wine.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all active:scale-110 border border-th-border-sub hover:bg-th-elevated/60"
            >
              {favorited ? (
                <svg className="w-5 h-5 text-red-400 fill-red-400" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-th-text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              )}
              <span className="text-th-text-sub">{favorited ? 'Opgeslagen' : 'Bewaren'}</span>
            </button>
          </div>

          {/* Name */}
          <h2 className="text-3xl sm:text-4xl font-bold text-th-text leading-tight">
            {wine.name}
          </h2>

          {/* Quote */}
          {wine.rating && (
            <blockquote className="text-base font-medium text-th-text-sub italic leading-relaxed border-l-2 border-th-accent pl-4">
              &ldquo;{wine.rating}&rdquo;
            </blockquote>
          )}

          {/* Description (full, not clamped) */}
          {wine.description && (
            <p className="text-th-text-dim leading-relaxed">
              {wine.description}
            </p>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-th-border">
            <div>
              <p className="text-xs text-th-text-dim uppercase tracking-widest mb-1">Influencer</p>
              <p className="text-sm font-semibold text-th-accent">@{wine.influencer_source}</p>
            </div>
            <div>
              <p className="text-xs text-th-text-dim uppercase tracking-widest mb-1">Gevonden op</p>
              <p className="text-sm text-th-text-sub">{formatDate(wine.date_found)}</p>
            </div>
            <div>
              <p className="text-xs text-th-text-dim uppercase tracking-widest mb-1">Supermarkt</p>
              <p className="text-sm text-th-text-sub">{wine.supermarket}</p>
            </div>
            <div>
              <p className="text-xs text-th-text-dim uppercase tracking-widest mb-1">Type</p>
              <p className="text-sm text-th-text-sub capitalize">{wine.wine_type}</p>
            </div>
          </div>

          {/* Link to original post */}
          <div className="pt-4 border-t border-th-border">
            <a
              href={(wine.post_url || '').split('#')[0]}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-th-accent text-white font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Bekijk originele post
              <span>&rarr;</span>
            </a>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default WineDetailModal;
