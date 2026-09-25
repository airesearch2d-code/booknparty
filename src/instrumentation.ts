import type { Instrumentation } from "next";

/**
 * Called once when a new Next.js server instance starts.
 * Initializes Sentry for server-side error monitoring when SENTRY_DSN is configured.
 * No-op (safe to run without Sentry) if SENTRY_DSN is not set.
 */
export async function register() {
    if (!process.env.SENTRY_DSN) return;

    if (process.env.NEXT_RUNTIME === "nodejs") {
        const Sentry = await import("@sentry/nextjs");
        Sentry.init({
            dsn: process.env.SENTRY_DSN,
            tracesSampleRate: 0.1,
            environment: process.env.NODE_ENV,
        });
    }

    if (process.env.NEXT_RUNTIME === "edge") {
        const Sentry = await import("@sentry/nextjs");
        Sentry.init({
            dsn: process.env.SENTRY_DSN,
            tracesSampleRate: 0.1,
            environment: process.env.NODE_ENV,
        });
    }
}

/**
 * Reports server-side rendering/route/action errors to Sentry.
 * No-op if SENTRY_DSN is not set.
 */
export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
    if (!process.env.SENTRY_DSN) return;

    const Sentry = await import("@sentry/nextjs");
    Sentry.captureRequestError(err, request, context);
};
