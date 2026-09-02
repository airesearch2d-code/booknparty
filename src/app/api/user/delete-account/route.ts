import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";

const deleteAccountSchema = z.object({
    currentPassword: z.string().min(6),
    confirmationText: z.literal("DELETE"),
});

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const parsed = deleteAccountSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid confirmation details" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { id: true, password: true, role: true },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const passwordsMatch = await bcrypt.compare(parsed.data.currentPassword, user.password);
        if (!passwordsMatch) {
            return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
        }

        // Prevent deleting the last admin account.
        if (user.role === "ADMIN") {
            const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
            if (adminCount <= 1) {
                return NextResponse.json({ error: "Cannot delete the last admin account" }, { status: 409 });
            }
        }

        // Owner deletion is blocked if venues/bookings exist as a safety measure.
        if (user.role === "OWNER") {
            const [ownedVenues, ownerVenueBookings] = await Promise.all([
                prisma.venue.count({ where: { ownerId: user.id } }),
                prisma.booking.count({ where: { venue: { ownerId: user.id } } }),
            ]);

            if (ownedVenues > 0 || ownerVenueBookings > 0) {
                return NextResponse.json(
                    { error: "Please contact support to delete an owner account with venue data" },
                    { status: 409 }
                );
            }
        }

        await prisma.$transaction([
            prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }),
            prisma.review.deleteMany({ where: { userId: user.id } }),
            prisma.enquiry.deleteMany({ where: { customerId: user.id } }),
            prisma.booking.deleteMany({ where: { customerId: user.id } }),
            prisma.user.delete({ where: { id: user.id } }),
        ]);

        return NextResponse.json({ message: "Account deleted successfully" });
    } catch (error) {
        console.error("Delete account error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
