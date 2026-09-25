import * as Sentry from "@sentry/nextjs";

// Client-side Sentry error monitoring. No-op if NEXT_PUBLIC_SENTRY_DSN is not set.
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
        tracesSampleRate: 0.1,
        environment: process.env.NODE_ENV,
    });
}

export function onRouterTransitionStart(url: string, navigationType: "push" | "replace" | "traverse") {
    if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;
    Sentry.addBreadcrumb({
        category: "navigation",
        message: `${navigationType} -> ${url}`,
        level: "info",
    });
}
