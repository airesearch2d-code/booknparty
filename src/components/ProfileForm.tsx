"use client";

import { useState } from "react";
import { Loader2, Save, UserCircle2 } from "lucide-react";
import toast from "react-hot-toast";

interface ProfileFormProps {
    initialUser: {
        id: string;
        name: string;
        email: string;
        phone?: string | null;
        avatar?: string | null;
        role?: string;
    };
    roleLabel: string;
}

export default function ProfileForm({ initialUser, roleLabel }: ProfileFormProps) {
    const [form, setForm] = useState({
        name: initialUser.name,
        email: initialUser.email,
        phone: initialUser.phone ?? "",
        avatar: initialUser.avatar ?? "",
    });
    const [saving, setSaving] = useState(false);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setSaving(true);

        try {
            const response = await fetch("/api/user/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    phone: form.phone || null,
                    avatar: form.avatar || null,
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Unable to update profile");

            toast.success("Profile updated successfully");
        } catch (error: any) {
            toast.error(error.message || "Unable to update profile");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <UserCircle2 size={22} className="text-white" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Profile details</h2>
                    <p className="text-white/50 text-xs">{roleLabel} account</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm text-white/70 mb-1.5">Full name</label>
                    <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Your name"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm text-white/70 mb-1.5">Email address</label>
                    <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="you@example.com"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm text-white/70 mb-1.5">Phone number</label>
                    <input
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="+91 98765 43210"
                    />
                </div>

                <div>
                    <label className="block text-sm text-white/70 mb-1.5">Avatar URL</label>
                    <input
                        name="avatar"
                        value={form.avatar}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="https://example.com/avatar.jpg"
                    />
                </div>

                <button type="submit" disabled={saving} className="btn-primary w-full py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60">
                    {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> Save changes</>}
                </button>
            </form>
        </div>
    );
}
