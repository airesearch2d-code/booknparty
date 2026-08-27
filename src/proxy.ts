import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Use ONLY the edge-safe authConfig here — no Prisma, no Node.js modules
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
    matcher: ["/dashboard/:path*", "/login", "/register"],
};
