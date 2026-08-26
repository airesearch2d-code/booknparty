import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VenueCard from "@/components/VenueCard";
import {
  Search,
  MapPin,
  ChevronRight,
  Star,
  Shield,
  CreditCard,
  Headphones,
  PartyPopper,
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

const cities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune", "Kolkata", "Jaipur"];

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
    step: "01",
    icon: "🔍",
    title: "Search & Discover",
    desc: "Browse venues by city, type, or event. Filter by capacity, price, and amenities.",
  },
  {
    step: "02",
    icon: "📅",
    title: "Check Availability",
    desc: "View venue details, photos, and pricing. Check date availability in real-time.",
  },
  {
    step: "03",
    icon: "💳",
    title: "Book & Pay Securely",
    desc: "Book online instantly or send an enquiry. Pay safely with Razorpay.",
  },
  {
    step: "04",
    icon: "🎉",
    title: "Celebrate!",
    desc: "Arrive at your confirmed venue and create unforgettable memories.",
  },
];

export default async function HomePage() {
  const session = await auth();
  const featuredVenues = await getFeaturedVenues();

  return (
    <div className="min-h-screen">
      <Navbar session={session as any} />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-black to-pink-900/30" />
          <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float" />
          <div
            className="absolute bottom-20 right-10 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-float"
            style={{ animationDelay: "2s" }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-2 mb-8 text-sm text-purple-300">
            <PartyPopper size={14} />
            <span>India's #1 Party Venue Booking Platform</span>
          </div>

          <h1 className="section-title mb-6 text-white">
            Find Your Perfect{" "}
            <span className="gradient-text">Party Venue</span>
            <br />
            For Every Occasion
          </h1>

          <p className="text-white/60 text-lg mb-10 max-w-2xl mx-auto">
            Discover and book extraordinary venues for birthdays, weddings, corporate events, and
            more. 2,500+ venues across 120+ cities in India.
          </p>

          {/* Search Box */}
          <div className="glass-card rounded-2xl p-4 max-w-3xl mx-auto neon-glow">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <MapPin
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400"
                />
                <select className="input-field pl-10 appearance-none cursor-pointer">
                  <option value="">Select City</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400"
                />
                <select className="input-field pl-10 appearance-none cursor-pointer">
                  <option value="">Event Type</option>
                  {eventTypes.map((e) => (
                    <option key={e.label} value={e.label}>
                      {e.icon} {e.label}
                    </option>
                  ))}
                </select>
              </div>
              <Link
                href="/venues"
                className="btn-primary px-8 py-3 rounded-xl flex items-center gap-2 justify-center whitespace-nowrap"
              >
                <Search size={16} />
                Search Venues
              </Link>
            </div>
          </div>

          {/* Popular Searches */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <span className="text-white/40 text-sm">Popular:</span>
            {["Banquet Hall Mumbai", "Rooftop Delhi", "Farmhouse Bangalore", "Club Hyderabad"].map(
              (tag) => (
                <Link
                  key={tag}
                  href={`/venues?q=${tag}`}
                  className="text-sm text-purple-300 hover:text-white transition-colors"
                >
                  {tag}
                </Link>
              )
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-white/10">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-bold gradient-text">{stat.number}</p>
              <p className="text-white/50 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Venue Categories */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="section-title text-white mb-3">
            Browse by <span className="gradient-text">Venue Type</span>
          </h2>
          <p className="text-white/50">Find the perfect space for your event</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {venueCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/venues?type=${cat.id}`}
              className="group glass-card rounded-2xl p-6 text-center hover:scale-105 transition-transform duration-300 cursor-pointer"
            >
              <div
                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${cat.color} mx-auto mb-4 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}
              >
                {cat.icon}
              </div>
              <p className="text-white font-semibold text-sm">{cat.label}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Venues */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="section-title text-white mb-2">
              Featured <span className="gradient-text">Venues</span>
            </h2>
            <p className="text-white/50">Handpicked premium venues for unforgettable events</p>
          </div>
          <Link
            href="/venues"
            className="hidden md:flex items-center gap-1 text-purple-400 hover:text-white transition-colors text-sm font-medium"
          >
            View All <ChevronRight size={16} />
          </Link>
        </div>

        {featuredVenues.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredVenues.map((venue) => (
              <VenueCard key={venue.id} venue={venue as any} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 glass-card rounded-2xl">
            <p className="text-4xl mb-4">🏛️</p>
            <p className="text-white font-semibold text-xl mb-2">Venues Coming Soon!</p>
            <p className="text-white/50 mb-6 text-sm">
              Be the first to list your venue and reach thousands of customers.
            </p>
            <Link href="/register?role=OWNER" className="btn-primary inline-block px-8 py-2.5 rounded-xl">
              List Your Venue Free
            </Link>
          </div>
        )}

        <div className="text-center mt-8 md:hidden">
          <Link href="/venues" className="btn-secondary px-8 py-2.5 rounded-xl">
            View All Venues
          </Link>
        </div>
      </section>

      {/* Event Types */}
      <section className="py-20 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="section-title text-white mb-3">
              Plan Your <span className="gradient-text">Perfect Event</span>
            </h2>
            <p className="text-white/50">From intimate gatherings to grand celebrations</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {eventTypes.map((event) => (
              <Link
                key={event.label}
                href={`/venues?event=${event.label}`}
                className="glass-card rounded-2xl p-5 flex flex-col items-center gap-3 hover:border-purple-500/50 transition-colors group"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">{event.icon}</span>
                <span className="text-white/80 text-sm font-medium text-center">{event.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="section-title text-white mb-3">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-white/50">Book your dream venue in 4 simple steps</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {howItWorks.map((step, idx) => (
            <div key={step.step} className="relative text-center">
              {idx < howItWorks.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-1/2 w-full h-px border-t border-dashed border-purple-500/30" />
              )}
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 mx-auto mb-4 flex items-center justify-center text-2xl">
                  {step.icon}
                </div>
                <span className="text-purple-400 text-xs font-bold tracking-widest">{step.step}</span>
                <h3 className="text-white font-bold mt-1 mb-2">{step.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why BookNParty */}
      <section className="py-20 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="section-title text-white mb-3">
              Why <span className="gradient-text">BookNParty?</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield size={28} className="text-purple-400" />,
                title: "Verified Venues",
                desc: "Every venue is verified by our team to ensure quality, safety, and accurate listings.",
              },
              {
                icon: <CreditCard size={28} className="text-pink-400" />,
                title: "Secure Payments",
                desc: "Pay securely via Razorpay. UPI, cards, net banking — all payment modes accepted.",
              },
              {
                icon: <Headphones size={28} className="text-blue-400" />,
                title: "24/7 Support",
                desc: "Our dedicated support team is available round the clock to help with your booking.",
              },
            ].map((feature) => (
              <div key={feature.title} className="glass-card rounded-2xl p-8">
                <div className="w-12 h-12 rounded-xl glass-card flex items-center justify-center mb-5">
                  {feature.icon}
                </div>
                <h3 className="text-white font-bold text-xl mb-3">{feature.title}</h3>
                <p className="text-white/50 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — List Venue */}
      <section className="py-24 max-w-7xl mx-auto px-4">
        <div className="relative glass-card rounded-3xl overflow-hidden p-10 md:p-16 text-center neon-glow">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/50 to-pink-900/50" />
          <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
          <div className="relative z-10">
            <p className="text-4xl mb-4">🏛️</p>
            <h2 className="section-title text-white mb-4">
              Own a Venue?{" "}
              <span className="gradient-text">Start Earning Today!</span>
            </h2>
            <p className="text-white/60 mb-8 max-w-xl mx-auto">
              Join our growing network of venue owners. List your property for free and start
              receiving bookings and enquiries from thousands of customers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register?role=OWNER" className="btn-primary px-10 py-3 rounded-xl text-base font-semibold">
                List Your Venue Free
              </Link>
              <Link href="/about" className="btn-secondary px-10 py-3 rounded-xl text-base font-semibold">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
