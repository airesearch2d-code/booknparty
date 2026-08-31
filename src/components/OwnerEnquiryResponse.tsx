"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function OwnerEnquiryResponse({ enquiryId }: { enquiryId: string }) {
    const router = useRouter();
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!response.trim()) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/enquiries/${enquiryId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ response }),
            });
            if (!res.ok) throw new Error("Failed");
            toast.success("Response sent!");
            router.refresh();
        } catch {
            toast.error("Failed to send response.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-2">
            <textarea
                className="input-field flex-1 resize-none text-sm min-h-16"
                placeholder="Type your response to the customer..."
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                required
            />
            <button
                type="submit"
                disabled={loading || !response.trim()}
                className="btn-primary px-4 rounded-xl flex-shrink-0 self-end disabled:opacity-50 flex items-center gap-2"
            >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
        </form>
    );
}
