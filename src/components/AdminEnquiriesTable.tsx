"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Archive, Loader2, RotateCcw } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface AdminEnquiryRow {
    id: string;
    status: string;
    eventType: string | null;
    eventDate: string | null;
    name: string;
    email: string;
    phone: string;
    venue: { name: string; city: string };
}

const statusStyles: Record<string, string> = {
    PENDING: "bg-yellow-500/20 text-yellow-300",
    RESPONDED: "bg-green-500/20 text-green-300",
    CLOSED: "bg-slate-500/20 text-slate-300",
};

export default function AdminEnquiriesTable({ enquiries }: { enquiries: AdminEnquiryRow[] }) {
    const router = useRouter();
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState<"CLOSED" | "PENDING" | null>(null);

    const allSelected = enquiries.length > 0 && selected.size === enquiries.length;

    const toggleAll = () => {
        setSelected(allSelected ? new Set() : new Set(enquiries.map((e) => e.id)));
    };

    const toggleOne = (id: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const applyBulkStatus = async (status: "CLOSED" | "PENDING") => {
        if (selected.size === 0) return;
        setLoading(status);
        try {
            const res = await fetch("/api/admin/enquiries/bulk-update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: Array.from(selected), status }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Bulk update failed");
            toast.success(`${data.count} enquir${data.count === 1 ? "y" : "ies"} updated`);
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
                            onClick={() => applyBulkStatus("CLOSED")}
                            disabled={!!loading}
                            className="flex items-center gap-1.5 bg-slate-500/20 text-slate-300 border border-slate-500/30 hover:bg-slate-500/30 transition-colors text-xs py-2 px-3 rounded-lg disabled:opacity-50"
                        >
                            {loading === "CLOSED" ? <Loader2 size={13} className="animate-spin" /> : <Archive size={13} />}
                            Close
                        </button>
                        <button
                            onClick={() => applyBulkStatus("PENDING")}
                            disabled={!!loading}
                            className="flex items-center gap-1.5 bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 hover:bg-yellow-500/30 transition-colors text-xs py-2 px-3 rounded-lg disabled:opacity-50"
                        >
                            {loading === "PENDING" ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />}
                            Reopen
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
                                    aria-label="Select all enquiries"
                                    className="accent-purple-500"
                                />
                            </th>
                            <th className="px-5 py-4">Customer</th>
                            <th className="px-5 py-4">Venue</th>
                            <th className="px-5 py-4">Event type</th>
                            <th className="px-5 py-4">Date</th>
                            <th className="px-5 py-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {enquiries.map((enquiry) => (
                            <tr key={enquiry.id} className="hover:bg-white/5 transition-colors align-top">
                                <td className="px-5 py-4">
                                    <input
                                        type="checkbox"
                                        checked={selected.has(enquiry.id)}
                                        onChange={() => toggleOne(enquiry.id)}
                                        aria-label={`Select enquiry from ${enquiry.name}`}
                                        className="accent-purple-500"
                                    />
                                </td>
                                <td className="px-5 py-4">
                                    <p className="text-white text-sm font-medium">{enquiry.name}</p>
                                    <p className="text-white/40 text-xs">{enquiry.email}</p>
                                    <p className="text-white/30 text-[11px] mt-1">{enquiry.phone}</p>
                                </td>
                                <td className="px-5 py-4">
                                    <p className="text-white text-sm font-medium">{enquiry.venue.name}</p>
                                    <p className="text-white/40 text-xs">{enquiry.venue.city}</p>
                                </td>
                                <td className="px-5 py-4 text-white/60 text-sm">{enquiry.eventType || "—"}</td>
                                <td className="px-5 py-4 text-white/60 text-sm">{enquiry.eventDate ? formatDate(enquiry.eventDate) : "Not provided"}</td>
                                <td className="px-5 py-4">
                                    <span className={`badge text-xs ${statusStyles[enquiry.status]}`}>{enquiry.status}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
