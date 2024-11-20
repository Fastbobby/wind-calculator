import React, { useEffect, useState } from 'react';
import { useLoadScript } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import { CaptureableMap } from '@/components/TerrainAnalyzer/CaptureableMap';
import { WIND_REGIONS, TERRAIN_CATEGORIES, SHIELDING_CLASSES, TOPOGRAPHIC_CLASSES } from '@/lib/constants';
import type { LocationData, WindResult } from '@/lib/types';

interface ExportPageProps {
  address: string;
  locationData: LocationData;
  windResult: WindResult;
  analysisResults: any[];
  criticalDirection: any;
  formData: {
    terrainCategory: string;
    shielding: string;
    topography: string;
  };
  onBack: () => void;
}

export default function ExportPage({
  address,
  locationData,
  windResult,
  analysisResults,
  criticalDirection,
  formData,
  onBack
}: ExportPageProps) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: ["places", "geometry"]
  });

  const [mapImage, setMapImage] = useState<string>('');
  const regionInfo = WIND_REGIONS[windResult.region];

  const handleMapCapture = (imageData: string) => {
    setMapImage(imageData);
  };

  const handleSave = () => {
    window.print();
  };

  if (!isLoaded) return <div>Loading map...</div>;

  const criticalResult = analysisResults.find(r => r.direction === criticalDirection?.direction);

  return (
    <div className="w-[210mm] mx-auto bg-white p-8 shadow-lg print:shadow-none space-y-6">
      <div className="flex justify-between items-center print:hidden mb-4">
        <Button onClick={onBack} variant="outline">Back to Calculator</Button>
        <Button onClick={handleSave}>Save as PDF</Button>
      </div>

      <div className="text-center border-b pb-4">
        <h1 className="text-2xl font-bold">Wind Classification Report</h1>
        <h2 className="text-xl mt-2">AS 4055-2021</h2>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">Location Details</h3>
          <div className="space-y-1 text-sm">
            <p>Latitude: {locationData.latitude.toFixed(4)}°</p>
            <p>Longitude: {locationData.longitude.toFixed(4)}°</p>
            <p>Elevation: {locationData.elevation.toFixed(1)}m</p>
            <p>Wind Region: {windResult.region} ({regionInfo.type})</p>
            <p className="text-xs text-gray-500 mt-1">{regionInfo.description}</p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Site Parameters</h3>
          <div className="space-y-2 text-sm">
            <div>
              <p className="font-medium">Terrain Category: {formData.terrainCategory}</p>
              <p className="text-xs text-gray-500">{TERRAIN_CATEGORIES[formData.terrainCategory]?.description}</p>
            </div>
            <div>
              <p className="font-medium">Shielding: {formData.shielding}</p>
              <p className="text-xs text-gray-500">{SHIELDING_CLASSES[formData.shielding]?.description}</p>
            </div>
            <div>
              <p className="font-medium">Topography: {formData.topography}</p>
              <p className="text-xs text-gray-500">{TOPOGRAPHIC_CLASSES[formData.topography]?.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="h-[300px] rounded-lg overflow-hidden border relative">
        {mapImage ? (
          <img 
            src={mapImage} 
            alt="Site Analysis Map" 
            className="w-full h-full object-cover"
          />
        ) : (
          <CaptureableMap
            center={{ lat: locationData.latitude, lng: locationData.longitude }}
            markerPosition={{ lat: locationData.latitude, lng: locationData.longitude }}
            analysisRadius={500}
            directionalLines={[]}
            criticalPath={criticalDirection?.path}
            buildings={[]}
            onCapture={handleMapCapture}
          />
        )}
      </div>

      <div className="border-t pt-4">
        <h3 className="font-semibold mb-4">Wind Classification Results</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded">
            <div className="text-sm text-gray-600">Region</div>
            <div className="text-2xl font-bold">{windResult.region}</div>
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <div className="text-sm text-gray-600">Classification</div>
            <div className="text-2xl font-bold">{windResult.classification}</div>
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <div className="text-sm text-gray-600">Service Wind Speed</div>
            <div className="text-2xl font-bold">{windResult.serviceSpeed} m/s</div>
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <div className="text-sm text-gray-600">Ultimate Wind Speed</div>
            <div className="text-2xl font-bold">{windResult.ultimateSpeed} m/s</div>
          </div>
        </div>
      </div>

      {criticalResult && (
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-2">Critical Direction Analysis</h3>
          <div className="p-4 bg-gray-50 rounded">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-600">Direction</div>
                <div className="font-bold">{criticalDirection.direction}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Max Slope</div>
                <div className="font-bold">{(criticalResult.slopes.maxSlope * 100).toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Average Slope</div>
                <div className="font-bold">{(criticalResult.slopes.averageSlope * 100).toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Elevation Change</div>
                <div className="font-bold">{criticalResult.slopes.elevationChange.toFixed(1)}m</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}