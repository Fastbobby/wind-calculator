export const WIND_REGIONS = {
  A: { 
    type: 'non-cyclonic', 
    description: 'Non-cyclonic regions with lower wind speeds, typically inland areas south of 30°S' 
  },
  B: { 
    type: 'non-cyclonic', 
    description: 'Non-cyclonic regions with moderate wind exposure, typically within 200km of coast between 25°S-30°S' 
  },
  C: { 
    type: 'cyclonic', 
    description: 'Cyclonic regions north of 25°S within 50km of coast' 
  },
  D: { 
    type: 'cyclonic', 
    description: 'Severe cyclonic regions along WA coast between 20°S-25°S' 
  }
} as const;

export const TERRAIN_CATEGORIES = {
  TC1: {
    name: 'Very exposed open terrain',
    description: 'Open terrain with very few or no obstructions',
    examples: ['Open water', 'Flat plains', 'Desert']
  },
  TC2: {
    name: 'Open terrain',
    description: 'Grasslands with scattered obstructions',
    examples: ['Farmland', 'Isolated trees', 'Occasional small buildings']
  },
  TC2_5: {
    name: 'Intermediate terrain',
    description: 'Developing suburban areas',
    examples: ['Sparse housing', 'Light vegetation']
  },
  TC3: {
    name: 'Suburban terrain',
    description: 'Numerous closely spaced obstructions',
    examples: ['Suburban housing', 'Industrial areas', 'Dense vegetation']
  }
} as const;

export const TOPOGRAPHIC_CLASSES = {
  T0: { maxSlope: 2.9, description: 'Flat land' },
  T1: { maxSlope: 5.7, description: 'Gentle slope' },
  T2: { maxSlope: 7.6, description: 'Hill crest' },
  T3: { maxSlope: 11.3, description: 'Steep slope' },
  T4: { maxSlope: 18.4, description: 'Ridge crest' },
  T5: { maxSlope: Infinity, description: 'Extreme slope' }
} as const;

export const SHIELDING_CLASSES = {
  FS: {
    name: 'Full shielding',
    minObstructions: 10,
    description: 'Dense surrounding buildings or trees within 100m'
  },
  PS: {
    name: 'Partial shielding',
    minObstructions: 2.5,
    description: 'Moderate surrounding buildings or trees within 100m'
  },
  NS: {
    name: 'No shielding',
    minObstructions: 0,
    description: 'Few or no surrounding buildings or trees within 100m'
  }
} as const;

export const WIND_CLASSIFICATIONS = {
  NON_CYCLONIC: {
    N1: { serviceSpeed: 26, ultimateSpeed: 34 },
    N2: { serviceSpeed: 29, ultimateSpeed: 40 },
    N3: { serviceSpeed: 32, ultimateSpeed: 50 },
    N4: { serviceSpeed: 39, ultimateSpeed: 61 },
    N5: { serviceSpeed: 47, ultimateSpeed: 74 },
    N6: { serviceSpeed: 55, ultimateSpeed: 86 }
  },
  CYCLONIC: {
    C1: { serviceSpeed: 32, ultimateSpeed: 50 },
    C2: { serviceSpeed: 39, ultimateSpeed: 61 },
    C3: { serviceSpeed: 47, ultimateSpeed: 74 },
    C4: { serviceSpeed: 55, ultimateSpeed: 86 }
  }
} as const;