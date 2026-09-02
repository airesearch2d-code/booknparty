import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/DashboardLayout";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

interface AdminBookingsPageProps {
    searchParams: Promise<{ status?: string; q?: string }>;
}

type BookingStatusFilter = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

export default async function AdminBookingsPage({ searchParams }: AdminBookingsPageProps) {
    const session = await auth();
    const role = (session?.user as { role?: string } | undefined)?.role;
    if (!session || role !== "ADMIN") redirect("/login");

    const params = await searchParams;
    const statusFilter = (params.status || "").toUpperCase();
    const q = params.q || "";

    const validStatuses: BookingStatusFilter[] = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];
    const typedStatus = validStatuses.includes(statusFilter as BookingStatusFilter)
        ? (statusFilter as BookingStatusFilter)
        : undefined;
    const where = {
        ...(typedStatus ? { status: typedStatus } : {}),
        ...(q
            ? {
                OR: [
                    { customer: { name: { contains: q, mode: "insensitive" as const } } },
                    { customer: { email: { contains: q, mode: "insensitive" as const } } },
                    { venue: { name: { contains: q, mode: "insensitive" as const } } },
                    { venue: { city: { contains: q, mode: "insensitive" as const } } },
                ],
            }
            : {}),
    };

    const bookings = await prisma.booking.findMany({
        where,
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

                <form className="glass-card rounded-2xl p-4 mb-6 grid grid-cols-1 md:grid-cols-[1fr_180px_auto_auto] gap-3">
                    <input
                        type="text"
                        name="q"
                        defaultValue={q}
                        placeholder="Search customer, email, venue, city"
                        className="input-field"
                    />
                    <select name="status" defaultValue={statusFilter} className="input-field">
                        <option value="">All statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="CANCELLED">Cancelled</option>
                        <option value="COMPLETED">Completed</option>
                    </select>
                    <button type="submit" className="btn-primary px-5 py-2.5 rounded-xl">Apply</button>
                    <Link
                        href={`/api/admin/bookings/export?status=${encodeURIComponent(statusFilter)}&q=${encodeURIComponent(q)}`}
                        className="btn-secondary px-5 py-2.5 rounded-xl text-center"
                    >
                        Export CSV
                    </Link>
                </form>

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
