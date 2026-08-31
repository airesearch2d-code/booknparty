import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/DashboardLayout";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function AdminBookingsPage() {
    const session = await auth();
    if (!session || (session.user as any).role !== "ADMIN") redirect("/login");

    const bookings = await prisma.booking.findMany({
        include: {
            venue: { select: { name: true, city: true } },
            customer: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    const totalRevenue = bookings
        .filter((booking) => booking.status === "CONFIRMED" || booking.status === "COMPLETED")
        .reduce((sum, booking) => sum + booking.totalAmount, 0);

    const statusStyles: Record<string, string> = {
        PENDING: "bg-yellow-500/20 text-yellow-300",
        CONFIRMED: "bg-green-500/20 text-green-300",
        CANCELLED: "bg-red-500/20 text-red-300",
        COMPLETED: "bg-blue-500/20 text-blue-300",
    };

    return (
        <DashboardLayout role="ADMIN">
            <div className="max-w-7xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">All Bookings</h1>
                    <p className="text-white/50 mt-1">Track bookings across all venues and customers</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="glass-card rounded-2xl p-5">
                        <p className="text-white/50 text-xs">Total bookings</p>
                        <p className="text-3xl font-bold text-white mt-1">{bookings.length}</p>
                    </div>
                    <div className="glass-card rounded-2xl p-5">
                        <p className="text-white/50 text-xs">Pending</p>
                        <p className="text-3xl font-bold text-white mt-1">{bookings.filter((b) => b.status === "PENDING").length}</p>
                    </div>
                    <div className="glass-card rounded-2xl p-5">
                        <p className="text-white/50 text-xs">Revenue</p>
                        <p className="text-2xl font-bold text-white mt-1">{formatCurrency(totalRevenue)}</p>
                    </div>
                </div>

                <div className="glass-card rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-white/10">
                                <tr className="text-left text-white/40 text-xs">
                                    <th className="px-5 py-4">Customer</th>
                                    <th className="px-5 py-4">Venue</th>
                                    <th className="px-5 py-4">Event date</th>
                                    <th className="px-5 py-4">Amount</th>
                                    <th className="px-5 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {bookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-5 py-4">
                                            <p className="text-white text-sm font-medium">{booking.customer.name}</p>
                                            <p className="text-white/40 text-xs">{booking.customer.email}</p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="text-white text-sm font-medium">{booking.venue.name}</p>
                                            <p className="text-white/40 text-xs">{booking.venue.city}</p>
                                        </td>
                                        <td className="px-5 py-4 text-white/60 text-sm">{formatDate(booking.eventDate)}</td>
                                        <td className="px-5 py-4 text-white/60 text-sm">{formatCurrency(booking.totalAmount)}</td>
                                        <td className="px-5 py-4">
                                            <span className={`badge text-xs ${statusStyles[booking.status]}`}>{booking.status}</span>
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
