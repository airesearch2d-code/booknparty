import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, CalendarCheck, MessageSquare, User, LogOut, Home, Building2, Users, Settings } from "lucide-react";
import { signOut } from "@/lib/auth";

interface DashboardLayoutProps {
    children: React.ReactNode;
    role: "ADMIN" | "OWNER" | "CUSTOMER";
}

const navItems = {
    CUSTOMER: [
        { href: "/dashboard/customer", icon: LayoutDashboard, label: "Overview" },
        { href: "/dashboard/customer/bookings", icon: CalendarCheck, label: "My Bookings" },
        { href: "/dashboard/customer/enquiries", icon: MessageSquare, label: "My Enquiries" },
        { href: "/dashboard/customer/profile", icon: User, label: "Profile" },
    ],
    OWNER: [
        { href: "/dashboard/owner", icon: LayoutDashboard, label: "Overview" },
        { href: "/dashboard/owner/venues", icon: Building2, label: "My Venues" },
        { href: "/dashboard/owner/bookings", icon: CalendarCheck, label: "Bookings" },
        { href: "/dashboard/owner/enquiries", icon: MessageSquare, label: "Enquiries" },
        { href: "/dashboard/owner/profile", icon: User, label: "Profile" },
    ],
    ADMIN: [
        { href: "/dashboard/admin", icon: LayoutDashboard, label: "Overview" },
        { href: "/dashboard/admin/venues", icon: Building2, label: "Venues" },
        { href: "/dashboard/admin/users", icon: Users, label: "Users" },
        { href: "/dashboard/admin/bookings", icon: CalendarCheck, label: "Bookings" },
        { href: "/dashboard/admin/enquiries", icon: MessageSquare, label: "Enquiries" },
        { href: "/dashboard/admin/settings", icon: Settings, label: "Settings" },
        { href: "/dashboard/admin/profile", icon: User, label: "Profile" },
    ],
};

const roleColors = {
    CUSTOMER: "from-purple-500 to-pink-500",
    OWNER: "from-blue-500 to-cyan-500",
    ADMIN: "from-orange-500 to-red-500",
};

const roleLabels = { CUSTOMER: "Customer", OWNER: "Venue Owner", ADMIN: "Admin" };
const roleEmoji = { CUSTOMER: "👤", OWNER: "🏛️", ADMIN: "⚡" };

export async function DashboardLayout({ children, role }: DashboardLayoutProps) {
    const session = await auth();
    if (!session) redirect("/login");

    const userRole = (session.user as any).role as "ADMIN" | "OWNER" | "CUSTOMER";
    const items = navItems[userRole] || navItems.CUSTOMER;

    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 fixed inset-y-0 left-0 z-40 glass-card border-r border-white/10 flex flex-col">
                {/* Logo */}
                <div className="p-6 border-b border-white/10">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm">🎉</div>
                        <span className="font-bold text-lg text-white">Book<span className="gradient-text">N</span>Party</span>
                    </Link>
                </div>

                {/* User info */}
                <div className="p-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${roleColors[userRole]} flex items-center justify-center font-bold text-white`}>
                            {session.user?.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-white text-sm font-semibold truncate">{session.user?.name}</p>
                            <span className={`text-xs badge bg-gradient-to-r ${roleColors[userRole]} text-white`}>
                                {roleEmoji[userRole]} {roleLabels[userRole]}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {items.map(({ href, icon: Icon, label }) => (
                        <Link
                            key={href}
                            href={href}
                            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm font-medium group"
                        >
                            <Icon size={17} className="group-hover:text-purple-400 transition-colors" />
                            {label}
                        </Link>
                    ))}
                </nav>

                {/* Bottom actions */}
                <div className="p-4 border-t border-white/10 space-y-1">
                    <Link href="/" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all text-sm">
                        <Home size={17} />
                        Back to Site
                    </Link>
                    <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
                        <button type="submit" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium">
                            <LogOut size={17} />
                            Sign Out
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 ml-64 min-h-screen p-8">{children}</main>
        </div>
    );
}
