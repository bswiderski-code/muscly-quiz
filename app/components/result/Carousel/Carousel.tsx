import React, { useState, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { usePrevNextButtons, PrevButton, NextButton } from './c_arrows';
import "./Carousel.css";
import { useTranslations } from 'next-intl';

interface EmblaCarouselProps {
  funnelKey?: string;
}

export function EmblaCarousel({ funnelKey = 'workout' }: EmblaCarouselProps) {
  const t = useTranslations('Carousel');
  const funnelConfig = t.raw(funnelKey) as { slides: Array<{ alt: string; caption: string }> };
  const slides = funnelConfig?.slides || [];
  const totalPages = slides.length;

  const [emblaRef, emblaApi] = useEmblaCarousel();
  const [currentPage, setCurrentPage] = useState(1);

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick
  } = usePrevNextButtons(emblaApi);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      const selectedIndex = emblaApi.selectedScrollSnap();
      setCurrentPage(selectedIndex + 1);
    };
    emblaApi.on('select', onSelect);
    onSelect();
  }, [emblaApi]);

  return (
    <div className="embla">
      <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container">
          {slides.map((slide, idx) => {
            return (
              <div className="embla__slide" key={idx}>
                <div
                  className="embla__caption"
                  style={{ fontSize: '1.15rem', fontWeight: 500, marginTop: 8 }}
                >
                  {slide.caption}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
      <div className="embla__indicator">
        <span style={{ fontSize: 'small', color: 'gray' }}>
          {t('indicatorNote')}
        </span>
      </div>
    </div>
  );
}
