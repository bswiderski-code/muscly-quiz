'use client';

import { useEffect } from 'react';
import type { ComponentProps } from 'react';
import StepRangeSlider from '@/app/components/funnels/StepRangeSlider';
import styles from './BodyfatSliderCard.module.css';
import {
  FEMALE_BODYFAT_IMAGES,
  MALE_BODYFAT_IMAGES,
  preloadImages,
} from '@/lib/quiz/stepImages';

export type BodyfatSliderCardProps = {
  /** Optional reference image above the card. */
  previewImage?: { src: string; alt: string };
  /** Which bodyfat asset set to preload (must match preview paths). */
  isFemale?: boolean;
  /** Pull the card up over the preview (e.g. male reference image). */
  overlapPreview?: boolean;
  /** May include `<strong>` for emphasis (from i18n). */
  descriptionHtml: string;
  /** Re-run enter animation when selection changes. */
  descriptionKey?: string;
} & Pick<
  ComponentProps<typeof StepRangeSlider>,
  'steps' | 'initialIndex' | 'rememberedIndex' | 'onChange' | 'className'
>;

export default function BodyfatSliderCard({
  previewImage,
  isFemale = false,
  overlapPreview = false,
  descriptionHtml,
  descriptionKey,
  steps,
  initialIndex,
  rememberedIndex,
  onChange,
  className,
}: BodyfatSliderCardProps) {
  // Eagerly preload every bodyfat image so sliding is instant.
  useEffect(() => {
    if (!previewImage) return
    const urls = isFemale ? FEMALE_BODYFAT_IMAGES : MALE_BODYFAT_IMAGES
    preloadImages(urls, { logContext: 'bodyfat' })
  }, [previewImage, isFemale])

  return (
    <div className={styles.figure}>
      {previewImage ? (
        <div className={styles.preview}>
          <img
            className={styles.previewImg}
            src={previewImage.src}
            alt={previewImage.alt}
            loading="eager"
            decoding="async"
            onError={() => {
              console.error('[bodyfat] Preview image failed to load:', previewImage.src)
            }}
          />
        </div>
      ) : null}
      <div
        className={`${styles.card} ${overlapPreview ? styles.cardOverlap : ''}`}
      >
        <div className={styles.inner}>
          <div className={`funnel-slider-wrap ${styles.track}`}>
            <StepRangeSlider
              className={className}
              steps={steps}
              initialIndex={initialIndex}
              rememberedIndex={rememberedIndex}
              onChange={onChange}
            />
          </div>
          <p
            className={styles.description}
            key={descriptionKey ?? descriptionHtml}
            dangerouslySetInnerHTML={{ __html: descriptionHtml }}
          />
        </div>
      </div>
    </div>
  );
}
