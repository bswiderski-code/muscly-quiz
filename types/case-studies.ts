export type CaseStudyTrend = 'gain' | 'loss';

/** Data passed to the case-study carousel (after `buildCaseStudyCards`). */
export type CaseStudyCardData = {
  id: string;
  beforeImageSrc: string;
  afterImageSrc: string;
  alt: string;
  beforeLabel: string;
  afterLabel: string;
  footerTitleLine1: string;
  footerTitleLine2: string;
  trend: CaseStudyTrend;
  trendIconLabel: string;
  startDateTime: string;
  startDate: string;
  startWeight: string;
  endDateTime: string;
  endDate: string;
  endWeight: string;
};

/** Static definition; labels and alt are filled by `buildCaseStudyCards`. */
export type CaseStudyDefinition = Omit<
  CaseStudyCardData,
  'alt' | 'beforeLabel' | 'afterLabel' | 'trendIconLabel'
>;
