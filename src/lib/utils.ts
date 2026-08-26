import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount);
}

export function formatDate(date: Date | string): string {
    return new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date(date));
}

export function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

export function getVenueTypeLabel(type: string): string {
    const labels: Record<string, string> = {
        BANQUET_HALL: "Banquet Hall",
        ROOFTOP: "Rooftop",
        FARMHOUSE: "Farmhouse",
        RESTAURANT: "Restaurant",
        CLUB: "Club",
        CONFERENCE_ROOM: "Conference Room",
        OUTDOOR: "Outdoor",
        VILLA: "Villa",
        OTHER: "Other",
    };
    return labels[type] || type;
}

export const venueCategories = [
    { id: "BANQUET_HALL", label: "Banquet Hall", icon: "🏛️", color: "from-purple-500 to-purple-700" },
    { id: "ROOFTOP", label: "Rooftop", icon: "🌃", color: "from-blue-500 to-blue-700" },
    { id: "FARMHOUSE", label: "Farmhouse", icon: "🌿", color: "from-green-500 to-green-700" },
    { id: "RESTAURANT", label: "Restaurant", icon: "🍽️", color: "from-orange-500 to-orange-700" },
    { id: "CLUB", label: "Night Club", icon: "🎵", color: "from-pink-500 to-pink-700" },
    { id: "CONFERENCE_ROOM", label: "Conference Room", icon: "💼", color: "from-gray-500 to-gray-700" },
    { id: "OUTDOOR", label: "Outdoor", icon: "⛺", color: "from-teal-500 to-teal-700" },
    { id: "VILLA", label: "Villa", icon: "🏡", color: "from-yellow-500 to-yellow-700" },
];

export const amenitiesList = [
    "Parking",
    "AC",
    "WiFi",
    "Catering",
    "DJ System",
    "Projector",
    "Stage",
    "Dance Floor",
    "Swimming Pool",
    "Bar",
    "Valet Parking",
    "CCTV",
    "Generator",
    "Changing Room",
    "Outdoor Space",
    "Lift",
];
