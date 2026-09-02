/**
 * BookNParty — Prisma Seed Script
 * Run with: npx ts-node -P tsconfig.seed.json prisma/seed.ts
 */

import * as dotenv from "dotenv";
import * as path from "path";
// Load .env.local so DATABASE_URL is available
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

// ─── Helper ───────────────────────────────────────────────────────────────────
function slug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function main() {
    console.log("🌱 Seeding BookNParty database...\n");

    const password = await bcrypt.hash("password123", 10);

    // ─── Users ───────────────────────────────────────────────────────────────
    const admin = await prisma.user.upsert({
        where: { email: "admin@booknparty.in" },
        update: {},
        create: {
            name: "Santosh Gupta",
            email: "admin@booknparty.in",
            password,
            role: "ADMIN",
            phone: "+91 98100 00001",
        },
    });

    const owner1 = await prisma.user.upsert({
        where: { email: "owner1@booknparty.in" },
        update: {},
        create: {
            name: "Priya Mehta",
            email: "owner1@booknparty.in",
            password,
            role: "OWNER",
            phone: "+91 98200 00002",
        },
    });

    const owner2 = await prisma.user.upsert({
        where: { email: "owner2@booknparty.in" },
        update: {},
        create: {
            name: "Rahul Kapoor",
            email: "owner2@booknparty.in",
            password,
            role: "OWNER",
            phone: "+91 98300 00003",
        },
    });

    const customer = await prisma.user.upsert({
        where: { email: "customer@booknparty.in" },
        update: {},
        create: {
            name: "Sneha Patel",
            email: "customer@booknparty.in",
            password,
            role: "CUSTOMER",
            phone: "+91 98400 00004",
        },
    });

    console.log("✅ Users created:");
    console.log(`   Admin     → admin@booknparty.in`);
    console.log(`   Owner 1   → owner1@booknparty.in`);
    console.log(`   Owner 2   → owner2@booknparty.in`);
    console.log(`   Customer  → customer@booknparty.in`);
    console.log(`   Password  → password123\n`);

    // ─── Venues ──────────────────────────────────────────────────────────────
    const venues = [
        {
            name: "The Grand Maharaja Banquet",
            slug: "the-grand-maharaja-banquet",
            description:
                "Step into royalty at The Grand Maharaja Banquet — one of Mumbai's most sought-after event spaces. This opulent hall features soaring ceilings adorned with crystal chandeliers, hand-crafted marble floors, and a stage fit for any grand occasion.\n\nPerfect for weddings, receptions, corporate galas, and milestone celebrations. Our in-house catering team crafts exquisite vegetarian and non-vegetarian menus. The air-conditioned hall comfortably seats up to 500 guests, with dedicated parking for 200+ cars.",
            type: "BANQUET_HALL",
            capacity: 500,
            pricePerHour: 15000,
            minBookingHours: 4,
            address: "14 Linking Road, Bandra West",
            city: "Mumbai",
            state: "Maharashtra",
            pincode: "400050",
            latitude: 19.0596,
            longitude: 72.8295,
            images: [
                "https://images.unsplash.com/photo-1519167758481-83f29db6db22?w=1200&q=80",
                "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80",
                "https://images.unsplash.com/photo-1478146059778-26028b07395a?w=800&q=80",
                "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80",
                "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80",
            ],
            amenities: ["AC", "Parking", "Catering", "DJ System", "Stage", "Valet Parking", "WiFi", "CCTV", "Generator"],
            highlights: ["Royal décor", "In-house catering", "Valet parking", "Dedicated event manager"],
            ownerId: owner1.id,
            isApproved: true,
        },
        {
            name: "SkyLounge Rooftop Terrace",
            slug: "skylounge-rooftop-terrace",
            description:
                "Mumbai's most Instagram-worthy venue — SkyLounge Rooftop Terrace offers panoramic views of the city skyline and the Arabian Sea. Host your birthday, cocktail night, or product launch 35 floors above the city buzz.\n\nFeaturing a state-of-the-art LED bar, mood lighting system, and a professional DJ setup, this contemporary space transforms by night into a vibrant party destination. Open-air seating for 120 guests with a retractable rain canopy for all-weather events.",
            type: "ROOFTOP",
            capacity: 120,
            pricePerHour: 8000,
            minBookingHours: 3,
            address: "35th Floor, Oberoi Commerz, Goregaon East",
            city: "Mumbai",
            state: "Maharashtra",
            pincode: "400063",
            latitude: 19.1578,
            longitude: 72.8479,
            images: [
                "https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=1200&q=80",
                "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=800&q=80",
                "https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=800&q=80",
                "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
            ],
            amenities: ["Bar", "DJ System", "WiFi", "Dance Floor", "CCTV"],
            highlights: ["360° city view", "Retractable canopy", "LED bar", "Sunset events"],
            ownerId: owner1.id,
            isApproved: true,
        },
        {
            name: "Green Valley Farmhouse",
            slug: "green-valley-farmhouse",
            description:
                "Escape the urban chaos at Green Valley Farmhouse — a lush 3-acre private estate nestled in the foothills of Chhatarpur. This rustic yet modern property features an open lawn for up to 800 guests, a heated swimming pool, multiple indoor and outdoor event zones, and luxurious changing suites.\n\nIdyllic for mehndi functions, sangeet nights, birthday bashes, and team off-sites. A fully-equipped kitchen and empanelled caterers are available. Overnight accommodation for up to 30 guests in 10 elegant rooms.",
            type: "FARMHOUSE",
            capacity: 800,
            pricePerHour: 20000,
            minBookingHours: 6,
            address: "Plot 12, Mehrauli-Chhatarpur Road",
            city: "Delhi",
            state: "Delhi",
            pincode: "110074",
            latitude: 28.5013,
            longitude: 77.1727,
            images: [
                "https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=1200&q=80",
                "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&q=80",
                "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
                "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80",
                "https://images.unsplash.com/photo-1444084316824-dc26d6657664?w=800&q=80",
            ],
            amenities: ["Swimming Pool", "Parking", "Catering", "DJ System", "Outdoor Space", "Generator", "AC", "Changing Room"],
            highlights: ["3-acre estate", "Private pool", "Overnight stay", "Rustic ambience"],
            ownerId: owner2.id,
            isApproved: true,
        },
        {
            name: "Azure Conference & Events Centre",
            slug: "azure-conference-events-centre",
            description:
                "Azure is Bengaluru's premier corporate event facility, offering world-class infrastructure for conferences, seminars, product launches, and team-building workshops. The 5,000 sq ft pillar-free hall can be configured in theatre (300), classroom (150), or boardroom (60) style.\n\nEquipped with 4K laser projectors, Dolby sound, high-speed fibre WiFi, and a dedicated tech support team. Six breakout rooms, business lounge, and a gourmet catering service are included in all packages.",
            type: "CONFERENCE_ROOM",
            capacity: 300,
            pricePerHour: 6000,
            minBookingHours: 2,
            address: "27 UB City, Vittal Mallya Road",
            city: "Bengaluru",
            state: "Karnataka",
            pincode: "560001",
            latitude: 12.9716,
            longitude: 77.5946,
            images: [
                "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200&q=80",
                "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
                "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80",
                "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=800&q=80",
            ],
            amenities: ["Projector", "WiFi", "AC", "Catering", "Parking", "CCTV", "Stage"],
            highlights: ["4K projection", "6 breakout rooms", "Tech support", "Fibre WiFi"],
            ownerId: owner2.id,
            isApproved: true,
        },
        {
            name: "Neon Nights Club Lounge",
            slug: "neon-nights-club-lounge",
            description:
                "Hyderabad's hottest private club venue — Neon Nights offers an electrifying party experience for private events. Featuring a professional DJ booth, laser light rig, LED dance floor, VIP bottle service, and a fully stocked premium bar.\n\nIdeal for birthday parties, bachelor/bachelorette events, brand launches, and after-parties. The venue accommodates 150 guests with a mix of banquette seating, standing space, and a private VIP enclave for 20.",
            type: "CLUB",
            capacity: 150,
            pricePerHour: 12000,
            minBookingHours: 3,
            address: "7th Floor, Jubilee Hills Road No. 36",
            city: "Hyderabad",
            state: "Telangana",
            pincode: "500033",
            latitude: 17.4325,
            longitude: 78.4134,
            images: [
                "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=80",
                "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
                "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800&q=80",
                "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80",
            ],
            amenities: ["Bar", "DJ System", "Dance Floor", "AC", "CCTV", "WiFi"],
            highlights: ["Laser rig", "LED dance floor", "VIP enclave", "Bottle service"],
            ownerId: owner1.id,
            isApproved: true,
        },
        {
            name: "The Heritage Villa Jaipur",
            slug: "the-heritage-villa-jaipur",
            description:
                "A stunning 18th-century Rajput haveli lovingly restored into an exclusive event villa. The Heritage Villa Jaipur offers a magical backdrop with pink sandstone courtyards, arched corridors, hand-painted frescoes, and a jaali-screened rooftop terrace.\n\nPerfect for destination weddings, pre-wedding shoots, intimate receptions, and royal-themed parties. The 2-acre property accommodates up to 200 guests and includes 8 heritage suites for overnight stays. Complimentary décor consultation and elephant welcome for wedding packages.",
            type: "VILLA",
            capacity: 200,
            pricePerHour: 25000,
            minBookingHours: 8,
            address: "Civil Lines, Near Rambagh Palace",
            city: "Jaipur",
            state: "Rajasthan",
            pincode: "302006",
            latitude: 26.8843,
            longitude: 75.8069,
            images: [
                "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
                "https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=800&q=80",
                "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80",
                "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80",
                "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80",
            ],
            amenities: ["Parking", "Catering", "Outdoor Space", "AC", "Generator", "Changing Room", "Swimming Pool"],
            highlights: ["Heritage architecture", "Overnight suites", "Elephant welcome", "Royal ambience"],
            ownerId: owner2.id,
            isApproved: true,
        },
        {
            name: "Spice Garden Restaurant & Events",
            slug: "spice-garden-restaurant-events",
            description:
                "Pune's favourite family restaurant transforms into an exclusive private dining and event space after hours. Spice Garden offers an intimate setting for kitty parties, anniversary dinners, retirement gatherings, and small corporate lunches.\n\nCapacity for 80 guests in a warm, garden-lit ambience with fairy lights and floral décor. The award-winning kitchen specialises in Pan-Indian and Continental cuisine. A curated beverage menu and live acoustic music package available on request.",
            type: "RESTAURANT",
            capacity: 80,
            pricePerHour: 4000,
            minBookingHours: 2,
            address: "Lane 5, Koregaon Park",
            city: "Pune",
            state: "Maharashtra",
            pincode: "411001",
            latitude: 18.5363,
            longitude: 73.8944,
            images: [
                "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80",
                "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
                "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
                "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=800&q=80",
            ],
            amenities: ["AC", "Catering", "Parking", "WiFi"],
            highlights: ["Award-winning kitchen", "Garden lighting", "Live music", "Intimate setting"],
            ownerId: owner1.id,
            isApproved: true,
        },
        {
            name: "EcoGrove Outdoor Events Park",
            slug: "ecogrove-outdoor-events-park",
            description:
                "Chennai's premier open-air event ground, spread across 5 acres of manicured lawns and tropical foliage. EcoGrove is the go-to venue for large-scale outdoor festivals, school annual days, community events, product expos, and music concerts.\n\nThe venue features a permanent concrete stage with top-line PA system, modular tent infrastructure for 1000 guests, food court zone, dedicated parking for 500 vehicles, and onsite security team. Rain contingency plans and generator backup always in place.",
            type: "OUTDOOR",
            capacity: 1000,
            pricePerHour: 18000,
            minBookingHours: 4,
            address: "ECR Highway, Akkarai",
            city: "Chennai",
            state: "Tamil Nadu",
            pincode: "600119",
            latitude: 12.8497,
            longitude: 80.2422,
            images: [
                "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&q=80",
                "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
                "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&q=80",
                "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80",
            ],
            amenities: ["Stage", "Parking", "Generator", "Outdoor Space", "CCTV"],
            highlights: ["5-acre lawn", "Concert stage", "1000+ capacity", "ECR beachside"],
            ownerId: owner2.id,
            isApproved: true,
        },
    ];

    // Upsert all venues
    let venueCount = 0;
    const createdVenues: any[] = [];
    for (const v of venues) {
        const venue = await prisma.venue.upsert({
            where: { slug: v.slug },
            update: {},
            create: v as any,
        });
        createdVenues.push(venue);
        venueCount++;
    }
    console.log(`✅ ${venueCount} venues seeded\n`);

    // ─── Reviews ─────────────────────────────────────────────────────────────
    const reviewData = [
        { rating: 5, comment: "Absolutely stunning venue! The chandeliers and décor were breathtaking. Staff was extremely professional and the catering was delicious. Highly recommend for weddings!" },
        { rating: 4, comment: "Great views and atmosphere. The rooftop experience was unforgettable. Minor delays with setup but overall an amazing venue for our product launch." },
        { rating: 5, comment: "Perfect farmhouse for our sangeet! Huge space, beautiful greenery, and the pool was a hit. Will definitely book again." },
        { rating: 5, comment: "Top-notch conference facility. The AV equipment and support team were fantastic. Our delegates were extremely impressed." },
    ];

    for (let i = 0; i < Math.min(reviewData.length, createdVenues.length); i++) {
        const existingReview = await prisma.review.findFirst({
            where: { venueId: createdVenues[i].id, userId: customer.id },
        });
        if (!existingReview) {
            await prisma.review.create({
                data: {
                    venueId: createdVenues[i].id,
                    userId: customer.id,
                    rating: reviewData[i].rating,
                    comment: reviewData[i].comment,
                },
            });
        }
    }
    console.log(`✅ ${reviewData.length} reviews seeded\n`);

    // ─── Sample Bookings ──────────────────────────────────────────────────────
    const existingBooking = await prisma.booking.findFirst({
        where: { customerId: customer.id },
    });

    if (!existingBooking) {
  await (prisma.booking.createMany as any)({
    data: [
      {
        venueId: createdVenues[0].id,
        customerId: customer.id,
        eventDate: new Date("2026-09-15T18:00:00.000Z"),
        hours: 4,
        guestCount: 150,
        totalAmount: 70800,
        status: "CONFIRMED",
        notes: "Birthday party for 150 guests. Need champagne tower setup.",
      },
      {
        venueId: createdVenues[2].id,
        customerId: customer.id,
        eventDate: new Date("2026-10-08T20:00:00.000Z"),
        hours: 3,
        guestCount: 300,
        totalAmount: 70800,
        status: "PENDING",
        notes: "Mehndi function. Need traditional décor and folk music setup.",
      },
    ],
  });

  console.log("✅ 2 sample bookings seeded\n");
}

    // ─── Sample Enquiries ─────────────────────────────────────────────────────
    const existingEnquiry = await prisma.enquiry.findFirst({
        where: { customerId: customer.id },
    });

    if (!existingEnquiry) {
        await (prisma.enquiry.createMany as any)({
            data: [
                {
                    venueId: createdVenues[1].id,
                    customerId: customer.id,
                    name: customer.name,
                    email: customer.email,
                    phone: customer.phone!,
                    message: "Hi! I'm planning a rooftop birthday party for 80 people. Can you confirm the availability and share your weekend packages?",
                    eventType: "Birthday Party",
                    eventDate: new Date("2026-09-20"),
                    guestCount: 80,
                    status: "PENDING",
                },
                {
                    venueId: createdVenues[3].id,
                    customerId: customer.id,
                    name: customer.name,
                    email: customer.email,
                    phone: customer.phone!,
                    message: "We need the conference hall for a 2-day leadership summit with 200 attendees. Please share your corporate packages.",
                    eventType: "Corporate Event",
                    eventDate: new Date("2026-11-05"),
                    guestCount: 200,
                    response: "Thank you for your enquiry! We have the dates available. Our 2-day corporate package includes all AV equipment, catering, and dedicated tech support. I'll email you the detailed proposal.",
                    status: "RESPONDED",
                },
            ],
        });
        console.log("✅ 2 sample enquiries seeded\n");
    }

    console.log("────────────────────────────────────────────");
    console.log("🎉 Seeding complete! Test login credentials:");
    console.log("   Admin    → admin@booknparty.in / password123");
    console.log("   Owner    → owner1@booknparty.in / password123");
    console.log("   Customer → customer@booknparty.in / password123");
    console.log("────────────────────────────────────────────\n");
}

main()
    .catch((e) => {
        console.error("❌ Seed error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
