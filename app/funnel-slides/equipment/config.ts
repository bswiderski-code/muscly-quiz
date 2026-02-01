import type { FunnelKey } from '@/lib/funnels/funnels';

export type EquipmentConfig = {
  translationNamespace: string;
  equipmentValues: readonly string[];
  errorMessage?: string;
  multiSelect: boolean;
  canBeEmpty: boolean;
};

const defaultEquipmentValues = ['none', 'bands', 'dumbbells', 'barbell', 'bench'] as const;

const defaultConfig: EquipmentConfig = {
  translationNamespace: 'Equipment',
  equipmentValues: defaultEquipmentValues,
  multiSelect: true,
  canBeEmpty: true,
};

const funnelConfigs: Partial<Record<FunnelKey, Partial<EquipmentConfig>>> = {
  kalistenika: {
    translationNamespace: 'KalistenikaEquipment',
    equipmentValues: ['none', 'bands', 'pullup_bar', 'dip_bar'] as const,
  },
  plan: {
    equipmentValues: ['none', 'bands', 'dumbbells', 'barbell', 'bench'] as const,
  },
};

export function getEquipmentConfig(funnelKey: FunnelKey): EquipmentConfig {
  const funnelConfig = funnelConfigs[funnelKey] || {};
  return {
    ...defaultConfig,
    ...funnelConfig,
  };
}
