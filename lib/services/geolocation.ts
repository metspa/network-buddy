/**
 * Geolocation service using browser's native Geolocation API
 */

export type GeoLocation = {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
};

export type GeolocationResult = {
  success: boolean;
  location: GeoLocation | null;
  error: string | null;
  permissionDenied: boolean;
};

export type PermissionStatus = 'granted' | 'denied' | 'prompt' | 'unknown';

/**
 * Check if geolocation is available on this platform
 */
export function isGeolocationAvailable(): boolean {
  return typeof window !== 'undefined' && 'geolocation' in navigator;
}

/**
 * Request geolocation permission
 * On web, permission is requested when getCurrentPosition is called
 */
export async function requestLocationPermission(): Promise<PermissionStatus> {
  return 'prompt';
}

/**
 * Check current permission status without prompting
 */
export async function checkLocationPermission(): Promise<PermissionStatus> {
  if (typeof window === 'undefined') {
    return 'unknown';
  }

  // Web: Check via Permissions API if available
  if ('permissions' in navigator) {
    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      return result.state as PermissionStatus;
    } catch {
      return 'prompt';
    }
  }

  return 'prompt';
}

/**
 * Get current location with timeout
 * Uses browser's native geolocation API
 */
export async function getCurrentLocation(
  timeoutMs: number = 10000
): Promise<GeolocationResult> {
  if (!isGeolocationAvailable()) {
    return {
      success: false,
      location: null,
      error: 'Geolocation not available on this device',
      permissionDenied: false,
    };
  }

  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos),
        (error) => reject(error),
        {
          enableHighAccuracy: true,
          timeout: timeoutMs,
          maximumAge: 30000,
        }
      );
    });

    return {
      success: true,
      location: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
      },
      error: null,
      permissionDenied: false,
    };
  } catch (error: unknown) {
    // Handle permission denied
    const err = error as GeolocationPositionError;
    const isPermissionDenied = err.code === 1; // PERMISSION_DENIED

    return {
      success: false,
      location: null,
      error: err.message || 'Failed to get location',
      permissionDenied: isPermissionDenied,
    };
  }
}

/**
 * Format coordinates for SerpAPI `ll` parameter
 * Format: @latitude,longitude,zoom
 */
export function formatForSerpApi(
  latitude: number,
  longitude: number,
  zoom: number = 15
): string {
  return `@${latitude},${longitude},${zoom}z`;
}
