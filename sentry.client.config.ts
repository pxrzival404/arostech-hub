import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1, // 10% sampling untuk performance
  replaysSessionSampleRate: 0.1, // 10% sampling untuk session replay
  replaysOnErrorSampleRate: 1.0, // 100% saat error terjadi
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true, // Mask sensitive data
      blockAllMedia: true,
    }),
  ],
  environment: process.env.NODE_ENV || 'development',
  beforeSend(event) {
    // Filter sensitive data
    if (event.request?.headers) {
      delete event.request.headers['cookie'];
      delete event.request.headers['authorization'];
      delete event.request.headers['x-auth-token'];
    }
    return event;
  },
});
