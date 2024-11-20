import React from 'react';
import { calculateDistanceToCoastline } from '@/lib/coastline-distance';

interface CoastlineTestProps {
  lat: number;
  lng: number;
}

export function CoastlineTest({ lat, lng }: CoastlineTestProps) {
  const distance = calculateDistanceToCoastline(lat, lng);

  return (
    <div className="mt-2 p-2 bg-slate-50 rounded text-sm">
      <div className="flex items-center gap-2">
        <div className="space-x-4">
          <span>Distance to coast: <b>{distance.toFixed(2)} km</b></span>
        </div>
      </div>
    </div>
  );
}