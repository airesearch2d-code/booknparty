import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/DashboardLayout";
import { MapPin, Calendar, MessageSquare } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

const enquiryStatus: Record<string, { label: string; color: string }> = {
    PENDING: { label: "Pending", color: "bg-yellow-500/20 text-yellow-300" },
    RESPONDED: { label: "Responded", color: "bg-green-500/20 text-green-300" },
    CLOSED: { label: "Closed", color: "bg-gray-500/20 text-gray-300" },
};

export default async function CustomerEnquiriesPage() {
    const session = await auth();
    if (!session || (session.user as any).role !== "CUSTOMER") redirect("/login");
    if (!session.user) {
        return redirect("/login");
    }
    const enquiries = await prisma.enquiry.findMany({
        where: { customerId: session.user.id! },
        include: {
            venue: { select: { name: true, images: true, city: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    return (
        <DashboardLayout role="CUSTOMER">
            <div className="max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">My Enquiries</h1>
                    <p className="text-white/50 mt-1">{enquiries.length} enquiries sent</p>
                </div>

                {enquiries.length === 0 ? (
                    <div className="text-center py-20 glass-card rounded-2xl">
                        <p className="text-6xl mb-4">💬</p>
                        <p className="text-white text-2xl font-bold mb-2">No enquiries yet</p>
                        <p className="text-white/40 mb-8">Enquire about venues you're interested in and track responses here.</p>
                        <Link href="/venues" className="btn-primary px-8 py-3 rounded-xl inline-flex">Explore Venues</Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {enquiries.map((enq) => {
                            const st = enquiryStatus[enq.status] ?? enquiryStatus.PENDING;
                            return (
                                <div key={enq.id} className="glass-card rounded-2xl p-5">
                                    <div className="flex gap-4">
                                        <div className="w-20 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-white/10">
                                            {enq.venue.images?.[0] ? (
                                                <img src={enq.venue.images[0]} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xl">🏛️</div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <Link href={`/venues/${enq.venue.slug}`} className="text-white font-bold text-base hover:text-purple-300 transition-colors">
                                                    {enq.venue.name}
                                                </Link>
                                                <span className={`badge flex-shrink-0 ${st.color}`}>{st.label}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-white/40 text-xs mt-0.5">
                                                <MapPin size={11} /> {enq.venue.city}
                                                <span className="mx-1">·</span>
                                                <Calendar size={11} /> {formatDate(enq.createdAt)}
                                            </div>
                                            {enq.eventType && (
                                                <p className="text-white/50 text-xs mt-2">
                                                    <span className="text-white/30">Event:</span> {enq.eventType}
                                                    {enq.guestCount ? ` · ${enq.guestCount} guests` : ""}
                                                    {enq.eventDate ? ` · ${formatDate(enq.eventDate)}` : ""}
                                                </p>
                                            )}
                                            <p className="text-white/40 text-xs mt-2 line-clamp-2">{enq.message}</p>
                                        </div>
                                    </div>
                                    {enq.response && (
                                        <div className="mt-4 pt-4 border-t border-white/10">
                                            <div className="flex items-start gap-2">
                                                <MessageSquare size={14} className="text-purple-400 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="text-white/50 text-xs font-medium mb-1">Owner's Response:</p>
                                                    <p className="text-white/70 text-sm">{enq.response}</p>
                                                </div>
                                            </div>
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
