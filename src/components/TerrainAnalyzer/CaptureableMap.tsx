import React, { useRef, useCallback } from 'react';
import { GoogleMap, CircleF, PolylineF } from '@react-google-maps/api';
import { MapPin } from './MapPin';
import { toPng } from 'html-to-image';

interface CaptureableMapProps {
  center: google.maps.LatLngLiteral;
  markerPosition: google.maps.LatLngLiteral;
  analysisRadius: number;
  directionalLines: google.maps.LatLngLiteral[][];
  criticalPath?: google.maps.LatLngLiteral[];
  buildings?: Array<{ lat: number; lng: number }>;
  onMapClick?: (event: google.maps.MapMouseEvent) => void;
  onMapLoad?: (map: google.maps.Map) => void;
  onCapture?: (imageData: string) => void;
}

const mapContainerStyle = { width: '100%', height: '400px' };
const ZOOM_LEVEL = 16;

export function CaptureableMap({
  center,
  markerPosition,
  analysisRadius,
  directionalLines,
  criticalPath,
  buildings = [],
  onMapClick,
  onMapLoad,
  onCapture
}: CaptureableMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  const captureMap = useCallback(async () => {
    if (!mapRef.current || !onCapture) return;

    try {
      const imageData = await toPng(mapRef.current, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        style: {
          transform: 'scale(1)',
        },
      });
      onCapture(imageData);
    } catch (error) {
      console.error('Error capturing map:', error);
    }
  }, [onCapture]);

  const handleMapLoad = useCallback((map: google.maps.Map) => {
    if (onMapLoad) {
      onMapLoad(map);
    }

    // Fit bounds to show radius comfortably
    if (window.google) {
      const circle = new window.google.maps.Circle({
        center: markerPosition,
        radius: analysisRadius
      });

      const bounds = circle.getBounds();
      if (bounds) {
        map.fitBounds(bounds);
      }
    }
  }, [markerPosition, analysisRadius, onMapLoad]);

  return (
    <div ref={mapRef} className="rounded-lg overflow-hidden border relative">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={ZOOM_LEVEL}
        options={{
          mapTypeId: 'hybrid',
          mapTypeControl: true,
          mapTypeControlOptions: {
            position: 8, // TOP_RIGHT
            style: 1, // HORIZONTAL_BAR
          },
          zoomControl: true,
          zoomControlOptions: {
            position: 11, // RIGHT_BOTTOM
          },
          streetViewControl: false,
          fullscreenControl: false,
          minZoom: 14,
          maxZoom: 20,
          tilt: 0,
          disableDefaultUI: false,
          gestureHandling: 'greedy',
          clickableIcons: false,
          styles: [
            {
              featureType: 'all',
              elementType: 'labels',
              stylers: [{ visibility: 'on' }]
            }
          ]
        }}
        onClick={onMapClick}
        onLoad={handleMapLoad}
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
            }}
          />
        ))}

        <MapPin position={markerPosition} />
      </GoogleMap>
    </div>
  );
}