import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

const GoogleMap = ({ center, zoom = 15, markers = [] }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim();

  useEffect(() => {
    if (!apiKey) {
      console.error('Google Maps API key is missing');
      setError('Google Maps API key is missing');
      return;
    }

    // Already loaded
    if (window.google?.maps) {
      setIsLoaded(true);
      return;
    }

    // Script already being loaded
    const existingScript = document.querySelector(
      'script[data-google-maps="true"]'
    );

    if (existingScript) {
      existingScript.addEventListener('load', () => {
        setIsLoaded(true);
      });

      existingScript.addEventListener('error', () => {
        setError('Failed to load Google Maps');
      });

      return;
    }

    const script = document.createElement('script');

    script.src =
      `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places`;

    script.async = true;
    script.defer = true;
    script.dataset.googleMaps = 'true';

    script.onload = () => {
      if (window.google?.maps) {
        setIsLoaded(true);
      } else {
        setError('Google Maps loaded but API is unavailable');
      }
    };

    script.onerror = () => {
      console.error('Failed to load Google Maps script');
      setError('Failed to load Google Maps');
    };

    document.head.appendChild(script);

    // Do NOT remove the script here.
    // Other components may still need Google Maps.
  }, [apiKey]);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || map) return;

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center,
      zoom,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      zoomControl: true,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'on' }]
        },
        {
          featureType: 'transit',
          elementType: 'labels',
          stylers: [{ visibility: 'on' }]
        },
        {
          featureType: 'poi.medical',
          elementType: 'all',
          stylers: [{ visibility: 'on' }]
        },
        {
          featureType: 'poi.business',
          elementType: 'all',
          stylers: [{ visibility: 'simplified' }]
        }
      ]
    });

    setMap(mapInstance);
  }, [isLoaded, center, zoom, map]);

  // Add markers
  useEffect(() => {
    if (!map || !markers.length) return;

    const mapMarkers = markers.map((marker) => {
      const mapMarker = new window.google.maps.Marker({
        position: marker.position,
        map,
        title: marker.title,
        icon: marker.icon || {
          url:
            'data:image/svg+xml;charset=UTF-8,' +
            encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32"
                   xmlns="http://www.w3.org/2000/svg">
                <circle
                  cx="16"
                  cy="16"
                  r="8"
                  fill="#4285f4"
                  stroke="#ffffff"
                  stroke-width="2"
                />
                <circle
                  cx="16"
                  cy="16"
                  r="4"
                  fill="#ffffff"
                />
              </svg>
            `),
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 16)
        }
      });

      if (marker.infoWindow) {
        const infoWindow = new window.google.maps.InfoWindow({
          content: marker.infoWindow
        });

        mapMarker.addListener('click', () => {
          infoWindow.open({
            map,
            anchor: mapMarker
          });
        });
      }

      return mapMarker;
    });

    return () => {
      mapMarkers.forEach((marker) => marker.setMap(null));
    };
  }, [map, markers]);

  if (error) {
    return (
      <div
        style={{
          height: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid #e9ecef',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center'
        }}
      >
        <p>{error}</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="map-loading">
        <div className="loading-spinner"></div>
        <p>Loading map...</p>
      </div>
    );
  }

  return (
    <div className="google-map-container">
      <div
        ref={mapRef}
        className="google-map"
        style={{
          width: '100%',
          height: '400px',
          borderRadius: '12px',
          border: '2px solid #e9ecef'
        }}
      />
    </div>
  );
};

GoogleMap.propTypes = {
  center: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired
  }).isRequired,

  zoom: PropTypes.number,

  markers: PropTypes.arrayOf(
    PropTypes.shape({
      position: PropTypes.shape({
        lat: PropTypes.number.isRequired,
        lng: PropTypes.number.isRequired
      }).isRequired,
      title: PropTypes.string,
      infoWindow: PropTypes.string,
      icon: PropTypes.object
    })
  )
};

export default GoogleMap;