import type { TopographicClass } from './types';

interface SlopeZone {
  position: 'lower' | 'middle' | 'top';
  height?: number;  // Height in meters, only applicable for top zone
}

interface TopographicMatrix {
  [slopeRatio: string]: {
    [zone: string]: TopographicClass;
  };
}

// Table 2.4 from AS 4055-2021
const TOPOGRAPHIC_MATRIX: TopographicMatrix = {
  'lt_1_20': {  // < 1:20 (<2.9°)
    lower: 'T0',
    middle: 'T0',
    top_small: 'T0',   // H ≤ 10m
    top_medium: 'T0',  // 10m < H ≤ 30m
    top_large: 'T0'    // H > 30m
  },
  'ge_1_20_lt_1_10': {  // ≥ 1:20 to < 1:10 (2.9° to 5.7°)
    lower: 'T0',
    middle: 'T0',
    top_small: 'T1',
    top_medium: 'T1',
    top_large: 'T1'
  },
  'ge_1_10_lt_1_7_5': {  // ≥ 1:10 to < 1:7.5 (5.7° to 7.6°)
    lower: 'T0',
    middle: 'T1',
    top_small: 'T1',
    top_medium: 'T2',
    top_large: 'T2'
  },
  'ge_1_7_5_lt_1_5': {  // ≥ 1:7.5 to < 1:5 (7.6° to 11.3°)
    lower: 'T0',
    middle: 'T1',
    top_small: 'T2',
    top_medium: 'T2',
    top_large: 'T3'
  },
  'ge_1_5_lt_1_3': {  // ≥ 1:5 to < 1:3 (11.3° to 18.4°)
    lower: 'T0',
    middle: 'T2',
    top_small: 'T2',
    top_medium: 'T3',
    top_large: 'T4'
  },
  'ge_1_3': {  // ≥ 1:3 (≥18.4°)
    lower: 'T0',
    middle: 'T2',
    top_small: 'T3',
    top_medium: 'T4',
    top_large: 'T5'
  }
};

export function getTopographicClass(slope: number, zone: SlopeZone): TopographicClass {
  // Convert slope to ratio (1:x format)
  const slopeRatio = 1 / slope;
  
  // Determine slope category
  let slopeCategory: keyof typeof TOPOGRAPHIC_MATRIX;
  if (slopeRatio < 3) slopeCategory = 'ge_1_3';
  else if (slopeRatio < 5) slopeCategory = 'ge_1_5_lt_1_3';
  else if (slopeRatio < 7.5) slopeCategory = 'ge_1_7_5_lt_1_5';
  else if (slopeRatio < 10) slopeCategory = 'ge_1_10_lt_1_7_5';
  else if (slopeRatio < 20) slopeCategory = 'ge_1_20_lt_1_10';
  else slopeCategory = 'lt_1_20';

  // Determine zone category
  let zoneCategory: string;
  if (zone.position === 'lower') {
    zoneCategory = 'lower';
  } else if (zone.position === 'middle') {
    zoneCategory = 'middle';
  } else {  // top zone
    if (!zone.height) return 'T0';  // Default to T0 if height is unknown
    if (zone.height <= 10) zoneCategory = 'top_small';
    else if (zone.height <= 30) zoneCategory = 'top_medium';
    else zoneCategory = 'top_large';
  }

  return TOPOGRAPHIC_MATRIX[slopeCategory][zoneCategory];
}