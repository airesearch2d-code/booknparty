import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendModificationDecisionToCustomer } from "@/lib/email";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; requestId: string }> }
) {
    const session = await auth();
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as any).role;
    if (role !== "OWNER" && role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id, requestId } = await params;
    const body = await req.json();
    const action = body.action as string | undefined;
    const reviewNote = typeof body.reviewNote === "string" ? body.reviewNote.trim() : undefined;

    if (action !== "APPROVE" && action !== "REJECT") {
        return NextResponse.json({ error: "Action must be APPROVE or REJECT" }, { status: 400 });
    }

    const modificationRequest = await prisma.bookingModificationRequest.findUnique({
        where: { id: requestId },
        include: {
            booking: {
                include: {
                    venue: { select: { name: true, ownerId: true, pricePerHour: true } },
                    customer: { select: { name: true, email: true } },
                },
            },
        },
    });

    if (!modificationRequest || modificationRequest.bookingId !== id) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (role === "OWNER" && modificationRequest.booking.venue.ownerId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (modificationRequest.status !== "PENDING") {
        return NextResponse.json({ error: "This request has already been reviewed" }, { status: 400 });
    }

    if (action === "APPROVE") {
        // Re-check for conflicts at approval time in case another booking took the slot since the request was made.
        const dayStart = new Date(modificationRequest.requestedEventDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

        const conflictingBooking = await prisma.booking.findFirst({
            where: {
                venueId: modificationRequest.booking.venueId,
                id: { not: id },
                status: { not: "CANCELLED" },
                eventDate: { gte: dayStart, lt: dayEnd },
            },
            select: { id: true },
        });

        if (conflictingBooking) {
            return NextResponse.json({ error: "This date is no longer available" }, { status: 409 });
        }

        const newTotalAmount = modificationRequest.booking.venue.pricePerHour * modificationRequest.requestedHours;

        await prisma.$transaction([
            prisma.booking.update({
                where: { id },
                data: {
                    eventDate: modificationRequest.requestedEventDate,
                    hours: modificationRequest.requestedHours,
                    guestCount: modificationRequest.requestedGuestCount,
                    totalAmount: newTotalAmount,
                },
            }),
            prisma.bookingModificationRequest.update({
                where: { id: requestId },
                data: { status: "APPROVED", reviewNote },
            }),
        ]);
    } else {
        await prisma.bookingModificationRequest.update({
            where: { id: requestId },
            data: { status: "REJECTED", reviewNote },
        });
    }

    sendModificationDecisionToCustomer({
        customerEmail: modificationRequest.booking.customer.email,
        customerName: modificationRequest.booking.customer.name,
        venueName: modificationRequest.booking.venue.name,
        approved: action === "APPROVE",
        requestedEventDate: modificationRequest.requestedEventDate,
        reviewNote,
    }).catch(console.error);

    return NextResponse.json({ success: true });
}
