"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Menu, X, Search, Bell, User, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";

interface NavbarProps {
    session?: {
        user: { name?: string | null; email?: string | null; image?: string | null; role?: string };
    } | null;
}

export default function Navbar({ session }: NavbarProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const pathname = usePathname();

    const getDashboardLink = () => {
        const role = session?.user?.role;
        if (role === "ADMIN") return "/dashboard/admin";
        if (role === "OWNER") return "/dashboard/owner";
        return "/dashboard/customer";
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold">
                            🎉
                        </div>
                        <span className="font-bold text-xl text-white">
                            Book<span className="gradient-text">N</span>Party
                        </span>
                    </Link>

                    {/* Desktop Nav Links */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link href="/venues" className="text-white/70 hover:text-white transition-colors text-sm font-medium">
                            Explore Venues
                        </Link>
                        <Link href="/venues?type=BANQUET_HALL" className="text-white/70 hover:text-white transition-colors text-sm font-medium">
                            Banquet Halls
                        </Link>
                        <Link href="/venues?type=ROOFTOP" className="text-white/70 hover:text-white transition-colors text-sm font-medium">
                            Rooftops
                        </Link>
                        <Link href="/venues?type=FARMHOUSE" className="text-white/70 hover:text-white transition-colors text-sm font-medium">
                            Farmhouses
                        </Link>
                    </div>

                    {/* Right actions */}
                    <div className="flex items-center gap-3">
                        <Link href="/venues" className="hidden md:flex items-center gap-1 text-white/70 hover:text-white transition-colors">
                            <Search size={18} />
                        </Link>

                        {session ? (
                            <div className="relative">
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center gap-2 bg-white/10 rounded-full pl-3 pr-2 py-1.5 text-sm text-white hover:bg-white/15 transition-colors"
                                >
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold">
                                        {session.user.name?.[0]?.toUpperCase()}
                                    </div>
                                    <span className="hidden md:inline">{session.user.name?.split(" ")[0]}</span>
                                    <ChevronDown size={14} />
                                </button>

                                {userMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 glass-card rounded-xl shadow-xl overflow-hidden z-50">
                                        <div className="px-4 py-3 border-b border-white/10">
                                            <p className="text-white text-sm font-medium">{session.user.name}</p>
                                            <p className="text-white/50 text-xs">{session.user.email}</p>
                                        </div>
                                        <Link
                                            href={getDashboardLink()}
                                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                                            onClick={() => setUserMenuOpen(false)}
                                        >
                                            <LayoutDashboard size={15} />
                                            Dashboard
                                        </Link>
                                        <button
                                            onClick={() => signOut({ callbackUrl: "/" })}
                                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-white/10 transition-colors w-full"
                                        >
                                            <LogOut size={15} />
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href="/login" className="btn-secondary text-sm py-1.5 px-4 rounded-lg">
                                    Login
                                </Link>
                                <Link href="/register" className="btn-primary text-sm py-1.5 px-4 rounded-lg">
                                    List Your Venue
                                </Link>
                            </div>
                        )}

                        {/* Mobile menu */}
                        <button className="md:hidden text-white" onClick={() => setMenuOpen(!menuOpen)}>
                            {menuOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {menuOpen && (
                    <div className="md:hidden pb-4 space-y-2">
                        <Link href="/venues" className="block py-2 text-white/80 hover:text-white text-sm">Explore Venues</Link>
                        <Link href="/venues?type=BANQUET_HALL" className="block py-2 text-white/80 hover:text-white text-sm">Banquet Halls</Link>
                        <Link href="/venues?type=ROOFTOP" className="block py-2 text-white/80 hover:text-white text-sm">Rooftops</Link>
                        <Link href="/venues?type=FARMHOUSE" className="block py-2 text-white/80 hover:text-white text-sm">Farmhouses</Link>
                        {!session && (
                            <div className="flex gap-2 pt-2">
                                <Link href="/login" className="btn-secondary text-sm py-1.5 px-4 rounded-lg flex-1 text-center">Login</Link>
                                <Link href="/register" className="btn-primary text-sm py-1.5 px-4 rounded-lg flex-1 text-center">Register</Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}
