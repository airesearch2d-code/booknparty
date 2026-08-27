import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VenueCard from "@/components/VenueCard";
import {
  Search, MapPin, ChevronRight,
  Star, Shield, CreditCard, Headphones, PartyPopper,
} from "lucide-react";
import { venueCategories } from "@/lib/utils";

async function getFeaturedVenues() {
  try {
    return await prisma.venue.findMany({
      where: { isApproved: true, isActive: true },
      include: { reviews: { select: { rating: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    });
  } catch {
    return [];
  }
}

const cities = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad",
  "Chennai", "Pune", "Kolkata", "Jaipur",
];

const eventTypes = [
  { icon: "🎂", label: "Birthday Party" },
  { icon: "💍", label: "Wedding" },
  { icon: "💼", label: "Corporate Event" },
  { icon: "🎓", label: "Graduation" },
  { icon: "🎊", label: "Anniversary" },
  { icon: "🥂", label: "Cocktail Party" },
  { icon: "🎸", label: "Concert" },
  { icon: "👶", label: "Baby Shower" },
];

const stats = [
  { number: "2,500+", label: "Venues Listed" },
  { number: "50,000+", label: "Happy Customers" },
  { number: "120+", label: "Cities Covered" },
  { number: "4.8★", label: "Average Rating" },
];

const howItWorks = [
  {
    step: "01", icon: "🔍",
    title: "Search & Discover",
    desc: "Browse venues by city, type, or event. Filter by capacity, price, and amenities.",
  },
  {
    step: "02", icon: "📅",
    title: "Check Availability",
    desc: "View venue details, photos, and pricing. Check date availability in real-time.",
  },
  {
    step: "03", icon: "💳",
    title: "Book & Pay Securely",
    desc: "Book instantly or send an enquiry. Pay safely with Razorpay — all modes accepted.",
  },
  {
    step: "04", icon: "🎉",
    title: "Celebrate!",
    desc: "Arrive at your confirmed venue and create unforgettable memories.",
  },
];

const whyUs = [
  {
    icon: <Shield size={26} className="text-purple-400" />,
    title: "Verified Venues",
    desc: "Every venue is personally verified by our team for quality, safety, and accuracy.",
    color: "rgba(168,85,247,0.12)",
    borderColor: "rgba(168,85,247,0.25)",
  },
  {
    icon: <CreditCard size={26} className="text-pink-400" />,
    title: "Secure Payments",
    desc: "Pay via Razorpay. UPI, cards, net banking — all payment modes supported.",
    color: "rgba(236,72,153,0.10)",
    borderColor: "rgba(236,72,153,0.22)",
  },
  {
    icon: <Headphones size={26} className="text-blue-400" />,
    title: "24/7 Support",
    desc: "Our dedicated team is available round the clock to assist with your booking.",
    color: "rgba(96,165,250,0.10)",
    borderColor: "rgba(96,165,250,0.22)",
  },
];

export default async function HomePage() {
  const session = await auth();
  const featuredVenues = await getFeaturedVenues();

  return (
    <div className="min-h-screen">
      <Navbar session={session as any} />

      {/* ══════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════ */}
      <section className="relative flex items-center justify-center overflow-hidden"
        style={{ minHeight: "calc(100vh - 0px)", paddingTop: "96px", paddingBottom: "80px" }}>
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/35 via-transparent to-pink-900/25" />
          <div className="absolute top-24 left-8 w-80 h-80 bg-purple-600/18 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-16 right-8 w-72 h-72 bg-pink-600/18 rounded-full blur-3xl animate-float"
            style={{ animationDelay: "2.5s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[560px] bg-indigo-600/8 rounded-full blur-3xl" />
        </div>

        <div className="section-container relative z-10 text-center">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-2 mb-8 text-sm"
            style={{ color: "#c084fc", border: "1px solid rgba(168,85,247,0.30)" }}>
            <PartyPopper size={14} />
            <span>India's #1 Party Venue Booking Platform</span>
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: "clamp(2rem, 5.5vw, 3.6rem)", fontWeight: 900, lineHeight: 1.08, letterSpacing: "-0.03em" }}
            className="text-white mb-5">
            Find Your Perfect{" "}
            <span className="gradient-text">Party Venue</span>
            <br />
            For Every Occasion
          </h1>

          <p className="mb-10 max-w-xl mx-auto"
            style={{ color: "rgba(255,255,255,0.58)", fontSize: "1.05rem", lineHeight: 1.65 }}>
            Discover and book extraordinary venues for birthdays, weddings,&nbsp;
            corporate events, and more — 2,500+ venues across 120+ cities.
          </p>

          {/* ── Search box ── */}
          <div className="glass-card rounded-2xl p-3 max-w-2xl mx-auto neon-glow"
            style={{ border: "1px solid rgba(168,85,247,0.22)" }}>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="flex-1 relative">
                <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "#a855f7" }} />
                <select className="input-field pl-9">
                  <option value="">Select City</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "#a855f7" }} />
                <select className="input-field pl-9">
                  <option value="">Event Type</option>
                  {eventTypes.map((e) => (
                    <option key={e.label} value={e.label}>{e.icon} {e.label}</option>
                  ))}
                </select>
              </div>
              <Link href="/venues" className="btn-primary px-6 py-2.5 rounded-xl sm:flex-shrink-0">
                <Search size={15} />
                Search
              </Link>
            </div>
          </div>

          {/* Popular tags */}
          <div className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-2">
            <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.8rem" }}>Popular:</span>
            {["Banquet Hall Mumbai", "Rooftop Delhi", "Farmhouse Bangalore", "Club Hyderabad"].map((tag) => (
              <Link key={tag} href={`/venues?q=${tag}`}
                className="text-sm hover:text-white transition-colors"
                style={{ color: "#c084fc" }}>
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          STATS
      ══════════════════════════════════════════════════════ */}
      <section style={{ borderTop: "1px solid rgba(255,255,255,0.08)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "48px 0" }}>
        <div className="section-container grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="gradient-text font-extrabold" style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.2rem)" }}>{s.number}</p>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.85rem", marginTop: "4px" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          VENUE CATEGORIES
      ══════════════════════════════════════════════════════ */}
      <section style={{ padding: "80px 0" }}>
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="section-title text-white mb-3">
              Browse by <span className="gradient-text">Venue Type</span>
            </h2>
            <p style={{ color: "rgba(255,255,255,0.45)" }}>Find the perfect space for your event</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {venueCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/venues?type=${cat.id}`}
                className="category-card glass-card rounded-2xl p-6 text-center cursor-pointer"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${cat.color} mx-auto mb-4 flex items-center justify-center text-2xl`}>
                  {cat.icon}
                </div>
                <p className="text-white font-semibold text-sm">{cat.label}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FEATURED VENUES
      ══════════════════════════════════════════════════════ */}
      <section style={{ padding: "0 0 80px" }}>
        <div className="section-container">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="section-title text-white mb-2">
                Featured <span className="gradient-text">Venues</span>
              </h2>
              <p style={{ color: "rgba(255,255,255,0.45)" }}>Handpicked premium venues for unforgettable events</p>
            </div>
            <Link href="/venues"
              className="hidden md:flex items-center gap-1 font-semibold text-sm transition-colors hover:text-white"
              style={{ color: "#a855f7" }}>
              View All <ChevronRight size={16} />
            </Link>
          </div>

          {featuredVenues.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredVenues.map((venue) => (
                <VenueCard key={venue.id} venue={venue as any} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 glass-card rounded-2xl"
              style={{ border: "1px solid rgba(168,85,247,0.20)" }}>
              <p className="text-4xl mb-4">🏛️</p>
              <p className="text-white font-bold text-xl mb-2">Venues Coming Soon!</p>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.9rem", marginBottom: "24px" }}>
                Be the first to list your venue and reach thousands of customers.
              </p>
              <Link href="/register?role=OWNER" className="btn-primary px-8 py-2.5 rounded-xl">
                List Your Venue Free
              </Link>
            </div>
          )}

          <div className="text-center mt-8 md:hidden">
            <Link href="/venues" className="btn-secondary px-8 py-2.5 rounded-xl">
              View All Venues
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          EVENT TYPES
      ══════════════════════════════════════════════════════ */}
      <section style={{ borderTop: "1px solid rgba(255,255,255,0.08)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "80px 0" }}>
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="section-title text-white mb-3">
              Plan Your <span className="gradient-text">Perfect Event</span>
            </h2>
            <p style={{ color: "rgba(255,255,255,0.45)" }}>From intimate gatherings to grand celebrations</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {eventTypes.map((event) => (
              <Link
                key={event.label}
                href={`/venues?event=${event.label}`}
                className="glass-card rounded-2xl p-5 flex flex-col items-center gap-3 cursor-pointer transition-all duration-250 hover:border-purple-500/40"
                style={{ textDecoration: "none" }}
              >
                <span style={{ fontSize: "2rem" }}>{event.icon}</span>
                <span className="text-white font-medium text-sm text-center">{event.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════════════ */}
      <section style={{ padding: "80px 0" }}>
        <div className="section-container">
          <div className="text-center mb-14">
            <h2 className="section-title text-white mb-3">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p style={{ color: "rgba(255,255,255,0.45)" }}>Book your dream venue in 4 simple steps</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((step, idx) => (
              <div key={step.step} className="relative">
                {/* Connector (desktop) */}
                {idx < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(50%+32px)] right-[-50%]"
                    style={{ borderTop: "2px dashed rgba(168,85,247,0.25)", zIndex: 0 }} />
                )}
                <div className="relative z-10 text-center glass-card rounded-2xl p-6 flex flex-col items-center gap-3"
                  style={{ border: "1px solid rgba(168,85,247,0.12)" }}>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl"
                    style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.18), rgba(236,72,153,0.14))", border: "1px solid rgba(168,85,247,0.25)" }}>
                    {step.icon}
                  </div>
                  <span style={{ color: "#a855f7", fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.12em" }}>{step.step}</span>
                  <h3 className="text-white font-bold">{step.title}</h3>
                  <p style={{ color: "rgba(255,255,255,0.50)", fontSize: "0.85rem", lineHeight: 1.6 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          WHY BOOKNPARTY
      ══════════════════════════════════════════════════════ */}
      <section style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "80px 0" }}>
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="section-title text-white mb-3">
              Why <span className="gradient-text">BookNParty?</span>
            </h2>
            <p style={{ color: "rgba(255,255,255,0.45)" }}>Everything you need for a perfect booking</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {whyUs.map((f) => (
              <div key={f.title} className="glass-card rounded-2xl p-8"
                style={{ border: `1px solid ${f.borderColor}` }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: f.color, border: `1px solid ${f.borderColor}` }}>
                  {f.icon}
                </div>
                <h3 className="text-white font-bold text-xl mb-3">{f.title}</h3>
                <p style={{ color: "rgba(255,255,255,0.50)", lineHeight: 1.65, fontSize: "0.9rem" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CTA — LIST YOUR VENUE
      ══════════════════════════════════════════════════════ */}
      <section style={{ padding: "80px 0 100px" }}>
        <div className="section-container">
          <div className="relative glass-card rounded-3xl overflow-hidden p-10 md:p-16 text-center neon-glow"
            style={{ border: "1px solid rgba(168,85,247,0.25)" }}>
            {/* BG gradient */}
            <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(88,28,135,0.35) 0%, rgba(157,23,77,0.30) 100%)" }} />
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-purple-500/15 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-pink-500/15 rounded-full blur-3xl" />

            <div className="relative z-10">
              <p className="text-5xl mb-5">🏛️</p>
              <h2 className="section-title text-white mb-4">
                Own a Venue?{" "}
                <span className="gradient-text">Start Earning Today!</span>
              </h2>
              <p style={{ color: "rgba(255,255,255,0.58)", marginBottom: "32px", maxWidth: "480px", margin: "0 auto 32px", lineHeight: 1.6 }}>
                Join our growing network of venue owners. List your property for free and start
                receiving bookings from thousands of customers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register?role=OWNER" className="btn-primary px-10 py-3 rounded-xl text-base">
                  List Your Venue Free
                </Link>
                <Link href="/about" className="btn-secondary px-10 py-3 rounded-xl text-base">
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
