"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CheckCircle2, XCircle, Loader2, CircleCheck } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface AdminBookingRow {
    id: string;
    status: string;
    eventDate: string;
    totalAmount: number;
    customer: { name: string; email: string };
    venue: { name: string; city: string };
}

const statusStyles: Record<string, string> = {
    PENDING: "bg-yellow-500/20 text-yellow-300",
    CONFIRMED: "bg-green-500/20 text-green-300",
    CANCELLED: "bg-red-500/20 text-red-300",
    COMPLETED: "bg-blue-500/20 text-blue-300",
};

export default function AdminBookingsTable({ bookings }: { bookings: AdminBookingRow[] }) {
    const router = useRouter();
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState<"CONFIRMED" | "CANCELLED" | "COMPLETED" | null>(null);

    const allSelected = bookings.length > 0 && selected.size === bookings.length;

    const toggleAll = () => {
        setSelected(allSelected ? new Set() : new Set(bookings.map((b) => b.id)));
    };

    const toggleOne = (id: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const applyBulkStatus = async (status: "CONFIRMED" | "CANCELLED" | "COMPLETED") => {
        if (selected.size === 0) return;
        setLoading(status);
        try {
            const res = await fetch("/api/admin/bookings/bulk-update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: Array.from(selected), status }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Bulk update failed");
            toast.success(`${data.count} booking${data.count === 1 ? "" : "s"} updated`);
            setSelected(new Set());
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Bulk update failed");
        } finally {
            setLoading(null);
        }
    };

    const selectionCount = useMemo(() => selected.size, [selected]);

    return (
        <div className="glass-card rounded-2xl overflow-hidden">
            {selectionCount > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-purple-500/10 border-b border-white/10">
                    <p className="text-white/70 text-sm">{selectionCount} selected</p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => applyBulkStatus("CONFIRMED")}
                            disabled={!!loading}
                            className="flex items-center gap-1.5 bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30 transition-colors text-xs py-2 px-3 rounded-lg disabled:opacity-50"
                        >
                            {loading === "CONFIRMED" ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                            Confirm
                        </button>
                        <button
                            onClick={() => applyBulkStatus("COMPLETED")}
                            disabled={!!loading}
                            className="flex items-center gap-1.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30 transition-colors text-xs py-2 px-3 rounded-lg disabled:opacity-50"
                        >
                            {loading === "COMPLETED" ? <Loader2 size={13} className="animate-spin" /> : <CircleCheck size={13} />}
                            Mark completed
                        </button>
                        <button
                            onClick={() => applyBulkStatus("CANCELLED")}
                            disabled={!!loading}
                            className="flex items-center gap-1.5 bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 transition-colors text-xs py-2 px-3 rounded-lg disabled:opacity-50"
                        >
                            {loading === "CANCELLED" ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
                            Cancel
                        </button>
                    </div>
                </div>
            )}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="border-b border-white/10">
                        <tr className="text-left text-white/40 text-xs">
                            <th className="px-5 py-4 w-10">
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={toggleAll}
                                    aria-label="Select all bookings"
                                    className="accent-purple-500"
                                />
                            </th>
                            <th className="px-5 py-4">Customer</th>
                            <th className="px-5 py-4">Venue</th>
                            <th className="px-5 py-4">Event date</th>
                            <th className="px-5 py-4">Amount</th>
                            <th className="px-5 py-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {bookings.map((booking) => (
                            <tr key={booking.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-5 py-4">
                                    <input
                                        type="checkbox"
                                        checked={selected.has(booking.id)}
                                        onChange={() => toggleOne(booking.id)}
                                        aria-label={`Select booking for ${booking.customer.name}`}
                                        className="accent-purple-500"
                                    />
                                </td>
                                <td className="px-5 py-4">
                                    <p className="text-white text-sm font-medium">{booking.customer.name}</p>
                                    <p className="text-white/40 text-xs">{booking.customer.email}</p>
                                </td>
                                <td className="px-5 py-4">
                                    <p className="text-white text-sm font-medium">{booking.venue.name}</p>
                                    <p className="text-white/40 text-xs">{booking.venue.city}</p>
                                </td>
                                <td className="px-5 py-4 text-white/60 text-sm">{formatDate(booking.eventDate)}</td>
                                <td className="px-5 py-4 text-white/60 text-sm">{formatCurrency(booking.totalAmount)}</td>
                                <td className="px-5 py-4">
                                    <span className={`badge text-xs ${statusStyles[booking.status]}`}>{booking.status}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
