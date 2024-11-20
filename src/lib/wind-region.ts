import type { WindRegion } from './types';
import { calculateDistanceToCoastline } from './coastline-distance';

export function determineWindRegion(lat: number, lng: number): WindRegion {
  const distanceFromCoast = calculateDistanceToCoastline(lat, lng);

  console.log(`Determining wind region for:`, {
    latitude: lat,
    longitude: lng,
    distanceFromCoast
  });

  // Region D: Western Australia coast between 20°S and 25°S
  if (lat >= -25 && lat <= -20 && lng >= 112 && lng <= 125) {
    if (distanceFromCoast <= 50) {
      console.log('Region D: Within 50km of coast between 20°S and 25°S');
      return 'D';
    }
    if (distanceFromCoast <= 100) {
      console.log('Region C: Between 50-100km from coast between 20°S and 25°S');
      return 'C';
    }
    if (distanceFromCoast <= 150) {
      return 'B';
    }
    return 'A';
  }

  // For areas north of 25°S
  if (lat > -25) {
    // Within 50km of coast is Region C
    if (distanceFromCoast <= 50) {
      console.log('Region C: Within 50km of coast, north of 25°S');
      return 'C';
    }
    // Between 50-100km from coast is Region B
    if (distanceFromCoast <= 100) {
      console.log('Region B: Between 50-100km from coast, north of 25°S');
      return 'B';
    }
    // Beyond 100km from coast is Region A
    console.log('Region A: More than 100km from coast, north of 25°S');
    return 'A';
  }

  // For latitudes between 25°S and 30°S
  if (lat >= -30 && lat <= -25) {
    if (distanceFromCoast > 200) {
      console.log('Region A: More than 200km from coast between 25°S and 30°S');
      return 'A';
    }
    console.log('Region B: Within 200km of coast between 25°S and 30°S');
    return 'B';
  }

  // South of 30°S is always Region A
  console.log('Region A: South of 30°S');
  return 'A';
}