import { coastlineGeoJSON } from './coastline-data';

export function calculateDistanceToCoastline(lat: number, lng: number): number {
  let minDistance = Infinity;
  let closestSegment = null;

  // Convert point to radians
  const φ = toRadians(lat);
  const λ = toRadians(lng);

  // Iterate through each feature in the collection
  coastlineGeoJSON.features.forEach(feature => {
    if (feature.geometry.type === 'MultiLineString') {
      // Check each line string in the multiline
      feature.geometry.coordinates.forEach(lineString => {
        // Check each segment in the line string
        for (let i = 0; i < lineString.length - 1; i++) {
          const [lng1, lat1] = lineString[i];
          const [lng2, lat2] = lineString[i + 1];
          
          // Convert segment endpoints to radians
          const φ1 = toRadians(lat1);
          const λ1 = toRadians(lng1);
          const φ2 = toRadians(lat2);
          const λ2 = toRadians(lng2);

          // Calculate distances to segment endpoints
          const d13 = greatCircleDistance(φ1, λ1, φ, λ);
          const d23 = greatCircleDistance(φ2, λ2, φ, λ);
          const d12 = greatCircleDistance(φ1, λ1, φ2, λ2);

          // If segment is effectively a point, just use direct distance
          if (d12 < 0.001) {
            const dist = Math.min(d13, d23);
            if (dist < minDistance) {
              minDistance = dist;
              closestSegment = { start: [lat1, lng1], end: [lat2, lng2] };
            }
            continue;
          }

          // Calculate cross-track distance using spherical geometry
          const θ13 = bearing(φ1, λ1, φ, λ);
          const θ12 = bearing(φ1, λ1, φ2, λ2);
          const δxt = Math.asin(Math.sin(d13/R) * Math.sin(θ13 - θ12)) * R;

          // Calculate along-track distance
          const δat = Math.acos(Math.cos(d13/R) / Math.cos(δxt/R)) * R;

          // If closest point is beyond segment endpoints, use endpoint distances
          if (δat > d12) {
            const dist = Math.min(d13, d23);
            if (dist < minDistance) {
              minDistance = dist;
              closestSegment = { start: [lat1, lng1], end: [lat2, lng2] };
            }
          } else {
            // Use cross-track distance as it's perpendicular to segment
            const dist = Math.abs(δxt);
            if (dist < minDistance) {
              minDistance = dist;
              closestSegment = { start: [lat1, lng1], end: [lat2, lng2] };
            }
          }
        }
      });
    }
  });

  console.log('Coastline distance calculation:', {
    location: { lat, lng },
    distance: minDistance,
    closestSegment
  });

  // Return distance in kilometers, default to 200km if no coastline found
  return minDistance === Infinity ? 200 : minDistance;
}

const R = 6371; // Earth's radius in kilometers

function toRadians(degrees: number): number {
  return degrees * Math.PI / 180;
}

function greatCircleDistance(φ1: number, λ1: number, φ2: number, λ2: number): number {
  const Δφ = φ2 - φ1;
  const Δλ = λ2 - λ1;
  
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
           Math.cos(φ1) * Math.cos(φ2) *
           Math.sin(Δλ/2) * Math.sin(Δλ/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  return R * c;
}

function bearing(φ1: number, λ1: number, φ2: number, λ2: number): number {
  const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) -
           Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
  return Math.atan2(y, x);
}