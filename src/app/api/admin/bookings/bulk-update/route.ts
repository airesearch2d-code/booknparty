import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendBookingStatusUpdateToCustomer } from "@/lib/email";

const VALID_STATUSES = ["CONFIRMED", "CANCELLED", "COMPLETED"] as const;

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const ids = Array.isArray(body.ids) ? (body.ids as string[]).filter((id) => typeof id === "string") : [];
    const status = body.status as string | undefined;

    if (ids.length === 0) {
        return NextResponse.json({ error: "No bookings selected" }, { status: 400 });
    }

    if (!status || !VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const bookings = await prisma.booking.findMany({
        where: { id: { in: ids } },
        include: {
            venue: { select: { name: true } },
            customer: { select: { name: true, email: true } },
        },
    });

    if (bookings.length === 0) {
        return NextResponse.json({ error: "No matching bookings found" }, { status: 404 });
    }

    const result = await prisma.booking.updateMany({
        where: { id: { in: bookings.map((b) => b.id) } },
        data: { status: status as (typeof VALID_STATUSES)[number] },
    });

    Promise.all(
        bookings.map((booking) =>
            sendBookingStatusUpdateToCustomer({
                customerEmail: booking.customer.email,
                customerName: booking.customer.name,
                venueName: booking.venue.name,
                eventDate: booking.eventDate,
                totalAmount: booking.totalAmount,
                newStatus: status as "CONFIRMED" | "CANCELLED" | "COMPLETED",
            })
        )
    ).catch(console.error);

    return NextResponse.json({ count: result.count });
}
