import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/DashboardLayout";
import { formatDate } from "@/lib/utils";

export default async function AdminEnquiriesPage() {
    const session = await auth();
    if (!session || (session.user as any).role !== "ADMIN") redirect("/login");

    const enquiries = await prisma.enquiry.findMany({
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
