import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import PlatformSettingsForm from "@/components/PlatformSettingsForm";

export default async function AdminSettingsPage() {
    const session = await auth();
    if (!session || (session.user as any).role !== "ADMIN") redirect("/login");

    const summaryCards = [
        { label: "Pending approvals", value: "3" },
        { label: "Open enquiries", value: "12" },
        { label: "New users today", value: "8" },
        { label: "Manual review queue", value: "2" },
    ];

    return (
        <DashboardLayout role="ADMIN">
            <div className="max-w-6xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">Platform settings</h1>
                    <p className="text-white/50 mt-1">Manage moderation and communication defaults</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {summaryCards.map((card) => (
                        <div key={card.label} className="glass-card rounded-2xl p-5 text-center">
                            <p className="text-3xl font-bold text-white">{card.value}</p>
                            <p className="text-white/40 text-xs mt-2">{card.label}</p>
                        </div>
                    ))}
                </div>

                <PlatformSettingsForm />
            </div>
        </DashboardLayout>
    );
}
