import React from 'react';

interface TerrainCriteriaProps {
  buildingDensity: number;
  buildingCount: number;
  distanceFromCoast: number;
  topoVariation: number;
  terrainCategory: string;
}

export function TerrainCriteriaDisplay({
  buildingDensity,
  buildingCount,
  distanceFromCoast,
  topoVariation,
  terrainCategory
}: TerrainCriteriaProps) {
  return (
    <div className="mt-4 p-3 bg-slate-50 rounded-lg text-sm">
      <h4 className="font-semibold mb-2">Terrain Category Calculation Criteria</h4>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div>
          <span className="text-slate-500">Building Density:</span>
          <div className="font-mono">{buildingDensity.toFixed(1)} /ha</div>
        </div>
        <div>
          <span className="text-slate-500">Building Count:</span>
          <div className="font-mono">{buildingCount}</div>
        </div>
        <div>
          <span className="text-slate-500">Topo Variation:</span>
          <div className="font-mono">{topoVariation.toFixed(1)} m</div>
        </div>
      </div>
      <div className="mt-2 text-xs">
        <div className="text-slate-600">Final Category Consideration: <span className="font-semibold">{terrainCategory}</span></div>
        <div className="mt-1 space-y-1">
          {distanceFromCoast <= 0.5 && (
            <div className="text-amber-600">• Within 500m of coast - category reduced</div>
          )}
          {distanceFromCoast > 0.5 && distanceFromCoast <= 1 && (
            <div className="text-amber-600">• Within 1km of coast - partial exposure adjustment</div>
          )}
          {buildingDensity > 10 && (
            <div className="text-amber-600">• Dense urban area (greater than 10 buildings/ha)</div>
          )}
          {buildingDensity <= 10 && buildingDensity > 2.5 && (
            <div className="text-amber-600">• Suburban density (2.5-10 buildings/ha)</div>
          )}
          {buildingDensity <= 2.5 && buildingDensity > 0.5 && (
            <div className="text-amber-600">• Scattered buildings (0.5-2.5 buildings/ha)</div>
          )}
          {buildingDensity <= 0.5 && (
            <div className="text-amber-600">• Very sparse development (less than 0.5 buildings/ha)</div>
          )}
          {topoVariation > 15 && (
            <div className="text-amber-600">• Significant terrain variation (greater than 15m) - category reduced</div>
          )}
          {topoVariation > 10 && topoVariation <= 15 && (
            <div className="text-amber-600">• Moderate terrain variation (10-15m) - partial reduction</div>
          )}
        </div>
      </div>
    </div>
  );
}