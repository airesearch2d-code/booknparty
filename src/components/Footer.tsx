import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";

const venueTypes = [
    "Banquet Halls", "Rooftop Venues", "Farmhouses",
    "Restaurants", "Night Clubs", "Conference Rooms",
    "Outdoor Spaces", "Villas",
];

const quickLinks = [
    { label: "Explore Venues", href: "/venues" },
    { label: "List Your Venue", href: "/register" },
    { label: "About Us", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
];

const socials = [
    { emoji: "📸", label: "Instagram", href: "#" },
    { emoji: "🐦", label: "Twitter", href: "#" },
    { emoji: "👥", label: "Facebook", href: "#" },
    { emoji: "▶️", label: "YouTube", href: "#" },
];

export default function Footer() {
    return (
        <footer style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: "0" }}>
            <div className="section-container" style={{ paddingTop: "64px", paddingBottom: "40px" }}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

                    {/* ── Brand ─────────────────────────────────── */}
                    <div>
                        <Link href="/" className="flex items-center gap-2 mb-5">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm leading-none">
                                🎉
                            </div>
                            <span className="font-bold text-lg text-white tracking-tight">
                                Book<span className="gradient-text">N</span>Party
                            </span>
                        </Link>
                        <p style={{ color: "rgba(255,255,255,0.44)", fontSize: "0.875rem", lineHeight: 1.65, marginBottom: "20px" }}>
                            India's premier platform to discover and book extraordinary venues for
                            every celebration — from intimate gatherings to grand corporate events.
                        </p>
                        <div className="flex gap-2.5">
                            {socials.map(({ emoji, label, href }) => (
                                <a key={label} href={href} aria-label={label}
                                    className="w-9 h-9 rounded-full glass-card flex items-center justify-center text-sm hover:scale-110 transition-transform"
                                    style={{ border: "1px solid rgba(255,255,255,0.12)" }}>
                                    {emoji}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* ── Venue Types ───────────────────────────── */}
                    <div>
                        <h4 className="font-semibold text-white mb-5" style={{ fontSize: "0.95rem" }}>
                            Venue Types
                        </h4>
                        <ul className="space-y-2.5">
                            {venueTypes.map((v) => (
                                <li key={v}>
                                    <Link
                                        href={`/venues?type=${v.toUpperCase().replace(/ /g, "_")}`}
                                        style={{ color: "rgba(255,255,255,0.44)", fontSize: "0.875rem", textDecoration: "none" }}
                                        className="hover:text-white transition-colors"
                                    >
                                        {v}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* ── Quick Links ───────────────────────────── */}
                    <div>
                        <h4 className="font-semibold text-white mb-5" style={{ fontSize: "0.95rem" }}>
                            Quick Links
                        </h4>
                        <ul className="space-y-2.5">
                            {quickLinks.map(({ label, href }) => (
                                <li key={label}>
                                    <Link
                                        href={href}
                                        style={{ color: "rgba(255,255,255,0.44)", fontSize: "0.875rem", textDecoration: "none" }}
                                        className="hover:text-white transition-colors"
                                    >
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* ── Contact ───────────────────────────────── */}
                    <div>
                        <h4 className="font-semibold text-white mb-5" style={{ fontSize: "0.95rem" }}>
                            Contact Us
                        </h4>
                        <ul className="space-y-3">
                            <li className="flex gap-2.5">
                                <MapPin size={15} style={{ color: "#a855f7", flexShrink: 0, marginTop: "2px" }} />
                                <span style={{ color: "rgba(255,255,255,0.44)", fontSize: "0.85rem", lineHeight: 1.5 }}>
                                    123 Party Street, Mumbai, Maharashtra 400001
                                </span>
                            </li>
                            <li className="flex gap-2.5 items-center">
                                <Phone size={15} style={{ color: "#a855f7", flexShrink: 0 }} />
                                <a href="tel:+919876543210"
                                    style={{ color: "rgba(255,255,255,0.44)", fontSize: "0.85rem", textDecoration: "none" }}
                                    className="hover:text-white transition-colors">
                                    +91 98765 43210
                                </a>
                            </li>
                            <li className="flex gap-2.5 items-center">
                                <Mail size={15} style={{ color: "#a855f7", flexShrink: 0 }} />
                                <a href="mailto:hello@booknparty.in"
                                    style={{ color: "rgba(255,255,255,0.44)", fontSize: "0.85rem", textDecoration: "none" }}
                                    className="hover:text-white transition-colors">
                                    hello@booknparty.in
                                </a>
                            </li>
                        </ul>

                        {/* CTA mini card */}
                        <div className="mt-6 glass-card rounded-xl p-4"
                            style={{ border: "1px solid rgba(168,85,247,0.22)" }}>
                            <p className="text-white font-semibold text-xs mb-1">🎉 List Your Venue Free</p>
                            <p style={{ color: "rgba(255,255,255,0.38)", fontSize: "0.75rem", marginBottom: "12px" }}>
                                Join 500+ venues earning with BookNParty
                            </p>
                            <Link href="/register?role=OWNER"
                                className="btn-primary text-xs w-full py-2 rounded-lg"
                                style={{ display: "flex", justifyContent: "center" }}>
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div style={{
                    borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: "40px", paddingTop: "24px",
                    display: "flex", flexDirection: "column", gap: "8px",
                    alignItems: "center", justifyContent: "space-between",
                    color: "rgba(255,255,255,0.28)", fontSize: "0.78rem"
                }}
                    className="sm:flex-row">
                    <p>© {new Date().getFullYear()} BookNParty. All rights reserved.</p>
                    <p>Made with ❤️ in India</p>
                </div>
            </div>
        </footer>
    );
}
