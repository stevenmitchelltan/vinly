import { useState, useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { getImageUrl, isCloudinary, buildCloudinarySrcSet } from '../utils/image';
import { getWineTypeEmoji } from '../utils/wine';

function ImageCarousel({ images = [], wineName = '', wineType = '' }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, dragFree: false });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const hasMultiple = images.length > 1;

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    onSelect();
    return () => emblaApi.off('select', onSelect);
  }, [emblaApi, onSelect]);

  // Keyboard navigation
  useEffect(() => {
    if (!emblaApi || !hasMultiple) return;
    const container = emblaApi.rootNode();

    const handleKey = (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        emblaApi.scrollPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        emblaApi.scrollNext();
      }
    };

    container.addEventListener('keydown', handleKey);
    return () => container.removeEventListener('keydown', handleKey);
  }, [emblaApi, hasMultiple]);

  if (images.length === 0) {
    return (
      <div className="bg-gradient-to-br from-stone-100 to-stone-50 rounded-xl flex items-center justify-center text-6xl" style={{ aspectRatio: '4/5' }}>
        {getWineTypeEmoji(wineType)}
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={emblaRef}
        className="overflow-hidden rounded-xl bg-gradient-to-br from-stone-100 to-stone-50"
        style={{ aspectRatio: '4/5' }}
        tabIndex={hasMultiple ? 0 : -1}
        role={hasMultiple ? 'region' : undefined}
        aria-label={hasMultiple ? `Afbeeldingen carrousel, ${images.length} afbeeldingen` : undefined}
      >
        <div className="flex h-full">
          {images.map((img, idx) => {
            const url = getImageUrl(img);
            return (
              <div key={idx} className="flex-[0_0_100%] min-w-0 h-full flex items-center justify-center">
                <img
                  src={url}
                  alt={`${wineName} - afbeelding ${idx + 1}`}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  width={800}
                  height={1000}
                  srcSet={isCloudinary(url) ? buildCloudinarySrcSet(url) : undefined}
                  sizes="(min-width:1280px) 25vw, (min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw"
                  className="w-full h-full object-cover pointer-events-none"
                  draggable="false"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/300x400?text=Wine+Bottle';
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Dot indicators */}
      {hasMultiple && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 px-2.5 py-1.5 rounded-full bg-white/30 backdrop-blur-sm" role="tablist" aria-label="Afbeelding navigatie">
          {images.map((_, idx) => (
            <button
              key={idx}
              role="tab"
              aria-selected={idx === selectedIndex}
              aria-label={`Bekijk afbeelding ${idx + 1} van ${images.length}`}
              onClick={() => emblaApi?.scrollTo(idx)}
              className={`rounded-full transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                idx === selectedIndex
                  ? 'bg-white w-5 h-1.5'
                  : 'bg-white/50 hover:bg-white/70 w-1.5 h-1.5 hover:scale-110'
              }`}
            />
          ))}
        </div>
      )}

      {/* Screen reader announcement */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {hasMultiple && `Afbeelding ${selectedIndex + 1} van ${images.length}`}
      </div>
    </div>
  );
}

export default ImageCarousel;
