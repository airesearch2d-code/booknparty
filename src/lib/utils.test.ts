import { describe, expect, it } from "vitest";
import { cn, formatCurrency, formatDate, generateSlug, getVenueTypeLabel } from "./utils";

describe("cn", () => {
    it("merges class names and resolves tailwind conflicts", () => {
        expect(cn("px-2", "px-4")).toBe("px-4");
        expect(cn("text-white", false && "text-black", "font-bold")).toBe("text-white font-bold");
    });
});

describe("formatCurrency", () => {
    it("formats a number as INR currency with no decimal places", () => {
        expect(formatCurrency(1000)).toBe("₹1,000");
        expect(formatCurrency(0)).toBe("₹0");
        expect(formatCurrency(1500000)).toBe("₹15,00,000");
    });
});

describe("formatDate", () => {
    it("formats a date string as 'D Month YYYY'", () => {
        expect(formatDate("2025-01-15")).toBe("15 January 2025");
    });

    it("formats a Date object the same way", () => {
        expect(formatDate(new Date("2025-12-25"))).toBe("25 December 2025");
    });
});

describe("generateSlug", () => {
    it("lowercases and hyphenates a name", () => {
        expect(generateSlug("Grand Ballroom Hotel")).toBe("grand-ballroom-hotel");
    });

    it("strips non-alphanumeric characters", () => {
        expect(generateSlug("Sunset Villa & Gardens!")).toBe("sunset-villa-gardens");
    });

    it("trims leading and trailing hyphens", () => {
        expect(generateSlug("  Rooftop Lounge  ")).toBe("rooftop-lounge");
    });
});

describe("getVenueTypeLabel", () => {
    it("returns the human readable label for a known type", () => {
        expect(getVenueTypeLabel("BANQUET_HALL")).toBe("Banquet Hall");
        expect(getVenueTypeLabel("ROOFTOP")).toBe("Rooftop");
    });

    it("returns the raw value for an unknown type", () => {
        expect(getVenueTypeLabel("UNKNOWN_TYPE")).toBe("UNKNOWN_TYPE");
    });
});
