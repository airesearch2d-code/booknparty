import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { randomBytes } from "crypto";
import { z } from "zod";

const forgotSchema = z.object({
    email: z.string().email(),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const parsed = forgotSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: parsed.data.email },
            select: { id: true, name: true, email: true },
        });

        // Always return a generic success response to avoid email enumeration.
        if (!user) {
            return NextResponse.json({ message: "If that email exists, a reset link has been sent." });
        }

        const token = randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

        await prisma.passwordResetToken.create({
            data: { userId: user.id, token, expiresAt },
        });

        await sendPasswordResetEmail({
            userEmail: user.email,
            userName: user.name,
            resetToken: token,
        });

        return NextResponse.json({ message: "If that email exists, a reset link has been sent." });
    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
