import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    try {
        const venue = await prisma.venue.findUnique({
            where: { slug, isApproved: true, isActive: true },
            select: {
                id: true, name: true, pricePerHour: true, minBookingHours: true,
                capacity: true, images: true, city: true, address: true,
            },
        });
        return NextResponse.json({ venue });
    } catch {
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
