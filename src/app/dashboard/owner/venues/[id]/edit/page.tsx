import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import EditVenueForm from "@/components/EditVenueForm";
import OwnerAvailabilityManager from "@/components/OwnerAvailabilityManager";

export default async function EditVenuePage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session || (session.user as any).role !== "OWNER") redirect("/login");

    const { id } = await params;

    return (
        <DashboardLayout role="OWNER">
            <div className="space-y-8">
                <EditVenueForm id={id} />
                <OwnerAvailabilityManager venueId={id} />
            </div>
        </DashboardLayout>
    );
}
