import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/DashboardLayout";
import ProfileForm from "@/components/ProfileForm";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import DeleteAccountCard from "@/components/DeleteAccountCard";

export default async function AdminProfilePage() {
    const session = await auth();
    const role = (session?.user as { role?: string } | undefined)?.role;
    if (!session || role !== "ADMIN") redirect("/login");
    if (!session.user?.id) redirect("/login");

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
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
        <DashboardLayout role="ADMIN">
            <div className="max-w-6xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">Admin Profile</h1>
                    <p className="text-white/50 mt-1">Review and update your admin account details</p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_0.7fr] gap-8">
                    <ProfileForm initialUser={user} roleLabel="Admin" />
                    <div className="space-y-8">
                        <ChangePasswordForm />
                        <DeleteAccountCard roleLabel="Admin" />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
