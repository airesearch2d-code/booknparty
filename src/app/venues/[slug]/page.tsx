import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VenueGallery from "@/components/VenueGallery";
import EnquiryModal from "@/components/EnquiryModal";
import { MapPin, Users, Clock, Star, CheckCircle, ArrowLeft, Phone, Share2 } from "lucide-react";
import { formatCurrency, getVenueTypeLabel } from "@/lib/utils";
import Link from "next/link";

interface Props {
    params: Promise<{ slug: string }>;
}

async function getVenue(slug: string) {
    return prisma.venue.findUnique({
        where: { slug, isApproved: true, isActive: true },
        include: {
            owner: { select: { name: true, phone: true } },
            reviews: {
                include: { user: { select: { name: true, avatar: true } } },
                orderBy: { createdAt: "desc" },
                take: 6,
            },
            _count: { select: { bookings: true, reviews: true } },
        },
    });
}

export async function generateMetadata({ params }: Props) {
    const { slug } = await params;
    const venue = await getVenue(slug);
    if (!venue) return { title: "Venue Not Found" };
    return {
        title: `${venue.name} — BookNParty`,
        description: venue.description.slice(0, 160),
    };
}

export default async function VenueDetailPage({ params }: Props) {
    const { slug } = await params;
    const [venue, session] = await Promise.all([getVenue(slug), auth()]);
    if (!venue) notFound();

    const avgRating =
        venue.reviews.length > 0
            ? venue.reviews.reduce((s, r) => s + r.rating, 0) / venue.reviews.length
            : 0;

    const minTotal = venue.pricePerHour * venue.minBookingHours;

    return (
        <div className="min-h-screen">
            <Navbar session={session as any} />

            <div className="pt-20">
                {/* Image Gallery */}
                <VenueGallery images={venue.images} name={venue.name} />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* LEFT — Main Info */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Breadcrumb */}
                            <div className="flex items-center gap-2 text-white/40 text-sm">
                                <Link href="/venues" className="hover:text-white flex items-center gap-1 transition-colors">
                                    <ArrowLeft size={14} /> All Venues
                                </Link>
                                <span>/</span>
                                <span className="text-white/60">{venue.name}</span>
                            </div>

                            {/* Venue Header */}
                            <div>
                                <div className="flex items-start justify-between gap-4 flex-wrap">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="badge bg-purple-500/20 text-purple-300">{getVenueTypeLabel(venue.type)}</span>
                                            {avgRating > 0 && (
                                                <div className="flex items-center gap-1 text-yellow-400 text-sm">
                                                    <Star size={14} className="fill-yellow-400" />
                                                    <span className="font-semibold">{avgRating.toFixed(1)}</span>
                                                    <span className="text-white/40">({venue._count.reviews} reviews)</span>
                                                </div>
                                            )}
                                        </div>
                                        <h1 className="text-3xl md:text-4xl font-bold text-white">{venue.name}</h1>
                                        <div className="flex items-center gap-1.5 text-white/50 mt-2">
                                            <MapPin size={15} className="text-purple-400" />
                                            <span>{venue.address}, {venue.city}, {venue.state} — {venue.pincode}</span>
                                        </div>
                                    </div>
                                    <button className="btn-secondary p-2.5 rounded-xl" title="Share">
                                        <Share2 size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { icon: Users, label: "Max Capacity", value: `${venue.capacity} guests` },
                                    { icon: Clock, label: "Min Duration", value: `${venue.minBookingHours} hours` },
                                    { icon: CheckCircle, label: "Bookings Done", value: `${venue._count.bookings}+` },
                                ].map(({ icon: Icon, label, value }) => (
                                    <div key={label} className="glass-card rounded-xl p-4 text-center">
                                        <Icon size={20} className="text-purple-400 mx-auto mb-2" />
                                        <p className="text-white font-bold text-sm">{value}</p>
                                        <p className="text-white/40 text-xs mt-0.5">{label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Description */}
                            <div className="glass-card rounded-2xl p-6">
                                <h2 className="text-white font-bold text-xl mb-4">About This Venue</h2>
                                <p className="text-white/70 leading-relaxed whitespace-pre-line">{venue.description}</p>
                            </div>

                            {/* Amenities */}
                            {venue.amenities.length > 0 && (
                                <div className="glass-card rounded-2xl p-6">
                                    <h2 className="text-white font-bold text-xl mb-5">Amenities</h2>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {venue.amenities.map((amenity) => (
                                            <div key={amenity} className="flex items-center gap-2 text-white/70 text-sm">
                                                <CheckCircle size={15} className="text-green-400 flex-shrink-0" />
                                                {amenity}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Map */}
                            {venue.latitude && venue.longitude ? (
                                <div className="glass-card rounded-2xl overflow-hidden">
                                    <div className="p-4 border-b border-white/10">
                                        <h2 className="text-white font-bold text-xl flex items-center gap-2">
                                            <MapPin size={18} className="text-purple-400" /> Location
                                        </h2>
                                    </div>
                                    <div className="relative h-72">
                                        <iframe
                                            title="Venue Location"
                                            src={`https://www.google.com/maps?q=${venue.latitude},${venue.longitude}&z=15&output=embed`}
                                            className="w-full h-full border-0"
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                        />
                                    </div>
                                    <div className="p-4 flex items-center gap-2 text-white/50 text-sm">
                                        <MapPin size={14} className="text-purple-400" />
                                        {venue.address}, {venue.city}, {venue.state}
                                    </div>
                                </div>
                            ) : (
                                <div className="glass-card rounded-2xl p-6">
                                    <h2 className="text-white font-bold text-xl mb-2 flex items-center gap-2">
                                        <MapPin size={18} className="text-purple-400" /> Location
                                    </h2>
                                    <p className="text-white/50 text-sm">{venue.address}, {venue.city}, {venue.state} — {venue.pincode}</p>
                                </div>
                            )}

                            {/* Reviews */}
                            <div className="glass-card rounded-2xl p-6">
                                <h2 className="text-white font-bold text-xl mb-5">
                                    Reviews
                                    {avgRating > 0 && (
                                        <span className="ml-3 text-base font-normal text-yellow-400 flex items-center gap-1 inline-flex">
                                            <Star size={15} className="fill-yellow-400" />
                                            {avgRating.toFixed(1)} / 5
                                        </span>
                                    )}
                                </h2>
                                {venue.reviews.length === 0 ? (
                                    <p className="text-white/40 text-sm">No reviews yet. Be the first to book and review!</p>
                                ) : (
                                    <div className="space-y-4">
                                        {venue.reviews.map((review) => (
                                            <div key={review.id} className="flex gap-4 pb-4 border-b border-white/10 last:border-0">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
                                                    {review.user.name[0]?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-white text-sm font-semibold">{review.user.name}</span>
                                                        <div className="flex">
                                                            {Array.from({ length: 5 }).map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    size={12}
                                                                    className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-white/20"}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <p className="text-white/60 text-sm leading-relaxed">{review.comment}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT — Booking Card (Sticky) */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 space-y-4">
                                {/* Price Card */}
                                <div className="glass-card rounded-2xl p-6 neon-glow">
                                    <div className="mb-5">
                                        <p className="text-white/40 text-sm">Starting from</p>
                                        <p className="text-4xl font-bold text-white mt-1">
                                            {formatCurrency(venue.pricePerHour)}
                                            <span className="text-white/40 text-base font-normal">/hr</span>
                                        </p>
                                        <p className="text-white/40 text-xs mt-1">
                                            Min {venue.minBookingHours}h booking · {formatCurrency(minTotal)} total
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <Link
                                            href={`/venues/${venue.slug}/book`}
                                            className="btn-primary w-full py-3 rounded-xl text-base font-semibold justify-center"
                                        >
                                            🎉 Book Now
                                        </Link>
                                        <EnquiryModal venue={{ id: venue.id, name: venue.name }} session={session as any} />
                                    </div>

                                    <div className="mt-5 pt-5 border-t border-white/10 space-y-2 text-xs text-white/40">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle size={12} className="text-green-400" /> Free cancellation within 24 hrs
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle size={12} className="text-green-400" /> Instant booking confirmation
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle size={12} className="text-green-400" /> Secure Razorpay payments
                                        </div>
                                    </div>
                                </div>

                                {/* Owner Contact */}
                                <div className="glass-card rounded-2xl p-5">
                                    <p className="text-white/50 text-xs mb-3 font-medium uppercase tracking-wider">Listed by</p>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center font-bold text-white">
                                            {venue.owner.name[0]?.toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-white font-semibold text-sm">{venue.owner.name}</p>
                                            <p className="text-white/40 text-xs">Venue Owner</p>
                                        </div>
                                    </div>
                                    {venue.owner.phone && (
                                        <a
                                            href={`tel:${venue.owner.phone}`}
                                            className="btn-secondary w-full py-2.5 rounded-xl text-sm justify-center flex items-center gap-2"
                                        >
                                            <Phone size={14} /> Call Owner
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
