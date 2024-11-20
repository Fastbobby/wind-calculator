import React, { useCallback } from 'react';
import { GoogleMap, CircleF, PolylineF } from '@react-google-maps/api';
import { MapPin } from './MapPin';

interface AnalysisMapProps {
  center: google.maps.LatLngLiteral;
  markerPosition: google.maps.LatLngLiteral;
  analysisRadius: number;
  directionalLines: google.maps.LatLngLiteral[][];
  criticalPath?: google.maps.LatLngLiteral[];
  buildings?: Array<{ lat: number; lng: number }>;
  onMapClick: (event: google.maps.MapMouseEvent) => void;
}

const mapContainerStyle = { width: '100%', height: '400px' };
const ZOOM_LEVEL = 16;

export function AnalysisMap({
  center,
  markerPosition,
  analysisRadius,
  directionalLines,
  criticalPath,
  buildings = [],
  onMapClick
}: AnalysisMapProps) {
  const handleClick = useCallback((e: google.maps.MapMouseEvent) => {
    console.log('Map clicked:', e.latLng?.toJSON());
    if (e.latLng) {
      onMapClick(e);
    }
  }, [onMapClick]);

  return (
    <div className="rounded-lg overflow-hidden border relative">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={ZOOM_LEVEL}
        options={{
          mapTypeId: 'hybrid',
          mapTypeControl: true,
          zoomControl: true,
          streetViewControl: false,
          fullscreenControl: false,
          clickableIcons: false,
          disableDoubleClickZoom: true,
          gestureHandling: 'cooperative'
        }}
        onClick={handleClick}
      >
        <CircleF
          center={markerPosition}
          radius={analysisRadius}
          options={{
            strokeColor: '#2196F3',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#2196F3',
            fillOpacity: 0.1,
            zIndex: 1,
            clickable: false
          }}
        />

        {directionalLines.map((line, index) => (
          <PolylineF
            key={`line-${index}`}
            path={line}
            options={{
              strokeColor: '#666666',
              strokeOpacity: 0.5,
              strokeWeight: 1,
              zIndex: 2,
              clickable: false
            }}
          />
        ))}

        {criticalPath && criticalPath.length > 0 && (
          <PolylineF
            path={criticalPath}
            options={{
              strokeColor: '#FF0000',
              strokeOpacity: 0.8,
              strokeWeight: 2,
              zIndex: 3,
              clickable: false
            }}
          />
        )}

        {buildings.map((building, index) => (
          <CircleF
            key={`building-${index}`}
            center={building}
            radius={5}
            options={{
              strokeColor: '#00FF00',
              strokeOpacity: 0.8,
              strokeWeight: 1,
              fillColor: '#00FF00',
              fillOpacity: 0.7,
              zIndex: 4,
              clickable: false
            }}
          />
        ))}

        <MapPin position={markerPosition} />
      </GoogleMap>
    </div>
  );
}