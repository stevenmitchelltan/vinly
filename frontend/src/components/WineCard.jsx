import React from 'react';
import { lightHaptic, mediumHaptic, selectionHaptic } from '../utils/haptics';

function WineCard({ wine }) {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [dragState, setDragState] = React.useState({
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    startTime: 0,
  });
  const [zoomState, setZoomState] = React.useState({
    scale: 1,
    translateX: 0,
    translateY: 0,
    isPinching: false,
    initialDistance: 0,
    initialScale: 1,
  });
  const containerRef = React.useRef(null);
  const imageContainerRef = React.useRef(null);

  // Swipe thresholds
  const SWIPE_THRESHOLD = 50; // px to trigger navigation
  const VELOCITY_THRESHOLD = 0.5; // px/ms for quick flick
  const MIN_ZOOM = 1;
  const MAX_ZOOM = 3;

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

  // Helper: Calculate distance between two touch points
  const getTouchDistance = (touch1, touch2) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Helper: Get center point between two touches
  const getTouchCenter = (touch1, touch2) => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
    };
  };

  // Reset zoom to default
  const resetZoom = () => {
    setZoomState({
      scale: 1,
      translateX: 0,
      translateY: 0,
      isPinching: false,
      initialDistance: 0,
      initialScale: 1,
    });
  };

  const goToNext = () => {
    if (currentImageIndex < images.length - 1) {
      selectionHaptic(); // Light haptic on carousel navigation
      setCurrentImageIndex((prev) => prev + 1);
    }
  };

  const goToPrevious = () => {
    if (currentImageIndex > 0) {
      selectionHaptic(); // Light haptic on carousel navigation
      setCurrentImageIndex((prev) => prev - 1);
    }
  };

  // Calculate the translateX value based on current index and drag offset
  const getTranslateX = () => {
    const containerWidth = containerRef.current?.offsetWidth || 0;
    const baseOffset = -currentImageIndex * containerWidth;
    
    if (!dragState.isDragging) {
      return baseOffset;
    }
    
    const dragOffset = dragState.currentX - dragState.startX;
    
    // Add resistance at edges (rubber band effect)
    const isAtStart = currentImageIndex === 0 && dragOffset > 0;
    const isAtEnd = currentImageIndex === images.length - 1 && dragOffset < 0;
    
    if (isAtStart || isAtEnd) {
      // Apply resistance: diminishing returns as you drag further
      return baseOffset + dragOffset * 0.3;
    }
    
    return baseOffset + dragOffset;
  };

  // Unified handler for both touch and mouse events
  const handleDragStart = (clientX, clientY) => {
    setDragState({
      isDragging: true,
      startX: clientX,
      startY: clientY,
      currentX: clientX,
      currentY: clientY,
      startTime: Date.now(),
    });
  };

  const handleDragMove = (clientX, clientY) => {
    if (!dragState.isDragging) return;
    
    setDragState(prev => ({
      ...prev,
      currentX: clientX,
      currentY: clientY,
    }));
  };

  const handleDragEnd = () => {
    if (!dragState.isDragging) return;
    
    const dragDistance = dragState.currentX - dragState.startX;
    const dragDuration = Date.now() - dragState.startTime;
    const velocity = Math.abs(dragDistance) / dragDuration;
    
    // Determine if we should navigate based on distance OR velocity
    const shouldNavigate = Math.abs(dragDistance) > SWIPE_THRESHOLD || velocity > VELOCITY_THRESHOLD;
    
    if (shouldNavigate) {
      if (dragDistance < 0 && currentImageIndex < images.length - 1) {
        // Swiped left -> next image
        mediumHaptic(); // Medium haptic on successful swipe
        setCurrentImageIndex(prev => prev + 1);
      } else if (dragDistance > 0 && currentImageIndex > 0) {
        // Swiped right -> previous image
        mediumHaptic(); // Medium haptic on successful swipe
        setCurrentImageIndex(prev => prev - 1);
      }
    }
    
    setDragState({
      isDragging: false,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      startTime: 0,
    });
  };

  // Touch event handlers with pinch-to-zoom support
  const onTouchStart = (e) => {
    if (e.touches.length === 2) {
      // Two fingers: start pinch zoom
      e.preventDefault();
      const distance = getTouchDistance(e.touches[0], e.touches[1]);
      setZoomState(prev => ({
        ...prev,
        isPinching: true,
        initialDistance: distance,
        initialScale: prev.scale,
      }));
    } else if (e.touches.length === 1) {
      // One finger: start drag/swipe (only if not zoomed)
      const touch = e.touches[0];
      if (zoomState.scale <= 1) {
        handleDragStart(touch.clientX, touch.clientY);
      } else {
        // When zoomed, one finger pans the image
        setDragState({
          isDragging: true,
          startX: touch.clientX,
          startY: touch.clientY,
          currentX: touch.clientX,
          currentY: touch.clientY,
          startTime: Date.now(),
        });
      }
    }
  };

  const onTouchMove = (e) => {
    // Always prevent default to stop page scrolling when touching carousel
    e.preventDefault();
    
    if (e.touches.length === 2 && zoomState.isPinching) {
      // Pinch zoom
      const distance = getTouchDistance(e.touches[0], e.touches[1]);
      const scale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, 
        zoomState.initialScale * (distance / zoomState.initialDistance)
      ));
      
      setZoomState(prev => ({
        ...prev,
        scale,
      }));
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];
      
      if (zoomState.scale > 1) {
        // Zoomed in: pan the image
        const deltaX = touch.clientX - dragState.startX;
        const deltaY = touch.clientY - dragState.startY;
        
        setZoomState(prev => ({
          ...prev,
          translateX: deltaX,
          translateY: deltaY,
        }));
      } else {
        // Not zoomed: carousel swipe
        handleDragMove(touch.clientX, touch.clientY);
      }
    }
  };

  const onTouchEnd = (e) => {
    if (zoomState.isPinching) {
      // End pinch - always spring back to normal (Instagram behavior)
      setZoomState(prev => ({
        ...prev,
        isPinching: false,
      }));
      
      // Spring back to normal zoom after a brief delay
      setTimeout(() => {
        resetZoom();
      }, 50);
    } else if (zoomState.scale > 1) {
      // End pan - spring back to normal
      setTimeout(() => {
        resetZoom();
      }, 50);
      
      setDragState({
        isDragging: false,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
        startTime: 0,
      });
    } else {
      // Normal carousel swipe end
      handleDragEnd();
    }
  };

  // Mouse event handlers for desktop
  const onMouseDown = (e) => {
    e.preventDefault();
    handleDragStart(e.clientX, e.clientY);
  };

  const onMouseMove = (e) => {
    if (dragState.isDragging) {
      e.preventDefault();
      handleDragMove(e.clientX, e.clientY);
    }
  };

  const onMouseUp = () => {
    handleDragEnd();
  };

  const onMouseLeave = () => {
    if (dragState.isDragging) {
      handleDragEnd();
    }
  };

  // Mouse wheel zoom for desktop with auto-reset
  const wheelResetTimeoutRef = React.useRef(null);
  
  const onWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      // Ctrl/Cmd + scroll = zoom
      e.preventDefault();
      const delta = -e.deltaY;
      const zoomSpeed = 0.01;
      const newScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, 
        zoomState.scale + delta * zoomSpeed
      ));
      
      setZoomState(prev => ({
        ...prev,
        scale: newScale,
      }));

      // Clear previous timeout
      if (wheelResetTimeoutRef.current) {
        clearTimeout(wheelResetTimeoutRef.current);
      }

      // Auto spring back after user stops scrolling
      wheelResetTimeoutRef.current = setTimeout(() => {
        resetZoom();
      }, 300);
    }
  };

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (!containerRef.current?.contains(document.activeElement)) return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNext();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentImageIndex, images.length]);

  return (
    <div className="wine-card animate-fade-in">
      {/* Image Carousel - 4:5 aspect ratio (vertical) - Instagram style with pinch zoom */}
      <div 
        ref={containerRef}
        className="relative bg-gradient-to-br from-burgundy-100 to-rose-100 w-full group overflow-hidden" 
        style={{ 
          aspectRatio: '4/5', 
          touchAction: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none',
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={hasMultipleImages && zoomState.scale <= 1 ? onMouseDown : undefined}
        onMouseMove={hasMultipleImages && zoomState.scale <= 1 ? onMouseMove : undefined}
        onMouseUp={hasMultipleImages && zoomState.scale <= 1 ? onMouseUp : undefined}
        onMouseLeave={hasMultipleImages && zoomState.scale <= 1 ? onMouseLeave : undefined}
        onWheel={onWheel}
        tabIndex={hasMultipleImages ? 0 : -1}
        role={hasMultipleImages ? "region" : undefined}
        aria-label={hasMultipleImages ? `Image carousel, ${images.length} images` : undefined}
      >
        {/* All images rendered side-by-side */}
        <div 
          className="absolute inset-0 flex"
          style={{
            transform: `translateX(${getTranslateX()}px)`,
            transition: dragState.isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: dragState.isDragging ? 'grabbing' : (hasMultipleImages ? 'grab' : 'default'),
            userSelect: 'none',
            WebkitUserSelect: 'none',
          }}
        >
          {images.length > 0 ? (
            images.map((img, idx) => (
              <div 
                key={idx} 
                ref={idx === currentImageIndex ? imageContainerRef : null}
                className="flex-shrink-0 w-full h-full flex items-center justify-center"
                style={{ 
                  width: '100%',
                  overflow: zoomState.scale > 1 ? 'visible' : 'hidden',
                }}
              >
                <img
                  src={getImageUrl(img)}
                  alt={`${wine.name} - image ${idx + 1}`}
                  loading={idx === 0 ? "eager" : "lazy"}
                  decoding="async"
                  width={800}
                  height={1000}
                  srcSet={(() => {
                    const raw = getImageUrl(img);
                    return isCloudinary(raw) ? buildCloudinarySrcSet(raw) : undefined;
                  })()}
                  sizes="(min-width:1280px) 25vw, (min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw"
                  className="w-full h-full object-cover pointer-events-none"
                  draggable="false"
                  style={idx === currentImageIndex ? {
                    transform: `scale(${zoomState.scale}) translate(${zoomState.translateX / zoomState.scale}px, ${zoomState.translateY / zoomState.scale}px)`,
                    transition: zoomState.isPinching || dragState.isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  } : {}}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/300x400?text=Wine+Bottle';
                  }}
                />
              </div>
            ))
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
              {getWineTypeEmoji(wine.wine_type)}
            </div>
          )}
        </div>

        {/* Navigation arrows - show on hover if multiple images (hidden when zoomed) */}
        {hasMultipleImages && zoomState.scale <= 1 && (
          <>
            <button
              onClick={() => {
                lightHaptic(); // Light haptic on button click
                goToPrevious();
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy-400"
              aria-label="Previous image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => {
                lightHaptic(); // Light haptic on button click
                goToNext();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy-400"
              aria-label="Next image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Dots indicator - Instagram style (hidden when zoomed) */}
        {hasMultipleImages && zoomState.scale <= 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5" role="tablist" aria-label="Image navigation">
            {images.map((_, idx) => (
              <button
                key={idx}
                role="tab"
                aria-selected={idx === currentImageIndex}
                aria-label={`View image ${idx + 1} of ${images.length}`}
                onClick={() => {
                  lightHaptic(); // Light haptic on dot click
                  setCurrentImageIndex(idx);
                }}
                className={`rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                  idx === currentImageIndex 
                    ? 'bg-white w-2 h-2' 
                    : 'bg-white/50 hover:bg-white/75 w-2 h-2'
                }`}
              />
            ))}
          </div>
        )}

        {/* Screen reader announcement for image changes */}
        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {hasMultipleImages && `Image ${currentImageIndex + 1} of ${images.length}`}
        </div>

        {/* Zoom hint (desktop only) */}
        {!hasMultipleImages && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
            Ctrl + scroll to zoom
          </div>
        )}
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

