"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowLeft, Loader2, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to send reset link");

            toast.success("If the email exists, a reset link has been sent.");
        } catch (error: any) {
            toast.error(error.message || "Failed to send reset link");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-20">
            <div className="w-full max-w-md glass-card rounded-2xl p-8">
                <Link href="/login" className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-sm mb-5">
                    <ArrowLeft size={14} /> Back to login
                </Link>

                <h1 className="text-2xl font-bold text-white">Forgot Password</h1>
                <p className="text-white/50 text-sm mt-1">Enter your email and we will send a secure reset link.</p>

                <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                    <div>
                        <label className="block text-white/70 text-sm mb-1.5">Email address</label>
                        <input
                            type="email"
                            className="input-field"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary w-full py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60">
                        {loading ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : <><Mail size={16} /> Send reset link</>}
                    </button>
                </form>
            </div>
        </div>
    );
}
