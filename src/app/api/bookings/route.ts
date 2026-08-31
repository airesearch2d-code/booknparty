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
    const { venueId, eventDate, hours, guestCount, eventType, notes } = body;

    const venue = await prisma.venue.findUnique({
        where: { id: venueId },
        include: { owner: { select: { name: true, email: true } } },
    });
    if (!venue) return NextResponse.json({ error: "Venue not found" }, { status: 404 });

    const totalAmount = venue.pricePerHour * hours;

    const booking = await prisma.booking.create({
        data: {
            venueId,
            customerId: session.user!.id!,
            eventDate: new Date(eventDate),
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
