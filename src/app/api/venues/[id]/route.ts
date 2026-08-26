import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const venue = await prisma.venue.findFirst({
        where: { id, ownerId: session.user.id! },
    });
    if (!venue) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ venue });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const role = (session.user as any).role;

    const where = role === "ADMIN" ? { id } : { id, ownerId: session.user.id! };
    const venue = await prisma.venue.update({ where, data: body });

    return NextResponse.json({ venue });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as any).role;
    const where = role === "ADMIN" ? { id } : { id, ownerId: session.user.id! };

    await prisma.venue.delete({ where });
    return NextResponse.json({ message: "Venue deleted" });
}
