export type WindRegion = 'A' | 'B' | 'C' | 'D';
export type TerrainCategory = 'TC1' | 'TC2' | 'TC2.5' | 'TC3';
export type TopographicClass = 'T0' | 'T1' | 'T2' | 'T3' | 'T4' | 'T5';
export type ShieldingClass = 'FS' | 'PS' | 'NS';
export type WindClassification = 'N1' | 'N2' | 'N3' | 'N4' | 'N5' | 'N6' | 'C1' | 'C2' | 'C3' | 'C4';

export interface OpenSpace {
  type: 'park' | 'water' | 'road';
  area: number;
  width: number;
}

export interface BuildingDensityResult {
  count: number;
  density: number;
  radius: number;
  buildings: Array<{ lat: number; lng: number }>;
  nearbyOpenSpaces?: OpenSpace[];
  distanceFromCoast: number;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  elevation: number;
  terrainCategory?: TerrainCategory;
  maxSlope?: number;
  exposureCategory?: string;
  distanceFromCoast?: number;
  directionalAnalysis?: DirectionalAnalysis[];
}

export interface WindParameters {
  region: WindRegion;
  terrainCategory: TerrainCategory;
  shielding: ShieldingClass;
  topographicClass: TopographicClass;
  latitude: number;
  longitude: number;
  distanceFromCoast: number;
}

export interface WindResult {
  classification: WindClassification;
  serviceSpeed: number;
  ultimateSpeed: number;
  description: string;
  region: WindRegion;
}

export interface DirectionalAnalysis {
  direction: string;
  slopes: {
    maxSlope: number;
    averageSlope: number;
    elevationChange: number;
    slopeCategory: string;
    distance: number;
  };
  terrainCategory: TerrainCategory;
  topographicClass: TopographicClass;
  exposureCategory: string;
}