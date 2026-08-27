"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function OwnerBookingActions({ bookingId }: { bookingId: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState<"confirm" | "cancel" | null>(null);

    const updateStatus = async (status: "CONFIRMED" | "CANCELLED") => {
        setLoading(status === "CONFIRMED" ? "confirm" : "cancel");
        try {
            const res = await fetch(`/api/bookings/${bookingId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            if (!res.ok) throw new Error("Failed");
            toast.success(`Booking ${status === "CONFIRMED" ? "confirmed" : "cancelled"}!`);
            router.refresh();
        } catch {
            toast.error("Action failed. Try again.");
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="flex gap-2 flex-shrink-0">
            <button
                onClick={() => updateStatus("CONFIRMED")}
                disabled={!!loading}
                className="flex items-center gap-1.5 bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30 transition-colors text-xs py-2 px-4 rounded-lg disabled:opacity-50"
            >
                {loading === "confirm" ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                Confirm
            </button>
            <button
                onClick={() => updateStatus("CANCELLED")}
                disabled={!!loading}
                className="flex items-center gap-1.5 bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 transition-colors text-xs py-2 px-4 rounded-lg disabled:opacity-50"
            >
                {loading === "cancel" ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
                Cancel
            </button>
        </div>
    );
}
