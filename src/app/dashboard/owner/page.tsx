import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Building2, CalendarCheck, MessageSquare, TrendingUp, Plus, Eye, Edit, CheckCircle, XCircle } from "lucide-react";
import { formatCurrency, formatDate, getVenueTypeLabel } from "@/lib/utils";
import Link from "next/link";

export default async function OwnerDashboard() {
    const session = await auth();
    if (!session || (session.user as any).role !== "OWNER") redirect("/login");

    const userId = session.user.id!;

    const [venues, recentBookings, recentEnquiries] = await Promise.all([
        prisma.venue.findMany({
            where: { ownerId: userId },
            include: { _count: { select: { bookings: true, enquiries: true } } },
        }),
        prisma.booking.findMany({
            where: { venue: { ownerId: userId } },
            include: {
                venue: { select: { name: true } },
                customer: { select: { name: true, email: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 6,
        }),
        prisma.enquiry.findMany({
            where: { venue: { ownerId: userId } },
            include: { venue: { select: { name: true } } },
            orderBy: { createdAt: "desc" },
            take: 5,
        }),
    ]);

    const totalRevenue = recentBookings
        .filter(b => b.status === "CONFIRMED" || b.status === "COMPLETED")
        .reduce((sum, b) => sum + b.totalAmount, 0);

    const statusColors: Record<string, string> = {
        PENDING: "bg-yellow-500/20 text-yellow-300",
        CONFIRMED: "bg-green-500/20 text-green-300",
        CANCELLED: "bg-red-500/20 text-red-300",
        COMPLETED: "bg-blue-500/20 text-blue-300",
    };

    const stats = [
        { label: "My Venues", value: venues.length, icon: Building2, color: "from-blue-500 to-blue-700" },
        { label: "Total Bookings", value: recentBookings.length, icon: CalendarCheck, color: "from-purple-500 to-purple-700" },
        { label: "Enquiries", value: recentEnquiries.length, icon: MessageSquare, color: "from-pink-500 to-pink-700" },
        { label: "Revenue (Est.)", value: formatCurrency(totalRevenue), icon: TrendingUp, color: "from-green-500 to-green-700", isText: true },
    ];

    return (
        <DashboardLayout role="OWNER">
            <div className="max-w-6xl">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Owner Dashboard 🏛️</h1>
                        <p className="text-white/50 mt-1">Manage your venues, bookings and enquiries</p>
                    </div>
                    <Link href="/dashboard/owner/venues/new" className="btn-primary px-5 py-2.5 rounded-xl flex items-center gap-2">
                        <Plus size={16} /> Add Venue
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                    {stats.map(({ label, value, icon: Icon, color, isText }) => (
                        <div key={label} className="glass-card rounded-2xl p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-white/50 text-xs mb-1">{label}</p>
                                    <p className={`font-bold text-white ${isText ? "text-xl" : "text-3xl"}`}>{value}</p>
                                </div>
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                                    <Icon size={18} className="text-white" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* My Venues */}
                    <div className="glass-card rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-white font-bold text-lg">My Venues</h2>
                            <Link href="/dashboard/owner/venues" className="text-purple-400 text-sm hover:text-white">View all</Link>
                        </div>
                        {venues.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-3xl mb-2">🏛️</p>
                                <p className="text-white/50 text-sm mb-4">No venues listed yet</p>
                                <Link href="/dashboard/owner/venues/new" className="btn-primary text-xs px-5 py-2 rounded-lg inline-flex items-center gap-1">
                                    <Plus size={13} /> Add Your First Venue
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {venues.slice(0, 4).map(venue => (
                                    <div key={venue.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                                        <div className="flex-1">
                                            <p className="text-white text-sm font-medium">{venue.name}</p>
                                            <p className="text-white/40 text-xs mt-0.5">{getVenueTypeLabel(venue.type)} · {venue._count.bookings} bookings · {venue._count.enquiries} enquiries</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {venue.isApproved ? (
                                                <CheckCircle size={14} className="text-green-400" />
                                            ) : (
                                                <span className="text-xs text-yellow-400">Pending</span>
                                            )}
                                            <Link href={`/dashboard/owner/venues/${venue.id}/edit`} className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                                                <Edit size={14} />
                                            </Link>
                                            <Link href={`/venues/${venue.slug}`} target="_blank" className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                                                <Eye size={14} />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent Bookings */}
                    <div className="glass-card rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-white font-bold text-lg">Recent Bookings</h2>
                            <Link href="/dashboard/owner/bookings" className="text-purple-400 text-sm hover:text-white">View all</Link>
                        </div>
                        {recentBookings.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-3xl mb-2">📅</p>
                                <p className="text-white/50 text-sm">No bookings received yet</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentBookings.map(b => (
                                    <div key={b.id} className="p-3 rounded-xl bg-white/5">
                                        <div className="flex justify-between mb-1">
                                            <p className="text-white text-sm font-medium">{b.customer.name}</p>
                                            <span className={`badge text-xs ${statusColors[b.status]}`}>{b.status}</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-white/40">
                                            <span>{b.venue.name} · {b.eventType}</span>
                                            <span className="font-medium text-white/60">{formatCurrency(b.totalAmount)}</span>
                                        </div>
                                        <p className="text-white/30 text-xs mt-0.5">{formatDate(b.eventDate)}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Enquiries */}
                <div className="glass-card rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-white font-bold text-lg">Recent Enquiries</h2>
                        <Link href="/dashboard/owner/enquiries" className="text-purple-400 text-sm hover:text-white">View all</Link>
                    </div>
                    {recentEnquiries.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-white/50 text-sm">No enquiries yet. Once your venues are approved, customers can enquire.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {recentEnquiries.map(enq => (
                                <div key={enq.id} className="p-4 rounded-xl bg-white/5">
                                    <div className="flex justify-between mb-2">
                                        <p className="text-white text-sm font-semibold">{enq.name}</p>
                                        <span className={`badge text-xs ${enq.status === "NEW" ? "bg-blue-500/20 text-blue-300" : "bg-green-500/20 text-green-300"}`}>{enq.status}</span>
                                    </div>
                                    <p className="text-white/50 text-xs mb-1">{enq.venue.name}</p>
                                    <p className="text-white/40 text-xs">{enq.eventType} · {enq.guestCount} guests</p>
                                    <p className="text-white/30 text-xs mt-2 line-clamp-2">{enq.message}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
