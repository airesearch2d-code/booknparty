import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/DashboardLayout";
import { CalendarCheck, MessageSquare, Star, MapPin } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function CustomerDashboard() {
    const session = await auth();
    if (!session || (session.user as any).role !== "CUSTOMER") redirect("/login");

    const userId = session.user!.id!;

    const [bookings, enquiries] = await Promise.all([
        prisma.booking.findMany({
            where: { customerId: userId },
            include: { venue: { select: { name: true, city: true, images: true } } },
            orderBy: { createdAt: "desc" },
            take: 5,
        }),
        prisma.enquiry.findMany({
            where: { customerId: userId },
            include: { venue: { select: { name: true, city: true } } },
            orderBy: { createdAt: "desc" },
            take: 5,
        }),
    ]);

    const stats = [
        { label: "Total Bookings", value: bookings.length, icon: CalendarCheck, color: "from-purple-500 to-purple-700" },
        { label: "Enquiries Sent", value: enquiries.length, icon: MessageSquare, color: "from-pink-500 to-pink-700" },
        { label: "Confirmed", value: bookings.filter(b => b.status === "CONFIRMED").length, icon: Star, color: "from-green-500 to-green-700" },
    ];

    const statusColors: Record<string, string> = {
        PENDING: "bg-yellow-500/20 text-yellow-300",
        CONFIRMED: "bg-green-500/20 text-green-300",
        CANCELLED: "bg-red-500/20 text-red-300",
        COMPLETED: "bg-blue-500/20 text-blue-300",
    };

    return (
        <DashboardLayout role="CUSTOMER">
            <div className="max-w-6xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">Welcome back, {session.user!.name?.split(" ")[0]}! 👋</h1>
                    <p className="text-white/50 mt-1">Here's an overview of your activity</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
                    {stats.map(({ label, value, icon: Icon, color }) => (
                        <div key={label} className="glass-card rounded-2xl p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white/50 text-sm">{label}</p>
                                    <p className="text-4xl font-bold text-white mt-1">{value}</p>
                                </div>
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                                    <Icon size={22} className="text-white" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Bookings */}
                    <div className="glass-card rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-white font-bold text-lg">Recent Bookings</h2>
                            <Link href="/dashboard/customer/bookings" className="text-purple-400 text-sm hover:text-white transition-colors">View all</Link>
                        </div>
                        {bookings.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-3xl mb-2">📅</p>
                                <p className="text-white/50 text-sm">No bookings yet</p>
                                <Link href="/venues" className="btn-primary text-xs px-4 py-2 rounded-lg mt-4 inline-block">Explore Venues</Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {bookings.map(booking => (
                                    <div key={booking.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-white/10">
                                            {booking.venue.images?.[0] && (
                                                <img src={booking.venue.images[0]} alt="" className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white text-sm font-medium truncate">{booking.venue.name}</p>
                                            <p className="text-white/40 text-xs flex items-center gap-1">
                                                <MapPin size={10} /> {booking.venue.city} · {formatDate(booking.eventDate)}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className={`badge text-xs ${statusColors[booking.status]}`}>{booking.status}</span>
                                            <span className="text-white/60 text-xs font-medium">{formatCurrency(booking.totalAmount)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent Enquiries */}
                    <div className="glass-card rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-white font-bold text-lg">Recent Enquiries</h2>
                            <Link href="/dashboard/customer/enquiries" className="text-purple-400 text-sm hover:text-white transition-colors">View all</Link>
                        </div>
                        {enquiries.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-3xl mb-2">💬</p>
                                <p className="text-white/50 text-sm">No enquiries sent yet</p>
                                <Link href="/venues" className="btn-primary text-xs px-4 py-2 rounded-lg mt-4 inline-block">Browse Venues</Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {enquiries.map(enq => (
                                    <div key={enq.id} className="p-3 rounded-xl bg-white/5">
                                        <div className="flex justify-between mb-1">
                                            <p className="text-white text-sm font-medium">{enq.venue.name}</p>
                                            <span className={`badge text-xs ${enq.status === "PENDING" ? "bg-blue-500/20 text-blue-300" : enq.status === "RESPONDED" ? "bg-green-500/20 text-green-300" : "bg-gray-500/20 text-gray-300"}`}>{enq.status}</span>
                                        </div>
                                        <p className="text-white/40 text-xs">{enq.eventType} · {enq.guestCount} guests · {formatDate(enq.createdAt)}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 glass-card rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
                    <div className="text-4xl">🎉</div>
                    <div className="flex-1 text-center sm:text-left">
                        <p className="text-white font-bold text-lg">Ready to plan your next event?</p>
                        <p className="text-white/50 text-sm">Browse 2,500+ venues across India and book your perfect space.</p>
                    </div>
                    <Link href="/venues" className="btn-primary px-8 py-2.5 rounded-xl whitespace-nowrap">Explore Venues</Link>
                </div>
            </div>
        </DashboardLayout>
    );
}
