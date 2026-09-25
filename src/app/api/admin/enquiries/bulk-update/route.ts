import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const VALID_STATUSES = ["PENDING", "RESPONDED", "CLOSED"] as const;

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const ids = Array.isArray(body.ids) ? (body.ids as string[]).filter((id) => typeof id === "string") : [];
    const status = body.status as string | undefined;

    if (ids.length === 0) {
        return NextResponse.json({ error: "No enquiries selected" }, { status: 400 });
    }

    if (!status || !VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const result = await prisma.enquiry.updateMany({
        where: { id: { in: ids } },
        data: { status: status as (typeof VALID_STATUSES)[number] },
    });

    return NextResponse.json({ count: result.count });
}
