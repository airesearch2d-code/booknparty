import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/DashboardLayout";
import ProfileForm from "@/components/ProfileForm";
import ChangePasswordForm from "@/components/ChangePasswordForm";

export default async function OwnerProfilePage() {
    const session = await auth();
    if (!session || (session.user as any).role !== "OWNER") redirect("/login");

    const user = await prisma.user.findUnique({
        where: { id: session.user.id! },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            role: true,
        },
    });

    if (!user) redirect("/login");

    return (
        <DashboardLayout role="OWNER">
            <div className="max-w-6xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">Owner Profile</h1>
                    <p className="text-white/50 mt-1">Manage account details for your venue business</p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_0.7fr] gap-8">
                    <ProfileForm initialUser={user} roleLabel="Owner" />
                    <ChangePasswordForm />
                </div>
            </div>
        </DashboardLayout>
    );
}
