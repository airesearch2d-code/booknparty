import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session || (session.user as any).role !== "CUSTOMER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { venueId, eventDate, hours, guestCount, eventType, notes } = body;

    const venue = await prisma.venue.findUnique({ where: { id: venueId } });
    if (!venue) return NextResponse.json({ error: "Venue not found" }, { status: 404 });

    const totalAmount = venue.pricePerHour * hours;

    const booking = await prisma.booking.create({
        data: {
            venueId,
            customerId: session.user.id!,
            eventDate: new Date(eventDate),
            hours,
            guestCount,
            eventType,
            totalAmount,
            notes,
        },
        include: { venue: { select: { name: true } } },
    });

    return NextResponse.json({ booking }, { status: 201 });
}

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as any).role;
    const where =
        role === "ADMIN"
            ? {}
            : role === "OWNER"
                ? { venue: { ownerId: session.user.id! } }
                : { customerId: session.user.id! };

    const bookings = await prisma.booking.findMany({
        where,
        include: {
            venue: { select: { name: true, city: true, images: true } },
            customer: { select: { name: true, email: true, phone: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ bookings });
}
