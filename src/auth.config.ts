import type { NextAuthConfig } from "next-auth";

// Edge-compatible auth config — NO Prisma, NO Node.js-only modules
// Used by middleware.ts (runs in Edge Runtime)
export const authConfig = {
    session: { strategy: "jwt" as const },
    pages: { signIn: "/login", error: "/login" },
    providers: [], // providers are added only in auth.ts (Node.js runtime)
    callbacks: {
        // This callback is evaluated in middleware to protect routes
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isDashboard = nextUrl.pathname.startsWith("/dashboard");

            if (isDashboard && !isLoggedIn) {
                return false; // Redirect to signIn page (defined above)
            }

            return true; // Allow all other routes
        },
    },
} satisfies NextAuthConfig;
