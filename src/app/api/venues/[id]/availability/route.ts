import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

function parseMonthWindow(month: string | null) {
    const now = new Date();
    const year = month ? Number(month.split("-")[0]) : now.getFullYear();
    const monthIndex = month ? Number(month.split("-")[1]) - 1 : now.getMonth();

    if (Number.isNaN(year) || Number.isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) {
        return null;
    }

    const start = new Date(year, monthIndex, 1, 0, 0, 0, 0);
    const end = new Date(year, monthIndex + 1, 1, 0, 0, 0, 0);
    return { start, end };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();
    const role = (session?.user as any)?.role as string | undefined;
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");

    const window = parseMonthWindow(month);
    if (!window) {
        return NextResponse.json({ error: "Invalid month format. Use YYYY-MM" }, { status: 400 });
    }

    const venue = await prisma.venue.findUnique({
        where: { id },
        select: { id: true, isApproved: true, isActive: true, ownerId: true },
    });

    if (!venue) {
        return NextResponse.json({ error: "Venue not found" }, { status: 404 });
    }

    const canSeePrivateAvailability = role === "ADMIN" || (role === "OWNER" && session?.user?.id === venue.ownerId);
    if (!canSeePrivateAvailability && (!venue.isActive || !venue.isApproved)) {
        return NextResponse.json({ error: "Venue not found" }, { status: 404 });
    }

    const [bookings, blockedDates] = await Promise.all([
        prisma.booking.findMany({
            where: {
                venueId: id,
                status: { not: "CANCELLED" },
                eventDate: { gte: window.start, lt: window.end },
            },
            select: { id: true, eventDate: true, status: true, hours: true },
            orderBy: { eventDate: "asc" },
        }),
        prisma.venueBlockedDate.findMany({
            where: {
                venueId: id,
                date: { gte: window.start, lt: window.end },
            },
            select: { id: true, date: true, reason: true },
            orderBy: { date: "asc" },
        }),
    ]);

    return NextResponse.json({
        month,
        bookings,
        blockedDates,
        unavailableDates: [
            ...bookings.map((booking) => booking.eventDate.toISOString().slice(0, 10)),
            ...blockedDates.map((blockedDate) => blockedDate.date.toISOString().slice(0, 10)),
        ],
    });
}
