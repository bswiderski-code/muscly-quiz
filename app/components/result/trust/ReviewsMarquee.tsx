'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface ReviewsMarqueeProps {
  locale: string;
  /** Public paths e.g. `/reviews/pl/rev1.png` (from `public/reviews/...`). */
  imageSrcs: string[];
}

type ImageLoadState = 'pending' | 'loaded' | 'error';

/** Same order on server + client (avoids hydration mismatch). */
function shuffleReviewUrlsDeterministic(locale: string, urls: string[]): string[] {
  if (urls.length === 0) return [];
  let seed = 2166136261;
  for (let i = 0; i < locale.length; i++) {
    seed ^= locale.charCodeAt(i);
    seed = Math.imul(seed, 16777619);
  }
  seed ^= urls.length * 0x9e3779b9;
  const shuffled = [...urls];
  for (let i = shuffled.length - 1; i > 0; i--) {
    seed = (Math.imul(seed, 1103515245) + 12345) >>> 0;
    const j = seed % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  return shuffled;
}

function ReviewSlideFrame({
  src,
  alt,
  loadState,
  onLoaded,
  onError,
  isVisible,
  eager,
  priority,
}: {
  src: string;
  alt: string;
  loadState: ImageLoadState;
  onLoaded: () => void;
  onError: () => void;
  isVisible: boolean;
  eager: boolean;
  priority: boolean;
}) {
  const showEmptyRect = loadState !== 'loaded';

  return (
    <div className="ds-reviews-marquee__frame">
      {showEmptyRect ? <div className="ds-reviews-marquee__empty-rect" aria-hidden /> : null}
      {/* Skip <Image> after permanent error so the browser does not retry forever */}
      {loadState !== 'error' ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 70vw, 420px"
          className={`ds-reviews-marquee__img${loadState === 'loaded' ? ' ds-reviews-marquee__img--visible' : ''}`}
          draggable={false}
          loading={eager ? 'eager' : 'lazy'}
          priority={priority}
          unoptimized={isVisible}
          onLoad={onLoaded}
          onError={onError}
        />
      ) : null}
    </div>
  );
}

export default function ReviewsMarquee({ locale, imageSrcs }: ReviewsMarqueeProps) {
  const t = useTranslations('ReviewsMarquee');
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const randomizedImages = useMemo(
    () => shuffleReviewUrlsDeterministic(locale, imageSrcs),
    [locale, imageSrcs],
  );
  const [imageStatus, setImageStatus] = useState<Record<string, ImageLoadState>>({});

  useEffect(() => {
    setImageStatus({});
  }, [locale, imageSrcs]);

  const markLoaded = useCallback((src: string) => {
    setImageStatus((prev) => ({ ...prev, [src]: 'loaded' }));
  }, []);

  const markError = useCallback((src: string) => {
    setImageStatus((prev) => ({ ...prev, [src]: 'error' }));
  }, []);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 },
    );

    observer.observe(scroller);

    const fallbackTimer = setTimeout(() => {
      setIsVisible((current) => (current ? current : true));
    }, 1500);

    return () => {
      observer.disconnect();
      clearTimeout(fallbackTimer);
    };
  }, []);

  // Marquee runs as soon as we have slides and viewport is active - no wait for images
  useEffect(() => {
    if (randomizedImages.length === 0) return;

    let animationFrameId: number;
    let lastTime = performance.now();
    let currentScrollPos = scrollerRef.current ? scrollerRef.current.scrollLeft : 0;

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

    const animate = (time: number) => {
      const deltaTime = time - lastTime;
      lastTime = time;

      if (scrollerRef.current && !isDragging && isVisible) {
        const speed = 32;
        const move = (speed * deltaTime) / 1000;

        currentScrollPos += move;
        scrollerRef.current.scrollLeft = currentScrollPos;

        checkInfiniteScroll();

        currentScrollPos = scrollerRef.current.scrollLeft;
      } else if (scrollerRef.current) {
        currentScrollPos = scrollerRef.current.scrollLeft;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isDragging, isVisible, randomizedImages.length]);

  const handleStart = (e: React.MouseEvent | React.TouchEvent, clientX: number) => {
    if (!scrollerRef.current || randomizedImages.length === 0) return;
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

  if (imageSrcs.length === 0) return null;

  return (
    <div className="ds-reviews-marquee">
      <div
        ref={scrollerRef}
        className="ds-reviews-marquee__track"
        style={{
          scrollBehavior: 'auto',
        }}
        onMouseDown={(e) => handleStart(e, e.pageX)}
        onMouseMove={(e) => handleMove(e, e.pageX)}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={(e) => handleStart(e, e.touches[0]!.clientX)}
        onTouchMove={(e) => handleMove(e, e.touches[0]!.clientX)}
        onTouchEnd={handleEnd}
        onScroll={() => {
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
            <div key={`${setIndex}-${imageIndex}`} className="ds-reviews-marquee__slide">
              <ReviewSlideFrame
                src={src}
                alt={t('imageAlt')}
                loadState={imageStatus[src] ?? 'pending'}
                onLoaded={() => markLoaded(src)}
                onError={() => markError(src)}
                isVisible={isVisible}
                eager={isVisible}
                priority={isVisible && setIndex === 0 && imageIndex === 0}
              />
            </div>
          )),
        )}
      </div>
    </div>
  );
}
