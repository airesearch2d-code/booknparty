"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Upload, X, Plus, ArrowLeft, Loader2, Save } from "lucide-react";
import toast from "react-hot-toast";
import { venueCategories, amenitiesList } from "@/lib/utils";
import Link from "next/link";

interface Props {
    id: string;
}

export default function EditVenueForm({ id }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
    const [imageUrls, setImageUrls] = useState<string[]>([""]);
    const [form, setForm] = useState({
        name: "", description: "", type: "BANQUET_HALL", capacity: "",
        pricePerHour: "", minBookingHours: "2", address: "", city: "",
        state: "", pincode: "", latitude: "", longitude: "",
    });

    useEffect(() => {
        fetch(`/api/venues/${id}`)
            .then(r => r.json())
            .then(data => {
                if (!data.venue) { toast.error("Venue not found"); router.push("/dashboard/owner/venues"); return; }
                const v = data.venue;
                setForm({
                    name: v.name, description: v.description, type: v.type,
                    capacity: String(v.capacity), pricePerHour: String(v.pricePerHour),
                    minBookingHours: String(v.minBookingHours), address: v.address,
                    city: v.city, state: v.state, pincode: v.pincode,
                    latitude: v.latitude ? String(v.latitude) : "",
                    longitude: v.longitude ? String(v.longitude) : "",
                });
                setSelectedAmenities(v.amenities || []);
                setImageUrls(v.images?.length ? v.images : [""]);
            })
            .finally(() => setFetching(false));
    }, [id, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    };

    const toggleAmenity = (amenity: string) => {
        setSelectedAmenities(prev =>
            prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const validImages = imageUrls.filter(u => u.trim());
        try {
            const res = await fetch(`/api/venues/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    capacity: parseInt(form.capacity),
                    pricePerHour: parseFloat(form.pricePerHour),
                    minBookingHours: parseInt(form.minBookingHours),
                    latitude: form.latitude ? parseFloat(form.latitude) : null,
                    longitude: form.longitude ? parseFloat(form.longitude) : null,
                    images: validImages,
                    amenities: selectedAmenities,
                    highlights: [],
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success("Venue updated! Re-submitted for approval.");
            router.push("/dashboard/owner/venues");
        } catch (err: any) {
            toast.error(err.message || "Failed to update venue");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 size={36} className="animate-spin text-purple-400" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-8">
                <Link href="/dashboard/owner/venues" className="p-2 rounded-lg glass-card hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                    <ArrowLeft size={18} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-white">Edit Venue</h1>
                    <p className="text-white/50 text-sm">Changes will re-submit for admin approval</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="glass-card rounded-2xl p-6 space-y-4">
                    <h2 className="text-white font-semibold text-lg">Basic Information</h2>
                    <div>
                        <label className="block text-white/70 text-sm mb-1.5">Venue Name *</label>
                        <input name="name" className="input-field" placeholder="e.g. The Grand Terrace" value={form.name} onChange={handleChange} required />
                    </div>
                    <div>
                        <label className="block text-white/70 text-sm mb-1.5">Venue Type *</label>
                        <select name="type" className="input-field" value={form.type} onChange={handleChange} required>
                            {venueCategories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-white/70 text-sm mb-1.5">Description *</label>
                        <textarea name="description" className="input-field min-h-28 resize-none" placeholder="Describe your venue..." value={form.description} onChange={handleChange} required />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-white/70 text-sm mb-1.5">Capacity *</label>
                            <input name="capacity" type="number" className="input-field" placeholder="100" value={form.capacity} onChange={handleChange} required min={1} />
                        </div>
                        <div>
                            <label className="block text-white/70 text-sm mb-1.5">Price/Hour (₹) *</label>
                            <input name="pricePerHour" type="number" className="input-field" placeholder="5000" value={form.pricePerHour} onChange={handleChange} required min={0} />
                        </div>
                        <div>
                            <label className="block text-white/70 text-sm mb-1.5">Min Hours</label>
                            <input name="minBookingHours" type="number" className="input-field" placeholder="2" value={form.minBookingHours} onChange={handleChange} min={1} />
                        </div>
                    </div>
                </div>

                {/* Location */}
                <div className="glass-card rounded-2xl p-6 space-y-4">
                    <h2 className="text-white font-semibold text-lg flex items-center gap-2"><MapPin size={18} className="text-purple-400" /> Location</h2>
                    <div>
                        <label className="block text-white/70 text-sm mb-1.5">Street Address *</label>
                        <input name="address" className="input-field" placeholder="123 Main Street" value={form.address} onChange={handleChange} required />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-white/70 text-sm mb-1.5">City *</label>
                            <input name="city" className="input-field" placeholder="Mumbai" value={form.city} onChange={handleChange} required />
                        </div>
                        <div>
                            <label className="block text-white/70 text-sm mb-1.5">State *</label>
                            <input name="state" className="input-field" placeholder="Maharashtra" value={form.state} onChange={handleChange} required />
                        </div>
                        <div>
                            <label className="block text-white/70 text-sm mb-1.5">Pincode *</label>
                            <input name="pincode" className="input-field" placeholder="400001" value={form.pincode} onChange={handleChange} required />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-white/70 text-sm mb-1.5">Latitude (optional)</label>
                            <input name="latitude" type="number" step="any" className="input-field" placeholder="19.0760" value={form.latitude} onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-white/70 text-sm mb-1.5">Longitude (optional)</label>
                            <input name="longitude" type="number" step="any" className="input-field" placeholder="72.8777" value={form.longitude} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                {/* Images */}
                <div className="glass-card rounded-2xl p-6 space-y-4">
                    <h2 className="text-white font-semibold text-lg flex items-center gap-2"><Upload size={18} className="text-purple-400" /> Images</h2>
                    <p className="text-white/40 text-xs">Paste image URLs (Cloudinary, Unsplash, etc.)</p>
                    {imageUrls.map((url, i) => (
                        <div key={i} className="flex gap-2">
                            <input
                                className="input-field flex-1"
                                placeholder={`Image URL ${i + 1}`}
                                value={url}
                                onChange={(e) => {
                                    const next = [...imageUrls];
                                    next[i] = e.target.value;
                                    setImageUrls(next);
                                }}
                            />
                            {imageUrls.length > 1 && (
                                <button type="button" onClick={() => setImageUrls(prev => prev.filter((_, j) => j !== i))} className="p-2.5 rounded-lg glass-card text-red-400 hover:bg-red-500/10">
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    ))}
                    {imageUrls.length < 8 && (
                        <button type="button" onClick={() => setImageUrls(prev => [...prev, ""])} className="btn-secondary text-sm py-2 px-4 rounded-lg flex items-center gap-2">
                            <Plus size={14} /> Add Image URL
                        </button>
                    )}
                </div>

                {/* Amenities */}
                <div className="glass-card rounded-2xl p-6">
                    <h2 className="text-white font-semibold text-lg mb-4">Amenities</h2>
                    <div className="flex flex-wrap gap-2">
                        {amenitiesList.map(amenity => (
                            <button
                                key={amenity}
                                type="button"
                                onClick={() => toggleAmenity(amenity)}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${selectedAmenities.includes(amenity) ? "bg-purple-500 text-white" : "glass-card text-white/60 hover:text-white"}`}
                            >
                                {amenity}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Submit */}
                <div className="flex gap-4">
                    <Link href="/dashboard/owner/venues" className="btn-secondary px-8 py-3 rounded-xl flex-1 text-center">
                        Cancel
                    </Link>
                    <button type="submit" disabled={loading} className="btn-primary px-8 py-3 rounded-xl flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
                        {loading ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : <><Save size={18} /> Save Changes</>}
                    </button>
                </div>
            </form>
        </div>
    );
}
