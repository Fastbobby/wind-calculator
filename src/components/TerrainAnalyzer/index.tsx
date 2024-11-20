import React, { useState, useCallback } from 'react';
import { useLoadScript } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import { SearchBar } from './SearchBar';
import { AnalysisMap } from './AnalysisMap';
import { AnalysisResults } from './AnalysisResults';
import { WindRegionDisplay } from '@/components/WindRegionDisplay';
import { useTerrainAnalysis } from './useTerrainAnalysis';
import type { WindRegion } from '@/lib/types';
import { determineWindRegion } from '@/lib/wind-region';

const GOOGLE_MAPS_LIBRARIES: ("places" | "geometry")[] = ["places", "geometry"];
const ANALYSIS_RADIUS = 500; // 500 meters radius

interface TerrainAnalyzerProps {
  onLocationUpdate: (lat: number, lng: number, elevation: number, analysis?: any) => void;
  initialLocation?: { latitude: number; longitude: number };
  analysisResults?: any[];
  criticalDirection?: any;
  onRegionChange?: (region: WindRegion) => void;
  selectedRegion?: WindRegion;
}

export default function TerrainAnalyzer({ 
  onLocationUpdate, 
  initialLocation,
  analysisResults: initialResults,
  criticalDirection,
  onRegionChange,
  selectedRegion
}: TerrainAnalyzerProps) {
  const defaultLocation = { lat: -33.865143, lng: 151.2099 };
  const [center, setCenter] = useState(initialLocation ? 
    { lat: initialLocation.latitude, lng: initialLocation.longitude } : 
    defaultLocation
  );
  const [markerPosition, setMarkerPosition] = useState(
    initialLocation ? 
    { lat: initialLocation.latitude, lng: initialLocation.longitude } : 
    defaultLocation
  );

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: GOOGLE_MAPS_LIBRARIES
  });

  const {
    analyzeLocation,
    analysisResults,
    isAnalyzing,
    error,
    directionalLines,
    criticalPath,
    buildings,
    buildingDensity,
    buildingCount,
    distanceFromCoast,
    topoVariation,
    terrainCategory
  } = useTerrainAnalysis({ isLoaded });

  const handleSearch = useCallback(async (address: string) => {
    if (!isLoaded || !window.google) return;

    const geocoder = new window.google.maps.Geocoder();
    try {
      const result = await geocoder.geocode({ address });
      if (result.results[0]) {
        const location = result.results[0].geometry.location;
        const newPosition = {
          lat: location.lat(),
          lng: location.lng()
        };
        setMarkerPosition(newPosition);
        setCenter(newPosition);
        
        // Update region when location changes
        if (onRegionChange) {
          const region = determineWindRegion(newPosition.lat, newPosition.lng);
          onRegionChange(region);
        }
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  }, [isLoaded, onRegionChange]);

  const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (!event.latLng) return;
    
    const newPosition = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    };
    setMarkerPosition(newPosition);
    setCenter(newPosition);
    
    // Update region when location changes
    if (onRegionChange) {
      const region = determineWindRegion(newPosition.lat, newPosition.lng);
      onRegionChange(region);
    }
  }, [onRegionChange]);

  const handleAnalyze = useCallback(async () => {
    const analysis = await analyzeLocation(markerPosition);
    if (analysis) {
      const criticalResult = analysis.analysisResults.find(
        (r: any) => r.direction === analysis.criticalDirection
      );

      // Calculate region if not already selected
      const calculatedRegion = selectedRegion || determineWindRegion(markerPosition.lat, markerPosition.lng);
      if (onRegionChange) {
        onRegionChange(calculatedRegion);
      }

      onLocationUpdate(
        markerPosition.lat,
        markerPosition.lng,
        analysis.baseElevation,
        {
          terrainCategory: analysis.terrainCategory,
          originalTerrainCategory: analysis.terrainCategory,
          topographicClass: criticalResult?.topographicClass,
          maxSlope: criticalResult?.slopes.maxSlope,
          exposureCategory: criticalResult?.exposureCategory,
          distanceFromCoast: analysis.distanceFromCoast,
          analysisResults: analysis.analysisResults,
          criticalDirection: analysis.criticalDirection,
          criticalPath: analysis.criticalPath,
          buildings: analysis.buildings,
          buildingCount: analysis.buildingCount,
          buildingDensity: analysis.buildingDensity,
          region: calculatedRegion
        }
      );
    }
  }, [analyzeLocation, markerPosition, onLocationUpdate, selectedRegion, onRegionChange]);

  if (!isLoaded) {
    return <div className="p-4">Loading maps...</div>;
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
          {error}
        </div>
      )}
      
      <SearchBar onSearch={handleSearch} isLoading={isAnalyzing} />

      <div className="space-y-4">
        <AnalysisMap
          center={center}
          markerPosition={markerPosition}
          analysisRadius={ANALYSIS_RADIUS}
          directionalLines={directionalLines}
          criticalPath={criticalPath}
          buildings={buildings}
          onMapClick={handleMapClick}
        />

        <WindRegionDisplay 
          latitude={markerPosition.lat}
          longitude={markerPosition.lng}
          onRegionChange={onRegionChange}
          selectedRegion={selectedRegion}
        />
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleAnalyze}
          disabled={!markerPosition || isAnalyzing}
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Terrain'}
        </Button>
      </div>

      <AnalysisResults 
        results={analysisResults}
        buildingDensity={buildingDensity}
        buildingCount={buildingCount}
        distanceFromCoast={distanceFromCoast}
        topoVariation={topoVariation}
        terrainCategory={terrainCategory}
        markerPosition={markerPosition}
      />
    </div>
  );
}