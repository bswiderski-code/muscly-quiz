'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

interface ReviewsMarqueeProps {
  locale: string;
  imageCount: number;
}

export default function ReviewsMarquee({ locale, imageCount }: ReviewsMarqueeProps) {
  const t = useTranslations('ReviewsMarquee');
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [randomizedImages, setRandomizedImages] = useState<string[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadedImageUrls, setLoadedImageUrls] = useState<Set<string>>(new Set());

  // Generate and randomize array of image paths
  useEffect(() => {
    const images = Array.from({ length: imageCount }, (_, i) =>
      `/reviews/${locale.toLowerCase()}/rev${i + 1}.png`
    );

    const shuffled = [...images];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setRandomizedImages(shuffled);
  }, [locale, imageCount]);

  // Preload images when they become visible
  useEffect(() => {
    if (isVisible && !imagesLoaded && randomizedImages.length > 0) {
      console.log('[ReviewsMarquee] Starting to preload images:', randomizedImages);
      const imagePromises = randomizedImages.map((src) => {
        return new Promise<string>((resolve, reject) => {
          const img = new window.Image();
          img.onload = () => {
            console.log('[ReviewsMarquee] Image loaded successfully:', src);
            setLoadedImageUrls((prev) => new Set([...prev, src]));
            resolve(src);
          };
          img.onerror = () => {
            console.error('[ReviewsMarquee] Failed to load image:', src);
            setLoadedImageUrls((prev) => new Set([...prev, src]));
            reject(src);
          };
          img.src = src;
        });
      });

      Promise.all(imagePromises)
        .then(() => {
          console.log('[ReviewsMarquee] All images preloaded (success or fail)');
          setTimeout(() => setImagesLoaded(true), 100);
        })
        .catch(() => {
          console.log('[ReviewsMarquee] Some images failed to preload, but marking as loaded anyway');
          setTimeout(() => setImagesLoaded(true), 100);
        });
        
      // Fallback: set imagesLoaded to true after 2 seconds anyway to ensure visibility
      const fallbackTimer = setTimeout(() => {
          if (!imagesLoaded) {
              console.warn('[ReviewsMarquee] Preloading timeout reached, forcing visibility');
              setImagesLoaded(true);
          }
      }, 2000);
      return () => clearTimeout(fallbackTimer);
    }
  }, [isVisible, randomizedImages, imagesLoaded]);

  // Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
          console.log('[ReviewsMarquee] Intersection change:', entry.isIntersecting);
          setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    if (scrollerRef.current) observer.observe(scrollerRef.current);
    
    // Fallback for cases where IntersectionObserver might fail or in extreme environments
    const fallbackTimer = setTimeout(() => {
        if (!isVisible) {
            console.log('[ReviewsMarquee] Forcing visibility fallback');
            setIsVisible(true);
        }
    }, 1000);

    return () => {
        observer.disconnect();
        clearTimeout(fallbackTimer);
    };
  }, [isVisible]);

  // --- NEW: JS-Based Auto Scroll ---
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    // Use a ref-like variable to track sub-pixel scroll position for smoothness
    let currentScrollPos = scrollerRef.current ? scrollerRef.current.scrollLeft : 0;

    const animate = (time: number) => {
      const deltaTime = time - lastTime;
      lastTime = time;

      if (scrollerRef.current && !isDragging && isVisible) {
        // Adjust this value to change speed (pixels per second)
        // 1px per frame at 60fps is 60px/s. 
        // 45px/s is ~25% slower and very smooth.
        const speed = 32; 
        const move = (speed * deltaTime) / 1000;
        
        currentScrollPos += move;
        scrollerRef.current.scrollLeft = currentScrollPos; 
        
        // Manually trigger reset check
        checkInfiniteScroll(); 
        
        // Keep our sub-pixel tracker in sync with any jumps from checkInfiniteScroll
        currentScrollPos = scrollerRef.current.scrollLeft;
      } else if (scrollerRef.current) {
        // Keep tracker in sync during manual dragging
        currentScrollPos = scrollerRef.current.scrollLeft;
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };

    const checkInfiniteScroll = () => {
      if (!scrollerRef.current) return;
      const container = scrollerRef.current;
      const scrollWidth = container.scrollWidth;
      const scrollLeftPos = container.scrollLeft;
      const oneSetWidth = scrollWidth / 6;

      if (scrollLeftPos >= oneSetWidth * 5) {
        container.scrollLeft = scrollLeftPos - oneSetWidth;
      } else if (scrollLeftPos <= oneSetWidth) {
        container.scrollLeft = scrollLeftPos + oneSetWidth;
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isDragging, isVisible]); 

  // Mouse/Touch handlers
  const handleStart = (e: React.MouseEvent | React.TouchEvent, clientX: number) => {
    // Prevent default only prevents dragging images/text, allows scroll
    // e.preventDefault(); 
    if (!scrollerRef.current) return;
    setIsDragging(true);
    setStartX(clientX - scrollerRef.current.offsetLeft);
    setScrollLeft(scrollerRef.current.scrollLeft);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent, clientX: number) => {
    if (!isDragging || !scrollerRef.current) return;
    e.preventDefault();
    const x = clientX - scrollerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="w-full overflow-hidden">
      <div
        ref={scrollerRef}
        // Removed 'animate-marquee' and 'transition-opacity' to prevent conflicts
        className="flex overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing select-none"
        style={{
          // Force 'auto' so JS updates are instant and don't lag
          scrollBehavior: 'auto', 
          opacity: !isVisible || imagesLoaded ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}
        onMouseDown={(e) => handleStart(e, e.pageX)}
        onMouseMove={(e) => handleMove(e, e.pageX)}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={(e) => handleStart(e, e.touches[0].clientX)}
        onTouchMove={(e) => handleMove(e, e.touches[0].clientX)}
        onTouchEnd={handleEnd}
        // We still keep onScroll for drag interactions
        onScroll={() => {
            // We duplicate the logic here just for drag interactions
             if (!scrollerRef.current) return;
             const container = scrollerRef.current;
             const oneSetWidth = container.scrollWidth / 6;
             if (container.scrollLeft >= oneSetWidth * 5) {
               container.scrollLeft = container.scrollLeft - oneSetWidth;
             } else if (container.scrollLeft <= oneSetWidth) {
               container.scrollLeft = container.scrollLeft + oneSetWidth;
             }
        }}
      >
        {Array.from({ length: 6 }, (_, setIndex) =>
          randomizedImages.map((src, imageIndex) => (
            <div
              key={`${setIndex}-${imageIndex}`}
              className="shrink-0 relative p-2 md:p-3"
            >
              <div 
                className="relative overflow-hidden rounded-2xl shadow-md border border-gray-100 bg-gray-50"
                style={{
                  width: 'min(70vw, 420px)',
                  aspectRatio: '962 / 410',
                }}
              >
                <Image
                  src={src}
                  alt={t('imageAlt')}
                  fill
                  sizes="(max-width: 768px) 70vw, 420px"
                  className="pointer-events-none object-cover"
                  style={{
                    opacity: loadedImageUrls.has(src) || !isVisible ? 1 : 0,
                    transition: 'opacity 0.3s'
                  }}
                  draggable={false}
                  loading={isVisible ? 'eager' : 'lazy'}
                  priority={isVisible && setIndex === 0}
                  unoptimized={isVisible}
                />
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}