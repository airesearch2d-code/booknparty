"use client";

import { useState } from "react";
import { Star, Loader2, X } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
    venueId: string;
    venueName: string;
    onSuccess?: () => void;
}

export default function ReviewModal({ venueId, venueName, onSuccess }: Props) {
    const [open, setOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [hovered, setHovered] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) return toast.error("Please select a star rating");
        if (!comment.trim()) return toast.error("Please write a comment");

        setSubmitting(true);
        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ venueId, rating, comment }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to submit review");

            toast.success("Review submitted! 🌟");
            setOpen(false);
            setRating(0);
            setComment("");
            onSuccess?.();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="btn-secondary text-xs py-2 px-4 rounded-lg flex items-center gap-1.5 w-fit"
            >
                <Star size={12} /> Write a Review
            </button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setOpen(false)}
                    />

                    {/* Modal */}
                    <div className="relative glass-card rounded-2xl p-6 w-full max-w-md shadow-2xl"
                        style={{ border: "1px solid rgba(168,85,247,0.25)" }}>
                        <button
                            onClick={() => setOpen(false)}
                            className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                        >
                            <X size={18} />
                        </button>

                        <h2 className="text-white font-bold text-xl mb-1">Leave a Review</h2>
                        <p className="text-white/50 text-sm mb-6">{venueName}</p>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Star Picker */}
                            <div>
                                <label className="block text-white/70 text-sm mb-2">Your Rating *</label>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onMouseEnter={() => setHovered(star)}
                                            onMouseLeave={() => setHovered(0)}
                                            onClick={() => setRating(star)}
                                            className="transition-transform hover:scale-110"
                                        >
                                            <Star
                                                size={32}
                                                className={
                                                    star <= (hovered || rating)
                                                        ? "text-yellow-400 fill-yellow-400"
                                                        : "text-white/20"
                                                }
                                            />
                                        </button>
                                    ))}
                                </div>
                                {rating > 0 && (
                                    <p className="text-yellow-400 text-xs mt-1">
                                        {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
                                    </p>
                                )}
                            </div>

                            {/* Comment */}
                            <div>
                                <label className="block text-white/70 text-sm mb-2">Your Experience *</label>
                                <textarea
                                    className="input-field min-h-28 resize-none"
                                    placeholder="Tell other customers about your experience at this venue..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    required
                                    minLength={20}
                                />
                                <p className="text-white/30 text-xs mt-1">{comment.length}/500 · Min 20 chars</p>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting || rating === 0}
                                className="btn-primary w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : "Submit Review"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
