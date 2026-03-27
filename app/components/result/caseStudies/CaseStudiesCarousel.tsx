'use client';

import { useCallback, useEffect, useState, type DragEvent, type MouseEvent } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import { TrendingDown, TrendingUp } from 'lucide-react';
import type { CaseStudyCardData } from '@/types/case-studies';

export type { CaseStudyCardData } from '@/types/case-studies';

interface CaseStudiesCarouselProps {
  cards: CaseStudyCardData[];
}

const AUTO_ADVANCE_MS = 20_000;

/** Each panel is ~half the card; card is full-width of the section (avoid underestimating - Next would serve a tiny src and it looks soft on desktop / DPR 2–3). */
const CASE_STUDY_IMAGE_SIZES = '(max-width: 768px) 50vw, min(720px, 48vw)';
const CASE_STUDY_IMAGE_QUALITY = 92;

function blockImageChrome(e: MouseEvent | DragEvent) {
  e.preventDefault();
}

export default function CaseStudiesCarousel({ cards }: CaseStudiesCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, dragFree: false });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scheduleNext = useCallback(() => {
    if (!emblaApi) return;
    const timer = setTimeout(() => emblaApi.scrollNext(), AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);

    let cleanup = scheduleNext();

    const onPointerDown = () => {
      cleanup?.();
      cleanup = undefined;
    };
    const onPointerUp = () => {
      cleanup = scheduleNext();
    };

    emblaApi.on('pointerDown', onPointerDown);
    emblaApi.on('pointerUp', onPointerUp);

    return () => {
      cleanup?.();
      emblaApi.off('select', onSelect);
      emblaApi.off('pointerDown', onPointerDown);
      emblaApi.off('pointerUp', onPointerUp);
    };
  }, [emblaApi, scheduleNext]);

  return (
    <div className="ds-carousel">
      <div className="ds-carousel__viewport" ref={emblaRef}>
        <div className="ds-carousel__container">
          {cards.map((card) => (
            <div key={card.id} className="ds-carousel__slide">
              <div className="ds-case-studies-card">
                <div
                  className="ds-case-studies-card__gallery ds-case-studies-card__gallery--protected"
                  onContextMenu={blockImageChrome}
                >
                  <div className="ds-case-studies-card__cell">
                    <Image
                      src={card.beforeImageSrc}
                      alt={card.alt}
                      fill
                      className="ds-case-studies-card__img"
                      sizes={CASE_STUDY_IMAGE_SIZES}
                      quality={CASE_STUDY_IMAGE_QUALITY}
                      draggable={false}
                      onContextMenu={blockImageChrome}
                      onDragStart={blockImageChrome}
                    />
                    <span className="ds-case-studies-card__badge ds-case-studies-card__badge--before">
                      {card.beforeLabel}
                    </span>
                  </div>
                  <div className="ds-case-studies-card__cell">
                    <Image
                      src={card.afterImageSrc}
                      alt=""
                      fill
                      className="ds-case-studies-card__img"
                      sizes={CASE_STUDY_IMAGE_SIZES}
                      quality={CASE_STUDY_IMAGE_QUALITY}
                      draggable={false}
                      onContextMenu={blockImageChrome}
                      onDragStart={blockImageChrome}
                      aria-hidden
                    />
                    <span className="ds-case-studies-card__badge ds-case-studies-card__badge--after">
                      {card.afterLabel}
                    </span>
                  </div>
                </div>
                <div className="ds-case-studies-card__lower">
                  <p className="ds-case-studies-card__footer-title">
                    <span className="ds-case-studies-card__footer-title-line">{card.footerTitleLine1}</span>
                    {card.footerTitleLine2 ? (
                      <span className="ds-case-studies-card__footer-title-line">{card.footerTitleLine2}</span>
                    ) : null}
                  </p>
                  <div className="ds-case-studies-card__metrics" aria-label={card.trendIconLabel}>
                    <div className="ds-case-studies-card__metric">
                      <time className="ds-case-studies-card__date" dateTime={card.startDateTime}>
                        {card.startDate}
                      </time>
                      <span className="ds-case-studies-card__weight ds-case-studies-card__weight--before">
                        {card.startWeight}
                      </span>
                    </div>
                    {card.trend === 'gain' ? (
                      <TrendingUp
                        className="ds-case-studies-card__trend-icon"
                        size={40}
                        strokeWidth={2.65}
                        aria-hidden
                      />
                    ) : (
                      <TrendingDown
                        className="ds-case-studies-card__trend-icon"
                        size={40}
                        strokeWidth={2.65}
                        aria-hidden
                      />
                    )}
                    <div className="ds-case-studies-card__metric">
                      <time className="ds-case-studies-card__date" dateTime={card.endDateTime}>
                        {card.endDate}
                      </time>
                      <span className="ds-case-studies-card__weight ds-case-studies-card__weight--after">
                        {card.endWeight}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="ds-carousel__dots" aria-hidden>
        {cards.map((_, i) => (
          <span
            key={i}
            className={`ds-carousel__dot${i === selectedIndex ? ' ds-carousel__dot--active' : ''}`}
          />
        ))}
      </div>
    </div>
  );
}
