import posthog from 'posthog-js';

export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || '';
export const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

export function initPostHog(): void {
  if (typeof window === 'undefined' || typeof window.document === 'undefined' || !POSTHOG_KEY) {
    return;
  }

  if (!posthog.__loaded) {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      capture_pageview: false,
      persistence: 'localStorage',
      autocapture: false, // Disable autocapture for privacy
      session_recording: {
        maskAllInputs: true,
      },
    });
  }
}

export function capturePostHogEvent(
  eventName: string,
  properties?: Record<string, any>
): void {
  if (typeof window === 'undefined' || typeof window.document === 'undefined') return;

  if (typeof posthog !== 'undefined') {
    posthog.capture(eventName, {
      ...properties,
      timestamp: new Date().toISOString(),
    });
  }
}

export function identifyUser(userId: string, traits?: Record<string, any>): void {
  if (typeof window === 'undefined' || typeof window.document === 'undefined') return;

  if (typeof posthog !== 'undefined') {
    posthog.identify(userId, traits);
  }
}
