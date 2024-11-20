import type { TerrainCategory } from '@/lib/types';

const DENSITY_THRESHOLDS = {
  TC3: {
    min: 10,
    description: 'Terrain with numerous closely spaced obstructions having heights generally from 3m to 10m (e.g. suburban housing, light industrial estates)'
  },
  TC2_5: {
    min: 2.5,
    description: 'Terrain with scattered houses or clumps of trees equivalent to house size (e.g. developing outer urban areas)'
  },
  TC2: {
    min: 0.5,
    description: 'Open terrain with well-scattered obstructions having heights generally from 1.5m to 5m (e.g. farmland with scattered trees)'
  },
  TC1: {
    min: 0,
    description: 'Very exposed open terrain with very few or no obstructions (e.g. flat treeless plains, water surfaces)'
  }
};

export class TerrainCategoryCalculator {
  private static readonly ANALYSIS_RADIUS = 500;

  private static calculateEffectiveDensity(buildingAnalysis: BuildingDensityResult): number {
    // Convert radius to hectares (1 hectare = 10000 m²)
    const areaHectares = Math.PI * Math.pow(buildingAnalysis.radius / 100, 2);
    
    // Calculate raw density (buildings per hectare)
    const rawDensity = buildingAnalysis.count / areaHectares;

    // Apply distance-based weighting for more accurate representation
    let weightedCount = buildingAnalysis.count;
    const buildings = buildingAnalysis.buildings;

    if (buildings.length > 0) {
      const centerLat = buildings[0].lat;
      const centerLng = buildings[0].lng;

      buildings.forEach(building => {
        // Calculate distance in meters (approximate)
        const distance = Math.sqrt(
          Math.pow((building.lat - centerLat) * 111320, 2) +
          Math.pow((building.lng - centerLng) * 111320 * Math.cos(centerLat * Math.PI / 180), 2)
        );

        // Less aggressive distance weighting
        const weight = Math.max(0.5, 1 - (distance / (2 * this.ANALYSIS_RADIUS)));
        weightedCount += weight;
      });
    }

    // Calculate weighted density
    const weightedDensity = weightedCount / areaHectares;

    console.log('[TerrainCategoryCalculator] Density calculation:', {
      rawDensity,
      weightedDensity,
      buildingCount: buildingAnalysis.count,
      areaHectares
    });

    return weightedDensity;
  }

  private static determineBaseCategory(density: number): TerrainCategory {
    console.log('[TerrainCategoryCalculator] Determining base category for density:', density);
    
    if (density >= DENSITY_THRESHOLDS.TC3.min) return 'TC3';
    if (density >= DENSITY_THRESHOLDS.TC2_5.min) return 'TC2.5';
    if (density >= DENSITY_THRESHOLDS.TC2.min) return 'TC2';
    return 'TC1';
  }

  private static getLowerTerrainCategory(category: TerrainCategory): TerrainCategory {
    switch (category) {
      case 'TC3': return 'TC2.5';
      case 'TC2.5': return 'TC2';
      case 'TC2': return 'TC1';
      default: return 'TC1';
    }
  }

  static calculate(
    buildingAnalysis: BuildingDensityResult,
    topoVariation: number,
    distanceFromCoast: number
  ): TerrainCategory {
    console.log('[TerrainCategoryCalculator] Starting calculation:', {
      buildingCount: buildingAnalysis.count,
      radius: buildingAnalysis.radius,
      topoVariation
    });

    const effectiveDensity = this.calculateEffectiveDensity(buildingAnalysis);
    let category = this.determineBaseCategory(effectiveDensity);
    
    // Apply topographic adjustment
    if (topoVariation > 15) {
      category = this.getLowerTerrainCategory(
        this.getLowerTerrainCategory(category)
      );
    } else if (topoVariation > 10) {
      category = this.getLowerTerrainCategory(category);
    }

    console.log('[TerrainCategoryCalculator] Final category:', {
      effectiveDensity,
      category,
      originalDensity: buildingAnalysis.density
    });
    
    return category;
  }

  static getDescription(category: TerrainCategory): string {
    return DENSITY_THRESHOLDS[category].description;
  }
}