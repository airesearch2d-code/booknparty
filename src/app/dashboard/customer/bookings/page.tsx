import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/DashboardLayout";
import { MapPin, Calendar, Clock, Star } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import ReviewModal from "@/components/ReviewModal";

const statusConfig: Record<string, { label: string; color: string }> = {
    PENDING: { label: "Pending", color: "bg-yellow-500/20 text-yellow-300" },
    CONFIRMED: { label: "Confirmed", color: "bg-green-500/20 text-green-300" },
    CANCELLED: { label: "Cancelled", color: "bg-red-500/20 text-red-300" },
    COMPLETED: { label: "Completed", color: "bg-blue-500/20 text-blue-300" },
};

export default async function CustomerBookingsPage() {
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== "CUSTOMER") redirect("/login");

    const [bookings, reviews] = await Promise.all([
        prisma.booking.findMany({
            where: { customerId: session.user.id! },
            include: {
                venue: { select: { name: true, images: true, city: true, state: true, slug: true } },
            },
            orderBy: { createdAt: "desc" },
        }),
        prisma.review.findMany({
            where: { userId: session.user.id! },
            select: { venueId: true },
        }),
    ]);

    const reviewedVenueIds = new Set(reviews.map(r => r.venueId));

    return (
        <DashboardLayout role="CUSTOMER">
            <div className="max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">My Bookings</h1>
                    <p className="text-white/50 mt-1">{bookings.length} total</p>
                </div>

                {bookings.length === 0 ? (
                    <div className="text-center py-20 glass-card rounded-2xl">
                        <p className="text-6xl mb-4">📅</p>
                        <p className="text-white text-2xl font-bold mb-2">No bookings yet</p>
                        <p className="text-white/40 mb-8">Your confirmed venue bookings will appear here.</p>
                        <Link href="/venues" className="btn-primary px-8 py-3 rounded-xl inline-flex">Explore Venues</Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bookings.map((booking) => {
                            const st = statusConfig[booking.status] ?? statusConfig.PENDING;
                            const alreadyReviewed = reviewedVenueIds.has(booking.venueId);
                            return (
                                <div key={booking.id} className="glass-card rounded-2xl p-5">
                                    <div className="flex gap-4">
                                        <div className="w-24 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-white/10">
                                            {booking.venue.images?.[0] ? (
                                                <img src={booking.venue.images[0]} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-2xl">🏛️</div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <Link href={`/venues/${booking.venue.slug}`} className="text-white font-bold text-lg hover:text-purple-300 transition-colors truncate">
                                                    {booking.venue.name}
                                                </Link>
                                                <span className={`badge flex-shrink-0 ${st.color}`}>{st.label}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-white/40 text-sm mt-1">
                                                <MapPin size={13} /> {booking.venue.city}, {booking.venue.state}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-white/50">
                                                <span className="flex items-center gap-1.5"><Calendar size={12} /> {formatDate(booking.eventDate)}</span>
                                                <span className="flex items-center gap-1.5"><Clock size={12} /> {booking.hours} hrs</span>
                                                {booking.eventType && <span>🎉 {booking.eventType}</span>}
                                                <span className="font-semibold text-white">{formatCurrency(booking.totalAmount)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {booking.status === "COMPLETED" && (
                                        <div className="mt-4 pt-4 border-t border-white/10">
                                            {alreadyReviewed ? (
                                                <span className="text-xs text-green-400 flex items-center gap-1.5">
                                                    <Star size={12} className="fill-green-400" /> Review submitted ✓
                                                </span>
                                            ) : (
                                                <ReviewModal venueId={booking.venueId} venueName={booking.venue.name} />
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
