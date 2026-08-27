import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Plus, Eye, Edit, Trash2, CheckCircle, Clock, MapPin } from "lucide-react";
import { formatCurrency, getVenueTypeLabel } from "@/lib/utils";
import Link from "next/link";

export default async function OwnerVenuesPage() {
    const session = await auth();
    if (!session || (session.user as any).role !== "OWNER") redirect("/login");

    const venues = await prisma.venue.findMany({
        where: { ownerId: session.user.id! },
        include: {
            _count: { select: { bookings: true, enquiries: true, reviews: true } },
            reviews: { select: { rating: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    async function deleteVenue(venueId: string) {
        "use server";
        await prisma.venue.delete({ where: { id: venueId } });
    }

    return (
        <DashboardLayout role="OWNER">
            <div className="max-w-5xl">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">My Venues</h1>
                        <p className="text-white/50 mt-1">{venues.length} venue{venues.length !== 1 ? "s" : ""} listed</p>
                    </div>
                    <Link href="/dashboard/owner/venues/new" className="btn-primary px-5 py-2.5 rounded-xl flex items-center gap-2">
                        <Plus size={16} /> Add Venue
                    </Link>
                </div>

                {venues.length === 0 ? (
                    <div className="text-center py-24 glass-card rounded-2xl">
                        <p className="text-6xl mb-4">🏛️</p>
                        <p className="text-white font-bold text-2xl mb-2">No venues yet</p>
                        <p className="text-white/50 mb-8 max-w-sm mx-auto">List your first venue and start receiving bookings from thousands of customers.</p>
                        <Link href="/dashboard/owner/venues/new" className="btn-primary px-8 py-3 rounded-xl inline-flex items-center gap-2">
                            <Plus size={16} /> Add Your First Venue
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {venues.map(venue => {
                            const avgRating = venue.reviews.length > 0
                                ? (venue.reviews.reduce((s, r) => s + r.rating, 0) / venue.reviews.length).toFixed(1)
                                : null;

                            return (
                                <div key={venue.id} className="glass-card rounded-2xl p-5">
                                    <div className="flex gap-4">
                                        {/* Image */}
                                        <div className="w-28 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-white/10">
                                            {venue.images?.[0] && (
                                                <img src={venue.images[0]} alt={venue.name} className="w-full h-full object-cover"
                                                    onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1519167758481-83f29db6db22?w=300&q=60"; }} />
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <h3 className="text-white font-bold text-lg leading-tight truncate">{venue.name}</h3>
                                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                                    {venue.isApproved ? (
                                                        <span className="badge bg-green-500/20 text-green-300 flex items-center gap-1">
                                                            <CheckCircle size={11} /> Approved
                                                        </span>
                                                    ) : (
                                                        <span className="badge bg-yellow-500/20 text-yellow-300 flex items-center gap-1">
                                                            <Clock size={11} /> Pending
                                                        </span>
                                                    )}
                                                    {!venue.isActive && (
                                                        <span className="badge bg-red-500/20 text-red-300">Inactive</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1 text-white/50 text-sm mb-2">
                                                <MapPin size={13} />
                                                <span>{venue.city}, {venue.state}</span>
                                                <span className="mx-1">·</span>
                                                <span>{getVenueTypeLabel(venue.type)}</span>
                                            </div>

                                            <div className="flex items-center gap-5 text-xs text-white/40">
                                                <span>👥 {venue.capacity} capacity</span>
                                                <span>💰 {formatCurrency(venue.pricePerHour)}/hr</span>
                                                <span>📅 {venue._count.bookings} bookings</span>
                                                <span>💬 {venue._count.enquiries} enquiries</span>
                                                {avgRating && <span>⭐ {avgRating}</span>}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-2 flex-shrink-0">
                                            <Link href={`/venues/${venue.slug}`} target="_blank" className="btn-secondary text-xs py-1.5 px-3 rounded-lg flex items-center gap-1.5">
                                                <Eye size={13} /> Preview
                                            </Link>
                                            <Link href={`/dashboard/owner/venues/${venue.id}/edit`} className="btn-secondary text-xs py-1.5 px-3 rounded-lg flex items-center gap-1.5">
                                                <Edit size={13} /> Edit
                                            </Link>
                                            <form action={deleteVenue.bind(null, venue.id)}>
                                                <button type="submit" className="w-full text-xs py-1.5 px-3 rounded-lg flex items-center gap-1.5 text-red-400 hover:bg-red-500/10 transition-colors border border-red-500/20">
                                                    <Trash2 size={13} /> Delete
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
