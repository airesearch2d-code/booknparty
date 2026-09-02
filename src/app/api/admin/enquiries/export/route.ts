import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type EnquiryStatusFilter = "PENDING" | "RESPONDED" | "CLOSED";

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

    const validStatuses: EnquiryStatusFilter[] = ["PENDING", "RESPONDED", "CLOSED"];
    const typedStatus = validStatuses.includes(status as EnquiryStatusFilter)
        ? (status as EnquiryStatusFilter)
        : undefined;
    const where = {
        ...(typedStatus ? { status: typedStatus } : {}),
        ...(q
            ? {
                OR: [
                    { name: { contains: q, mode: "insensitive" as const } },
                    { email: { contains: q, mode: "insensitive" as const } },
                    { venue: { name: { contains: q, mode: "insensitive" as const } } },
                    { venue: { city: { contains: q, mode: "insensitive" as const } } },
                ],
            }
            : {}),
    };

    const enquiries = await prisma.enquiry.findMany({
        where,
        include: {
            venue: { select: { name: true, city: true } },
            customer: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    const header = [
        "Enquiry ID",
        "Name",
        "Email",
        "Phone",
        "Venue",
        "City",
        "Event Type",
        "Event Date",
        "Guest Count",
        "Status",
        "Message",
        "Response",
        "Created At",
    ];

    const rows = enquiries.map((enquiry) => [
        enquiry.id,
        enquiry.name,
        enquiry.email,
        enquiry.phone,
        enquiry.venue.name,
        enquiry.venue.city,
        enquiry.eventType,
        enquiry.eventDate ? enquiry.eventDate.toISOString() : "",
        enquiry.guestCount,
        enquiry.status,
        enquiry.message,
        enquiry.response,
        enquiry.createdAt.toISOString(),
    ]);

    const csv = [header, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n");

    return new NextResponse(csv, {
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="enquiries-export-${Date.now()}.csv"`,
        },
    });
}
