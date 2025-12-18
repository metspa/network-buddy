'use client';

import { Capacitor } from '@capacitor/core';

/**
 * Platform detection utilities for handling iOS App Store restrictions
 *
 * Apple requires In-App Purchase for digital content on iOS.
 * We hide Stripe payment options on iOS and direct users to web for purchases.
 * Users can still use credits/subscriptions purchased on web (Guideline 3.1.3(b)).
 */

/**
 * Check if app is running as a native iOS app (via Capacitor)
 */
export function isNativeIOS(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
  } catch {
    return false;
  }
}

/**
 * Check if app is running as any native app (iOS or Android)
 */
export function isNativeApp(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

/**
 * Check if external payments (Stripe) should be hidden
 * Currently only iOS requires this due to App Store guidelines
 */
export function shouldHideExternalPayments(): boolean {
  return isNativeIOS();
}

/**
 * Get the web URL for purchasing (for directing iOS users)
 */
export function getWebPurchaseUrl(): string {
  // Use production URL for purchases
  return 'https://networkbuddy.io';
}
