'use client';

/**
 * Platform detection utilities for handling iOS App Store restrictions
 *
 * Apple requires In-App Purchase for digital content on iOS.
 * We hide Stripe payment options on iOS and direct users to web for purchases.
 * Users can still use credits/subscriptions purchased on web (Guideline 3.1.3(b)).
 */

/**
 * Check if running on iOS device (any context - browser, PWA, WebView, native)
 */
export function isIOSDevice(): boolean {
  if (typeof window === 'undefined') return false;

  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
}

/**
 * Check if app is running in iOS standalone mode (PWA or native app WebView)
 */
export function isIOSStandalone(): boolean {
  if (typeof window === 'undefined') return false;

  // Check for standalone display mode (PWA installed on home screen)
  const isStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

  // Check for display-mode: standalone media query (also catches WebView apps)
  const isDisplayModeStandalone = window.matchMedia('(display-mode: standalone)').matches;

  return isStandalone || isDisplayModeStandalone;
}

/**
 * Check if app is running in an iOS WebView (like Despia-built apps)
 */
export function isIOSWebView(): boolean {
  if (typeof window === 'undefined') return false;
  if (!isIOSDevice()) return false;

  const userAgent = window.navigator.userAgent.toLowerCase();

  // iOS WebView indicators:
  // - No Safari in user agent but has AppleWebKit
  // - Or running in standalone mode
  const hasAppleWebKit = userAgent.includes('applewebkit');
  const hasSafari = userAgent.includes('safari');
  const hasChrome = userAgent.includes('crome') || userAgent.includes('crios');

  // WebView: Has WebKit but not Safari browser (and not Chrome)
  const isWebView = hasAppleWebKit && !hasSafari && !hasChrome;

  // Also check for standalone mode which indicates native app wrapper
  return isWebView || isIOSStandalone();
}

/**
 * Check if app is running as a native iOS app (via Capacitor)
 */
export function isNativeIOS(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    // Dynamic import check for Capacitor
    const Capacitor = (window as Window & { Capacitor?: { isNativePlatform: () => boolean; getPlatform: () => string } }).Capacitor;
    if (Capacitor && typeof Capacitor.isNativePlatform === 'function') {
      return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
    }
  } catch {
    // Capacitor not available
  }

  return false;
}

/**
 * Check if app is running as any native app (iOS or Android)
 */
export function isNativeApp(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const Capacitor = (window as Window & { Capacitor?: { isNativePlatform: () => boolean } }).Capacitor;
    if (Capacitor && typeof Capacitor.isNativePlatform === 'function') {
      return Capacitor.isNativePlatform();
    }
  } catch {
    // Capacitor not available
  }

  return false;
}

/**
 * Check if external payments (Stripe) should be hidden
 * Hide on iOS native apps, WebViews (Despia), and standalone PWAs
 */
export function shouldHideExternalPayments(): boolean {
  // Hide payments on native iOS (Capacitor)
  if (isNativeIOS()) return true;

  // Hide payments in iOS WebView (Despia-built apps)
  if (isIOSWebView()) return true;

  // Hide payments in iOS standalone PWA mode
  if (isIOSDevice() && isIOSStandalone()) return true;

  return false;
}

/**
 * Get the web URL for purchasing (for directing iOS users)
 */
export function getWebPurchaseUrl(): string {
  // Use production URL for purchases
  return 'https://networkbuddy.io';
}
