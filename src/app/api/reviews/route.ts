import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session || (session.user as any).role !== "CUSTOMER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { venueId, rating, comment } = body;

    if (!venueId || !rating || !comment) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
        return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    // Verify the user has a completed booking for this venue
    const completedBooking = await prisma.booking.findFirst({
        where: {
            customerId: session.user!.id!,
            venueId,
            status: "COMPLETED",
        },
    });

    if (!completedBooking) {
        return NextResponse.json(
            { error: "You can only review venues you have completed a booking for" },
            { status: 403 }
        );
    }

    // Check if user has already reviewed this venue
    const existingReview = await prisma.review.findFirst({
        where: { venueId, userId: session.user!.id! },
    });

    if (existingReview) {
        return NextResponse.json({ error: "You have already reviewed this venue" }, { status: 409 });
    }

    const review = await prisma.review.create({
        data: {
            venueId,
            userId: session.user!.id!,
            rating,
            comment,
        },
    });

    return NextResponse.json({ review }, { status: 201 });
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const venueId = searchParams.get("venueId");

    const reviews = await prisma.review.findMany({
        where: venueId ? { venueId } : {},
        include: { user: { select: { name: true, avatar: true } } },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ reviews });
}
