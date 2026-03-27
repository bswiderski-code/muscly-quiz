import type { CaseStudyCardData, CaseStudyDefinition } from '@/types/case-studies';

/** Matches files under `public/casestudies/`. */
export const CASE_STUDY_CARD_DEFINITIONS: CaseStudyDefinition[] = [
  {
    id: 'case-1',
    beforeImageSrc: '/casestudies/case1/bef-case.png',
    afterImageSrc: '/casestudies/case1/aft-case.png',
    trend: 'loss',
    startDateTime: '2025-07-12',
    startDate: '12.07.2025',
    startWeight: '86kg',
    endDateTime: '2025-12-31',
    endDate: '31.12.2025',
    endWeight: '79kg',
    footerTitleLine1: '5-MIESIĘCZNA REDUKCJA',
    footerTitleLine2: '',
  },
  {
    id: 'case-2',
    beforeImageSrc: '/casestudies/case2/bef-case.png',
    afterImageSrc: '/casestudies/case2/aft-case.png',
    trend: 'gain',
    startDateTime: '2025-10-19',
    startDate: '19.10.2025',
    startWeight: '58kg',
    endDateTime: '2026-02-24',
    endDate: '24.02.2026',
    endWeight: '63kg',
    footerTitleLine1: '4-MIESIĘCZNA MASA',
    footerTitleLine2: '',
  },
  {
    id: 'case-3',
    beforeImageSrc: '/casestudies/case3/bef-case.png',
    afterImageSrc: '/casestudies/case3/aft-case.png',
    trend: 'gain',
    startDateTime: '2025-03-01',
    startDate: '01.03.2025',
    startWeight: '68kg',
    endDateTime: '2026-03-01',
    endDate: '01.03.2026',
    endWeight: '80kg',
    footerTitleLine1: '12-MIESIĘCZNA MASA',
    footerTitleLine2: '',
  },
];

type BuildCaseStudyLabels = {
  defaultImageAlt: string;
  beforeLabel: string;
  afterLabel: string;
  trendIconLabelLoss: string;
  trendIconLabelGain: string;
};

export function buildCaseStudyCards(
  definitions: CaseStudyDefinition[],
  labels: BuildCaseStudyLabels,
): CaseStudyCardData[] {
  return definitions.map((def) => ({
    ...def,
    alt: labels.defaultImageAlt,
    beforeLabel: labels.beforeLabel,
    afterLabel: labels.afterLabel,
    trendIconLabel:
      def.trend === 'gain' ? labels.trendIconLabelGain : labels.trendIconLabelLoss,
  }));
}
