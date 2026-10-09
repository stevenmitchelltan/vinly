import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import ImageCarousel from './ImageCarousel';
import { wineTypes, formatDate } from '../utils/wine';
import WineReview from './WineReview';
import { useFavorites } from '../context/FavoritesContext';
import { SupermarketIcon } from './icons/SupermarketIcons';

const PEEK_VH = 50; // how far down the sheet is in peek mode (dvh)

function WineDetailModal({ wine, onClose }) {
  const { isFavorite, toggleFavorite } = useFavorites();

  if (!wine) return null;

  const images = wine.image_urls || (wine.image_url ? [wine.image_url] : []);
  const favorited = isFavorite(wine.id);
  const type = wineTypes[wine.wine_type];
  const postUrl = (wine.post_url || '').split('#')[0];
  const dialogRef = useRef(null);
  const metadata = (
    <div className="flex items-center gap-4 flex-1 min-w-0 text-xs text-th-text-sub">
      <span className="inline-flex items-center gap-2 min-w-0">
        <SupermarketIcon name={wine.supermarket} />
        <span className="truncate">{wine.supermarket}</span>
      </span>
      {type && (
        <span className="inline-flex items-center gap-1.5 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: type.color }} aria-hidden="true" />
          {type.label}
        </span>
      )}
    </div>
  );

  // Desktop: click-outside tracking
  const mouseDownTarget = useRef(null);

  // Mobile bottom sheet
  const [sheetMounted, setSheetMounted] = useState(false);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [sheetDragPx, setSheetDragPx] = useState(0);
  const [isDraggingSheet, setIsDraggingSheet] = useState(false);
  const sheetTouchStartY = useRef(null);
  const dismissed = useRef(false);

  // Animate sheet in after mount
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setSheetMounted(true));
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  // Body scroll lock + Escape
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const previousFocus = document.activeElement;
    const visibleControls = () => Array.from(dialogRef.current?.querySelectorAll('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])') || [])
      .filter(el => el.getClientRects().length > 0 && !el.disabled);
    const closeButton = Array.from(dialogRef.current?.querySelectorAll('button[aria-label="Sluiten"]') || [])
      .find(el => el.getClientRects().length > 0);
    closeButton?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key !== 'Tab') return;
      const controls = visibleControls();
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (!first) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
      previousFocus?.focus();
    };
  }, [onClose]);

  // Sheet drag handlers (on the drag handle zone)
  const onDragStart = useCallback((e) => {
    sheetTouchStartY.current = e.touches[0].clientY;
    setIsDraggingSheet(true);
  }, []);

  const onDragMove = useCallback((e) => {
    if (sheetTouchStartY.current === null) return;
    setSheetDragPx(e.touches[0].clientY - sheetTouchStartY.current);
  }, []);

  const onDragEnd = useCallback(() => {
    if (sheetTouchStartY.current === null) return;

    if (sheetExpanded) {
      // Expanded → drag down to collapse
      if (sheetDragPx > 80) setSheetExpanded(false);
    } else {
      // Peek → drag up to expand, drag down to dismiss
      if (sheetDragPx < -50) {
        setSheetExpanded(true);
      } else if (sheetDragPx > 100 && !dismissed.current) {
        dismissed.current = true;
        onClose();
        return;
      }
    }

    setSheetDragPx(0);
    sheetTouchStartY.current = null;
    setIsDraggingSheet(false);
  }, [sheetExpanded, sheetDragPx, onClose]);

  // Sheet position
  const sheetTranslateVh = sheetMounted ? (sheetExpanded ? 0 : PEEK_VH) : 100;
  const sheetTransform = sheetDragPx !== 0
    ? `translateY(calc(${sheetTranslateVh}dvh + ${sheetDragPx}px))`
    : `translateY(${sheetTranslateVh}dvh)`;

  // Shared heart SVGs
  const heartFilled = (cls) => (
    <svg className={cls} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
    </svg>
  );
  const heartOutline = (cls) => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  );

  return createPortal(
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-label={wine.name} className="fixed inset-0 z-50">

      {/* ===== MOBILE: full-screen image + bottom sheet ===== */}
      <div className="md:hidden absolute inset-0 bg-black">
        {/* Full-screen image */}
        <div className="absolute inset-0">
          <ImageCarousel images={images} wineName={wine.name} wineType={wine.wine_type} bottleImage={wine.bottle_image_url} bottlePresentation={wine.bottle_image_presentation} bottleLayout="mobile" overlay counterPill hideIndicators />
        </div>

        {/* Close button on image */}
        <button
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white/80 active:scale-95 transition-transform"
          onClick={onClose}
          aria-label="Sluiten"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Favorite button on image */}
        <button
          className="absolute top-4 left-4 z-20 p-2.5 rounded-full bg-black/40 backdrop-blur-md active:scale-110 transition-transform"
          onClick={() => toggleFavorite(wine.id)}
          aria-pressed={favorited}
          aria-label={favorited ? 'Verwijder uit favorieten' : 'Voeg toe aan favorieten'}
        >
          {favorited
            ? heartFilled('w-5 h-5 text-burgundy-700 fill-burgundy-700')
            : heartOutline('w-5 h-5 text-white/80')
          }
        </button>

        {/* Bottom sheet */}
        <div
          className="absolute inset-x-0 bottom-0 bg-th-surface rounded-t-2xl"
          style={{
            height: '85dvh',
            transform: sheetTransform,
            transition: isDraggingSheet ? 'none' : 'transform 0.4s cubic-bezier(0.32,0.72,0,1)',
            boxShadow: '0 -8px 30px rgba(0,0,0,0.25)',
          }}
        >
          {/* Drag handle zone */}
          <div
            className="touch-none cursor-grab active:cursor-grabbing"
            onTouchStart={onDragStart}
            onTouchMove={onDragMove}
            onTouchEnd={onDragEnd}
          >
            <button
              onClick={() => setSheetExpanded(!sheetExpanded)}
              aria-expanded={sheetExpanded}
              aria-label={sheetExpanded ? 'Toon minder wijninformatie' : 'Toon alle wijninformatie'}
              className="flex justify-center items-center w-full h-11 rounded-t-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-th-accent"
            >
              <span className="w-10 h-1 rounded-full bg-th-border-sub" />
            </button>
          </div>

          {/* Sheet content */}
          <div
            className={`px-5 pb-10 space-y-3 ${sheetExpanded ? 'overflow-y-auto' : 'overflow-hidden'}`}
            style={{ height: 'calc(100% - 2.75rem)' }}
          >
            {metadata}

            {/* Wine name */}
            <h2 className="font-fraunces text-xl font-semibold text-th-text leading-snug">
              {wine.name}
            </h2>

            <WineReview wine={wine} className="text-sm" />

            {/* Description */}
            {wine.description && (
              <p className="text-sm text-th-text-sub leading-relaxed">
                {wine.description}
              </p>
            )}

            <div className="flex items-center justify-between gap-4 pt-3 border-t border-th-border">
              <p className="text-xs text-th-text-dim">Gevonden op {formatDate(wine.date_found)}</p>
              {postUrl && (
                <a href={postUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 text-xs text-th-accent hover:underline underline-offset-2 font-medium rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-th-accent">
                  Originele post <span aria-hidden="true">&rarr;</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== DESKTOP: side-by-side modal ===== */}
      <div
        className="hidden md:flex fixed inset-0 items-center justify-center bg-black/60 backdrop-blur-sm py-6 px-4"
        onMouseDown={(e) => { mouseDownTarget.current = e.target; }}
        onClick={(e) => { if (e.target === e.currentTarget && mouseDownTarget.current === e.currentTarget) onClose(); }}
      >
        <div className="w-full max-w-4xl max-h-[90vh] bg-th-surface rounded-2xl overflow-hidden border border-th-border shadow-2xl animate-scale-in">
          <div className="flex flex-row max-h-[90vh]">
            {/* Image — left */}
            <div className="relative w-[45%] flex-shrink-0 overflow-hidden">
              <ImageCarousel images={images} wineName={wine.name} wineType={wine.wine_type} bottleImage={wine.bottle_image_url} bottlePresentation={wine.bottle_image_presentation} overlay />
            </div>

            {/* Content — right */}
            <div className="flex-1 overflow-y-auto p-8 space-y-5">
              {/* Header */}
              <div className="flex items-center gap-2">
                {metadata}
                <button
                  onClick={() => toggleFavorite(wine.id)}
                  aria-pressed={favorited}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all active:scale-110 border border-th-border-sub hover:bg-th-elevated/60 flex-shrink-0"
                >
                  {favorited
                    ? heartFilled('w-5 h-5 text-burgundy-700 fill-burgundy-700')
                    : heartOutline('w-5 h-5 text-th-text-dim')
                  }
                  <span className="text-th-text-sub">{favorited ? 'Opgeslagen' : 'Bewaren'}</span>
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-th-elevated text-th-text-dim hover:text-th-text transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-th-accent"
                  aria-label="Sluiten"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <h2 className="font-fraunces text-3xl font-semibold text-th-text leading-snug">{wine.name}</h2>

              <WineReview wine={wine} className="text-base" />

              {wine.description && (
                <p className="text-th-text-sub leading-relaxed">{wine.description}</p>
              )}

              <div className="flex items-center justify-between gap-4 pt-4 border-t border-th-border">
                <div>
                  <p className="text-xs text-th-text-dim mb-1">Gevonden op</p>
                  <p className="text-sm text-th-text-sub">{formatDate(wine.date_found)}</p>
                </div>
                {postUrl && (
                  <a href={postUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-th-accent hover:underline underline-offset-2 font-medium rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-th-accent">
                    Bekijk originele post <span aria-hidden="true">&rarr;</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>,
    document.body
  );
}

export default WineDetailModal;
