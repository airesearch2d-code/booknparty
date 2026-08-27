"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, UserPlus, Building2, User } from "lucide-react";
import toast from "react-hot-toast";
import { Suspense } from "react";

function RegisterForm() {
    const searchParams = useSearchParams();
    const defaultRole = searchParams.get("role") === "OWNER" ? "OWNER" : "CUSTOMER";

    const [role, setRole] = useState<"OWNER" | "CUSTOMER">(defaultRole as any);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, phone, password, role }),
            });
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.error || "Registration failed");
            } else {
                toast.success("Account created! Please sign in.");
                router.push("/login");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden">
            <div className="absolute top-20 left-10 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-20 right-10 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />

            <div className="relative w-full max-w-md">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-lg">🎉</div>
                        <span className="font-bold text-2xl text-white">Book<span className="gradient-text">N</span>Party</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-white mt-4">Create your account</h1>
                    <p className="text-white/50 text-sm mt-1">Join thousands of event planners & venue owners</p>
                </div>

                <div className="glass-card rounded-2xl p-8 neon-glow">
                    {/* Role Toggle */}
                    <div className="flex gap-3 mb-6">
                        <button
                            type="button"
                            onClick={() => setRole("CUSTOMER")}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition-all ${role === "CUSTOMER"
                                    ? "bg-purple-500/20 border-purple-500 text-white"
                                    : "border-white/10 text-white/50 hover:border-white/30"
                                }`}
                            id="role-customer"
                        >
                            <User size={16} />
                            Customer
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole("OWNER")}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition-all ${role === "OWNER"
                                    ? "bg-purple-500/20 border-purple-500 text-white"
                                    : "border-white/10 text-white/50 hover:border-white/30"
                                }`}
                            id="role-owner"
                        >
                            <Building2 size={16} />
                            Venue Owner
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-white/70 text-sm mb-2 font-medium">Full Name</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                id="register-name"
                            />
                        </div>

                        <div>
                            <label className="block text-white/70 text-sm mb-2 font-medium">Email Address</label>
                            <input
                                type="email"
                                className="input-field"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                id="register-email"
                            />
                        </div>

                        <div>
                            <label className="block text-white/70 text-sm mb-2 font-medium">Phone Number</label>
                            <input
                                type="tel"
                                className="input-field"
                                placeholder="+91 98765 43210"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                id="register-phone"
                            />
                        </div>

                        <div>
                            <label className="block text-white/70 text-sm mb-2 font-medium">Password</label>
                            <div className="relative">
                                <input
                                    type={showPass ? "text" : "password"}
                                    className="input-field pr-10"
                                    placeholder="Min 6 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    id="register-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                                >
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {role === "OWNER" && (
                            <div className="glass-card rounded-xl p-4 text-sm">
                                <p className="text-purple-300 font-medium mb-1">🏛️ Venue Owner Benefits</p>
                                <ul className="text-white/50 space-y-1 text-xs">
                                    <li>✓ List unlimited venues for free</li>
                                    <li>✓ Receive direct bookings & enquiries</li>
                                    <li>✓ Manage pricing and availability</li>
                                    <li>✓ Access detailed analytics dashboard</li>
                                </ul>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-3 rounded-xl flex items-center justify-center gap-2 text-base font-semibold disabled:opacity-50"
                            id="register-submit"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <UserPlus size={18} />
                                    Create Account
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-white/40 text-sm">
                            Already have an account?{" "}
                            <Link href="/login" className="text-purple-400 hover:text-white font-medium transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense>
            <RegisterForm />
        </Suspense>
    );
}
