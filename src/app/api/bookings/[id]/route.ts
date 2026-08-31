import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { status } = await req.json();
    const role = (session.user as any).role;

    // Only OWNER or ADMIN can change booking status
    if (role !== "OWNER" && role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // OWNER can only update bookings for their own venues
    const booking = await prisma.booking.findUnique({
        where: { id },
        include: { venue: { select: { ownerId: true } } },
    });

    if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (role === "OWNER" && booking.venue.ownerId !== session.user!.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const validStatuses = ["CONFIRMED", "CANCELLED", "COMPLETED"];
    if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updated = await prisma.booking.update({
        where: { id },
        data: { status },
    });

    return NextResponse.json({ booking: updated });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
            venue: { select: { name: true, city: true, images: true, ownerId: true } },
            customer: { select: { name: true, email: true, phone: true } },
        },
    });

    if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ booking });
}
