"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CalendarClock, Check, Loader2, X } from "lucide-react";
import toast from "react-hot-toast";
import { formatDate } from "@/lib/utils";

interface OwnerModificationRequestActionsProps {
    bookingId: string;
    requestId: string;
    requestedEventDate: string;
    requestedHours: number;
    requestedGuestCount: number;
    reason?: string | null;
}

export default function OwnerModificationRequestActions({
    bookingId,
    requestId,
    requestedEventDate,
    requestedHours,
    requestedGuestCount,
    reason,
}: OwnerModificationRequestActionsProps) {
    const router = useRouter();
    const [loading, setLoading] = useState<"APPROVE" | "REJECT" | null>(null);

    const decide = async (action: "APPROVE" | "REJECT") => {
        setLoading(action);
        try {
            const res = await fetch(`/api/bookings/${bookingId}/modify-requests/${requestId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to record decision");
            toast.success(action === "APPROVE" ? "Change approved" : "Change rejected");
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to record decision");
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-start gap-2 mb-3">
                <CalendarClock size={15} className="text-purple-300 mt-0.5" />
                <div>
                    <p className="text-white text-sm font-medium">Change requested</p>
                    <p className="text-white/50 text-xs mt-0.5">
                        New date: {formatDate(requestedEventDate)} · {requestedHours} hrs · {requestedGuestCount} guests
                    </p>
                    {reason && <p className="text-white/40 text-xs mt-1 italic">&quot;{reason}&quot;</p>}
                </div>
            </div>
            <div className="flex gap-2">
                <button
                    onClick={() => decide("APPROVE")}
                    disabled={!!loading}
                    className="flex items-center gap-1.5 bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30 transition-colors text-xs py-2 px-4 rounded-lg disabled:opacity-50"
                >
                    {loading === "APPROVE" ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                    Approve
                </button>
                <button
                    onClick={() => decide("REJECT")}
                    disabled={!!loading}
                    className="flex items-center gap-1.5 bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 transition-colors text-xs py-2 px-4 rounded-lg disabled:opacity-50"
                >
                    {loading === "REJECT" ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />}
                    Reject
                </button>
            </div>
        </div>
    );
}
