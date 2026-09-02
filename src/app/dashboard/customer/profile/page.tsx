import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/DashboardLayout";
import ProfileForm from "@/components/ProfileForm";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import DeleteAccountCard from "@/components/DeleteAccountCard";

export default async function CustomerProfilePage() {
    const session = await auth();
    const role = (session?.user as { role?: string } | undefined)?.role;
    if (!session || role !== "CUSTOMER") redirect("/login");
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
        <DashboardLayout role="CUSTOMER">
            <div className="max-w-6xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">Profile</h1>
                    <p className="text-white/50 mt-1">Update your personal information and security settings</p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_0.7fr] gap-8">
                    <ProfileForm initialUser={user} roleLabel="Customer" />
                    <div className="space-y-8">
                        <ChangePasswordForm />
                        <DeleteAccountCard roleLabel="Customer" />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
