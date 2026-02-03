"use client";

import { useMemo } from "react";
import SelectMenu from '@/app/components/funnels/SelectMenu';
import ProgressHeader from '@/app/components/header/ProgressHeader';
import NextButton from '@/app/components/funnels/NextButton';
import { useStepController } from '@/lib/useStepController';
import type { StepId } from '@/lib/steps/stepIds.ts';
import { useTranslations } from 'next-intl';
import { useCurrentFunnel } from '@/lib/funnels/funnelContext';
import { DISABLED_EQUIPMENT } from '@/config/quiz';
import "../funnel.css";

const stepId: StepId = 'equipment';

const EQUIPMENT_VALUES = ['none', 'bands', 'dumbbells', 'barbell', 'bench', 'pullup_bar', 'dip_bar'].filter(
	(val) => !DISABLED_EQUIPMENT.includes(val)
) as readonly string[];

type OptionCopy = {
	label: string;
	description: string;
};

export default function Page() {
	const funnelKey = useCurrentFunnel();
	const t = useTranslations('Equipment');
	const { idx, total, goPrev, select, value, isPending } = useStepController(stepId);

	type EquipmentValue = typeof EQUIPMENT_VALUES[number];

	function isEquipmentValue(value: string): value is EquipmentValue {
		return (EQUIPMENT_VALUES as readonly string[]).includes(value);
	}

	function deserializeSelection(raw: string): EquipmentValue[] {
		if (!raw) return [];
		return raw
			.split('|')
			.map((entry) => entry.trim())
			.filter((entry): entry is EquipmentValue => isEquipmentValue(entry));
	}

	const selected = useMemo(() => deserializeSelection(value), [value]);

	const options = useMemo(() => {
		const rawOptions = t.raw('options') as Record<string, OptionCopy>;
		return EQUIPMENT_VALUES.map((key) => {
			const description = (key !== 'none')
				? ''
				: (rawOptions[key]?.description ?? '');

			return {
				value: key,
				label: rawOptions[key]?.label ?? key,
				description,
			};
		});
	}, [t, funnelKey]);
	const hasSelection = selected.length > 0;
	const serializedSelection = selected.join('|');

	function handleNext() {
		if (!hasSelection) {
			alert(t('errorMsg'));
			return;
		}
		select(serializedSelection, { advance: true });
	}

	return (
		<main className="funnel-page">
			<div className="funnel-header-wrapper">
				<ProgressHeader currentIdx={idx} onBack={goPrev} />
			</div>

			<div className="funnel-content funnel-content--centered">
				<h1 className="funnel-title">
					<span dangerouslySetInnerHTML={{ __html: t.raw('title') }} />
				</h1>
				<p className="funnel-subtitle">
					<span dangerouslySetInnerHTML={{ __html: t.raw('subtitle') }} />
				</p>

				<SelectMenu
					options={options.map((opt) => ({
						value: opt.value,
						label: opt.label,
						details: opt.description,
						exclusive: opt.value === 'none',
					}))}
					value={selected.join(',')}
					onChange={(v) => {
						const pipe = v.split(',').map((s) => s.trim()).filter(Boolean).join('|');
						select(pipe, { advance: false });
					}}
					name="equipment"
					multi={true}
					canBeEmpty={true}
				/>

				<div className="funnel-submit-wrap">
					<NextButton
						currentIdx={idx}
						fieldKey="equipment"
						fieldValue={serializedSelection}
						disabled={!hasSelection || isPending}
						onClick={handleNext}
					/>
				</div>
			</div>
		</main>
	);
}
