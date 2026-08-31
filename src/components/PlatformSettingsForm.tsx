"use client";

import { useState } from "react";
import { Loader2, Settings2 } from "lucide-react";
import toast from "react-hot-toast";

const defaultSettings = {
    emailNotifications: true,
    autoApproveVenues: false,
    bookingModeration: true,
    customerReviews: true,
    maintenanceMode: false,
};

export default function PlatformSettingsForm() {
    const [settings, setSettings] = useState(defaultSettings);
    const [saving, setSaving] = useState(false);

    const toggleSetting = (key: keyof typeof defaultSettings) => {
        setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = async (event: React.FormEvent) => {
        event.preventDefault();
        setSaving(true);

        try {
            await new Promise((resolve) => setTimeout(resolve, 500));
            toast.success("Platform settings saved");
        } catch (error) {
            toast.error("Unable to save settings");
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSave} className="glass-card rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                    <Settings2 size={20} className="text-white" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Platform settings</h2>
                    <p className="text-white/50 text-xs">Configuration for moderation and communication</p>
                </div>
            </div>

            {Object.entries(settings).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between gap-4 rounded-xl bg-white/5 px-4 py-3">
                    <div>
                        <p className="text-white font-medium capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</p>
                        <p className="text-white/40 text-xs">Toggle this platform behavior</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => toggleSetting(key as keyof typeof defaultSettings)}
                        className={`relative h-7 w-12 rounded-full transition-all ${value ? "bg-purple-500" : "bg-white/10"}`}
                        aria-label={`Toggle ${key}`}
                    >
                        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${value ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                </div>
            ))}

            <button type="submit" disabled={saving} className="btn-primary w-full py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60">
                {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : "Save settings"}
            </button>
        </form>
    );
}
