import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const blockDateSchema = z.object({
    date: z.string().min(1),
    reason: z.string().max(200).optional(),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const role = (session.user as any).role;

    if (role !== "OWNER" && role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = blockDateSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const venue = await prisma.venue.findUnique({ where: { id }, select: { ownerId: true } });
    if (!venue) return NextResponse.json({ error: "Venue not found" }, { status: 404 });

    if (role === "OWNER" && venue.ownerId !== session.user?.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const date = new Date(parsed.data.date);
    if (Number.isNaN(date.getTime())) {
        return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    date.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
        return NextResponse.json({ error: "Cannot block a past date" }, { status: 400 });
    }

    const hasBooking = await prisma.booking.findFirst({
        where: {
            venueId: id,
            status: { not: "CANCELLED" },
            eventDate: {
                gte: date,
                lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
            },
        },
        select: { id: true },
    });

    if (hasBooking) {
        return NextResponse.json({ error: "Cannot block a date with active bookings" }, { status: 409 });
    }

    try {
        const blockedDate = await prisma.venueBlockedDate.create({
            data: {
                venueId: id,
                date,
                reason: parsed.data.reason,
            },
        });

        return NextResponse.json({ blockedDate }, { status: 201 });
    } catch (error: any) {
        if (error?.code === "P2002") {
            return NextResponse.json({ error: "Date already blocked" }, { status: 409 });
        }
        return NextResponse.json({ error: "Failed to block date" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const role = (session.user as any).role;
    if (role !== "OWNER" && role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const blockedId = searchParams.get("blockedId");
    if (!blockedId) {
        return NextResponse.json({ error: "blockedId is required" }, { status: 400 });
    }

    const blockedDate = await prisma.venueBlockedDate.findUnique({
        where: { id: blockedId },
        include: { venue: { select: { ownerId: true, id: true } } },
    });

    if (!blockedDate || blockedDate.venue.id !== id) {
        return NextResponse.json({ error: "Blocked date not found" }, { status: 404 });
    }

    if (role === "OWNER" && blockedDate.venue.ownerId !== session.user?.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.venueBlockedDate.delete({ where: { id: blockedId } });
    return NextResponse.json({ message: "Blocked date removed" });
}
