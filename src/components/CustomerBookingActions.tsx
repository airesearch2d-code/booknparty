"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { XCircle, Loader2, Receipt, Clock } from "lucide-react";
import toast from "react-hot-toast";
import BookingModificationModal from "./BookingModificationModal";

interface CustomerBookingActionsProps {
    bookingId: string;
    status: string;
    eventDate: string;
    hours: number;
    guestCount: number;
    hasPendingModificationRequest: boolean;
}

export default function CustomerBookingActions({
    bookingId,
    status,
    eventDate,
    hours,
    guestCount,
    hasPendingModificationRequest,
}: CustomerBookingActionsProps) {
    const router = useRouter();
    const [cancelling, setCancelling] = useState(false);

    const isFuture = new Date(eventDate).getTime() > Date.now();
    const canCancel = (status === "PENDING" || status === "CONFIRMED") && isFuture;
    const canViewInvoice = status === "CONFIRMED" || status === "COMPLETED";
    const canRequestChange = canCancel && !hasPendingModificationRequest;

    const cancelBooking = async () => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;
        setCancelling(true);
        try {
            const res = await fetch(`/api/bookings/${bookingId}/cancel`, { method: "POST" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to cancel booking");
            toast.success("Booking cancelled");
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to cancel booking");
        } finally {
            setCancelling(false);
        }
    };

    if (!canCancel && !canViewInvoice && !hasPendingModificationRequest) return null;

    return (
        <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
            {hasPendingModificationRequest && (
                <span className="flex items-center gap-1.5 bg-yellow-500/20 text-yellow-300 text-xs py-2 px-4 rounded-lg">
                    <Clock size={13} /> Change requested — pending review
                </span>
            )}
            {canViewInvoice && (
                <Link
                    href={`/dashboard/customer/bookings/${bookingId}/invoice`}
                    className="flex items-center gap-1.5 bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:text-white transition-colors text-xs py-2 px-4 rounded-lg"
                >
                    <Receipt size={13} /> Invoice
                </Link>
            )}
            {canRequestChange && (
                <BookingModificationModal
                    bookingId={bookingId}
                    currentEventDate={eventDate}
                    currentHours={hours}
                    currentGuestCount={guestCount}
                />
            )}
            {canCancel && (
                <button
                    onClick={cancelBooking}
                    disabled={cancelling}
                    className="flex items-center gap-1.5 bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 transition-colors text-xs py-2 px-4 rounded-lg disabled:opacity-50"
                >
                    {cancelling ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
                    Cancel
                </button>
            )}
        </div>
    );
}
