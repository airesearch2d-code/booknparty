import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/DashboardLayout";
import Link from "next/link";
import AdminEnquiriesTable from "@/components/AdminEnquiriesTable";

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

                <AdminEnquiriesTable
                    enquiries={enquiries.map((enquiry) => ({
                        id: enquiry.id,
                        status: enquiry.status,
                        eventType: enquiry.eventType,
                        eventDate: enquiry.eventDate ? enquiry.eventDate.toISOString() : null,
                        name: enquiry.name,
                        email: enquiry.email,
                        phone: enquiry.phone,
                        venue: enquiry.venue,
                    }))}
                />
            </div>
        </DashboardLayout>
    );
}
