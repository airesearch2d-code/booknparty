import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Calendar, MapPin, MessageSquare } from "lucide-react";
import { formatDate } from "@/lib/utils";
import OwnerEnquiryResponse from "@/components/OwnerEnquiryResponse";

const statusConfig: Record<string, { label: string; color: string }> = {
    PENDING: { label: "Pending", color: "bg-yellow-500/20 text-yellow-300" },
    RESPONDED: { label: "Responded", color: "bg-green-500/20 text-green-300" },
    CLOSED: { label: "Closed", color: "bg-gray-500/20 text-gray-300" },
};

export default async function OwnerEnquiriesPage() {
    const session = await auth();
    if (!session || (session.user as any).role !== "OWNER") redirect("/login");

    const enquiries = await prisma.enquiry.findMany({
        where: { venue: { ownerId: session.user.id! } },
        include: {
            venue: { select: { name: true, city: true } },
            customer: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    const pending = enquiries.filter((e) => e.status === "PENDING").length;
    const responded = enquiries.filter((e) => e.status === "RESPONDED").length;

    return (
        <DashboardLayout role="OWNER">
            <div className="max-w-5xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">Enquiries</h1>
                    <p className="text-white/50 mt-1">{enquiries.length} total · {pending} pending</p>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                    {[
                        { label: "Total", value: enquiries.length, color: "text-white" },
                        { label: "Pending Reply", value: pending, color: "text-yellow-300" },
                        { label: "Responded", value: responded, color: "text-green-300" },
                    ].map((s) => (
                        <div key={s.label} className="glass-card rounded-xl p-4 text-center">
                            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                            <p className="text-white/40 text-xs mt-1">{s.label}</p>
                        </div>
                    ))}
                </div>

                {enquiries.length === 0 ? (
                    <div className="text-center py-20 glass-card rounded-2xl">
                        <p className="text-6xl mb-4">💬</p>
                        <p className="text-white text-2xl font-bold mb-2">No enquiries yet</p>
                        <p className="text-white/40">When customers enquire about your venues, they'll appear here.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {enquiries.map((enq) => {
                            const st = statusConfig[enq.status] ?? statusConfig.PENDING;
                            return (
                                <div key={enq.id} className="glass-card rounded-2xl p-5">
                                    <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <p className="text-white font-bold">{enq.customer.name}</p>
                                                <span className={`badge ${st.color}`}>{st.label}</span>
                                            </div>
                                            <p className="text-white/40 text-xs">{enq.customer.email}</p>
                                            <div className="flex flex-wrap gap-3 mt-2 text-xs text-white/40">
                                                <span><MapPin size={11} className="inline mr-1" />{enq.venue.name}</span>
                                                {enq.eventType && <span>🎉 {enq.eventType}</span>}
                                                {enq.guestCount && <span>👥 {enq.guestCount} guests</span>}
                                                {enq.eventDate && <span><Calendar size={11} className="inline mr-1" />{formatDate(enq.eventDate)}</span>}
                                            </div>
                                        </div>
                                        <span className="text-white/30 text-xs">{formatDate(enq.createdAt)}</span>
                                    </div>

                                    <div className="bg-white/5 rounded-xl p-4 mb-4">
                                        <p className="text-white/50 text-xs font-medium mb-1 flex items-center gap-1.5">
                                            <MessageSquare size={12} /> Customer&apos;s Message
                                        </p>
                                        <p className="text-white/70 text-sm">{enq.message}</p>
                                    </div>

                                    {/* Response */}
                                    {enq.response ? (
                                        <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
                                            <p className="text-purple-300 text-xs font-medium mb-1">Your Response</p>
                                            <p className="text-white/70 text-sm">{enq.response}</p>
                                        </div>
                                    ) : (
                                        <OwnerEnquiryResponse enquiryId={enq.id} />
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
