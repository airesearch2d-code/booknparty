import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/DashboardLayout";
import { CheckCircle, XCircle, MapPin, Eye } from "lucide-react";
import { formatDate, getVenueTypeLabel } from "@/lib/utils";
import Link from "next/link";

export default async function AdminVenuesPage() {
    const session = await auth();
    if (!session || (session.user as any).role !== "ADMIN") redirect("/login");

    const venues = await prisma.venue.findMany({
        include: {
            owner: { select: { name: true, email: true } },
            _count: { select: { bookings: true, enquiries: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    async function approveVenue(venueId: string) {
        "use server";
        await prisma.venue.update({ where: { id: venueId }, data: { isApproved: true } });
    }

    async function rejectVenue(venueId: string) {
        "use server";
        await prisma.venue.update({ where: { id: venueId }, data: { isActive: false, isApproved: false } });
    }

    const pending = venues.filter(v => !v.isApproved && v.isActive);
    const approved = venues.filter(v => v.isApproved);

    return (
        <DashboardLayout role="ADMIN">
            <div className="max-w-6xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">Venue Management</h1>
                    <p className="text-white/50 mt-1">{pending.length} pending · {approved.length} approved</p>
                </div>

                {/* Pending Approvals */}
                {pending.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                            Pending Approval
                        </h2>
                        <div className="space-y-4">
                            {pending.map(venue => (
                                <div key={venue.id} className="glass-card rounded-2xl p-5 border border-orange-500/20">
                                    <div className="flex gap-4">
                                        <div className="w-24 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-white/10">
                                            {venue.images?.[0] && <img src={venue.images[0]} alt="" className="w-full h-full object-cover" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white font-bold text-lg">{venue.name}</p>
                                            <div className="flex items-center gap-1 text-white/50 text-sm mb-1">
                                                <MapPin size={13} />{venue.city}, {venue.state} · {getVenueTypeLabel(venue.type)}
                                            </div>
                                            <p className="text-white/40 text-xs">By {venue.owner.name} ({venue.owner.email}) · Submitted {formatDate(venue.createdAt)}</p>
                                            <p className="text-white/30 text-xs mt-1">Capacity: {venue.capacity} · ₹{venue.pricePerHour}/hr</p>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <form action={approveVenue.bind(null, venue.id)}>
                                                <button type="submit" className="flex items-center gap-1.5 bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30 transition-colors text-xs py-2 px-4 rounded-lg w-full justify-center">
                                                    <CheckCircle size={14} /> Approve
                                                </button>
                                            </form>
                                            <form action={rejectVenue.bind(null, venue.id)}>
                                                <button type="submit" className="flex items-center gap-1.5 bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 transition-colors text-xs py-2 px-4 rounded-lg w-full justify-center">
                                                    <XCircle size={14} /> Reject
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* All Venues */}
                <div>
                    <h2 className="text-white font-semibold text-lg mb-4">All Venues ({venues.length})</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-white/40 text-xs border-b border-white/10">
                                    <th className="pb-3 pr-4">Venue</th>
                                    <th className="pb-3 pr-4">Owner</th>
                                    <th className="pb-3 pr-4">Type</th>
                                    <th className="pb-3 pr-4">City</th>
                                    <th className="pb-3 pr-4">Bookings</th>
                                    <th className="pb-3 pr-4">Status</th>
                                    <th className="pb-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {venues.map(venue => (
                                    <tr key={venue.id} className="text-sm">
                                        <td className="py-3 pr-4">
                                            <p className="text-white font-medium">{venue.name}</p>
                                            <p className="text-white/40 text-xs">₹{venue.pricePerHour}/hr · {venue.capacity} cap</p>
                                        </td>
                                        <td className="py-3 pr-4">
                                            <p className="text-white/70">{venue.owner.name}</p>
                                            <p className="text-white/30 text-xs">{venue.owner.email}</p>
                                        </td>
                                        <td className="py-3 pr-4 text-white/60">{getVenueTypeLabel(venue.type)}</td>
                                        <td className="py-3 pr-4 text-white/60">{venue.city}</td>
                                        <td className="py-3 pr-4 text-white/60">{venue._count.bookings}</td>
                                        <td className="py-3 pr-4">
                                            {venue.isApproved
                                                ? <span className="badge bg-green-500/20 text-green-300">Approved</span>
                                                : venue.isActive
                                                    ? <span className="badge bg-yellow-500/20 text-yellow-300">Pending</span>
                                                    : <span className="badge bg-red-500/20 text-red-300">Rejected</span>}
                                        </td>
                                        <td className="py-3">
                                            <div className="flex gap-2">
                                                <Link href={`/venues/${venue.slug}`} target="_blank" className="p-1.5 rounded-lg glass-card text-white/50 hover:text-white transition-colors">
                                                    <Eye size={14} />
                                                </Link>
                                                {!venue.isApproved && venue.isActive && (
                                                    <form action={approveVenue.bind(null, venue.id)}>
                                                        <button type="submit" className="p-1.5 rounded-lg bg-green-500/20 text-green-300 hover:bg-green-500/30 transition-colors">
                                                            <CheckCircle size={14} />
                                                        </button>
                                                    </form>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
