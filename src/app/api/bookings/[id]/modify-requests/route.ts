import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendModificationRequestToOwner } from "@/lib/email";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as any).role;
    if (role !== "CUSTOMER") {
        return NextResponse.json({ error: "Only customers can request booking changes" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const rawEventDate = body.eventDate as string | undefined;
    const hours = Number(body.hours);
    const guestCount = Number(body.guestCount);
    const reason = typeof body.reason === "string" ? body.reason.trim() : undefined;

    if (!rawEventDate || !Number.isFinite(hours) || !Number.isFinite(guestCount)) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const requestedEventDate = new Date(rawEventDate);
    if (Number.isNaN(requestedEventDate.getTime()) || requestedEventDate.getTime() <= Date.now()) {
        return NextResponse.json({ error: "Requested event date must be in the future" }, { status: 400 });
    }

    if (hours < 1) {
        return NextResponse.json({ error: "Booking duration must be at least 1 hour" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
            venue: { select: { name: true, capacity: true, minBookingHours: true, ownerId: true, owner: { select: { name: true, email: true } } } },
            customer: { select: { name: true, email: true } },
        },
    });

    if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (booking.customerId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (booking.status !== "PENDING" && booking.status !== "CONFIRMED") {
        return NextResponse.json({ error: "Only pending or confirmed bookings can be modified" }, { status: 400 });
    }

    if (hours < booking.venue.minBookingHours) {
        return NextResponse.json({ error: `Minimum booking duration is ${booking.venue.minBookingHours} hour(s)` }, { status: 400 });
    }

    if (guestCount > booking.venue.capacity) {
        return NextResponse.json({ error: `Guest count cannot exceed venue capacity (${booking.venue.capacity})` }, { status: 400 });
    }

    const existingPending = await prisma.bookingModificationRequest.findFirst({
        where: { bookingId: id, status: "PENDING" },
    });
    if (existingPending) {
        return NextResponse.json({ error: "A change request is already pending review for this booking" }, { status: 409 });
    }

    const dayStart = new Date(requestedEventDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

    const [conflictingBooking, blockedDate] = await Promise.all([
        prisma.booking.findFirst({
            where: {
                venueId: booking.venueId,
                id: { not: id },
                status: { not: "CANCELLED" },
                eventDate: { gte: dayStart, lt: dayEnd },
            },
            select: { id: true },
        }),
        prisma.venueBlockedDate.findFirst({
            where: { venueId: booking.venueId, date: { gte: dayStart, lt: dayEnd } },
            select: { id: true, reason: true },
        }),
    ]);

    if (conflictingBooking) {
        return NextResponse.json({ error: "This date is already booked. Please select another date." }, { status: 409 });
    }
    if (blockedDate) {
        return NextResponse.json({ error: blockedDate.reason || "This date has been blocked by the venue owner." }, { status: 409 });
    }

    const modificationRequest = await prisma.bookingModificationRequest.create({
        data: {
            bookingId: id,
            requestedEventDate,
            requestedHours: hours,
            requestedGuestCount: guestCount,
            reason,
        },
    });

    sendModificationRequestToOwner({
        ownerEmail: booking.venue.owner.email,
        ownerName: booking.venue.owner.name,
        customerName: booking.customer.name,
        venueName: booking.venue.name,
        currentEventDate: booking.eventDate,
        requestedEventDate,
        requestedHours: hours,
        requestedGuestCount: guestCount,
        reason,
    }).catch(console.error);

    return NextResponse.json({ modificationRequest }, { status: 201 });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const booking = await prisma.booking.findUnique({
        where: { id },
        select: { customerId: true, venue: { select: { ownerId: true } } },
    });
    if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const role = (session.user as any).role;
    const isOwnerOfBooking = booking.customerId === session.user.id;
    const isVenueOwner = booking.venue.ownerId === session.user.id;
    if (!isOwnerOfBooking && !isVenueOwner && role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const modificationRequests = await prisma.bookingModificationRequest.findMany({
        where: { bookingId: id },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ modificationRequests });
}
