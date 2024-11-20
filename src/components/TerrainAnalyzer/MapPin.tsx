import React from 'react';
import { MarkerF } from '@react-google-maps/api';

interface MapPinProps {
  position: google.maps.LatLngLiteral;
}

export function MapPin({ position }: MapPinProps) {
  if (!window.google) return null;

  return (
    <MarkerF
      position={position}
      icon={{
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#FF0000',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 2,
      }}
      className="map-pin"
    />
  );
}