import React from 'react';
import { MarkerF } from '@react-google-maps/api';

interface MarkerPinProps {
  position: google.maps.LatLngLiteral;
  isSelected?: boolean;
}

export function MarkerPin({ position, isSelected = false }: MarkerPinProps) {
  return (
    <MarkerF
      position={position}
      icon={{
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: isSelected ? '#FF0000' : '#FF4444',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 2,
      }}
    />
  );
}