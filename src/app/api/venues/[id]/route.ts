import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendVenueApprovedToOwner, sendVenueRejectedToOwner } from "@/lib/email";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const venue = await prisma.venue.findFirst({
        where: { id, ownerId: session.user!.id! },
    });
    if (!venue) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ venue });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as any).role;
    if (role !== "OWNER" && role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const existing = await prisma.venue.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (role === "OWNER" && existing.ownerId !== session.user!.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const {
        name, description, type, capacity, pricePerHour, minBookingHours,
        address, city, state, pincode, latitude, longitude,
        images, amenities, highlights, isActive, isApproved,
    } = body;

    const updated = await prisma.venue.update({
        where: { id },
        data: {
            name,
            description,
            type,
            capacity: parseInt(capacity),
            pricePerHour: parseFloat(pricePerHour),
            minBookingHours: parseInt(minBookingHours ?? 2),
            address,
            city,
            state,
            pincode,
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null,
            images: images ?? [],
            amenities: amenities ?? [],
            highlights: highlights ?? [],
            isActive: isActive !== undefined ? isActive : true,
            // Owner edits reset approval; admin can set approval explicitly.
            isApproved: role === "ADMIN"
                ? (isApproved !== undefined ? Boolean(isApproved) : existing.isApproved)
                : false,
        },
    });

    // If admin is approving or rejecting, send notification to owner
    if (role === "ADMIN" && body.isApproved !== undefined) {
        const owner = await prisma.user.findUnique({
            where: { id: existing.ownerId },
            select: { name: true, email: true },
        });
        if (owner) {
            if (body.isApproved === true && !existing.isApproved) {
                sendVenueApprovedToOwner({
                    ownerEmail: owner.email,
                    ownerName: owner.name,
                    venueName: updated.name,
                    venueSlug: updated.slug,
                }).catch(console.error);
            } else if (body.isApproved === false && existing.isApproved) {
                sendVenueRejectedToOwner({
                    ownerEmail: owner.email,
                    ownerName: owner.name,
                    venueName: updated.name,
                }).catch(console.error);
            }
        }
    }

    return NextResponse.json({ venue: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as any).role;
    if (role !== "OWNER" && role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const existing = await prisma.venue.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (role === "OWNER" && existing.ownerId !== session.user!.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.venue.delete({ where: { id } });
    return NextResponse.json({ message: "Venue deleted" });
}
