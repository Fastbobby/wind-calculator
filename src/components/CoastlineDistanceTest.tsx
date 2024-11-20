import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface CoastlineDistanceTestProps {
  lat: number;
  lng: number;
}

export function CoastlineDistanceTest({ lat, lng }: CoastlineDistanceTestProps) {
  const [distance, setDistance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCoastlineDistance = async () => {
    setLoading(true);
    try {
      // Query for coastline ways within a large radius (100km)
      const query = `
        [out:json][timeout:25];
        (
          way["natural"="coastline"](around:100000,${lat},${lng});
        );
        out body geom;
      `;

      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `data=${encodeURIComponent(query)}`
      });

      if (!response.ok) {
        throw new Error('Failed to fetch coastline data');
      }

      const data = await response.json();
      
      if (!data.elements || !data.elements.length) {
        console.log('No coastline found within 100km');
        setDistance(100); // Set to max search radius if no coastline found
        return;
      }

      // Find minimum distance to any coastline segment
      let minDistance = Infinity;
      
      data.elements.forEach((way: any) => {
        if (way.geometry) {
          for (let i = 0; i < way.geometry.length - 1; i++) {
            const p1 = way.geometry[i];
            const p2 = way.geometry[i + 1];
            
            // Calculate distance to line segment
            const dist = distanceToLineSegment(
              lat, lng,
              p1.lat, p1.lon,
              p2.lat, p2.lon
            );
            
            minDistance = Math.min(minDistance, dist);
          }
        }
      });

      setDistance(minDistance);
      
    } catch (error) {
      console.error('Error fetching coastline:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-semibold mb-2">Coastline Distance Test</h3>
      <div className="space-y-2">
        <div>
          Location: {lat.toFixed(4)}, {lng.toFixed(4)}
        </div>
        <Button 
          onClick={fetchCoastlineDistance}
          disabled={loading}
        >
          {loading ? 'Calculating...' : 'Test Distance to Coast'}
        </Button>
        {distance !== null && (
          <div className="mt-2">
            Distance to coast: {distance.toFixed(2)} km
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to calculate distance to a line segment
function distanceToLineSegment(
  lat: number, lng: number,
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  
  // Convert to radians
  const φ = lat * Math.PI / 180;
  const λ = lng * Math.PI / 180;
  const φ1 = lat1 * Math.PI / 180;
  const λ1 = lng1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const λ2 = lng2 * Math.PI / 180;

  // Calculate distances and bearings
  const d13 = greatCircleDistance(φ1, λ1, φ, λ);
  const d23 = greatCircleDistance(φ2, λ2, φ, λ);
  const d12 = greatCircleDistance(φ1, λ1, φ2, λ2);

  // Use spherical law of cosines
  const angle = Math.acos(
    (Math.cos(d23/R) - Math.cos(d12/R) * Math.cos(d13/R)) /
    (Math.sin(d12/R) * Math.sin(d13/R))
  );

  // If angle is obtuse, closest point is one of the endpoints
  if (angle >= Math.PI/2) {
    return Math.min(d13, d23);
  }

  // Calculate perpendicular distance
  const dist = R * Math.asin(Math.sin(d13/R) * Math.sin(angle));
  
  return dist;
}

function greatCircleDistance(
  φ1: number, λ1: number,
  φ2: number, λ2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const Δφ = φ2 - φ1;
  const Δλ = λ2 - λ1;
  
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
           Math.cos(φ1) * Math.cos(φ2) *
           Math.sin(Δλ/2) * Math.sin(Δλ/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  return R * c;
}