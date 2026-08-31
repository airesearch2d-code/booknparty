"use client";

import { useState } from "react";
import { Loader2, LockKeyhole } from "lucide-react";
import toast from "react-hot-toast";

export default function ChangePasswordForm() {
    const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [saving, setSaving] = useState(false);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (form.newPassword.length < 6) {
            toast.error("New password must be at least 6 characters");
            return;
        }

        if (form.newPassword !== form.confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        setSaving(true);

        try {
            const response = await fetch("/api/user/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword: form.currentPassword,
                    newPassword: form.newPassword,
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Password change failed");

            toast.success("Password updated successfully");
            setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error: any) {
            toast.error(error.message || "Password change failed");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="glass-card rounded-2xl p-6 h-fit">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <LockKeyhole size={20} className="text-white" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Security</h2>
                    <p className="text-white/50 text-xs">Keep your account protected</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm text-white/70 mb-1.5">Current password</label>
                    <input
                        name="currentPassword"
                        type="password"
                        value={form.currentPassword}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Current password"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm text-white/70 mb-1.5">New password</label>
                    <input
                        name="newPassword"
                        type="password"
                        value={form.newPassword}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="At least 6 characters"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm text-white/70 mb-1.5">Confirm new password</label>
                    <input
                        name="confirmPassword"
                        type="password"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Re-enter password"
                        required
                    />
                </div>

                <button type="submit" disabled={saving} className="btn-secondary w-full py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60">
                    {saving ? <><Loader2 size={16} className="animate-spin" /> Updating...</> : "Change password"}
                </button>
            </form>
        </div>
    );
}
