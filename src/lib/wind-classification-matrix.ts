import type { WindRegion, TerrainCategory, TopographicClass, ShieldingClass, WindClassification } from './types';

interface WindClassificationMatrix {
  [region: string]: {
    [terrainCategory: string]: {
      [topographicClass: string]: {
        [shieldingClass: string]: WindClassification | 'NA';
      };
    };
  };
}

// Table 2.2 from AS 4055-2021
const WIND_CLASSIFICATION_MATRIX: WindClassificationMatrix = {
  A: {
    TC3: {
      T0: { FS: 'N1', PS: 'N1', NS: 'N1' },
      T1: { FS: 'N1', PS: 'N2', NS: 'N2' },
      T2: { FS: 'N2', PS: 'N2', NS: 'N2' },
      T3: { FS: 'N3', PS: 'N3', NS: 'N3' },
      T4: { FS: 'N3', PS: 'N3', NS: 'N3' },
      T5: { FS: 'N4', PS: 'N4', NS: 'N4' }
    },
    'TC2.5': {
      T0: { FS: 'N1', PS: 'N1', NS: 'N2' },
      T1: { FS: 'N1', PS: 'N2', NS: 'N2' },
      T2: { FS: 'N2', PS: 'N3', NS: 'N3' },
      T3: { FS: 'N3', PS: 'N3', NS: 'N3' },
      T4: { FS: 'N4', PS: 'N4', NS: 'N4' },
      T5: { FS: 'N4', PS: 'N4', NS: 'N4' }
    },
    TC2: {
      T0: { FS: 'N1', PS: 'N2', NS: 'N2' },
      T1: { FS: 'N2', PS: 'N2', NS: 'N3' },
      T2: { FS: 'N2', PS: 'N3', NS: 'N3' },
      T3: { FS: 'N3', PS: 'N3', NS: 'N3' },
      T4: { FS: 'N4', PS: 'N4', NS: 'N4' },
      T5: { FS: 'N4', PS: 'N4', NS: 'N4' }
    },
    TC1: {
      T0: { FS: 'N2', PS: 'N2', NS: 'N3' },
      T1: { FS: 'N2', PS: 'N3', NS: 'N3' },
      T2: { FS: 'N3', PS: 'N3', NS: 'N3' },
      T3: { FS: 'N4', PS: 'N4', NS: 'N4' },
      T4: { FS: 'N4', PS: 'N4', NS: 'N4' },
      T5: { FS: 'N5', PS: 'N5', NS: 'N5' }
    }
  },
  B: {
    TC3: {
      T0: { FS: 'N2', PS: 'N2', NS: 'N3' },
      T1: { FS: 'N2', PS: 'N3', NS: 'N3' },
      T2: { FS: 'N3', PS: 'N3', NS: 'N4' },
      T3: { FS: 'N4', PS: 'N4', NS: 'N4' },
      T4: { FS: 'N4', PS: 'N4', NS: 'N4' },
      T5: { FS: 'N5', PS: 'N5', NS: 'N5' }
    },
    'TC2.5': {
      T0: { FS: 'N2', PS: 'N3', NS: 'N3' },
      T1: { FS: 'N3', PS: 'N3', NS: 'N3' },
      T2: { FS: 'N3', PS: 'N4', NS: 'N4' },
      T3: { FS: 'N4', PS: 'N4', NS: 'N4' },
      T4: { FS: 'N5', PS: 'N5', NS: 'N5' },
      T5: { FS: 'N5', PS: 'N5', NS: 'N5' }
    },
    TC2: {
      T0: { FS: 'N2', PS: 'N3', NS: 'N3' },
      T1: { FS: 'N3', PS: 'N3', NS: 'N4' },
      T2: { FS: 'N3', PS: 'N4', NS: 'N4' },
      T3: { FS: 'N4', PS: 'N5', NS: 'N5' },
      T4: { FS: 'N5', PS: 'N5', NS: 'N5' },
      T5: { FS: 'N6', PS: 'N6', NS: 'N6' }
    },
    TC1: {
      T0: { FS: 'N3', PS: 'N3', NS: 'N4' },
      T1: { FS: 'N3', PS: 'N4', NS: 'N4' },
      T2: { FS: 'N4', PS: 'N4', NS: 'N5' },
      T3: { FS: 'N5', PS: 'N5', NS: 'N5' },
      T4: { FS: 'N6', PS: 'N6', NS: 'N6' },
      T5: { FS: 'N6', PS: 'N6', NS: 'N6' }
    }
  },
  C: {
    TC3: {
      T0: { FS: 'C1', PS: 'C2', NS: 'C2' },
      T1: { FS: 'C2', PS: 'C2', NS: 'C3' },
      T2: { FS: 'C2', PS: 'C3', NS: 'C3' },
      T3: { FS: 'C3', PS: 'C3', NS: 'C4' },
      T4: { FS: 'C4', PS: 'C4', NS: 'C4' },
      T5: { FS: 'C4', PS: 'C4', NS: 'C4' }
    },
    'TC2.5': {
      T0: { FS: 'C1', PS: 'C2', NS: 'C2' },
      T1: { FS: 'C2', PS: 'C2', NS: 'C3' },
      T2: { FS: 'C2', PS: 'C3', NS: 'C3' },
      T3: { FS: 'C3', PS: 'C3', NS: 'C4' },
      T4: { FS: 'C4', PS: 'C4', NS: 'C4' },
      T5: { FS: 'NA', PS: 'NA', NS: 'NA' }
    },
    TC2: {
      T0: { FS: 'C2', PS: 'C2', NS: 'C3' },
      T1: { FS: 'C2', PS: 'C3', NS: 'C3' },
      T2: { FS: 'C3', PS: 'C3', NS: 'C4' },
      T3: { FS: 'C4', PS: 'C4', NS: 'C4' },
      T4: { FS: 'NA', PS: 'NA', NS: 'NA' },
      T5: { FS: 'NA', PS: 'NA', NS: 'NA' }
    },
    TC1: {
      T0: { FS: 'C2', PS: 'C3', NS: 'C3' },
      T1: { FS: 'C3', PS: 'C3', NS: 'C4' },
      T2: { FS: 'C3', PS: 'C4', NS: 'C4' },
      T3: { FS: 'C4', PS: 'C4', NS: 'C4' },
      T4: { FS: 'NA', PS: 'NA', NS: 'NA' },
      T5: { FS: 'NA', PS: 'NA', NS: 'NA' }
    }
  }
};

export function getWindClassification(
  region: WindRegion,
  terrainCategory: TerrainCategory,
  topographicClass: TopographicClass,
  shieldingClass: ShieldingClass
): WindClassification | 'NA' {
  // Region D is always C4
  if (region === 'D') return 'C4';

  // Look up in matrix
  const result = WIND_CLASSIFICATION_MATRIX[region]?.[terrainCategory]?.[topographicClass]?.[shieldingClass];
  
  // Return NA if the combination is not allowed
  if (!result || result === 'NA') {
    return 'NA';
  }

  return result;
}