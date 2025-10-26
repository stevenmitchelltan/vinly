import React from 'react';

function WineCard({ wine }) {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [touchStart, setTouchStart] = React.useState(null);
  const [touchEnd, setTouchEnd] = React.useState(null);

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

  // Get images array (prefer image_urls, fallback to image_url)
  const images = wine.image_urls || (wine.image_url ? [wine.image_url] : []);
  const hasMultipleImages = images.length > 1;

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Touch event handlers for mobile swipe
  const onTouchStart = (e) => {
    setTouchEnd(null); // Reset end position
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
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
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          {images.length > 0 ? (
            <img
              src={getImageUrl(images[currentImageIndex])}
              alt={wine.name}
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
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Previous image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity min-w-[44px] min-h-[44px] flex items-center justify-center"
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
        
        {/* Stock status badge */}
        {wine.in_stock !== null && (
          <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
            wine.in_stock ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
          }`}>
            {wine.in_stock ? '✓ Op voorraad' : '✗ Mogelijk uitverkocht'}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        {/* Supermarket badge */}
        <div className="flex items-center justify-between">
          <span className="inline-block bg-gradient-to-r from-burgundy-100 to-burgundy-200 text-burgundy-800 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide shadow-sm">
            {wine.supermarket}
          </span>
          <span className="text-3xl">{getWineTypeEmoji(wine.wine_type)}</span>
        </div>

        {/* Wine name */}
        <h3 className="font-bold text-xl text-gray-900 leading-tight min-h-[3rem] flex items-center">
          {wine.name}
        </h3>

        {/* Rating */}
        {wine.rating && (
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-burgundy-600 to-burgundy-800 bg-clip-text text-transparent">{wine.rating}</span>
          </div>
        )}

        {/* Description */}
        {wine.description && (
          <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
            {wine.description}
          </p>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-gray-100 space-y-2">
          <p className="text-xs text-gray-500 font-medium">
            📸 van <span className="font-semibold text-burgundy-700">@{wine.influencer_source}</span>
          </p>
          <p className="text-xs text-gray-400">
            {formatDate(wine.date_found)}
          </p>
          
          {/* Link to Instagram post */}
          <a
            href={wine.post_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-burgundy-600 hover:text-burgundy-800 font-semibold hover:gap-2 transition-all"
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

