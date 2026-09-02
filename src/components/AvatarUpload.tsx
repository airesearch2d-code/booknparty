"use client";

import { useMemo, useRef, useState } from "react";
import { Camera, Loader2, UserCircle2 } from "lucide-react";
import toast from "react-hot-toast";

interface AvatarUploadProps {
    currentAvatar?: string | null;
    userName: string;
    onUploaded: (avatarUrl: string) => void;
}

export default function AvatarUpload({ currentAvatar, userName, onUploaded }: AvatarUploadProps) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [uploading, setUploading] = useState(false);

    const initials = useMemo(() => {
        return userName
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
    }, [userName]);

    const handleFilePick = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
        if (!allowed.includes(file.type)) {
            toast.error("Only JPEG, PNG, and WEBP images are allowed");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be under 5MB");
            return;
        }

        setUploading(true);
        try {
            const payload = new FormData();
            payload.append("file", file);

            const response = await fetch("/api/user/upload-avatar", {
                method: "POST",
                body: payload,
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to upload avatar");

            onUploaded(data.avatarUrl);
            toast.success("Avatar updated");
        } catch (error: any) {
            toast.error(error.message || "Failed to upload avatar");
        } finally {
            setUploading(false);
            if (event.target) event.target.value = "";
        }
    };

    return (
        <div className="bg-white/5 rounded-xl p-4">
            <p className="text-white/70 text-sm mb-3">Profile photo</p>
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                    {currentAvatar ? (
                        <img src={currentAvatar} alt="Profile avatar" className="w-full h-full object-cover" />
                    ) : (
                        initials || <UserCircle2 size={30} />
                    )}
                </div>

                <div>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="btn-secondary px-4 py-2 rounded-lg text-sm flex items-center gap-2 disabled:opacity-60"
                    >
                        {uploading ? <><Loader2 size={14} className="animate-spin" /> Uploading...</> : <><Camera size={14} /> Upload Avatar</>}
                    </button>
                    <p className="text-white/35 text-xs mt-2">JPEG, PNG, WEBP up to 5MB</p>
                </div>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleFilePick}
                className="hidden"
            />
        </div>
    );
}
