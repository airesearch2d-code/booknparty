"use client";

import { useState } from "react";
import { X, MessageSquare, Send, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface EnquiryModalProps {
    venue: { id: string; name: string };
    session: { user: { id: string; name?: string | null; email?: string | null } } | null;
}

const eventTypes = [
    "Birthday Party", "Wedding", "Corporate Event", "Graduation", "Anniversary",
    "Cocktail Party", "Conference/Meeting", "Baby Shower", "Product Launch", "Other",
];

export default function EnquiryModal({ venue, session }: EnquiryModalProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: session?.user?.name || "",
        email: session?.user?.email || "",
        phone: "",
        eventType: "",
        eventDate: "",
        guestCount: "",
        message: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/enquiries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    venueId: venue.id,
                    customerId: session?.user?.id || "guest",
                    ...form,
                    guestCount: parseInt(form.guestCount) || 1,
                    eventDate: form.eventDate || null,
                }),
            });
            if (!res.ok) throw new Error("Failed");
            toast.success("Enquiry sent! The owner will contact you soon.");
            setOpen(false);
            setForm(f => ({ ...f, phone: "", eventType: "", eventDate: "", guestCount: "", message: "" }));
        } catch {
            toast.error("Failed to send enquiry. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="btn-secondary w-full py-3 rounded-xl text-base font-semibold justify-center flex items-center gap-2"
                id="enquire-now-btn"
            >
                <MessageSquare size={18} /> Enquire Now
            </button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                    <div
                        className="relative glass-card rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <div>
                                <h2 className="text-white font-bold text-xl">Send Enquiry</h2>
                                <p className="text-white/50 text-sm mt-0.5">{venue.name}</p>
                            </div>
                            <button onClick={() => setOpen(false)} className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-white/70 text-xs font-medium mb-1.5">Your Name *</label>
                                    <input name="name" className="input-field text-sm" placeholder="John Doe" value={form.name} onChange={handleChange} required />
                                </div>
                                <div>
                                    <label className="block text-white/70 text-xs font-medium mb-1.5">Email *</label>
                                    <input name="email" type="email" className="input-field text-sm" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-white/70 text-xs font-medium mb-1.5">Phone *</label>
                                    <input name="phone" type="tel" className="input-field text-sm" placeholder="+91 98765 43210" value={form.phone} onChange={handleChange} required />
                                </div>
                                <div>
                                    <label className="block text-white/70 text-xs font-medium mb-1.5">Guest Count *</label>
                                    <input name="guestCount" type="number" min="1" className="input-field text-sm" placeholder="50" value={form.guestCount} onChange={handleChange} required />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-white/70 text-xs font-medium mb-1.5">Event Type *</label>
                                    <select name="eventType" className="input-field text-sm" value={form.eventType} onChange={handleChange} required>
                                        <option value="">Select type</option>
                                        {eventTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-white/70 text-xs font-medium mb-1.5">Preferred Date</label>
                                    <input name="eventDate" type="date" className="input-field text-sm" value={form.eventDate} onChange={handleChange} min={new Date().toISOString().split("T")[0]} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-white/70 text-xs font-medium mb-1.5">Message / Requirements</label>
                                <textarea
                                    name="message"
                                    className="input-field text-sm min-h-24 resize-none"
                                    placeholder="Tell us about your event, special requirements, catering needs, etc."
                                    value={form.message}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <button type="submit" disabled={loading} className="btn-primary w-full py-3 rounded-xl font-semibold justify-center flex items-center gap-2 disabled:opacity-50">
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                {loading ? "Sending..." : "Send Enquiry"}
                            </button>

                            <p className="text-white/30 text-xs text-center">
                                The venue owner will respond within 24 hours.
                            </p>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
