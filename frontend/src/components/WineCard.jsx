import React from 'react';
import { clampPan, projectMomentum, pinchScale } from '../utils/gesture.js';
import { useResizeObserver } from '../utils/useResizeObserver.js';

function WineCard({ wine }) {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [showResetZoom, setShowResetZoom] = React.useState(false);
  const [scale, setScale] = React.useState(1); // Track scale for UI reactivity
  
  // Refs for gesture state (avoid React re-renders during drag/zoom)
  const scaleRef = React.useRef(1);
  const txRef = React.useRef(0);
  const tyRef = React.useRef(0);
  const isDraggingRef = React.useRef(false);
  const lastMoveRef = React.useRef({ x: 0, y: 0, time: 0 });
  const velocityRef = React.useRef({ vx: 0, vy: 0 });
  
  // Pointer tracking
  const pointersRef = React.useRef(new Map()); // Map<pointerId, {x, y}>
  const pinchStartRef = React.useRef({ dist: 0, scale: 1, center: { x: 0, y: 0 } });
  
  // Animation
  const rafRef = React.useRef(null);
  const momentumAnimRef = React.useRef(null);
  
  const containerRef = React.useRef(null);
  const carouselRef = React.useRef(null);
  const activeImageRef = React.useRef(null);
  
  const containerSize = useResizeObserver(containerRef);
  
  // Check prefers-reduced-motion
  const prefersReducedMotion = React.useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);
  
  const MIN_ZOOM = 1;
  const MAX_ZOOM = 3;
  const SWIPE_THRESHOLD = 50; // px
  const VELOCITY_THRESHOLD = 0.5; // px/ms
  
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
    if (!dateString) return 'Datum onbekend';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Datum onbekend';
      return date.toLocaleDateString('nl-NL', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return 'Datum onbekend';
    }
  };
  
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http')) return imageUrl;
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    return `${apiBaseUrl}${imageUrl}`;
  };
  
  const isCloudinary = (url) => /res\.cloudinary\.com/.test(url || '');
  
  const buildCloudinarySrcSet = (url) => {
    const widths = [320, 480, 640, 768, 1024, 1280];
    return widths.map((w) => {
      // Preserve existing transforms, add f_auto,q_auto if not present
      const parts = url.split('/upload/');
      if (parts.length !== 2) return url;
      const [base, path] = parts;
      // Check if transforms already exist
      if (path.includes('/')) {
        // Has transforms, insert before them
        const pathParts = path.split('/');
        return `${base}/upload/f_auto,q_auto,w_${w}/${pathParts.slice(1).join('/')} ${w}w`;
      }
      return `${base}/upload/f_auto,q_auto,w_${w}/${path} ${w}w`;
    }).join(', ');
  };
  
  const images = wine.image_urls || (wine.image_url ? [wine.image_url] : []);
  const hasMultipleImages = images.length > 1;
  
  // Get pointer distance (for pinch)
  const getPointerDistance = (p1, p2) => {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  };
  
  // Get pointer center
  const getPointerCenter = (p1, p2) => ({
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  });
  
  // Update transform via rAF (no React state)
  const updateTransform = React.useCallback(() => {
    if (!carouselRef.current || !activeImageRef.current) return;
    
    const containerWidth = containerRef.current?.offsetWidth || containerSize.width || 0;
    const baseOffset = -currentImageIndex * containerWidth;
    
    // Carousel transform
    const carouselTx = baseOffset + (isDraggingRef.current ? txRef.current : 0);
    carouselRef.current.style.transform = `translate3d(${carouselTx}px, 0, 0)`;
    
    // Image zoom/pan transform
    const scale = scaleRef.current;
    const clamped = clampPan(
      { tx: txRef.current, ty: tyRef.current },
      { cw: containerWidth, ch: containerRef.current?.offsetHeight || 0 },
      {},
      scale
    );
    
    activeImageRef.current.style.transform = `translate3d(${clamped.tx / scale}px, ${clamped.ty / scale}px, 0) scale(${scale})`;
    
    // Update touch-action based on zoom
    if (containerRef.current) {
      if (scale > 1) {
        containerRef.current.style.touchAction = 'none';
      } else {
        // Try pinch-zoom, fallback to pan-y
        containerRef.current.style.touchAction = 'pan-y pinch-zoom';
      }
    }
  }, [currentImageIndex, containerSize.width]);
  
  // rAF loop
  React.useEffect(() => {
    const loop = () => {
      updateTransform();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (momentumAnimRef.current) cancelAnimationFrame(momentumAnimRef.current);
    };
  }, [updateTransform]);
  
  // Reset zoom
  const resetZoom = () => {
    scaleRef.current = 1;
    txRef.current = 0;
    tyRef.current = 0;
    setScale(1);
    setShowResetZoom(false);
    updateTransform();
  };
  
  // Pointer Events
  const handlePointerDown = (e) => {
    if (!containerRef.current) return;
    
    const pointer = { id: e.pointerId, x: e.clientX, y: e.clientY };
    pointersRef.current.set(e.pointerId, pointer);
    
    containerRef.current.setPointerCapture(e.pointerId);
    
    const count = pointersRef.current.size;
    
    if (count === 1) {
      // Single pointer: carousel swipe or pan when zoomed
      const scale = scaleRef.current;
      
      if (scale > 1) {
        // Pan zoomed image
        isDraggingRef.current = true;
        const rect = containerRef.current.getBoundingClientRect();
        lastMoveRef.current = {
          x: e.clientX - rect.left - containerRef.current.offsetWidth / 2,
          y: e.clientY - rect.top - containerRef.current.offsetHeight / 2,
          time: Date.now(),
        };
        pointer.startX = txRef.current;
        pointer.startY = tyRef.current;
      } else {
        // Carousel swipe
        isDraggingRef.current = true;
        lastMoveRef.current = {
          x: e.clientX,
          y: e.clientY,
          time: Date.now(),
        };
        pointer.startX = e.clientX;
        pointer.startY = e.clientY;
        velocityRef.current = { vx: 0, vy: 0 };
      }
    } else if (count === 2) {
      // Two pointers: pinch-to-zoom
      e.preventDefault();
      const pointers = Array.from(pointersRef.current.values());
      const dist = getPointerDistance(pointers[0], pointers[1]);
      const center = getPointerCenter(pointers[0], pointers[1]);
      const rect = containerRef.current.getBoundingClientRect();
      
      pinchStartRef.current = {
        dist,
        scale: scaleRef.current,
        center: {
          x: center.x - rect.left - containerRef.current.offsetWidth / 2,
          y: center.y - rect.top - containerRef.current.offsetHeight / 2,
        },
      };
      isDraggingRef.current = true;
    }
  };
  
  const handlePointerMove = (e) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    
    const pointer = pointersRef.current.get(e.pointerId);
    if (!pointer) return;
    
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    
    const count = pointersRef.current.size;
    
    if (count === 1 && scaleRef.current > 1) {
      // Pan zoomed image
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = e.clientX - rect.left - containerRef.current.offsetWidth / 2;
      const centerY = e.clientY - rect.top - containerRef.current.offsetHeight / 2;
      
      const deltaX = centerX - lastMoveRef.current.x;
      const deltaY = centerY - lastMoveRef.current.y;
      
      txRef.current = pointer.startX + deltaX;
      tyRef.current = pointer.startY + deltaY;
      
      const now = Date.now();
      const dt = Math.max(1, now - lastMoveRef.current.time);
      velocityRef.current = {
        vx: deltaX / dt,
        vy: deltaY / dt,
      };
      
      lastMoveRef.current = { x: centerX, y: centerY, time: now };
    } else if (count === 1 && scaleRef.current <= 1) {
      // Carousel swipe
      const deltaX = e.clientX - pointer.startX;
      txRef.current = deltaX;
      
      const now = Date.now();
      const dt = Math.max(1, now - lastMoveRef.current.time);
      const vx = (e.clientX - lastMoveRef.current.x) / dt;
      velocityRef.current = { vx, vy: 0 };
      
      lastMoveRef.current = { x: e.clientX, y: e.clientY, time: now };
    } else if (count === 2) {
      // Pinch-to-zoom
      e.preventDefault();
      const pointers = Array.from(pointersRef.current.values());
      const dist = getPointerDistance(pointers[0], pointers[1]);
      
      const newScale = pinchScale(
        pinchStartRef.current.dist,
        dist,
        pinchStartRef.current.scale,
        MIN_ZOOM,
        MAX_ZOOM
      );
      
      scaleRef.current = newScale;
      setScale(newScale);
      setShowResetZoom(newScale > 1);
      
      // Pan to keep pinch center fixed
      const center = getPointerCenter(pointers[0], pointers[1]);
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = center.x - rect.left - containerRef.current.offsetWidth / 2;
      const centerY = center.y - rect.top - containerRef.current.offsetHeight / 2;
      
      const scaleDelta = newScale - pinchStartRef.current.scale;
      txRef.current = pinchStartRef.current.center.x * scaleDelta;
      tyRef.current = pinchStartRef.current.center.y * scaleDelta;
    }
  };
  
  const handlePointerUp = (e) => {
    const pointer = pointersRef.current.get(e.pointerId);
    if (!pointer) return;
    
    if (containerRef.current) {
      containerRef.current.releasePointerCapture(e.pointerId);
    }
    
    pointersRef.current.delete(e.pointerId);
    
    const count = pointersRef.current.size;
    
    if (count === 0) {
      isDraggingRef.current = false;
      
      if (scaleRef.current > 1) {
        // End pan while zoomed - no momentum, just clamp
        updateTransform();
      } else {
        // Carousel swipe end - apply momentum
        const containerWidth = containerRef.current?.offsetWidth || containerSize.width || 0;
        const distance = txRef.current;
        const duration = Date.now() - lastMoveRef.current.time;
        const velocity = velocityRef.current.vx;
        
        const shouldNavigate = Math.abs(distance) > SWIPE_THRESHOLD || 
          (duration > 0 && Math.abs(velocity) > VELOCITY_THRESHOLD);
        
        if (shouldNavigate && !prefersReducedMotion) {
          // Apply momentum
          const projectedDelta = projectMomentum(velocity, 250, containerWidth);
          const targetOffset = distance + projectedDelta;
          
          let targetIndex = currentImageIndex;
          if (targetOffset < -containerWidth / 2 && currentImageIndex < images.length - 1) {
            targetIndex = currentImageIndex + 1;
          } else if (targetOffset > containerWidth / 2 && currentImageIndex > 0) {
            targetIndex = currentImageIndex - 1;
          }
          
          // Animate to target
          const startOffset = txRef.current;
          const endOffset = targetIndex === currentImageIndex ? 0 : 
            (targetIndex > currentImageIndex ? -containerWidth : containerWidth);
          
          let startTime = null;
          const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / 300, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            txRef.current = startOffset + (endOffset - startOffset) * eased;
            updateTransform();
            
            if (progress < 1) {
              momentumAnimRef.current = requestAnimationFrame(animate);
            } else {
              setCurrentImageIndex(targetIndex);
              txRef.current = 0;
              updateTransform();
            }
          };
          momentumAnimRef.current = requestAnimationFrame(animate);
        } else {
          // Snap to nearest
          let targetIndex = currentImageIndex;
          if (distance < -containerWidth / 2 && currentImageIndex < images.length - 1) {
            targetIndex = currentImageIndex + 1;
          } else if (distance > containerWidth / 2 && currentImageIndex > 0) {
            targetIndex = currentImageIndex - 1;
          }
          
          setCurrentImageIndex(targetIndex);
          txRef.current = 0;
          updateTransform();
        }
      }
    }
  };
  
  const handlePointerCancel = (e) => {
    if (containerRef.current) {
      containerRef.current.releasePointerCapture(e.pointerId);
    }
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size === 0) {
      isDraggingRef.current = false;
      txRef.current = 0;
      tyRef.current = 0;
      updateTransform();
    }
  };
  
  // Wheel zoom around cursor
  const handleWheel = (e) => {
    if (!(e.ctrlKey || e.metaKey) || !activeImageRef.current || !containerRef.current) return;
    
    e.preventDefault();
    
    const rect = containerRef.current.getBoundingClientRect();
    const cursorX = e.clientX - rect.left - rect.width / 2;
    const cursorY = e.clientY - rect.top - rect.height / 2;
    
    const delta = -e.deltaY * 0.01;
    const oldScale = scaleRef.current;
    const newScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, oldScale + delta));
    
    if (newScale !== oldScale) {
      // Adjust translate so cursor point stays fixed
      const scaleDelta = newScale - oldScale;
      txRef.current += cursorX * scaleDelta;
      tyRef.current += cursorY * scaleDelta;
      
      scaleRef.current = newScale;
      setScale(newScale);
      setShowResetZoom(newScale > 1);
      updateTransform();
    }
  };
  
  // Keyboard navigation
  const goToPrevious = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };
  
  const goToNext = () => {
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    }
  };
  
  const goToFirst = () => {
    setCurrentImageIndex(0);
  };
  
  const goToLast = () => {
    setCurrentImageIndex(images.length - 1);
  };
  
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (!containerRef.current?.contains(document.activeElement)) return;
      
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'Home') {
        e.preventDefault();
        goToFirst();
      } else if (e.key === 'End') {
        e.preventDefault();
        goToLast();
      } else if (e.key === 'Escape' && scaleRef.current > 1) {
        e.preventDefault();
        resetZoom();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentImageIndex, images.length]);
  
  // Update transform when index changes
  React.useEffect(() => {
    txRef.current = 0;
    updateTransform();
  }, [currentImageIndex]);
  
  // Safe fallbacks
  const influencerSource = wine.influencer_source ? 
    wine.influencer_source.replace(/^@/, '') : 'Onbekend';
  const postUrl = wine.post_url?.split('#')[0];
  const hasValidPostUrl = postUrl && postUrl.startsWith('http');
  
  return (
    <div className="wine-card animate-fade-in">
      {/* Image Carousel */}
      <div className="p-3">
        <div
          ref={containerRef}
          className="relative bg-gradient-to-br from-gray-50 to-stone-100 w-full group overflow-hidden rounded-xl"
          style={{ 
            aspectRatio: '4/5',
            WebkitUserSelect: 'none',
            userSelect: 'none',
            touchAction: scale > 1 ? 'none' : 'pan-y pinch-zoom',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onWheel={handleWheel}
          tabIndex={hasMultipleImages ? 0 : -1}
          role={hasMultipleImages ? "region" : undefined}
          aria-label={hasMultipleImages ? `Afbeeldingcarrousel, ${images.length} afbeeldingen` : undefined}
        >
          {/* Carousel track */}
          <div 
            ref={carouselRef}
            className="absolute inset-0 flex"
            style={{
              willChange: 'transform',
              transition: isDraggingRef.current || momentumAnimRef.current ? 'none' : 
                (prefersReducedMotion ? 'transform 0.15s ease-out' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'),
            }}
          >
            {images.length > 0 ? (
              images.map((img, idx) => (
                <div 
                  key={idx} 
                  ref={idx === currentImageIndex ? activeImageRef : null}
                  className="flex-shrink-0 w-full h-full flex items-center justify-center"
                  style={{ 
                    width: '100%',
                    overflow: scaleRef.current > 1 ? 'visible' : 'hidden',
                  }}
                >
                  <img
                    src={getImageUrl(img)}
                    alt={`${wine.name} - afbeelding ${idx + 1}`}
                    fetchPriority={idx === 0 ? "high" : undefined}
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
                    style={{
                      willChange: idx === currentImageIndex ? 'transform' : 'auto',
                    }}
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
          
          {/* Reset zoom button */}
          {showResetZoom && (
            <button
              onClick={resetZoom}
              className="absolute top-3 right-3 bg-black/70 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-black/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white z-10"
              aria-label="Reset zoom"
            >
              Reset zoom
            </button>
          )}
          
          {/* Dots indicator - proper a11y */}
          {hasMultipleImages && scale <= 1 && (
            <nav aria-label="Afbeeldingnavigatie">
              <ul className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 px-2.5 py-1.5 rounded-full bg-white/30 backdrop-blur-sm" role="list">
                {images.map((_, idx) => (
                  <li key={idx}>
                    <button
                      aria-label={`Afbeelding ${idx + 1} van ${images.length}`}
                      aria-current={idx === currentImageIndex ? 'true' : undefined}
                      onClick={() => {
                        setCurrentImageIndex(idx);
                        containerRef.current?.focus();
                      }}
                      className={`rounded-full transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1 focus-visible:ring-offset-black/20 ${
                        idx === currentImageIndex 
                          ? 'bg-white w-5 h-1.5' 
                          : 'bg-white/50 hover:bg-white/70 w-1.5 h-1.5 hover:scale-110'
                      }`}
                      style={{
                        minWidth: '32px',
                        minHeight: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    />
                  </li>
                ))}
              </ul>
            </nav>
          )}
          
          {/* Screen reader announcement */}
          <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
            {hasMultipleImages && `Afbeelding ${currentImageIndex + 1} van ${images.length}`}
          </div>
          
          {/* Zoom hint (desktop only) */}
          {!hasMultipleImages && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
              Ctrl + scroll om te zoomen
            </div>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6 space-y-3">
        {/* Supermarket badge */}
        <div className="flex items-center justify-between">
          <span className="inline-block bg-gray-100 text-gray-700 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide shadow-sm">
            {wine.supermarket}
          </span>
          <span className="text-3xl">{getWineTypeEmoji(wine.wine_type)}</span>
        </div>
        
        {/* Wine name */}
        <h3 className="font-bold text-2xl text-gray-900 leading-snug min-h-[3rem] flex items-center">
          {wine.name}
        </h3>
        
        {/* Quote */}
        {wine.rating && (
          <p className="text-sm font-medium text-gray-800 italic leading-relaxed border-l-2 border-burgundy-300 pl-3">
            "{wine.rating}"
          </p>
        )}
        
        {/* Description */}
        {wine.description && (
          <p className="text-sm text-gray-700 line-clamp-4 leading-loose font-inter">
            {wine.description}
          </p>
        )}
        
        {/* Footer */}
        <div className="pt-4 border-t border-gray-100 space-y-2">
          <p className="text-xs text-gray-600 font-medium">
            📸 van <span className="font-semibold text-amber-700">{influencerSource}</span>
          </p>
          <p className="text-xs text-gray-600">
            {formatDate(wine.date_found)}
          </p>
          
          {/* Link to original post */}
          {hasValidPostUrl && (
            <a
              href={postUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-burgundy-700 hover:text-burgundy-900 font-semibold hover:gap-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy-400 rounded"
            >
              Bekijk originele post 
              <span className="text-base">→</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default WineCard;
