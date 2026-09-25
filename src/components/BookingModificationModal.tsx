"use client";

import { useState } from "react";
import { CalendarClock, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface BookingModificationModalProps {
    bookingId: string;
    currentEventDate: string;
    currentHours: number;
    currentGuestCount: number;
}

export default function BookingModificationModal({
    bookingId,
    currentEventDate,
    currentHours,
    currentGuestCount,
}: BookingModificationModalProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [eventDate, setEventDate] = useState(currentEventDate.slice(0, 10));
    const [hours, setHours] = useState(currentHours);
    const [guestCount, setGuestCount] = useState(currentGuestCount);
    const [reason, setReason] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch(`/api/bookings/${bookingId}/modify-requests`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ eventDate, hours, guestCount, reason }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to submit change request");
            toast.success("Change request sent to the venue owner");
            setOpen(false);
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to submit change request");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-1.5 bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:text-white transition-colors text-xs py-2 px-4 rounded-lg"
            >
                <CalendarClock size={13} /> Request change
            </button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />

                    <div
                        className="relative glass-card rounded-2xl p-6 w-full max-w-md shadow-2xl"
                        style={{ border: "1px solid rgba(168,85,247,0.25)" }}
                    >
                        <button
                            onClick={() => setOpen(false)}
                            className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                        >
                            <X size={18} />
                        </button>

                        <h2 className="text-white font-bold text-xl mb-1">Request Booking Change</h2>
                        <p className="text-white/50 text-sm mb-6">The venue owner will review and approve or reject this request.</p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-white/70 text-sm mb-2">New event date *</label>
                                <input
                                    type="date"
                                    className="input-field"
                                    value={eventDate}
                                    onChange={(e) => setEventDate(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-white/70 text-sm mb-2">Duration (hrs) *</label>
                                    <input
                                        type="number"
                                        min={1}
                                        className="input-field"
                                        value={hours}
                                        onChange={(e) => setHours(Number(e.target.value))}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-white/70 text-sm mb-2">Guests *</label>
                                    <input
                                        type="number"
                                        min={1}
                                        className="input-field"
                                        value={guestCount}
                                        onChange={(e) => setGuestCount(Number(e.target.value))}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-white/70 text-sm mb-2">Reason (optional)</label>
                                <textarea
                                    className="input-field min-h-20 resize-none"
                                    placeholder="Let the owner know why you need this change..."
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                />
                            </div>

                            <button type="submit" disabled={submitting} className="btn-primary w-full py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
                                {submitting ? <Loader2 size={16} className="animate-spin" /> : <CalendarClock size={16} />}
                                Submit Request
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
