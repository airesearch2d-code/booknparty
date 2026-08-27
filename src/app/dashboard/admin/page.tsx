import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Building2, Users, CalendarCheck, MessageSquare, TrendingUp, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { formatCurrency, formatDate, getVenueTypeLabel } from "@/lib/utils";
import Link from "next/link";

export default async function AdminDashboard() {
    const session = await auth();
    if (!session || (session.user as any).role !== "ADMIN") redirect("/login");

    const [totalUsers, totalVenues, pendingVenues, totalBookings, recentUsers, recentVenues] = await Promise.all([
        prisma.user.count(),
        prisma.venue.count(),
        prisma.venue.count({ where: { isApproved: false } }),
        prisma.booking.count(),
        prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
        prisma.venue.findMany({
            where: { isApproved: false },
            include: { owner: { select: { name: true, email: true } } },
            orderBy: { createdAt: "desc" },
            take: 6,
        }),
    ]);

    const totalRevenue = await prisma.booking.aggregate({
        _sum: { totalAmount: true },
        where: { status: { in: ["CONFIRMED", "COMPLETED"] } },
    });

    const stats = [
        { label: "Total Users", value: totalUsers, icon: Users, color: "from-blue-500 to-cyan-500" },
        { label: "Total Venues", value: totalVenues, icon: Building2, color: "from-purple-500 to-purple-700" },
        { label: "Pending Approval", value: pendingVenues, icon: AlertTriangle, color: "from-orange-500 to-orange-700" },
        { label: "Total Bookings", value: totalBookings, icon: CalendarCheck, color: "from-pink-500 to-pink-700" },
        { label: "Total Revenue", value: formatCurrency(totalRevenue._sum.totalAmount || 0), icon: TrendingUp, color: "from-green-500 to-green-700", isText: true },
    ];

    const roleColors: Record<string, string> = {
        ADMIN: "bg-orange-500/20 text-orange-300",
        OWNER: "bg-blue-500/20 text-blue-300",
        CUSTOMER: "bg-purple-500/20 text-purple-300",
    };

    return (
        <DashboardLayout role="ADMIN">
            <div className="max-w-7xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">Admin Dashboard ⚡</h1>
                    <p className="text-white/50 mt-1">Platform overview and management</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
                    {stats.map(({ label, value, icon: Icon, color, isText }) => (
                        <div key={label} className="glass-card rounded-2xl p-5">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
                                <Icon size={18} className="text-white" />
                            </div>
                            <p className={`font-bold text-white ${(isText as any) ? "text-base" : "text-3xl"}`}>{value}</p>
                            <p className="text-white/40 text-xs mt-1">{label}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Pending Venue Approvals */}
                    <div className="glass-card rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-white font-bold text-lg flex items-center gap-2">
                                <Clock size={18} className="text-orange-400" />
                                Pending Approvals
                                {pendingVenues > 0 && (
                                    <span className="badge bg-orange-500/20 text-orange-300">{pendingVenues}</span>
                                )}
                            </h2>
                            <Link href="/dashboard/admin/venues" className="text-purple-400 text-sm hover:text-white">View all</Link>
                        </div>
                        {recentVenues.length === 0 ? (
                            <div className="text-center py-8">
                                <CheckCircle size={32} className="text-green-400 mx-auto mb-2" />
                                <p className="text-white/50 text-sm">All venues are approved!</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentVenues.map(venue => (
                                    <div key={venue.id} className="p-4 rounded-xl bg-white/5">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white text-sm font-semibold truncate">{venue.name}</p>
                                                <p className="text-white/40 text-xs mt-0.5">{getVenueTypeLabel(venue.type)} · by {venue.owner.name}</p>
                                                <p className="text-white/30 text-xs">{venue.city}, {venue.state} · {formatDate(venue.createdAt)}</p>
                                            </div>
                                            <div className="flex gap-2 flex-shrink-0">
                                                <ApproveVenueButton venueId={venue.id} />
                                                <Link href={`/dashboard/admin/venues`} className="btn-secondary text-xs py-1 px-3 rounded-lg">Review</Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent Users */}
                    <div className="glass-card rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-white font-bold text-lg">Recent Users</h2>
                            <Link href="/dashboard/admin/users" className="text-purple-400 text-sm hover:text-white">View all</Link>
                        </div>
                        <div className="space-y-3">
                            {recentUsers.map(user => (
                                <div key={user.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
                                        {user.name[0]?.toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-sm font-medium truncate">{user.name}</p>
                                        <p className="text-white/40 text-xs truncate">{user.email}</p>
                                    </div>
                                    <span className={`badge text-xs ${roleColors[user.role]}`}>{user.role}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { href: "/dashboard/admin/venues", label: "Manage Venues", icon: "🏛️" },
                        { href: "/dashboard/admin/users", label: "Manage Users", icon: "👥" },
                        { href: "/dashboard/admin/bookings", label: "All Bookings", icon: "📅" },
                        { href: "/dashboard/admin/enquiries", label: "All Enquiries", icon: "💬" },
                    ].map(action => (
                        <Link key={action.href} href={action.href} className="glass-card rounded-xl p-4 flex items-center gap-3 hover:bg-white/10 transition-colors group">
                            <span className="text-2xl group-hover:scale-110 transition-transform">{action.icon}</span>
                            <span className="text-white/70 group-hover:text-white text-sm font-medium transition-colors">{action.label}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}

// Quick approve button (client component inline for simplicity via server action)
async function ApproveVenueButton({ venueId }: { venueId: string }) {
    async function approve() {
        "use server";
        await prisma.venue.update({ where: { id: venueId }, data: { isApproved: true } });
    }
    return (
        <form action={approve}>
            <button type="submit" className="btn-primary text-xs py-1 px-3 rounded-lg">Approve</button>
        </form>
    );
}
