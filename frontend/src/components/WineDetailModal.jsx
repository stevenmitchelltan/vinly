import { useEffect, useRef, useState, useCallback } from 'react';
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
  const mouseDownTarget = useRef(null);
  const modalRef = useRef(null);

  // Swipe-to-dismiss state
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStart = useRef(null);
  const dismissed = useRef(false);

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

  // Touch handlers for swipe-to-dismiss
  const handleTouchStart = useCallback((e) => {
    // Only initiate drag if at scroll top
    const content = modalRef.current?.querySelector('[data-modal-content]');
    if (content && content.scrollTop > 0) return;
    touchStart.current = e.touches[0].clientY;
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (touchStart.current === null) return;
    const delta = e.touches[0].clientY - touchStart.current;
    // Only allow downward drag
    if (delta > 0) {
      setDragY(delta);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (touchStart.current === null) return;
    if (dragY > 120 && !dismissed.current) {
      dismissed.current = true;
      onClose();
    } else {
      setDragY(0);
    }
    touchStart.current = null;
    setIsDragging(false);
  }, [dragY, onClose]);

  const dragOpacity = Math.max(0.2, 1 - dragY / 400);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto md:py-6 md:px-4"
      onMouseDown={(e) => { mouseDownTarget.current = e.target; }}
      onClick={(e) => { if (e.target === e.currentTarget && mouseDownTarget.current === e.currentTarget) onClose(); }}
      style={{ opacity: dragOpacity }}
    >
      <div
        ref={modalRef}
        className="w-full md:max-w-4xl max-h-[100dvh] md:max-h-[90vh] bg-th-surface rounded-t-2xl md:rounded-2xl overflow-hidden border border-th-border shadow-2xl animate-modal-up md:animate-scale-in"
        style={{
          transform: dragY > 0 ? `translateY(${dragY}px)` : undefined,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle — mobile only */}
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-th-border-sub" />
        </div>

        {/* Desktop: side-by-side / Mobile: stacked */}
        <div className="flex flex-col md:flex-row md:max-h-[90vh]">
          {/* Image — left side on desktop, top on mobile */}
          <div className="relative md:w-[45%] md:flex-shrink-0 max-h-[40vh] md:max-h-none overflow-hidden">
            <ImageCarousel images={images} wineName={wine.name} wineType={wine.wine_type} overlay />
          </div>

          {/* Content — right side on desktop, bottom on mobile */}
          <div data-modal-content className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-3 sm:space-y-5">
            {/* Header: badges + favorite + close */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <span className="inline-flex items-center gap-1.5 bg-th-elevated text-th-text-sub px-3 py-1 rounded-full text-xs sm:text-sm font-medium max-w-[140px] sm:max-w-[160px]">
                  <SupermarketIcon name={wine.supermarket} />
                  <span className="truncate">{wine.supermarket}</span>
                </span>
                <span className="text-xl sm:text-2xl flex-shrink-0">{getWineTypeEmoji(wine.wine_type)}</span>
              </div>
              <button
                onClick={() => toggleFavorite(wine.id)}
                className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-sm font-medium transition-all active:scale-110 border border-th-border-sub hover:bg-th-elevated/60 flex-shrink-0"
              >
                {favorited ? (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 fill-red-400" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-th-text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                )}
                <span className="text-th-text-sub hidden sm:inline">{favorited ? 'Opgeslagen' : 'Bewaren'}</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 rounded-lg hover:bg-th-elevated text-th-text-dim hover:text-th-text transition-colors flex-shrink-0"
                aria-label="Sluiten"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Name */}
            <h2 className="text-xl sm:text-3xl font-bold text-th-text leading-tight">
              {wine.name}
            </h2>

            {/* Quote */}
            {wine.rating && (
              <blockquote className="text-sm sm:text-base font-medium text-th-text-sub italic leading-snug sm:leading-relaxed border-l-2 border-th-accent pl-3 sm:pl-4">
                &ldquo;{wine.rating}&rdquo;
              </blockquote>
            )}

            {/* Description */}
            {wine.description && (
              <p className="text-sm sm:text-base text-th-text-dim leading-snug sm:leading-relaxed line-clamp-3 sm:line-clamp-none">
                {wine.description}
              </p>
            )}

            {/* Metadata — compact inline on mobile, grid on desktop */}
            <div className="pt-3 sm:pt-4 border-t border-th-border">
              {/* Mobile: compact inline list */}
              <div className="sm:hidden space-y-2">
                <div className="flex items-center gap-1.5 text-sm">
                  <span className="font-semibold text-th-accent">@{wine.influencer_source}</span>
                  <span className="text-th-text-dim">·</span>
                  <span className="text-th-text-sub capitalize">{wine.wine_type}</span>
                  <span className="text-th-text-dim">·</span>
                  <span className="text-th-text-sub">{formatDate(wine.date_found)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-th-text-dim">{wine.supermarket}</span>
                  <a
                    href={(wine.post_url || '').split('#')[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-th-accent hover:underline font-medium"
                  >
                    Originele post <span>&rarr;</span>
                  </a>
                </div>
              </div>
              {/* Desktop: full grid */}
              <div className="hidden sm:grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-th-text-dim uppercase tracking-wider mb-1">Influencer</p>
                  <p className="text-sm font-semibold text-th-accent">@{wine.influencer_source}</p>
                </div>
                <div>
                  <p className="text-xs text-th-text-dim uppercase tracking-wider mb-1">Gevonden op</p>
                  <p className="text-sm text-th-text-sub">{formatDate(wine.date_found)}</p>
                </div>
                <div>
                  <p className="text-xs text-th-text-dim uppercase tracking-wider mb-1">Supermarkt</p>
                  <p className="text-sm text-th-text-sub">{wine.supermarket}</p>
                </div>
                <div>
                  <p className="text-xs text-th-text-dim uppercase tracking-wider mb-1">Type</p>
                  <p className="text-sm text-th-text-sub capitalize">{wine.wine_type}</p>
                </div>
              </div>
            </div>

            {/* Link to original post — desktop only (mobile has it inline above) */}
            <div className="hidden sm:block pt-4 border-t border-th-border">
              <a
                href={(wine.post_url || '').split('#')[0]}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-th-accent hover:underline font-medium"
              >
                Bekijk originele post
                <span>&rarr;</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default WineDetailModal;
