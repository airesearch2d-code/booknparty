import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { response } = await req.json();

    if (!response?.trim()) {
        return NextResponse.json({ error: "Response cannot be empty" }, { status: 400 });
    }

    try {
        const enquiry = await prisma.enquiry.findUnique({
            where: { id },
            include: { venue: { select: { ownerId: true } } },
        });

        if (!enquiry) return NextResponse.json({ error: "Not found" }, { status: 404 });

        const userId = session.user?.id;
        if (enquiry.venue.ownerId !== userId && (session.user as any)?.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const updated = await prisma.enquiry.update({
            where: { id },
            data: { response, status: "RESPONDED" as any },
        });

        return NextResponse.json({ enquiry: updated });
    } catch {
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
