import type { TerrainCategory, TopographicClass, ShieldingClass } from './types';
import { WIND_CLASSIFICATIONS } from './constants';

// Calculate distance from coast using Haversine formula
export function calculateEastDistanceToCoast(lat: number, lng: number): number {
  // Simplified coastal points for Australia's east coast
  const coastalPoints = [
    { lat: -43.6345972, lng: 146.8746465 }, // Tasmania
    { lat: -37.8136276, lng: 144.9630576 }, // Melbourne
    { lat: -33.8688197, lng: 151.2092955 }, // Sydney
    { lat: -27.4704528, lng: 153.0260341 }, // Brisbane
    { lat: -16.9185514, lng: 145.7780548 }, // Cairns
    { lat: -12.4634403, lng: 130.8456418 }, // Darwin
  ];

  // Find nearest coastal point
  let minDistance = Infinity;
  
  coastalPoints.forEach(point => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(point.lat - lat);
    const dLon = toRad(point.lng - lng);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRad(lat)) * Math.cos(toRad(point.lat)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    if (distance < minDistance) {
      minDistance = distance;
    }
  });

  return minDistance;
}

function toRad(degrees: number): number {
  return degrees * Math.PI / 180;
}