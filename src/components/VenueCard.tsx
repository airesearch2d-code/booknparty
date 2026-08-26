import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, Users, Clock } from "lucide-react";
import { formatCurrency, getVenueTypeLabel } from "@/lib/utils";

interface VenueCardProps {
    venue: {
        id: string;
        slug: string;
        name: string;
        type: string;
        city: string;
        state: string;
        images: string[];
        pricePerHour: number;
        capacity: number;
        minBookingHours: number;
        reviews?: { rating: number }[];
    };
}

export default function VenueCard({ venue }: VenueCardProps) {
    const avgRating =
        venue.reviews && venue.reviews.length > 0
            ? venue.reviews.reduce((sum, r) => sum + r.rating, 0) / venue.reviews.length
            : 0;

    const coverImage = venue.images?.[0] || "/placeholder-venue.jpg";

    return (
        <Link href={`/venues/${venue.slug}`} className="block venue-card group">
            <div className="glass-card rounded-2xl overflow-hidden">
                {/* Image */}
                <div className="relative h-52 overflow-hidden">
                    <img
                        src={coverImage}
                        alt={venue.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src =
                                "https://images.unsplash.com/photo-1519167758481-83f29db6db22?w=600&q=80";
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    {/* Type badge */}
                    <div className="absolute top-3 left-3">
                        <span className="badge bg-purple-500/80 text-white backdrop-blur-sm">
                            {getVenueTypeLabel(venue.type)}
                        </span>
                    </div>

                    {/* Rating */}
                    {avgRating > 0 && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
                            <Star size={12} className="fill-yellow-400 text-yellow-400" />
                            <span className="text-white text-xs font-semibold">{avgRating.toFixed(1)}</span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4">
                    <h3 className="font-bold text-white text-lg mb-1 line-clamp-1 group-hover:text-purple-300 transition-colors">
                        {venue.name}
                    </h3>

                    <div className="flex items-center gap-1 text-white/50 text-sm mb-3">
                        <MapPin size={13} />
                        <span>{venue.city}, {venue.state}</span>
                    </div>

                    <div className="flex items-center gap-4 text-white/40 text-xs mb-4">
                        <div className="flex items-center gap-1">
                            <Users size={12} />
                            <span>Up to {venue.capacity}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock size={12} />
                            <span>Min {venue.minBookingHours}h</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/10 pt-3">
                        <div>
                            <p className="text-white/40 text-xs">Starting from</p>
                            <p className="text-white font-bold text-lg">
                                {formatCurrency(venue.pricePerHour)}
                                <span className="text-white/40 text-xs font-normal">/hr</span>
                            </p>
                        </div>
                        <span className="btn-primary text-xs py-1.5 px-4 rounded-lg">
                            View Details
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
