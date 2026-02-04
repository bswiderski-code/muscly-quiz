"use client";

import { useStepController } from "@/lib/useStepController";
import type { StepId } from '@/lib/steps/stepIds.ts';
import { useCurrentFunnel } from '@/lib/funnels/funnelContext'
import ProgressHeader from "@/app/components/header/ProgressHeader";
import Image from "next/image";
import "../funnel.css";
import { useLocale, useTranslations } from "next-intl";
import { withLocale } from "@/lib/imagePath";

const stepId: StepId = "gender";

const ASSETS = {
  maleImageSrc: '/btns/{locale}/male-btn.svg',
  femaleImageSrc: '/btns/{locale}/female-btn.svg',
};

export default function Page() {
   const { idx, total, value, select, goPrev, isPending } = useStepController(stepId);
   
   const funnel = useCurrentFunnel();
   const locale = useLocale();
   const t = useTranslations('Gender');

   const maleSrc = withLocale(ASSETS.maleImageSrc, locale);
   const femaleSrc = withLocale(ASSETS.femaleImageSrc, locale);

   return (
	   <main className="funnel-page">
           <div className="funnel-header-wrapper">
			   <ProgressHeader currentIdx={idx} onBack={goPrev} />
           </div>
		   <div className="funnel-content funnel-content--centered">
			   {/* used t.raw() to allow HTML tags like <b> or <br> from the JSON */}
			   <h1 className="funnel-title" dangerouslySetInnerHTML={{ __html: t.raw("title") }} />

			   <div
				   className="funnel-choices"
				   role="group"
				   aria-label={t("ariaLabel")}
			   >
				   {/* Male Option */}
				   <div className="funnel-choice-item">
					   <button
						   type="button"
						   className="funnel-choice-btn"
						   onClick={() => select("M")}
						   aria-pressed={value === "M"}
						   disabled={isPending && value === "M"}
						   aria-label={t("male.label")}
					   >
						   <Image 
                               src={maleSrc} 
                               alt={t("male.alt")}
							   width={177} 
                               height={307} 
                           />
					   </button>
				   </div>

				   {/* Female Option */}
				   <div className="funnel-choice-item">
					   <button
						   type="button"
						   className="funnel-choice-btn"
						   onClick={() => select("F")}
						   aria-pressed={value === "F"}
						   disabled={isPending && value === "F"}
						   aria-label={t("female.label")}
					   >
						   <Image 
                               src={femaleSrc} 
                               alt={t("female.alt")}
							   width={177} 
                               height={307} 
                           />
					   </button>
				   </div>
			   </div>
		   </div>
	   </main>
   );
}
