"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
    Menu, X, Search, LogOut, LayoutDashboard, ChevronDown,
} from "lucide-react";

interface NavbarProps {
    session?: {
        user: { name?: string | null; email?: string | null; image?: string | null; role?: string };
    } | null;
}

const navLinks = [
    { href: "/venues", label: "Explore Venues" },
    { href: "/venues?type=BANQUET_HALL", label: "Banquet Halls" },
    { href: "/venues?type=ROOFTOP", label: "Rooftops" },
    { href: "/venues?type=FARMHOUSE", label: "Farmhouses" },
];

export default function Navbar({ session }: NavbarProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    /* Add shadow when scrolled */
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 12);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const getDashboardLink = () => {
        const role = session?.user?.role;
        if (role === "ADMIN") return "/dashboard/admin";
        if (role === "OWNER") return "/dashboard/owner";
        return "/dashboard/customer";
    };

    return (
        <nav
            className="fixed top-0 left-0 right-0 z-50 navbar-bg"
            style={{ boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.40)" : "none" }}
        >
            <div className="section-container">
                <div className="flex items-center justify-between h-16">

                    {/* ── Logo ───────────────────────────────────── */}
                    <Link href="/" className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-base leading-none select-none">
                            🎉
                        </div>
                        <span className="font-bold text-lg text-white tracking-tight">
                            Book<span className="gradient-text">N</span>Party
                        </span>
                    </Link>

                    {/* ── Desktop Nav ─────────────────────────────── */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                                style={{
                                    color: pathname === link.href ? "white" : "rgba(255,255,255,0.65)",
                                    background: pathname === link.href ? "rgba(168,85,247,0.15)" : "transparent",
                                }}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* ── Right actions ───────────────────────────── */}
                    <div className="flex items-center gap-2">
                        {/* Search icon (desktop) */}
                        <Link
                            href="/venues"
                            className="hidden md:flex items-center justify-center w-9 h-9 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
                        >
                            <Search size={17} />
                        </Link>

                        {session ? (
                            <div className="relative">
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center gap-2 rounded-full pl-2 pr-2.5 py-1.5 text-sm text-white hover:bg-white/10 transition-colors"
                                >
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                        {session.user.name?.[0]?.toUpperCase() ?? "U"}
                                    </div>
                                    <span className="hidden md:inline font-medium max-w-[80px] truncate">
                                        {session.user.name?.split(" ")[0]}
                                    </span>
                                    <ChevronDown size={13} className="opacity-60" />
                                </button>

                                {userMenuOpen && (
                                    <>
                                        {/* Backdrop */}
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setUserMenuOpen(false)}
                                        />
                                        <div className="absolute right-0 mt-2 w-52 glass-card rounded-xl shadow-2xl overflow-hidden z-50"
                                            style={{ border: "1px solid rgba(168,85,247,0.25)" }}>
                                            <div className="px-4 py-3 border-b border-white/10">
                                                <p className="text-white text-sm font-semibold truncate">{session.user.name}</p>
                                                <p className="text-white/40 text-xs truncate">{session.user.email}</p>
                                            </div>
                                            <Link
                                                href={getDashboardLink()}
                                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/75 hover:text-white hover:bg-white/10 transition-colors"
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                <LayoutDashboard size={15} /> Dashboard
                                            </Link>
                                            <button
                                                onClick={() => signOut({ callbackUrl: "/" })}
                                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-white/10 transition-colors w-full"
                                            >
                                                <LogOut size={15} /> Sign Out
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href="/login" className="btn-secondary text-sm py-2 px-4 rounded-lg hidden sm:inline-flex">
                                    Login
                                </Link>
                                <Link href="/register" className="btn-primary text-sm py-2 px-4 rounded-lg">
                                    List Your Venue
                                </Link>
                            </div>
                        )}

                        {/* Mobile hamburger */}
                        <button
                            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-white ml-1"
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-label="Toggle menu"
                        >
                            {menuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {/* ── Mobile Menu ─────────────────────────────────── */}
                {menuOpen && (
                    <div className="md:hidden pb-4 pt-1 border-t border-white/10 mt-1 space-y-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMenuOpen(false)}
                                className="flex items-center py-2.5 px-3 rounded-lg text-sm font-medium transition-colors"
                                style={{
                                    color: pathname === link.href ? "white" : "rgba(255,255,255,0.70)",
                                    background: pathname === link.href ? "rgba(168,85,247,0.12)" : "transparent",
                                }}
                            >
                                {link.label}
                            </Link>
                        ))}
                        {!session && (
                            <div className="flex gap-2 pt-3">
                                <Link href="/login" className="btn-secondary text-sm py-2 px-4 rounded-lg flex-1 text-center" onClick={() => setMenuOpen(false)}>
                                    Login
                                </Link>
                                <Link href="/register" className="btn-primary text-sm py-2 px-4 rounded-lg flex-1 text-center" onClick={() => setMenuOpen(false)}>
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}
