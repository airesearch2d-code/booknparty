"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";

interface VenueGalleryProps {
    images: string[];
    name: string;
}

const FALLBACK = "https://images.unsplash.com/photo-1519167758481-83f29db6db22?w=1200&q=80";

export default function VenueGallery({ images, name }: VenueGalleryProps) {
    const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
    const imgs = images.length > 0 ? images : [FALLBACK];

    const prev = () => setLightboxIdx((i) => (i !== null ? (i - 1 + imgs.length) % imgs.length : 0));
    const next = () => setLightboxIdx((i) => (i !== null ? (i + 1) % imgs.length : 0));

    const handleKey = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowLeft") prev();
        if (e.key === "ArrowRight") next();
        if (e.key === "Escape") setLightboxIdx(null);
    };

    return (
        <>
            {/* Gallery Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
                {imgs.length === 1 ? (
                    <div
                        className="relative h-[420px] rounded-2xl overflow-hidden cursor-zoom-in"
                        onClick={() => setLightboxIdx(0)}
                    >
                        <img src={imgs[0]} alt={name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        <div className="absolute bottom-4 right-4 glass-card rounded-lg px-3 py-1.5 flex items-center gap-1.5 text-white text-xs">
                            <ZoomIn size={13} /> View Photo
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-4 gap-2 h-[420px] rounded-2xl overflow-hidden">
                        {/* Main large image */}
                        <div className="col-span-2 row-span-2 relative cursor-zoom-in group" onClick={() => setLightboxIdx(0)}>
                            <img src={imgs[0]} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        {/* Thumbnails */}
                        {imgs.slice(1, 5).map((img, i) => (
                            <div
                                key={i}
                                className="relative cursor-zoom-in group overflow-hidden"
                                onClick={() => setLightboxIdx(i + 1)}
                            >
                                <img src={img} alt={`${name} ${i + 2}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                {i === 3 && imgs.length > 5 && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                        <span className="text-white font-bold text-xl">+{imgs.length - 5}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {imgs.length > 1 && (
                    <p className="text-white/40 text-xs mt-2 text-right flex items-center justify-end gap-1">
                        <ZoomIn size={12} /> Click any photo to view full gallery
                    </p>
                )}
            </div>

            {/* Lightbox */}
            {lightboxIdx !== null && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
                    onClick={() => setLightboxIdx(null)}
                    onKeyDown={handleKey}
                    tabIndex={0}
                >
                    <button
                        className="absolute top-4 right-4 p-2 glass-card rounded-full text-white hover:bg-white/20 transition-colors"
                        onClick={() => setLightboxIdx(null)}
                    >
                        <X size={20} />
                    </button>

                    <button
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 glass-card rounded-full text-white hover:bg-white/20 transition-colors z-10"
                        onClick={(e) => { e.stopPropagation(); prev(); }}
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <div
                        className="max-w-5xl max-h-[85vh] mx-16 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={imgs[lightboxIdx]}
                            alt={`${name} ${lightboxIdx + 1}`}
                            className="max-h-[85vh] max-w-full object-contain rounded-xl"
                        />
                    </div>

                    <button
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 glass-card rounded-full text-white hover:bg-white/20 transition-colors z-10"
                        onClick={(e) => { e.stopPropagation(); next(); }}
                    >
                        <ChevronRight size={24} />
                    </button>

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                        {imgs.map((_, i) => (
                            <button
                                key={i}
                                onClick={(e) => { e.stopPropagation(); setLightboxIdx(i); }}
                                className={`h-1.5 rounded-full transition-all ${i === lightboxIdx ? "w-6 bg-purple-400" : "w-1.5 bg-white/40 hover:bg-white/70"}`}
                            />
                        ))}
                    </div>
                    <p className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/40 text-xs">
                        {lightboxIdx + 1} / {imgs.length}
                    </p>
                </div>
            )}
        </>
    );
}
