import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const resetSchema = z.object({
    token: z.string().min(1),
    newPassword: z.string().min(6),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const parsed = resetSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
        }

        const { token, newPassword } = parsed.data;

        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token },
            include: { user: { select: { id: true } } },
        });

        if (!resetToken || resetToken.expiresAt < new Date()) {
            return NextResponse.json({ error: "Reset token is invalid or expired" }, { status: 400 });
        }

        const passwordHash = await bcrypt.hash(newPassword, 12);

        await prisma.$transaction([
            prisma.user.update({ where: { id: resetToken.user.id }, data: { password: passwordHash } }),
            prisma.passwordResetToken.deleteMany({ where: { userId: resetToken.user.id } }),
        ]);

        return NextResponse.json({ message: "Password reset successful" });
    } catch (error) {
        console.error("Reset password error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
