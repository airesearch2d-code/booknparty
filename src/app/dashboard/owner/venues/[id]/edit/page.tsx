import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import EditVenueForm from "@/components/EditVenueForm";

export default async function EditVenuePage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session || (session.user as any).role !== "OWNER") redirect("/login");

    const { id } = await params;

    return (
        <DashboardLayout role="OWNER">
            <EditVenueForm id={id} />
        </DashboardLayout>
    );
}
