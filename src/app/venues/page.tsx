"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VenueCard from "@/components/VenueCard";
import { SlidersHorizontal, Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { venueCategories } from "@/lib/utils";

const cities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune", "Kolkata", "Jaipur", "Ahmedabad", "Surat"];
const capacities = [
    { label: "Any Capacity", value: 0 },
    { label: "Up to 50", value: 50 },
    { label: "Up to 100", value: 100 },
    { label: "Up to 200", value: 200 },
    { label: "Up to 500", value: 500 },
    { label: "500+", value: 501 },
];

function VenuesContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [venues, setVenues] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);

    const [city, setCity] = useState(searchParams.get("city") || "");
    const [type, setType] = useState(searchParams.get("type") || "");
    const [capacity, setCapacity] = useState(0);
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(500000);
    const [page, setPage] = useState(1);

    useEffect(() => {
        fetchVenues();
    }, [city, type, capacity, page]);

    const fetchVenues = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                ...(city && { city }),
                ...(type && { type }),
                ...(capacity > 0 && { capacity: String(capacity) }),
                minPrice: String(minPrice),
                maxPrice: String(maxPrice),
                page: String(page),
            });
            const res = await fetch(`/api/venues?${params}`);
            const data = await res.json();
            setVenues(data.venues || []);
            setTotal(data.total || 0);
            setPages(data.pages || 1);
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setCity(""); setType(""); setCapacity(0); setMinPrice(0); setMaxPrice(500000); setPage(1);
    };

    const hasFilters = city || type || capacity > 0;

    return (
        <div className="min-h-screen">
            <Navbar />
            <div className="pt-24 pb-20 max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Explore <span className="gradient-text">Venues</span>
                    </h1>
                    <p className="text-white/50 text-sm">
                        {loading ? "Searching..." : `${total} venues found`}
                        {city && ` in ${city}`}
                        {type && ` · ${venueCategories.find(c => c.id === type)?.label || type}`}
                    </p>
                </div>

                {/* Search Bar */}
                <div className="glass-card rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-3">
                    <select className="input-field flex-1" value={city} onChange={(e) => { setCity(e.target.value); setPage(1); }}>
                        <option value="">All Cities</option>
                        {cities.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select className="input-field flex-1" value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}>
                        <option value="">All Venue Types</option>
                        {venueCategories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                    </select>
                    <select className="input-field flex-1" value={capacity} onChange={(e) => { setCapacity(parseInt(e.target.value)); setPage(1); }}>
                        {capacities.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                    <button onClick={fetchVenues} className="btn-primary px-6 py-2.5 rounded-xl flex items-center gap-2 whitespace-nowrap">
                        <Search size={16} /> Search
                    </button>
                    {hasFilters && (
                        <button onClick={clearFilters} className="btn-secondary px-4 py-2.5 rounded-xl flex items-center gap-2">
                            <X size={16} /> Clear
                        </button>
                    )}
                </div>

                {/* Category Pills */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
                    <button
                        onClick={() => setType("")}
                        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${!type ? "bg-purple-500 text-white" : "glass-card text-white/60 hover:text-white"}`}
                    >
                        All
                    </button>
                    {venueCategories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => { setType(cat.id); setPage(1); }}
                            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${type === cat.id ? "bg-purple-500 text-white" : "glass-card text-white/60 hover:text-white"}`}
                        >
                            {cat.icon} {cat.label}
                        </button>
                    ))}
                </div>

                {/* Venues Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="glass-card rounded-2xl overflow-hidden animate-pulse">
                                <div className="h-52 bg-white/5" />
                                <div className="p-4 space-y-3">
                                    <div className="h-4 bg-white/5 rounded w-3/4" />
                                    <div className="h-3 bg-white/5 rounded w-1/2" />
                                    <div className="h-8 bg-white/5 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : venues.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {venues.map(venue => <VenueCard key={venue.id} venue={venue} />)}
                        </div>

                        {/* Pagination */}
                        {pages > 1 && (
                            <div className="flex items-center justify-center gap-3 mt-12">
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary p-2 rounded-lg disabled:opacity-40">
                                    <ChevronLeft size={18} />
                                </button>
                                <span className="text-white/60 text-sm">Page {page} of {pages}</span>
                                <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="btn-secondary p-2 rounded-lg disabled:opacity-40">
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-24 glass-card rounded-2xl">
                        <p className="text-5xl mb-4">🔍</p>
                        <p className="text-white font-bold text-xl mb-2">No venues found</p>
                        <p className="text-white/50 text-sm mb-6">Try adjusting your filters or search a different city</p>
                        <button onClick={clearFilters} className="btn-primary px-8 py-2.5 rounded-xl">Clear Filters</button>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}

export default function VenuesPage() {
    return <Suspense><VenuesContent /></Suspense>;
}
