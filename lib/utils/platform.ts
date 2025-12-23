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
  // Real Safari browser has "Version/X.X" AND "Safari/XXX" in user agent
  // WebViews typically have AppleWebKit but missing "Version/" or proper Safari identifier
  const hasAppleWebKit = userAgent.includes('applewebkit');
  const hasVersion = userAgent.includes('version/');
  const hasSafariIdentifier = /safari\/\d/.test(userAgent);
  const hasChrome = userAgent.includes('chrome') || userAgent.includes('crios');
  const hasFirefox = userAgent.includes('fxios');

  // It's a real browser if it has Version/ AND Safari/XXX (Safari) or is Chrome/Firefox
  const isRealBrowser = (hasVersion && hasSafariIdentifier) || hasChrome || hasFirefox;

  // WebView: Has WebKit but NOT a real browser
  const isWebView = hasAppleWebKit && !isRealBrowser;

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
 * Only hide when inside the iOS app (WebView/PWA/native), NOT in Safari
 * Safari is where users go to make purchases - they should be able to checkout there
 *
 * IMPORTANT: This function is MORE aggressive to ensure App Store compliance.
 * On iOS, we ONLY allow external payments if we're DEFINITELY in a real browser.
 */
export function shouldHideExternalPayments(): boolean {
  if (typeof window === 'undefined') return false;

  // If not iOS device, allow external payments (Android/Web)
  if (!isIOSDevice()) return false;

  // On iOS, we must be VERY careful. Only allow external payments in REAL browsers.
  // Real Safari has both "Version/X.X" AND "Safari/XXX" in user agent
  // WebViews, PWAs, and native apps do NOT have these identifiers
  const userAgent = window.navigator.userAgent.toLowerCase();

  // Check for real Safari browser indicators
  const hasVersion = userAgent.includes('version/');
  const hasSafariIdentifier = /safari\/\d/.test(userAgent);
  const isRealSafari = hasVersion && hasSafariIdentifier;

  // Check for Chrome on iOS (CriOS) and Firefox on iOS (FxiOS)
  const hasChrome = userAgent.includes('crios');
  const hasFirefox = userAgent.includes('fxios');

  // It's a real browser if it matches Safari, Chrome, or Firefox patterns
  const isRealBrowser = isRealSafari || hasChrome || hasFirefox;

  // HIDE payments if we're NOT in a real browser
  // This catches: WebViews, PWAs, Capacitor apps, and any other iOS context
  return !isRealBrowser;
}

/**
 * Get the web URL for purchasing (for directing iOS users)
 */
export function getWebPurchaseUrl(): string {
  // Use production URL for purchases
  return 'https://networkbuddy.io';
}
