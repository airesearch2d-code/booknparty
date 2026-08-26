import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateSlug } from "@/lib/utils";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city") || "";
    const type = searchParams.get("type") || "";
    const minPrice = parseFloat(searchParams.get("minPrice") || "0");
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "9999999");
    const capacity = parseInt(searchParams.get("capacity") || "0");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 12;

    const where: any = {
        isApproved: true,
        isActive: true,
        ...(city && { city: { contains: city, mode: "insensitive" } }),
        ...(type && { type }),
        pricePerHour: { gte: minPrice, lte: maxPrice },
        ...(capacity > 0 && { capacity: { gte: capacity } }),
    };

    const [venues, total] = await Promise.all([
        prisma.venue.findMany({
            where,
            include: {
                owner: { select: { name: true } },
                reviews: { select: { rating: true } },
                _count: { select: { bookings: true } },
            },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.venue.count({ where }),
    ]);

    return NextResponse.json({ venues, total, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session || (session.user as any).role !== "OWNER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const slug = generateSlug(body.name) + "-" + Date.now();

    const venue = await prisma.venue.create({
        data: {
            ...body,
            slug,
            ownerId: session.user.id!,
            images: body.images || [],
            amenities: body.amenities || [],
            highlights: body.highlights || [],
        },
    });

    return NextResponse.json({ venue }, { status: 201 });
}
