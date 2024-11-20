import { useState, useCallback } from 'react';
import { analyzeBuildingDensity, determineTerrainCategory, calculateTopoVariation } from '@/lib/terrain-classification';
import { calculateEastDistanceToCoast } from '@/lib/calculations';
import type { TerrainCategory, TopographicClass } from '@/lib/types';

const DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
const ANALYSIS_DISTANCE = 500; // meters

interface UseTerrainAnalysisProps {
  isLoaded: boolean;
}

export function useTerrainAnalysis({ isLoaded }: UseTerrainAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<any[]>([]);
  const [directionalLines, setDirectionalLines] = useState<google.maps.LatLngLiteral[][]>([]);
  const [criticalPath, setCriticalPath] = useState<google.maps.LatLngLiteral[]>([]);
  const [buildings, setBuildings] = useState<Array<{ lat: number; lng: number }>>([]);
  const [position, setPosition] = useState<google.maps.LatLngLiteral | null>(null);

  const generatePointsInDirection = useCallback((lat: number, lng: number, direction: string): google.maps.LatLngLiteral[] => {
    const points: google.maps.LatLngLiteral[] = [];
    const distance = 0.5; // 500m in degrees
    const steps = 10;
    
    let bearing;
    switch (direction) {
      case 'N': bearing = 0; break;
      case 'NE': bearing = 45; break;
      case 'E': bearing = 90; break;
      case 'SE': bearing = 135; break;
      case 'S': bearing = 180; break;
      case 'SW': bearing = 225; break;
      case 'W': bearing = 270; break;
      case 'NW': bearing = 315; break;
      default: bearing = 0;
    }
    
    for (let i = 0; i <= steps; i++) {
      const point = google.maps.geometry.spherical.computeOffset(
        new google.maps.LatLng(lat, lng),
        (distance * i * 1000) / steps,
        bearing
      );
      points.push({ lat: point.lat(), lng: point.lng() });
    }
    
    return points;
  }, []);

  const getElevationData = useCallback(async (points: google.maps.LatLngLiteral[]): Promise<google.maps.ElevationResult[] | null> => {
    if (!window.google) return null;
    
    return new Promise((resolve) => {
      const elevator = new google.maps.ElevationService();
      elevator.getElevationForLocations({
        locations: points
      }, (results, status) => {
        if (status === 'OK' && results) {
          resolve(results);
        } else {
          resolve(null);
        }
      });
    });
  }, []);

  const analyzeSlope = useCallback((elevationData: google.maps.ElevationResult[], baseElevation: number) => {
    const MIN_ELEVATION_CHANGE = 3;
    const MIN_HORIZONTAL_DISTANCE = 50;
    
    let maxSignificantSlope = 0;
    let totalSlope = 0;
    const elevationChanges: number[] = [];
    const slopeWindow = Math.floor(elevationData.length / 2);
    
    for (let i = 0; i < elevationData.length - slopeWindow; i++) {
      const elevationChange = Math.abs(
        elevationData[i + slopeWindow].elevation - elevationData[i].elevation
      );
      const horizontalDistance = (ANALYSIS_DISTANCE * slopeWindow) / (elevationData.length - 1);
      
      if (elevationChange >= MIN_ELEVATION_CHANGE && horizontalDistance >= MIN_HORIZONTAL_DISTANCE) {
        const slope = elevationChange / horizontalDistance;
        maxSignificantSlope = Math.max(maxSignificantSlope, slope);
        totalSlope += slope;
        elevationChanges.push(elevationChange);
      }
    }

    if (maxSignificantSlope === 0) {
      const totalChange = Math.abs(
        elevationData[elevationData.length - 1].elevation - elevationData[0].elevation
      );
      maxSignificantSlope = totalChange / ANALYSIS_DISTANCE;
    }

    return {
      maxSlope: maxSignificantSlope,
      averageSlope: totalSlope / Math.max(1, elevationChanges.length),
      elevationChange: Math.max(0, ...elevationChanges),
      slopeCategory: determineSlopeCategory(maxSignificantSlope)
    };
  }, []);

  const determineSlopeCategory = useCallback((slope: number): TopographicClass => {
    const slopeRatio = 1 / slope;
    if (slopeRatio >= 20) return 'T0';
    if (slopeRatio >= 10) return 'T1';
    if (slopeRatio >= 7.5) return 'T2';
    if (slopeRatio >= 5) return 'T3';
    if (slopeRatio >= 3) return 'T4';
    return 'T5';
  }, []);

  const analyzeLocation = useCallback(async (position: google.maps.LatLngLiteral) => {
    if (!isLoaded || !window.google) return null;
    
    setIsAnalyzing(true);
    setError(null);
    setPosition(position);
    
    try {
      const baseElevationData = await getElevationData([position]);
      if (!baseElevationData || !baseElevationData[0]) {
        throw new Error('Could not get base elevation');
      }
      const baseElevation = baseElevationData[0].elevation;

      const newDirectionalLines: google.maps.LatLngLiteral[][] = [];
      const results = [];
      const allElevationData: google.maps.ElevationResult[][] = [];

      for (const direction of DIRECTIONS) {
        const points = generatePointsInDirection(position.lat, position.lng, direction);
        newDirectionalLines.push(points);
        
        const elevationData = await getElevationData(points);
        if (elevationData) {
          allElevationData.push(elevationData);
          const analysis = analyzeSlope(elevationData, baseElevation);
          results.push({
            direction,
            slopes: analysis,
            topographicClass: analysis.slopeCategory
          });
        }
      }

      const buildingAnalysis = await analyzeBuildingDensity(position.lat, position.lng);
      const distanceFromCoast = calculateEastDistanceToCoast(position.lat, position.lng);
      const topoVariation = calculateTopoVariation(allElevationData);
      
      const terrainCategory = determineTerrainCategory(
        buildingAnalysis,
        topoVariation,
        distanceFromCoast
      );

      const criticalResult = results.reduce((prev, current) => {
        return (prev.slopes.maxSlope > current.slopes.maxSlope) ? prev : current;
      });

      const newCriticalPath = generatePointsInDirection(
        position.lat,
        position.lng,
        criticalResult.direction
      );

      setDirectionalLines(newDirectionalLines);
      setCriticalPath(newCriticalPath);
      setBuildings(buildingAnalysis.buildings);
      setAnalysisResults(results);

      return {
        baseElevation,
        terrainCategory,
        topographicClass: criticalResult.topographicClass,
        analysisResults: results,
        criticalDirection: criticalResult.direction,
        criticalPath: newCriticalPath,
        buildings: buildingAnalysis.buildings,
        buildingCount: buildingAnalysis.count,
        buildingDensity: buildingAnalysis.density,
        distanceFromCoast
      };

    } catch (error) {
      console.error('Analysis error:', error);
      setError('Error analyzing terrain');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [isLoaded, generatePointsInDirection, getElevationData, analyzeSlope]);

  return {
    analyzeLocation,
    analysisResults,
    isAnalyzing,
    error,
    directionalLines,
    criticalPath,
    buildings,
    buildingDensity: buildings.length / (Math.PI * Math.pow(ANALYSIS_DISTANCE / 100, 2)),
    buildingCount: buildings.length,
    distanceFromCoast: position ? calculateEastDistanceToCoast(position.lat, position.lng) : 0,
    topoVariation: analysisResults.length > 0 ? 
      Math.max(...analysisResults.map(r => r.slopes?.elevationChange || 0)) : 0,
    terrainCategory: analysisResults[0]?.terrainCategory || ''
  };
}