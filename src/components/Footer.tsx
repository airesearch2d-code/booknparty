import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
    return (
        <footer className="border-t border-white/10 mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {/* Brand */}
                    <div>
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm">🎉</div>
                            <span className="font-bold text-xl text-white">Book<span className="gradient-text">N</span>Party</span>
                        </Link>
                        <p className="text-white/50 text-sm leading-relaxed mb-4">
                            India's premier platform to discover and book extraordinary venues for every celebration — from intimate gatherings to grand corporate events.
                        </p>
                        <div className="flex gap-3">
                            {[
                                { emoji: "📸", label: "Instagram" },
                                { emoji: "🐦", label: "Twitter" },
                                { emoji: "👥", label: "Facebook" },
                                { emoji: "▶️", label: "YouTube" },
                            ].map(({ emoji, label }) => (
                                <a key={label} href="#" aria-label={label} className="w-8 h-8 rounded-full glass-card flex items-center justify-center text-sm hover:scale-110 transition-transform">
                                    {emoji}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Venue Types */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Venue Types</h4>
                        <ul className="space-y-2 text-sm text-white/50">
                            {["Banquet Halls", "Rooftop Venues", "Farmhouses", "Restaurants", "Night Clubs", "Conference Rooms", "Outdoor Spaces", "Villas"].map((v) => (
                                <li key={v}>
                                    <Link href={`/venues?type=${v.toUpperCase().replace(/ /g, "_")}`} className="hover:text-white transition-colors">
                                        {v}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-sm text-white/50">
                            {[
                                { label: "Explore Venues", href: "/venues" },
                                { label: "List Your Venue", href: "/register" },
                                { label: "About Us", href: "/about" },
                                { label: "Blog", href: "/blog" },
                                { label: "Contact", href: "/contact" },
                                { label: "Privacy Policy", href: "/privacy" },
                                { label: "Terms of Service", href: "/terms" },
                            ].map(({ label, href }) => (
                                <li key={label}>
                                    <Link href={href} className="hover:text-white transition-colors">{label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Contact Us</h4>
                        <ul className="space-y-3 text-sm text-white/50">
                            <li className="flex gap-2">
                                <MapPin size={15} className="text-purple-400 mt-0.5 flex-shrink-0" />
                                <span>123 Party Street, Mumbai, Maharashtra 400001</span>
                            </li>
                            <li className="flex gap-2">
                                <Phone size={15} className="text-purple-400 flex-shrink-0" />
                                <a href="tel:+919876543210" className="hover:text-white">+91 98765 43210</a>
                            </li>
                            <li className="flex gap-2">
                                <Mail size={15} className="text-purple-400 flex-shrink-0" />
                                <a href="mailto:hello@booknparty.in" className="hover:text-white">hello@booknparty.in</a>
                            </li>
                        </ul>
                        <div className="mt-6 glass-card rounded-xl p-4">
                            <p className="text-white/70 text-xs font-medium mb-2">🎉 List Your Venue Free</p>
                            <p className="text-white/40 text-xs mb-3">Join 500+ venues earning with BookNParty</p>
                            <Link href="/register?role=OWNER" className="btn-primary text-xs w-full text-center block py-2 rounded-lg">
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-white/30 text-xs">
                    <p>© {new Date().getFullYear()} BookNParty. All rights reserved.</p>
                    <p>Made with ❤️ in India</p>
                </div>
            </div>
        </footer>
    );
}
