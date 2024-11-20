import React from 'react';
import { determineWindRegion } from '@/lib/wind-region';
import { WIND_REGIONS } from '@/lib/constants';
import { Select } from '@/components/ui/select';
import type { WindRegion } from '@/lib/types';

interface WindRegionDisplayProps {
  latitude: number;
  longitude: number;
  onRegionChange?: (region: WindRegion) => void;
  selectedRegion?: WindRegion;
}

export function WindRegionDisplay({ 
  latitude, 
  longitude, 
  onRegionChange,
  selectedRegion 
}: WindRegionDisplayProps) {
  const suggestedRegion = determineWindRegion(latitude, longitude);
  const currentRegion = selectedRegion || suggestedRegion;
  const regionInfo = WIND_REGIONS[currentRegion];

  const handleRegionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newRegion = event.target.value as WindRegion;
    if (onRegionChange) {
      onRegionChange(newRegion);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Wind Region</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Override:</span>
          <Select 
            value={currentRegion}
            onChange={handleRegionChange}
            className="w-32"
          >
            {Object.keys(WIND_REGIONS).map((region) => (
              <option key={region} value={region}>
                Region {region}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Suggested Region:</span>
          <span className="font-medium">{suggestedRegion}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Selected Type:</span>
          <span className="font-medium">{regionInfo.type}</span>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          {regionInfo.description}
        </div>
      </div>
    </div>
  );
}