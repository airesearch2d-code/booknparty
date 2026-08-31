import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import OwnerBookingActions from "@/components/OwnerBookingActions";

const statusConfig: Record<string, { label: string; color: string }> = {
    PENDING: { label: "Pending", color: "bg-yellow-500/20 text-yellow-300" },
    CONFIRMED: { label: "Confirmed", color: "bg-green-500/20 text-green-300" },
    CANCELLED: { label: "Cancelled", color: "bg-red-500/20 text-red-300" },
    COMPLETED: { label: "Completed", color: "bg-blue-500/20 text-blue-300" },
};

export default async function OwnerBookingsPage() {
    const session = await auth();
    if (!session || (session.user as any).role !== "OWNER") redirect("/login");

    const bookings = await prisma.booking.findMany({
        where: { venue: { ownerId: session.user.id! } },
        include: {
            venue: { select: { name: true, city: true } },
            customer: { select: { name: true, email: true, phone: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    const pending = bookings.filter((b) => b.status === "PENDING").length;
    const confirmed = bookings.filter((b) => b.status === "CONFIRMED").length;
    const revenue = bookings.filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED")
        .reduce((s, b) => s + b.totalAmount, 0);

    return (
        <DashboardLayout role="OWNER">
            <div className="max-w-5xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">Bookings</h1>
                    <p className="text-white/50 mt-1">{bookings.length} total</p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {[
                        { label: "Pending Action", value: pending, color: "text-yellow-300" },
                        { label: "Confirmed", value: confirmed, color: "text-green-300" },
                        { label: "Revenue", value: formatCurrency(revenue), color: "text-purple-300" },
                    ].map((s) => (
                        <div key={s.label} className="glass-card rounded-xl p-4 text-center">
                            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                            <p className="text-white/40 text-xs mt-1">{s.label}</p>
                        </div>
                    ))}
                </div>

                {bookings.length === 0 ? (
                    <div className="text-center py-20 glass-card rounded-2xl">
                        <p className="text-6xl mb-4">📅</p>
                        <p className="text-white text-2xl font-bold mb-2">No bookings yet</p>
                        <p className="text-white/40">Bookings from customers will appear here.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bookings.map((booking) => {
                            const st = statusConfig[booking.status] ?? statusConfig.PENDING;
                            return (
                                <div key={booking.id} className="glass-card rounded-2xl p-5">
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="text-white font-bold text-lg">{booking.venue.name}</span>
                                                <span className={`badge ${st.color}`}>{st.label}</span>
                                            </div>
                                            {/* Customer */}
                                            <div className="flex items-center gap-4 text-white/50 text-sm mb-3">
                                                <span>👤 {booking.customer.name}</span>
                                                <span>✉️ {booking.customer.email}</span>
                                                {booking.customer.phone && <span>📞 {booking.customer.phone}</span>}
                                            </div>
                                            {/* Booking details */}
                                            <div className="flex flex-wrap gap-4 text-xs text-white/40">
                                                <span className="flex items-center gap-1.5"><Calendar size={12} /> {formatDate(booking.eventDate)}</span>
                                                <span className="flex items-center gap-1.5"><Clock size={12} /> {booking.hours} hrs</span>
                                                <span className="flex items-center gap-1.5"><Users size={12} /> {booking.guestCount} guests</span>
                                                <span className="flex items-center gap-1.5 text-white font-semibold">{formatCurrency(booking.totalAmount)}</span>
                                            </div>
                                            {booking.notes && (
                                                <p className="text-white/40 text-xs mt-2 italic">&quot;{booking.notes}&quot;</p>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        {booking.status === "PENDING" && (
                                            <OwnerBookingActions bookingId={booking.id} />
                                        )}
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
