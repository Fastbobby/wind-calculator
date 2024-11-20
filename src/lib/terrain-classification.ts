import { TerrainCategoryCalculator } from './terrain-classification/TerrainCategoryCalculator';
import type { TerrainCategory } from './types';

interface BuildingDensityResult {
  count: number;
  density: number;
  radius: number;
  buildings: Array<{ lat: number; lng: number }>;
}

export async function analyzeBuildingDensity(
  lat: number,
  lng: number,
  maxRadius: number = 500
): Promise<BuildingDensityResult> {
  // Query for buildings within radius using Overpass API
  const query = `
    [out:json][timeout:25];
    (
      way["building"](around:${maxRadius},${lat},${lng});
      relation["building"](around:${maxRadius},${lat},${lng});
    );
    out center;
  `;

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(query)}`
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.elements) {
      throw new Error('Invalid response format from Overpass API');
    }

    const buildings = data.elements
      .filter((element: any) => element.center || (element.lat && element.lon))
      .map((element: any) => ({
        lat: element.center ? element.center.lat : element.lat,
        lng: element.center ? element.center.lon : element.lon
      }));

    const areaHectares = Math.PI * Math.pow(maxRadius / 100, 2);
    const density = buildings.length / areaHectares;

    return {
      count: buildings.length,
      density,
      radius: maxRadius,
      buildings
    };
  } catch (error) {
    console.error('Error fetching building data:', error);
    return {
      count: 0,
      density: 0,
      radius: maxRadius,
      buildings: []
    };
  }
}

export function calculateTopoVariation(elevationData: google.maps.ElevationResult[][]): number {
  const directionalStdDevs = elevationData.map(points => {
    const elevations = points.map(p => p.elevation);
    const mean = elevations.reduce((a, b) => a + b) / elevations.length;
    const squaredDiffs = elevations.map(e => Math.pow(e - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b) / elevations.length;
    return Math.sqrt(variance);
  });

  return directionalStdDevs.reduce((a, b) => a + b) / directionalStdDevs.length;
}

export function determineTerrainCategory(
  buildingAnalysis: BuildingDensityResult,
  topoVariation: number,
  distanceFromCoast: number
): TerrainCategory {
  return TerrainCategoryCalculator.calculate(
    buildingAnalysis,
    topoVariation,
    distanceFromCoast
  );
}