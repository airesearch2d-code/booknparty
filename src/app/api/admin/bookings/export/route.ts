import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type BookingStatusFilter = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

function escapeCsv(value: string | number | null | undefined) {
    const raw = String(value ?? "");
    if (raw.includes(",") || raw.includes("\n") || raw.includes("\"")) {
        return `"${raw.replace(/\"/g, "\"\"")}"`;
    }
    return raw;
}

export async function GET(req: NextRequest) {
    const session = await auth();
    const role = (session?.user as { role?: string } | undefined)?.role;
    if (!session || role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = (searchParams.get("status") || "").toUpperCase();
    const q = searchParams.get("q") || "";

    const validStatuses: BookingStatusFilter[] = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];
    const typedStatus = validStatuses.includes(status as BookingStatusFilter)
        ? (status as BookingStatusFilter)
        : undefined;
    const where = {
        ...(typedStatus ? { status: typedStatus } : {}),
        ...(q
            ? {
                OR: [
                    { customer: { name: { contains: q, mode: "insensitive" as const } } },
                    { customer: { email: { contains: q, mode: "insensitive" as const } } },
                    { venue: { name: { contains: q, mode: "insensitive" as const } } },
                    { venue: { city: { contains: q, mode: "insensitive" as const } } },
                ],
            }
            : {}),
    };

    const bookings = await prisma.booking.findMany({
        where,
        include: {
            venue: { select: { name: true, city: true } },
            customer: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    const header = [
        "Booking ID",
        "Customer Name",
        "Customer Email",
        "Venue",
        "City",
        "Event Date",
        "Hours",
        "Guest Count",
        "Amount",
        "Status",
        "Created At",
    ];

    const rows = bookings.map((booking) => [
        booking.id,
        booking.customer.name,
        booking.customer.email,
        booking.venue.name,
        booking.venue.city,
        booking.eventDate.toISOString(),
        booking.hours,
        booking.guestCount,
        booking.totalAmount,
        booking.status,
        booking.createdAt.toISOString(),
    ]);

    const csv = [header, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n");

    return new NextResponse(csv, {
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="bookings-export-${Date.now()}.csv"`,
        },
    });
}
