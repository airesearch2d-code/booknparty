"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Calendar, Clock, Users, CreditCard, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";

interface Venue {
    id: string;
    name: string;
    pricePerHour: number;
    minBookingHours: number;
    capacity: number;
    images: string[];
    city: string;
    address: string;
}

export default function BookingPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session, status } = useSession();
    const slug = params.slug as string;

    const [venue, setVenue] = useState<Venue | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [availabilityLoading, setAvailabilityLoading] = useState(false);
    const [availabilityMonth, setAvailabilityMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
    const [form, setForm] = useState({
        date: "",
        startTime: "09:00",
        hours: 2,
        guestCount: 1,
        notes: "",
    });

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login");
    }, [status, router]);

    useEffect(() => {
        fetch(`/api/venues/by-slug/${slug}`)
            .then((r) => r.json())
            .then((data) => {
                setVenue(data.venue || null);
                if (data.venue) setForm((f) => ({ ...f, hours: data.venue.minBookingHours }));
            })
            .finally(() => setLoading(false));
    }, [slug]);

    useEffect(() => {
        if (!venue) return;
        const month = `${availabilityMonth.getFullYear()}-${String(availabilityMonth.getMonth() + 1).padStart(2, "0")}`;

        setAvailabilityLoading(true);
        fetch(`/api/venues/${venue.id}/availability?month=${month}`)
            .then((response) => response.json())
            .then((data) => {
                setUnavailableDates(Array.isArray(data.unavailableDates) ? data.unavailableDates : []);
            })
            .catch(() => {
                setUnavailableDates([]);
                toast.error("Unable to load availability for this month");
            })
            .finally(() => setAvailabilityLoading(false));
    }, [venue, availabilityMonth]);

    const totalAmount = venue ? venue.pricePerHour * form.hours : 0;
    const gst = Math.round(totalAmount * 0.18);
    const grandTotal = totalAmount + gst;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!venue || !session?.user) return;

        if (unavailableDates.includes(form.date)) {
            toast.error("Selected date is unavailable. Please choose another date.");
            return;
        }

        setSubmitting(true);

        try {
            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    venueId: venue.id,
                    eventDate: form.date,
                    hours: form.hours,
                    guestCount: form.guestCount,
                    notes: form.notes,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Booking failed");

            toast.success("Booking confirmed! 🎉");
            router.push("/dashboard/customer");
        } catch (err: any) {
            toast.error(err.message || "Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 size={40} className="animate-spin text-purple-400" />
            </div>
        );
    }

    if (!venue) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-6xl mb-4">😕</p>
                    <p className="text-white text-2xl font-bold">Venue not found</p>
                    <Link href="/venues" className="btn-primary mt-6 px-6 py-3 rounded-xl inline-flex">Browse Venues</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Navbar session={session as any} />

            <div className="pt-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                <div className="flex items-center gap-3 mb-8">
                    <Link href={`/venues/${slug}`} className="p-2 rounded-lg glass-card hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Book Your Event</h1>
                        <p className="text-white/50 text-sm">{venue.name}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* FORM */}
                    <div className="lg:col-span-3">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Date & Time */}
                            <div className="glass-card rounded-2xl p-6 space-y-4">
                                <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                                    <Calendar size={18} className="text-purple-400" /> Date & Time
                                </h2>
                                <div>
                                    <label className="block text-white/70 text-sm mb-2">Event Date *</label>
                                    <AvailabilityCalendar
                                        monthDate={availabilityMonth}
                                        selectedDate={form.date}
                                        unavailableDates={unavailableDates}
                                        onMonthChange={setAvailabilityMonth}
                                        onSelectDate={(isoDate) => setForm((f) => ({ ...f, date: isoDate }))}
                                        loading={availabilityLoading}
                                    />
                                    {form.date && (
                                        <p className="text-xs text-white/50 mt-3">
                                            Selected date: <span className="text-white">{new Date(form.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <div>
                                        <label className="block text-white/70 text-sm mb-1.5">Start Time *</label>
                                        <input
                                            type="time"
                                            className="input-field"
                                            value={form.startTime}
                                            onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-white/70 text-sm mb-1.5">
                                        Duration: <span className="text-purple-400 font-bold">{form.hours} hrs</span>
                                    </label>
                                    <input
                                        type="range"
                                        min={venue.minBookingHours}
                                        max={12}
                                        value={form.hours}
                                        onChange={(e) => setForm((f) => ({ ...f, hours: parseInt(e.target.value) }))}
                                        className="w-full accent-purple-500"
                                    />
                                    <div className="flex justify-between text-white/30 text-xs mt-1">
                                        <span>{venue.minBookingHours}h (min)</span>
                                        <span>12h (max)</span>
                                    </div>
                                </div>
                            </div>

                            {/* Guest Count */}
                            <div className="glass-card rounded-2xl p-6">
                                <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                                    <Users size={18} className="text-purple-400" /> Guests
                                </h2>
                                <div>
                                    <label className="block text-white/70 text-sm mb-1.5">Number of Guests *</label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={venue.capacity}
                                        className="input-field"
                                        value={form.guestCount}
                                        onChange={(e) => setForm((f) => ({ ...f, guestCount: parseInt(e.target.value) }))}
                                        required
                                    />
                                    <p className="text-white/30 text-xs mt-1.5">Max capacity: {venue.capacity} guests</p>
                                </div>
                            </div>

                            {/* Special Requests */}
                            <div className="glass-card rounded-2xl p-6">
                                <h2 className="text-white font-semibold text-lg mb-4">Special Requests</h2>
                                <textarea
                                    className="input-field min-h-24 resize-none"
                                    placeholder="Catering preferences, décor requirements, setup instructions..."
                                    value={form.notes}
                                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting || !form.date}
                                className="btn-primary w-full py-4 rounded-xl text-base font-bold justify-center flex items-center gap-2 disabled:opacity-50"
                            >
                                {submitting ? (
                                    <><Loader2 size={20} className="animate-spin" /> Processing...</>
                                ) : (
                                    <><CreditCard size={20} /> Confirm Booking · {formatINR(grandTotal)}</>
                                )}
                            </button>
                            <p className="text-white/30 text-xs text-center mt-2">You'll be charged after the owner confirms.</p>
                        </form>
                    </div>

                    {/* PRICE SUMMARY */}
                    <div className="lg:col-span-2">
                        <div className="sticky top-24 glass-card rounded-2xl p-6 space-y-5">
                            {venue.images[0] && (
                                <img
                                    src={venue.images[0]}
                                    alt={venue.name}
                                    className="w-full h-36 object-cover rounded-xl"
                                />
                            )}
                            <div>
                                <p className="text-white font-bold text-lg">{venue.name}</p>
                                <p className="text-white/40 text-sm">{venue.city}</p>
                            </div>

                            <div className="border-t border-white/10 pt-4 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/60 flex items-center gap-1.5">
                                        <Clock size={14} />₹{venue.pricePerHour.toLocaleString()} × {form.hours} hrs
                                    </span>
                                    <span className="text-white">{formatINR(totalAmount)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/60">GST (18%)</span>
                                    <span className="text-white">{formatINR(gst)}</span>
                                </div>
                                <div className="flex justify-between font-bold border-t border-white/10 pt-3 text-base">
                                    <span className="text-white">Total</span>
                                    <span className="gradient-text text-lg">{formatINR(grandTotal)}</span>
                                </div>
                            </div>

                            <div className="space-y-2 pt-2">
                                {[
                                    "Free cancellation within 24 hrs",
                                    "Instant confirmation",
                                    "Secure payments",
                                ].map((t) => (
                                    <div key={t} className="flex items-center gap-2 text-xs text-white/40">
                                        <CheckCircle size={12} className="text-green-400 flex-shrink-0" /> {t}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

function formatINR(n: number) {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}
