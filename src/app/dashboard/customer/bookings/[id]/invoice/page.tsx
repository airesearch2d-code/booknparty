import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import InvoicePrintButton from "@/components/InvoicePrintButton";

interface InvoicePageProps {
    params: Promise<{ id: string }>;
}

export default async function BookingInvoicePage({ params }: InvoicePageProps) {
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== "CUSTOMER") redirect("/login");

    const { id } = await params;

    const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
            venue: { select: { name: true, address: true, city: true, state: true, pincode: true } },
            customer: { select: { name: true, email: true, phone: true } },
        },
    });

    if (!booking || booking.customerId !== session.user.id) notFound();
    if (booking.status !== "CONFIRMED" && booking.status !== "COMPLETED") {
        redirect("/dashboard/customer/bookings");
    }

    const issuedDate = new Date();
    const invoiceNumber = `INV-${booking.id.slice(-8).toUpperCase()}`;

    return (
        <div className="min-h-screen bg-[#0f0f0f] py-10 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-6 print:hidden">
                    <Link href="/dashboard/customer/bookings" className="flex items-center gap-2 text-white/50 hover:text-white text-sm">
                        <ArrowLeft size={16} /> Back to My Bookings
                    </Link>
                    <InvoicePrintButton />
                </div>

                <div className="glass-card rounded-2xl p-8 print:bg-white print:text-black">
                    <div className="flex items-start justify-between border-b border-white/10 print:border-black/20 pb-6 mb-6">
                        <div>
                            <p className="text-2xl font-bold text-white print:text-black">🎉 BookNParty</p>
                            <p className="text-white/40 print:text-black/60 text-xs mt-1">Venue Booking Invoice</p>
                        </div>
                        <div className="text-right">
                            <p className="text-white print:text-black font-semibold">{invoiceNumber}</p>
                            <p className="text-white/40 print:text-black/60 text-xs mt-1">Issued {formatDate(issuedDate)}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-8">
                        <div>
                            <p className="text-white/40 print:text-black/50 text-xs uppercase tracking-wide mb-1">Billed to</p>
                            <p className="text-white print:text-black font-medium">{booking.customer.name}</p>
                            <p className="text-white/50 print:text-black/70 text-sm">{booking.customer.email}</p>
                            {booking.customer.phone && <p className="text-white/50 print:text-black/70 text-sm">{booking.customer.phone}</p>}
                        </div>
                        <div>
                            <p className="text-white/40 print:text-black/50 text-xs uppercase tracking-wide mb-1">Venue</p>
                            <p className="text-white print:text-black font-medium">{booking.venue.name}</p>
                            <p className="text-white/50 print:text-black/70 text-sm">{booking.venue.address}</p>
                            <p className="text-white/50 print:text-black/70 text-sm">{booking.venue.city}, {booking.venue.state} {booking.venue.pincode}</p>
                        </div>
                    </div>

                    <table className="w-full mb-8">
                        <thead>
                            <tr className="text-left text-white/40 print:text-black/50 text-xs uppercase tracking-wide border-b border-white/10 print:border-black/20">
                                <th className="pb-3">Description</th>
                                <th className="pb-3 text-right">Duration</th>
                                <th className="pb-3 text-right">Guests</th>
                                <th className="pb-3 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="text-white print:text-black text-sm">
                                <td className="py-3">
                                    Venue booking — {booking.venue.name}
                                    {booking.eventType && <span className="block text-white/40 print:text-black/50 text-xs mt-0.5">{booking.eventType} · {formatDate(booking.eventDate)}</span>}
                                </td>
                                <td className="py-3 text-right">{booking.hours} hrs</td>
                                <td className="py-3 text-right">{booking.guestCount}</td>
                                <td className="py-3 text-right">{formatCurrency(booking.totalAmount)}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="flex justify-end">
                        <div className="w-56">
                            <div className="flex justify-between text-white/50 print:text-black/70 text-sm py-1">
                                <span>Subtotal</span>
                                <span>{formatCurrency(booking.totalAmount)}</span>
                            </div>
                            <div className="flex justify-between text-white print:text-black font-bold text-lg border-t border-white/10 print:border-black/20 mt-2 pt-2">
                                <span>Total</span>
                                <span>{formatCurrency(booking.totalAmount)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/10 print:border-black/20 text-center">
                        <p className="text-white/30 print:text-black/40 text-xs">
                            This invoice reflects payment settled directly between customer and venue. Booking status: {booking.status}.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
