"use client";

import { Printer } from "lucide-react";

export default function InvoicePrintButton() {
    return (
        <button
            onClick={() => window.print()}
            className="btn-primary px-5 py-2.5 rounded-xl flex items-center gap-2 print:hidden"
        >
            <Printer size={16} /> Print / Save as PDF
        </button>
    );
}
