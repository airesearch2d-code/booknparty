import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { status } = await req.json();

    const validStatuses = ["CONFIRMED", "CANCELLED", "COMPLETED", "PENDING"];
    if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    try {
        // Owners can only manage their own venue's bookings
        const booking = await prisma.booking.findUnique({
            where: { id },
            include: { venue: { select: { ownerId: true } } },
        });

        if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

        const role = (session.user as any).role;
        if (role === "OWNER" && booking.venue.ownerId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        if (role === "CUSTOMER" && booking.customerId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const updated = await prisma.booking.update({ where: { id }, data: { status } });
        return NextResponse.json({ booking: updated });
    } catch {
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
