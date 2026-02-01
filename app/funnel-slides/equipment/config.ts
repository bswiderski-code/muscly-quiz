import type { FunnelKey } from '@/lib/funnels/funnels';

export type EquipmentConfig = {
  translationNamespace: string;
  equipmentValues: readonly string[];
  errorMessage?: string;
  multiSelect: boolean;
  canBeEmpty: boolean;
};

const mergedEquipmentValues = ['none', 'bands', 'dumbbells', 'barbell', 'bench', 'pullup_bar', 'dip_bar'] as const;

const defaultConfig: EquipmentConfig = {
  translationNamespace: 'Equipment',
  equipmentValues: mergedEquipmentValues,
  multiSelect: true,
  canBeEmpty: true,
};

const funnelConfigs: Partial<Record<FunnelKey, Partial<EquipmentConfig>>> = {
  workout: {
    equipmentValues: mergedEquipmentValues,
  },
};

export function getEquipmentConfig(funnelKey: FunnelKey): EquipmentConfig {
  const funnelConfig = funnelConfigs[funnelKey] || {};
  return {
    ...defaultConfig,
    ...funnelConfig,
  };
}
