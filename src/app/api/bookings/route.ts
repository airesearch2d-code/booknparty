import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendBookingConfirmationToCustomer, sendBookingRequestToOwner } from "@/lib/email";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session || (session.user as any).role !== "CUSTOMER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const venueId = body.venueId as string | undefined;
    const rawEventDate = (body.eventDate ?? body.date) as string | undefined;
    const hours = Number(body.hours ?? body.totalHours);
    const guestCount = Number(body.guestCount);
    const eventType = body.eventType as string | undefined;
    const notes = body.notes as string | undefined;

    if (!venueId || !rawEventDate || !Number.isFinite(hours) || !Number.isFinite(guestCount)) {
        return NextResponse.json({ error: "Missing required booking fields" }, { status: 400 });
    }

    const parsedEventDate = new Date(rawEventDate);
    if (Number.isNaN(parsedEventDate.getTime())) {
        return NextResponse.json({ error: "Invalid event date" }, { status: 400 });
    }

    if (hours < 1) {
        return NextResponse.json({ error: "Booking duration must be at least 1 hour" }, { status: 400 });
    }

    const bookingDayStart = new Date(parsedEventDate);
    bookingDayStart.setHours(0, 0, 0, 0);
    const bookingDayEnd = new Date(bookingDayStart.getTime() + 24 * 60 * 60 * 1000);

    const venue = await prisma.venue.findUnique({
        where: { id: venueId },
        include: { owner: { select: { name: true, email: true } } },
    });
    if (!venue) return NextResponse.json({ error: "Venue not found" }, { status: 404 });

    if (!venue.isApproved || !venue.isActive) {
        return NextResponse.json({ error: "Venue is not available for booking" }, { status: 400 });
    }

    if (hours < venue.minBookingHours) {
        return NextResponse.json({ error: `Minimum booking duration is ${venue.minBookingHours} hour(s)` }, { status: 400 });
    }

    if (guestCount > venue.capacity) {
        return NextResponse.json({ error: `Guest count cannot exceed venue capacity (${venue.capacity})` }, { status: 400 });
    }

    const [conflictingBooking, blockedDate] = await Promise.all([
        prisma.booking.findFirst({
            where: {
                venueId,
                status: { not: "CANCELLED" },
                eventDate: { gte: bookingDayStart, lt: bookingDayEnd },
            },
            select: { id: true },
        }),
        prisma.venueBlockedDate.findFirst({
            where: {
                venueId,
                date: { gte: bookingDayStart, lt: bookingDayEnd },
            },
            select: { id: true, reason: true },
        }),
    ]);

    if (conflictingBooking) {
        return NextResponse.json({ error: "This date is already booked. Please select another date." }, { status: 409 });
    }

    if (blockedDate) {
        return NextResponse.json({ error: blockedDate.reason || "This date has been blocked by the venue owner." }, { status: 409 });
    }

    const totalAmount = venue.pricePerHour * hours;

    const booking = await prisma.booking.create({
        data: {
            venueId,
            customerId: session.user!.id!,
            eventDate: parsedEventDate,
            hours,
            guestCount,
            eventType,
            totalAmount,
            notes,
        },
        include: { venue: { select: { name: true } } },
    });

    // Send email notifications in the background (non-blocking)
    const customer = await prisma.user.findUnique({
        where: { id: session.user!.id! },
        select: { name: true, email: true, phone: true },
    });
    if (customer) {
        Promise.all([
            sendBookingConfirmationToCustomer({
                customerEmail: customer.email,
                customerName: customer.name,
                venueName: venue.name,
                venueCity: venue.city,
                eventDate: booking.eventDate,
                hours,
                guestCount,
                totalAmount,
                eventType,
                bookingId: booking.id,
            }),
            sendBookingRequestToOwner({
                ownerEmail: venue.owner.email,
                ownerName: venue.owner.name,
                customerName: customer.name,
                customerEmail: customer.email,
                customerPhone: customer.phone,
                venueName: venue.name,
                eventDate: booking.eventDate,
                hours,
                guestCount,
                totalAmount,
                eventType,
                bookingId: booking.id,
            }),
        ]).catch(console.error);
    }

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
                ? { venue: { ownerId: session.user!.id! } }
                : { customerId: session.user!.id! };

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
