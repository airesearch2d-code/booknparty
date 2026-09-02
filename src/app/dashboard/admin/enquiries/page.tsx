import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/DashboardLayout";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface AdminEnquiriesPageProps {
    searchParams: Promise<{ status?: string; q?: string }>;
}

type EnquiryStatusFilter = "PENDING" | "RESPONDED" | "CLOSED";

export default async function AdminEnquiriesPage({ searchParams }: AdminEnquiriesPageProps) {
    const session = await auth();
    const role = (session?.user as { role?: string } | undefined)?.role;
    if (!session || role !== "ADMIN") redirect("/login");

    const params = await searchParams;
    const statusFilter = (params.status || "").toUpperCase();
    const q = params.q || "";

    const validStatuses: EnquiryStatusFilter[] = ["PENDING", "RESPONDED", "CLOSED"];
    const typedStatus = validStatuses.includes(statusFilter as EnquiryStatusFilter)
        ? (statusFilter as EnquiryStatusFilter)
        : undefined;
    const where = {
        ...(typedStatus ? { status: typedStatus } : {}),
        ...(q
            ? {
                OR: [
                    { name: { contains: q, mode: "insensitive" as const } },
                    { email: { contains: q, mode: "insensitive" as const } },
                    { venue: { name: { contains: q, mode: "insensitive" as const } } },
                    { venue: { city: { contains: q, mode: "insensitive" as const } } },
                ],
            }
            : {}),
    };

    const enquiries = await prisma.enquiry.findMany({
        where,
        include: {
            venue: { select: { name: true, city: true } },
            customer: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    const statusStyles: Record<string, string> = {
        PENDING: "bg-yellow-500/20 text-yellow-300",
        RESPONDED: "bg-green-500/20 text-green-300",
        CLOSED: "bg-slate-500/20 text-slate-300",
    };

    return (
        <DashboardLayout role="ADMIN">
            <div className="max-w-7xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">All Enquiries</h1>
                    <p className="text-white/50 mt-1">Review incoming guest questions and responses</p>
                </div>

                <form className="glass-card rounded-2xl p-4 mb-6 grid grid-cols-1 md:grid-cols-[1fr_180px_auto_auto] gap-3">
                    <input
                        type="text"
                        name="q"
                        defaultValue={q}
                        placeholder="Search name, email, venue, city"
                        className="input-field"
                    />
                    <select name="status" defaultValue={statusFilter} className="input-field">
                        <option value="">All statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="RESPONDED">Responded</option>
                        <option value="CLOSED">Closed</option>
                    </select>
                    <button type="submit" className="btn-primary px-5 py-2.5 rounded-xl">Apply</button>
                    <Link
                        href={`/api/admin/enquiries/export?status=${encodeURIComponent(statusFilter)}&q=${encodeURIComponent(q)}`}
                        className="btn-secondary px-5 py-2.5 rounded-xl text-center"
                    >
                        Export CSV
                    </Link>
                </form>

                <div className="glass-card rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-white/10">
                                <tr className="text-left text-white/40 text-xs">
                                    <th className="px-5 py-4">Customer</th>
                                    <th className="px-5 py-4">Venue</th>
                                    <th className="px-5 py-4">Event type</th>
                                    <th className="px-5 py-4">Date</th>
                                    <th className="px-5 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {enquiries.map((enquiry) => (
                                    <tr key={enquiry.id} className="hover:bg-white/5 transition-colors align-top">
                                        <td className="px-5 py-4">
                                            <p className="text-white text-sm font-medium">{enquiry.name}</p>
                                            <p className="text-white/40 text-xs">{enquiry.email}</p>
                                            <p className="text-white/30 text-[11px] mt-1">{enquiry.phone}</p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="text-white text-sm font-medium">{enquiry.venue.name}</p>
                                            <p className="text-white/40 text-xs">{enquiry.venue.city}</p>
                                        </td>
                                        <td className="px-5 py-4 text-white/60 text-sm">{enquiry.eventType || "—"}</td>
                                        <td className="px-5 py-4 text-white/60 text-sm">{enquiry.eventDate ? formatDate(enquiry.eventDate) : "Not provided"}</td>
                                        <td className="px-5 py-4">
                                            <span className={`badge text-xs ${statusStyles[enquiry.status]}`}>{enquiry.status}</span>
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
