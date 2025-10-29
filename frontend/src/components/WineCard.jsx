import React from 'react';

function WineCard({ wine }) {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [touchStart, setTouchStart] = React.useState(null);
  const [touchEnd, setTouchEnd] = React.useState(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragOffset, setDragOffset] = React.useState(0);

  // Minimum swipe distance (in px) to trigger navigation
  const minSwipeDistance = 50;

  const getWineTypeEmoji = (type) => {
    const emojis = {
      red: '🍷',
      white: '🥂',
      rose: '🌸',
      sparkling: '🍾',
    };
    return emojis[type] || '🍷';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Prepend API base URL to image paths
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http')) return imageUrl;
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    return `${apiBaseUrl}${imageUrl}`;
  };

  const isCloudinary = (url) => /res\.cloudinary\.com/.test(url || '');
  const buildCloudinarySrcSet = (url) => {
    const widths = [320, 480, 640, 768, 1024, 1280];
    return widths.map((w) => url.replace('/upload/', `/upload/w_${w}/`) + ` ${w}w`).join(', ');
  };

  // Get images array (prefer image_urls, fallback to image_url)
  const images = wine.image_urls || (wine.image_url ? [wine.image_url] : []);
  const hasMultipleImages = images.length > 1;

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Touch event handlers for mobile swipe with live drag feedback
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    if (!touchStart) return;
    const currentTouch = e.targetTouches[0].clientX;
    setTouchEnd(currentTouch);
    
    // Calculate drag offset for live feedback
    const offset = currentTouch - touchStart;
    
    // Only set dragging state if user has moved more than 5px (prevents accidental drag on tap)
    if (Math.abs(offset) > 5) {
      setIsDragging(true);
      // Limit drag to reasonable range
      setDragOffset(Math.max(-150, Math.min(150, offset)));
    }
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setIsDragging(false);
      setDragOffset(0);
      return;
    }
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentImageIndex < images.length - 1) {
      goToNext();
    } else if (isRightSwipe && currentImageIndex > 0) {
      goToPrevious();
    }
    
    // Reset drag state
    setIsDragging(false);
    setDragOffset(0);
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div className="wine-card animate-fade-in">
      {/* Image Carousel - 4:5 aspect ratio (vertical) */}
      <div 
        className="relative bg-gradient-to-br from-burgundy-100 to-rose-100 w-full group" 
        style={{ aspectRatio: '4/5' }}
        onTouchStart={hasMultipleImages ? onTouchStart : undefined}
        onTouchMove={hasMultipleImages ? onTouchMove : undefined}
        onTouchEnd={hasMultipleImages ? onTouchEnd : undefined}
      >
        <div 
          className="absolute inset-0 flex items-center justify-center overflow-hidden"
          style={{
            transform: isDragging ? `translateX(${dragOffset}px)` : 'translateX(0)',
            transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {images.length > 0 ? (
            <img
              src={getImageUrl(images[currentImageIndex])}
              alt={wine.name}
              loading="lazy"
              decoding="async"
              width={800}
              height={1000}
              srcSet={(() => {
                const raw = getImageUrl(images[currentImageIndex]);
                return isCloudinary(raw) ? buildCloudinarySrcSet(raw) : undefined;
              })()}
              sizes="(min-width:1280px) 25vw, (min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw"
              className="w-full h-full object-cover transition-opacity duration-300"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/300x400?text=Wine+Bottle';
              }}
            />
          ) : (
            <div className="text-6xl">{getWineTypeEmoji(wine.wine_type)}</div>
          )}
        </div>

        {/* Navigation arrows - show on hover if multiple images */}
        {hasMultipleImages && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy-400"
              aria-label="Previous image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy-400"
              aria-label="Next image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Dots indicator - Instagram style */}
        {hasMultipleImages && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`rounded-full transition-all p-1 ${
                  idx === currentImageIndex 
                    ? 'bg-white w-2 h-2' 
                    : 'bg-white/50 hover:bg-white/75 w-2 h-2'
                }`}
                aria-label={`View image ${idx + 1}`}
              />
            ))}
          </div>
        )}
        
        {/* Voorraad functionality removed */}
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        {/* Supermarket badge */}
        <div className="flex items-center justify-between">
          <span className="inline-block bg-gradient-to-r from-burgundy-100 to-burgundy-200 text-burgundy-900 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide shadow-sm">
            {wine.supermarket}
          </span>
          <span className="text-3xl">{getWineTypeEmoji(wine.wine_type)}</span>
        </div>

        {/* Wine name */}
        <h3 className="font-bold text-xl text-gray-900 leading-tight min-h-[3rem] flex items-center">
          {wine.name}
        </h3>

        {/* Quote */}
{wine.rating && (
  <p className="text-sm font-medium text-gray-700 italic leading-relaxed border-l-2 border-burgundy-300 pl-3">
    "{wine.rating}"
  </p>
)}

        {/* Description */}
        {wine.description && (
          <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed font-inter">
            {wine.description}
          </p>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-gray-100 space-y-2">
          <p className="text-xs text-gray-500 font-medium">
            📸 van <span className="font-semibold text-burgundy-800">@{wine.influencer_source}</span>
          </p>
          <p className="text-xs text-gray-500">
            {formatDate(wine.date_found)}
          </p>
          
          {/* Link to Instagram post */}
          <a
            href={wine.post_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-burgundy-700 hover:text-burgundy-900 font-semibold hover:gap-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy-400 rounded"
          >
            Bekijk originele post 
            <span className="text-base">→</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default WineCard;

