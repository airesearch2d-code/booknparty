import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendBookingStatusUpdateToCustomer, sendBookingCancelledByCustomerToOwner } from "@/lib/email";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as any).role;
    if (role !== "CUSTOMER") {
        return NextResponse.json({ error: "Only customers can cancel their own bookings" }, { status: 403 });
    }

    const { id } = await params;

    const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
            venue: { select: { name: true, owner: { select: { name: true, email: true } } } },
            customer: { select: { name: true, email: true } },
        },
    });

    if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (booking.customerId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (booking.status !== "PENDING" && booking.status !== "CONFIRMED") {
        return NextResponse.json({ error: "Only pending or confirmed bookings can be cancelled" }, { status: 400 });
    }

    if (new Date(booking.eventDate).getTime() <= Date.now()) {
        return NextResponse.json({ error: "Cannot cancel a booking for a past or ongoing event" }, { status: 400 });
    }

    const updated = await prisma.booking.update({
        where: { id },
        data: { status: "CANCELLED" },
    });

    Promise.all([
        sendBookingStatusUpdateToCustomer({
            customerEmail: booking.customer.email,
            customerName: booking.customer.name,
            venueName: booking.venue.name,
            eventDate: booking.eventDate,
            totalAmount: booking.totalAmount,
            newStatus: "CANCELLED",
        }),
        sendBookingCancelledByCustomerToOwner({
            ownerEmail: booking.venue.owner.email,
            ownerName: booking.venue.owner.name,
            customerName: booking.customer.name,
            venueName: booking.venue.name,
            eventDate: booking.eventDate,
        }),
    ]).catch(console.error);

    return NextResponse.json({ booking: updated });
}
