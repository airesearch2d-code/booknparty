"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { signOut } from "next-auth/react";

interface DeleteAccountCardProps {
    roleLabel: string;
}

export default function DeleteAccountCard({ roleLabel }: DeleteAccountCardProps) {
    const [currentPassword, setCurrentPassword] = useState("");
    const [confirmationText, setConfirmationText] = useState("");
    const [deleting, setDeleting] = useState(false);

    const handleDeleteAccount = async (event: React.FormEvent) => {
        event.preventDefault();

        if (confirmationText !== "DELETE") {
            toast.error("Type DELETE exactly to continue");
            return;
        }

        setDeleting(true);
        try {
            const response = await fetch("/api/user/delete-account", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, confirmationText }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to delete account");

            toast.success("Account deleted");
            await signOut({ callbackUrl: "/" });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to delete account";
            toast.error(message);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="glass-card rounded-2xl p-6 border border-red-500/30">
            <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                    <AlertTriangle size={20} className="text-white" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Delete account</h2>
                    <p className="text-white/50 text-xs">This action is permanent for your {roleLabel} account</p>
                </div>
            </div>

            <p className="text-xs text-red-200/80 bg-red-500/10 rounded-lg p-3 mb-4">
                This will remove your personal account data. For owner accounts with existing venue data, contact support.
            </p>

            <form onSubmit={handleDeleteAccount} className="space-y-4">
                <div>
                    <label className="block text-sm text-white/70 mb-1.5">Current password</label>
                    <input
                        type="password"
                        className="input-field"
                        value={currentPassword}
                        onChange={(event) => setCurrentPassword(event.target.value)}
                        placeholder="Enter current password"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm text-white/70 mb-1.5">Type DELETE to confirm</label>
                    <input
                        type="text"
                        className="input-field"
                        value={confirmationText}
                        onChange={(event) => setConfirmationText(event.target.value)}
                        placeholder="DELETE"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={deleting}
                    className="w-full py-3 rounded-xl flex items-center justify-center gap-2 bg-red-600/80 hover:bg-red-600 text-white font-medium disabled:opacity-60"
                >
                    {deleting ? <><Loader2 size={16} className="animate-spin" /> Deleting...</> : <><Trash2 size={16} /> Delete account</>}
                </button>
            </form>
        </div>
    );
}
