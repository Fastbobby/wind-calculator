import React from 'react';
import type { DirectionalAnalysis } from '@/lib/types';
import { TerrainCriteriaDisplay } from './TerrainCriteriaDisplay';

interface AnalysisResultsProps {
  results: DirectionalAnalysis[];
  buildingDensity?: number;
  buildingCount?: number;
  distanceFromCoast?: number;
  topoVariation?: number;
  terrainCategory?: string;
  markerPosition?: { lat: number; lng: number };
}

export function AnalysisResults({ 
  results,
  buildingDensity = 0,
  buildingCount = 0,
  distanceFromCoast = 0,
  topoVariation = 0,
  terrainCategory = '',
  markerPosition
}: AnalysisResultsProps) {
  if (results.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Terrain Analysis Results</h3>
      {results.map((result, index) => (
        <div key={index} className="flex items-center gap-4 p-2 bg-gray-50 rounded text-sm">
          <div className="w-8 text-center font-semibold">{result.direction}</div>
          <div className="grid grid-cols-3 gap-4 flex-1">
            <div>Max Slope: {(result.slopes.maxSlope * 100).toFixed(1)}%</div>
            <div>Avg Slope: {(result.slopes.averageSlope * 100).toFixed(1)}%</div>
            <div>Elevation Δ: {result.slopes.elevationChange.toFixed(1)}m</div>
          </div>
        </div>
      ))}

      <TerrainCriteriaDisplay
        buildingDensity={buildingDensity}
        buildingCount={buildingCount}
        distanceFromCoast={distanceFromCoast}
        topoVariation={topoVariation}
        terrainCategory={terrainCategory}
      />
    </div>
  );
}