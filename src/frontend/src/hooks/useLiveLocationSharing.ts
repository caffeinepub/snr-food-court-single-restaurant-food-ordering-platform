import { useEffect, useRef, useState } from 'react';
import { useUpdateCustomerLocationOnOrder } from './useQueries';

interface UseLiveLocationSharingProps {
  orderId: string | null;
  enabled: boolean;
}

interface LocationState {
  isSharing: boolean;
  error: string | null;
  isSupported: boolean;
}

export function useLiveLocationSharing({ orderId, enabled }: UseLiveLocationSharingProps) {
  const [state, setState] = useState<LocationState>({
    isSharing: false,
    error: null,
    isSupported: typeof navigator !== 'undefined' && 'geolocation' in navigator,
  });

  const updateLocation = useUpdateCustomerLocationOnOrder();
  const watchIdRef = useRef<number | null>(null);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const lastPositionRef = useRef<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    // Don't start if not enabled, no orderId, or geolocation not supported
    if (!enabled || !orderId || !state.isSupported) {
      return;
    }

    // Check if geolocation is available
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
        isSharing: false,
      }));
      return;
    }

    // Request initial position to trigger permission prompt
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Permission granted, start watching position
        setState(prev => ({ ...prev, isSharing: true, error: null }));
        lastPositionRef.current = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        // Send initial location
        updateLocation.mutate({
          orderId,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        // Watch position for updates
        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            lastPositionRef.current = {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            };
          },
          (error) => {
            console.error('Geolocation error:', error);
            setState(prev => ({
              ...prev,
              error: `Location error: ${error.message}`,
              isSharing: false,
            }));
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );

        // Set up interval to send location updates every second
        intervalIdRef.current = setInterval(() => {
          if (lastPositionRef.current && orderId) {
            updateLocation.mutate({
              orderId,
              latitude: lastPositionRef.current.latitude,
              longitude: lastPositionRef.current.longitude,
            });
          }
        }, 1000);
      },
      (error) => {
        // Permission denied or error
        let errorMessage = 'Unable to access your location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access in your browser settings to share your live location with the restaurant.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable. Please check your device settings.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            break;
        }

        setState(prev => ({
          ...prev,
          error: errorMessage,
          isSharing: false,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    // Cleanup function
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (intervalIdRef.current !== null) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
      lastPositionRef.current = null;
    };
  }, [enabled, orderId, state.isSupported]);

  return state;
}
