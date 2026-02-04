import { getTranslations } from 'next-intl/server';
import { getFaqData } from '@/lib/faq';
import FaqAccordion from './FaqAccordion';

interface FaqSectionProps {
  locale: string;
}

export default async function FaqSection({ locale }: FaqSectionProps) {
  const t = await getTranslations('ResultPage');
  const faqData = await getFaqData(locale);

  if (faqData.length === 0) return null;

  return (
    <section className="w-full py-12 px-6 bg-gray-50/50 border-t border-gray-100 flex flex-col items-center">
      <div className="max-w-3xl mx-auto w-full">
        <h2 
          className="text-4xl leading-tight mb-4 text-center font-bold"
          style={{ fontFamily: "'Comic Relief', Arial, Helvetica, sans-serif" }}
        >
          {t('faq.title').replace('<br/>', '\n')}
        </h2>
        {/* We can add description if needed, but the original request focused on title and accordion */}
        
        <FaqAccordion faqData={faqData} />
      </div>
    </section>
  );
}
