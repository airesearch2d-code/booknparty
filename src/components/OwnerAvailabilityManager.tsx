"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Ban, Loader2, Trash2 } from "lucide-react";

interface OwnerAvailabilityManagerProps {
    venueId: string;
}

interface BlockedDateItem {
    id: string;
    date: string;
    reason?: string | null;
}

function monthKey(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export default function OwnerAvailabilityManager({ venueId }: OwnerAvailabilityManagerProps) {
    const [date, setDate] = useState("");
    const [reason, setReason] = useState("");
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(() => new Date());
    const [blockedDates, setBlockedDates] = useState<BlockedDateItem[]>([]);

    const month = useMemo(() => monthKey(currentMonth), [currentMonth]);

    const loadBlockedDates = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/venues/${venueId}/availability?month=${month}`);
            const data = await response.json();
            setBlockedDates(Array.isArray(data.blockedDates) ? data.blockedDates : []);
        } catch {
            toast.error("Failed to load blocked dates");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBlockedDates();
    }, [month]);

    const handleBlockDate = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!date) return;

        setSaving(true);
        try {
            const response = await fetch(`/api/venues/${venueId}/block-dates`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date, reason: reason || undefined }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to block date");

            toast.success("Date blocked");
            setDate("");
            setReason("");
            await loadBlockedDates();
        } catch (error: any) {
            toast.error(error.message || "Failed to block date");
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveBlockedDate = async (blockedId: string) => {
        setSaving(true);
        try {
            const response = await fetch(`/api/venues/${venueId}/block-dates?blockedId=${blockedId}`, {
                method: "DELETE",
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to remove blocked date");

            toast.success("Blocked date removed");
            await loadBlockedDates();
        } catch (error: any) {
            toast.error(error.message || "Failed to remove blocked date");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="glass-card rounded-2xl p-6 space-y-5">
            <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                <Ban size={18} className="text-purple-400" /> Availability Controls
            </h2>

            <form onSubmit={handleBlockDate} className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-3">
                <input
                    type="date"
                    className="input-field"
                    value={date}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(event) => setDate(event.target.value)}
                    required
                />
                <input
                    type="text"
                    className="input-field"
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    placeholder="Reason (optional)"
                    maxLength={200}
                />
                <button type="submit" disabled={saving} className="btn-secondary px-4 py-2 rounded-xl disabled:opacity-50">
                    {saving ? "Saving..." : "Block Date"}
                </button>
            </form>

            <div className="flex items-center justify-between">
                <p className="text-xs text-white/40">Blocked dates in {currentMonth.toLocaleString("en-IN", { month: "long", year: "numeric" })}</p>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                        className="btn-secondary px-3 py-1.5 rounded-lg text-xs"
                    >
                        Prev
                    </button>
                    <button
                        type="button"
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                        className="btn-secondary px-3 py-1.5 rounded-lg text-xs"
                    >
                        Next
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center gap-2 text-white/60 text-sm">
                    <Loader2 size={14} className="animate-spin" /> Loading blocked dates...
                </div>
            ) : blockedDates.length === 0 ? (
                <p className="text-white/40 text-sm">No blocked dates for this month.</p>
            ) : (
                <div className="space-y-2">
                    {blockedDates.map((item) => (
                        <div key={item.id} className="bg-white/5 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                            <div>
                                <p className="text-white text-sm font-medium">
                                    {new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                                </p>
                                <p className="text-white/40 text-xs">{item.reason || "No reason provided"}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleRemoveBlockedDate(item.id)}
                                disabled={saving}
                                className="p-2 rounded-lg text-red-300 hover:bg-red-500/10 disabled:opacity-40"
                                title="Remove blocked date"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
