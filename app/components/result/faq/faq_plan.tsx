import { useState } from 'react';
import Image from 'next/image';
import styles from './faq_plan.module.css';
import { FAQS } from './faq_questions';
import { useLocale, useTranslations } from 'next-intl';
import { useCurrentFunnel } from '@/lib/funnels/funnelContext';

export default function FAQPlan() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const locale = useLocale();
  const t = useTranslations('ResultPage');
  const currentFunnel = useCurrentFunnel();

  // Map user locale to FAQ language codes
  const langMap: { [key: string]: string } = {
    'pl': 'PL',
    'en': 'EN',
    'ro': 'RO',
  };
  const lang = langMap[locale.toLowerCase()] || 'EN';

  const header = t.raw('faq.title');

  const faqs = FAQS.filter(faq => faq.language === lang);

  return (
    <div>
      <h2 className={styles.faqTitle} dangerouslySetInnerHTML={{ __html: header }} />
      <div className={styles.faqList}>
        {faqs.map((faq, idx) => (
          <div key={idx} className={styles.faqItem}>
            <button
              className={styles.faqQuestion}
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              aria-expanded={openIndex === idx}
              aria-controls={`faq-answer-${idx}`}
              style={{ fontFamily: "'Comic Relief', Arial, Helvetica, sans-serif" }}
            >
              <span>{faq.question}</span>
              <span className={openIndex === idx ? styles.iconOpen : styles.iconClosed}>
                <Image src="/btns/unfold.svg" alt={lang === 'EN' ? 'Expand' : lang === 'RO' ? 'Extinde' : 'Rozwiń'} width={24} height={24} />
              </span>
            </button>
            {openIndex === idx && (
              <div
                id={`faq-answer-${idx}`}
                className={styles.faqAnswer}
                style={{ fontFamily: "'Comic Relief', Arial, Helvetica, sans-serif" }}
                dangerouslySetInnerHTML={{ __html: faq.answer }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
