'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  getCurrentLocation,
  checkLocationPermission,
  requestLocationPermission,
  isGeolocationAvailable,
  type GeoLocation,
  type PermissionStatus,
} from '@/lib/services/geolocation';

export type UseGeolocationState = {
  location: GeoLocation | null;
  loading: boolean;
  error: string | null;
  permissionDenied: boolean;
  permissionStatus: PermissionStatus;
  isAvailable: boolean;
};

export function useGeolocation() {
  const [state, setState] = useState<UseGeolocationState>({
    location: null,
    loading: false,
    error: null,
    permissionDenied: false,
    permissionStatus: 'unknown',
    isAvailable: false,
  });

  // Check availability and permission on mount
  useEffect(() => {
    const init = async () => {
      const available = isGeolocationAvailable();
      setState((prev) => ({ ...prev, isAvailable: available }));

      if (available) {
        const permission = await checkLocationPermission();
        setState((prev) => ({
          ...prev,
          permissionStatus: permission,
        }));
      }
    };
    init();
  }, []);

  const requestPermission = useCallback(async () => {
    const result = await requestLocationPermission();
    setState((prev) => ({
      ...prev,
      permissionStatus: result,
      permissionDenied: result === 'denied',
    }));
    return result;
  }, []);

  const getLocation = useCallback(async (timeoutMs: number = 10000) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    const result = await getCurrentLocation(timeoutMs);

    setState((prev) => ({
      ...prev,
      loading: false,
      location: result.location,
      error: result.error,
      permissionDenied: result.permissionDenied,
      permissionStatus: result.permissionDenied ? 'denied' : prev.permissionStatus,
    }));

    return result;
  }, []);

  const clearLocation = useCallback(() => {
    setState((prev) => ({ ...prev, location: null, error: null }));
  }, []);

  return {
    ...state,
    getLocation,
    requestPermission,
    clearLocation,
  };
}
