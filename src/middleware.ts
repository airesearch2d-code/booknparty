import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const { nextUrl, auth: session } = req;
    const isLoggedIn = !!session;

    const isAuthPage = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/register");
    const isDashboard = nextUrl.pathname.startsWith("/dashboard");

    if (isDashboard && !isLoggedIn) {
        return NextResponse.redirect(new URL("/login", nextUrl));
    }

    if (isAuthPage && isLoggedIn) {
        const role = (session?.user as any)?.role;
        if (role === "ADMIN") return NextResponse.redirect(new URL("/dashboard/admin", nextUrl));
        if (role === "OWNER") return NextResponse.redirect(new URL("/dashboard/owner", nextUrl));
        return NextResponse.redirect(new URL("/dashboard/customer", nextUrl));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/dashboard/:path*", "/login", "/register"],
};
