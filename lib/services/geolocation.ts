/**
 * Cross-platform geolocation service
 * Uses Capacitor Geolocation on native, falls back to browser API on web
 */

import { Capacitor } from '@capacitor/core';
import { Geolocation, type Position } from '@capacitor/geolocation';

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
  if (Capacitor.isNativePlatform()) {
    return true;
  }
  return 'geolocation' in navigator;
}

/**
 * Request geolocation permission
 */
export async function requestLocationPermission(): Promise<PermissionStatus> {
  if (Capacitor.isNativePlatform()) {
    try {
      const result = await Geolocation.requestPermissions();
      return result.location as PermissionStatus;
    } catch {
      return 'denied';
    }
  }

  // Web: Permission is requested when getCurrentPosition is called
  return 'prompt';
}

/**
 * Check current permission status without prompting
 */
export async function checkLocationPermission(): Promise<PermissionStatus> {
  if (Capacitor.isNativePlatform()) {
    try {
      const result = await Geolocation.checkPermissions();
      return result.location as PermissionStatus;
    } catch {
      return 'unknown';
    }
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
 * Uses Capacitor on native, navigator.geolocation on web
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
    let position: Position;

    if (Capacitor.isNativePlatform()) {
      // Native: Use Capacitor Geolocation plugin
      position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: timeoutMs,
        maximumAge: 30000, // Accept cached position up to 30 seconds old
      });
    } else {
      // Web: Use browser geolocation API
      position = await new Promise<Position>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve({
              coords: {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                accuracy: pos.coords.accuracy,
                altitude: pos.coords.altitude,
                altitudeAccuracy: pos.coords.altitudeAccuracy,
                heading: pos.coords.heading,
                speed: pos.coords.speed,
              },
              timestamp: pos.timestamp,
            });
          },
          (error) => {
            reject(error);
          },
          {
            enableHighAccuracy: true,
            timeout: timeoutMs,
            maximumAge: 30000,
          }
        );
      });
    }

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
    const err = error as { code?: number; message?: string };
    const isPermissionDenied = Boolean(
      err.code === 1 || // Web GeolocationPositionError.PERMISSION_DENIED
      err.message?.toLowerCase().includes('permission') ||
      err.message?.toLowerCase().includes('denied')
    );

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
