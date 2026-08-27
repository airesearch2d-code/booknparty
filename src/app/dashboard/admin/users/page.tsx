import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/DashboardLayout";
import { formatDate } from "@/lib/utils";

export default async function AdminUsersPage() {
    const session = await auth();
    if (!session || (session.user as any).role !== "ADMIN") redirect("/login");

    const users = await prisma.user.findMany({
        include: { _count: { select: { bookings: true, venues: true } } },
        orderBy: { createdAt: "desc" },
    });

    const roleColors: Record<string, string> = {
        ADMIN: "bg-orange-500/20 text-orange-300",
        OWNER: "bg-blue-500/20 text-blue-300",
        CUSTOMER: "bg-purple-500/20 text-purple-300",
    };

    const counts = {
        total: users.length,
        admins: users.filter(u => u.role === "ADMIN").length,
        owners: users.filter(u => u.role === "OWNER").length,
        customers: users.filter(u => u.role === "CUSTOMER").length,
    };

    return (
        <DashboardLayout role="ADMIN">
            <div className="max-w-6xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">User Management</h1>
                    <p className="text-white/50 mt-1">{counts.total} total users</p>
                </div>

                {/* Role Stats */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                    {[
                        { label: "Total", value: counts.total, color: "from-gray-500 to-gray-700" },
                        { label: "Admins", value: counts.admins, color: "from-orange-500 to-orange-700" },
                        { label: "Owners", value: counts.owners, color: "from-blue-500 to-blue-700" },
                        { label: "Customers", value: counts.customers, color: "from-purple-500 to-purple-700" },
                    ].map(s => (
                        <div key={s.label} className="glass-card rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold text-white">{s.value}</p>
                            <p className="text-white/50 text-xs mt-1">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Users Table */}
                <div className="glass-card rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-white/10">
                                <tr className="text-left text-white/40 text-xs">
                                    <th className="px-5 py-4">User</th>
                                    <th className="px-5 py-4">Role</th>
                                    <th className="px-5 py-4">Phone</th>
                                    <th className="px-5 py-4">Venues</th>
                                    <th className="px-5 py-4">Bookings</th>
                                    <th className="px-5 py-4">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0 ${user.role === "ADMIN" ? "bg-gradient-to-br from-orange-500 to-red-500" : user.role === "OWNER" ? "bg-gradient-to-br from-blue-500 to-cyan-500" : "bg-gradient-to-br from-purple-500 to-pink-500"}`}>
                                                    {user.name[0]?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-white text-sm font-medium">{user.name}</p>
                                                    <p className="text-white/40 text-xs">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`badge text-xs ${roleColors[user.role]}`}>{user.role}</span>
                                        </td>
                                        <td className="px-5 py-4 text-white/50 text-sm">{user.phone || "—"}</td>
                                        <td className="px-5 py-4 text-white/60 text-sm">{user._count.venues}</td>
                                        <td className="px-5 py-4 text-white/60 text-sm">{user._count.bookings}</td>
                                        <td className="px-5 py-4 text-white/40 text-xs">{formatDate(user.createdAt)}</td>
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
