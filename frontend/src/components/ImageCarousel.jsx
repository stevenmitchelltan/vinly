import { useState, useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { getImageUrl, isCloudinary, buildCloudinarySrcSet } from '../utils/image';
import BottlePhoto from './BottlePhoto';
import { getWineTypeEmoji } from '../utils/wine';

function ImageCarousel({ images = [], wineName = '', wineType = '', bottleImage = '', bottlePresentation, bottleLayout = 'detail', overlay = false, hideIndicators = false, counterPill = false, renderFooter }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, dragFree: false });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [errorIndices, setErrorIndices] = useState(new Set());

  const hasMultiple = images.length > 1;
  const catalogueIndicators = bottleLayout === 'catalogue';

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
    const fallbackClass = overlay
      ? 'w-full h-full flex items-center justify-center text-6xl'
      : 'bg-gradient-to-br from-stone-100 to-stone-50 rounded-xl flex items-center justify-center text-6xl';
    return (
      <div className={fallbackClass} style={overlay ? undefined : { aspectRatio: '3/4' }}>
        {getWineTypeEmoji(wineType)}
      </div>
    );
  }

  const containerClass = overlay
    ? 'overflow-hidden w-full h-full select-none'
    : 'overflow-hidden rounded-xl bg-gradient-to-br from-stone-100 to-stone-50 select-none';

  return (
    <div className={catalogueIndicators ? 'relative w-full' : 'relative w-full h-full'}>
      <div className={catalogueIndicators ? 'relative aspect-square rounded-lg overflow-hidden bg-th-photo' : 'contents'}>
        <div
          ref={emblaRef}
          className={containerClass}
          style={overlay ? undefined : { aspectRatio: '3/4' }}
          tabIndex={hasMultiple ? 0 : -1}
          role={hasMultiple ? 'region' : undefined}
          aria-label={hasMultiple ? `Afbeeldingen carrousel, ${images.length} afbeeldingen` : undefined}
        >
          <div className="flex h-full">
            {images.map((img, idx) => {
              const url = getImageUrl(img);
              return (
                <div key={idx} className={`flex-[0_0_100%] min-w-0 h-full flex items-center justify-center ${img === bottleImage ? 'bg-th-photo isolate' : ''}`}>
                  {errorIndices.has(idx) ? (
                    <span className="text-6xl">{getWineTypeEmoji(wineType)}</span>
                  ) : img === bottleImage ? (
                    <BottlePhoto
                      src={img}
                      alt={`${wineName} - flesfoto`}
                      presentation={bottlePresentation}
                      layout={bottleLayout}
                      onError={() => setErrorIndices(prev => new Set(prev).add(idx))}
                    />
                  ) : (
                    <img
                      src={url}
                      alt={`${wineName} - afbeelding ${idx + 1}`}
                      loading={idx === 0 ? 'eager' : 'lazy'}
                      decoding="async"
                      width={800}
                      height={1000}
                      srcSet={isCloudinary(url) ? buildCloudinarySrcSet(url) : undefined}
                      sizes="(min-width:1280px) 25vw, (min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw"
                      className="w-full h-full pointer-events-none object-cover"
                      draggable="false"
                      onError={() => setErrorIndices(prev => new Set(prev).add(idx))}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Dot indicators */}
        {hasMultiple && !hideIndicators && !renderFooter && (
          <div
            className={catalogueIndicators
              ? 'absolute bottom-2 left-1/2 -translate-x-1/2 flex px-1 rounded-full bg-white/90 backdrop-blur-sm'
              : 'absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 px-2.5 py-1.5 rounded-full bg-black/30 backdrop-blur-sm'}
            role={catalogueIndicators ? "group" : "tablist"}
            aria-label="Afbeelding navigatie"
          >
            {images.map((_, idx) => (
              <button
                key={idx}
                role={catalogueIndicators ? undefined : "tab"}
                aria-selected={catalogueIndicators ? undefined : idx === selectedIndex}
                aria-current={catalogueIndicators && idx === selectedIndex ? "true" : undefined}
                aria-label={`Bekijk afbeelding ${idx + 1} van ${images.length}`}
                onClick={(e) => { e.stopPropagation(); emblaApi?.scrollTo(idx); }}
                className={catalogueIndicators
                  ? 'group/dot flex items-center justify-center w-6 h-7 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy-700'
                  : `rounded-full transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                  idx === selectedIndex
                    ? 'bg-white w-5 h-1.5'
                    : 'bg-white/50 hover:bg-white/70 w-1.5 h-1.5 hover:scale-110'
                }`}
              >
                {catalogueIndicators && (
                  <span className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === selectedIndex ? 'bg-burgundy-700' : 'bg-stone-300 group-hover/dot:bg-stone-500'}`} />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Counter pill (e.g. "1 / 3") */}
        {hasMultiple && counterPill && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-white/90 text-xs font-medium tabular-nums">
            {selectedIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {renderFooter && renderFooter(hasMultiple && !hideIndicators ? (
        <div
          className="absolute left-1/2 -translate-x-1/2 flex w-max max-w-[calc(100%-5rem)]"
          role="group"
          aria-label="Afbeelding navigatie"
        >
          {images.map((_, idx) => (
            <button
              key={idx}
              aria-current={idx === selectedIndex ? 'true' : undefined}
              aria-label={`Bekijk afbeelding ${idx + 1} van ${images.length}`}
              onClick={(e) => { e.stopPropagation(); emblaApi?.scrollTo(idx); }}
              className="group/dot flex items-center justify-center w-5 min-w-0 h-8 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy-700"
            >
              <span className={`w-[5px] h-[5px] rounded-full transition-colors ${idx === selectedIndex ? 'bg-burgundy-700' : 'bg-stone-400 group-hover/dot:bg-stone-500'}`} />
            </button>
          ))}
        </div>
      ) : null)}

      {/* Screen reader announcement */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {hasMultiple && `Afbeelding ${selectedIndex + 1} van ${images.length}`}
      </div>
    </div>
  );
}

export default ImageCarousel;
