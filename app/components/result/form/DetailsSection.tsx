'use client'

import { useTranslations } from "next-intl";
import { useState } from "react";

type Props = {
  diet_goal: string;
};

export function DetailsSection({ diet_goal }: Props) {
  const t = useTranslations('ReportForm');
  const [showDetails, setShowDetails] = useState(false);

  const trainingTextGoal = diet_goal === 'cut' ? 'palić tłuszcz' : (diet_goal === 'bulk' ? 'budować masę mięśniową' : 'osiągnąć cel');
  const goalSchemaText = diet_goal === 'cut' ? 'która pozwoli Ci gubić tłuszcz w zaplanowanym tempie' : (diet_goal === 'bulk' ? 'która pozwoli Ci rosnąć w zaplanowanym tempie' : 'dopasowany do Twojego celu');

  const details1 = t.raw('detailsBox1Body') as unknown as Record<string, string>;
  const details2 = t.raw('detailsBox2Body') as unknown as Record<string, string>;

  return (
    <div style={{ textAlign: 'center', marginTop: 0 }}>
      <button
        type="button"
        aria-expanded={showDetails}
        onClick={() => setShowDetails((s) => !s)}
        style={{
          background: 'none',
          border: 'none',
          color: '#000',
          cursor: 'pointer',
          textDecoration: 'underline',
          fontSize: '16px',
          fontFamily: 'inherit',
          padding: 0,
          outline: 'none'
        }}
      >
        {t('detailsBtn')}
      </button>
      <div
        aria-hidden={!showDetails}
        style={{
          maxHeight: showDetails ? '1000px' : '0',
          overflow: 'hidden',
          transition: 'max-height 0.3s ease-in-out',
          marginTop: '12px'
        }}
      >
        <div className="outline-box" style={{ marginTop: 0, textAlign: "left" }}>
          <div className="box-title">{t('detailsBox1Title')}</div>
          <div className="box-body">
            - <span dangerouslySetInnerHTML={{ __html: t('detailsBox1Body.training', { goal: trainingTextGoal }) }} />
            <br />
            - <span dangerouslySetInnerHTML={{ __html: details1.smart }} />
            <br />
            - <span dangerouslySetInnerHTML={{ __html: details1.workDiet }} />
            <br />
            - <span dangerouslySetInnerHTML={{ __html: details1.progress }} />
          </div>
        </div>
        <div className="outline-box" style={{ marginTop: 12, textAlign: "left" }}>
          <div className="box-title">{t('detailsBox2Title')}</div>
          <div className="box-body">
            - <span dangerouslySetInnerHTML={{ __html: details2.macros }} />
            <br />
            - <span dangerouslySetInnerHTML={{ __html: t('detailsBox2Body.dietSchema', { goalSchema: goalSchemaText }) }} />
            <br />
            - <span dangerouslySetInnerHTML={{ __html: details2.summary }} />
          </div>
        </div>
      </div>
    </div>
  );
}
