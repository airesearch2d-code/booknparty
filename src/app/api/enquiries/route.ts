import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEnquiryNotificationToOwner } from "@/lib/email";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { venueId, customerId, name, email, phone, message, eventType, eventDate, guestCount } = body;

    const venue = await prisma.venue.findUnique({
        where: { id: venueId },
        include: { owner: { select: { name: true, email: true } } },
    });

    const enquiry = await prisma.enquiry.create({
        data: {
            venueId,
            customerId,
            name,
            email,
            phone,
            message,
            eventType,
            guestCount,
            ...(eventDate && { eventDate: new Date(eventDate) }),
        },
    });

    // Notify venue owner in the background
    if (venue) {
        sendEnquiryNotificationToOwner({
            ownerEmail: venue.owner.email,
            ownerName: venue.owner.name,
            venueName: venue.name,
            senderName: name,
            senderEmail: email,
            senderPhone: phone,
            message,
            eventType,
            eventDate: eventDate ? new Date(eventDate) : null,
            guestCount,
        }).catch(console.error);
    }

    return NextResponse.json({ enquiry }, { status: 201 });
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const venueId = searchParams.get("venueId");
    const customerId = searchParams.get("customerId");

    const enquiries = await prisma.enquiry.findMany({
        where: {
            ...(venueId && { venueId }),
            ...(customerId && { customerId }),
        },
        include: {
            venue: { select: { name: true, city: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ enquiries });
}
