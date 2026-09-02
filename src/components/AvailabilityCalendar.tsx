"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface AvailabilityCalendarProps {
    monthDate: Date;
    selectedDate: string;
    unavailableDates: string[];
    onSelectDate: (isoDate: string) => void;
    onMonthChange: (nextMonthDate: Date) => void;
    loading?: boolean;
}

function toIsoDate(date: Date) {
    return date.toISOString().slice(0, 10);
}

export default function AvailabilityCalendar({
    monthDate,
    selectedDate,
    unavailableDates,
    onSelectDate,
    onMonthChange,
    loading = false,
}: AvailabilityCalendarProps) {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const firstWeekday = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const unavailableSet = new Set(unavailableDates);

    const cells: Array<Date | null> = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(year, month, day));
    while (cells.length % 7 !== 0) cells.push(null);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const monthLabel = monthDate.toLocaleString("en-IN", { month: "long", year: "numeric" });

    return (
        <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
                <button
                    type="button"
                    onClick={() => onMonthChange(new Date(year, month - 1, 1))}
                    className="p-2 rounded-lg glass-card hover:bg-white/10 text-white/70 hover:text-white"
                    aria-label="Previous month"
                >
                    <ChevronLeft size={16} />
                </button>
                <p className="text-white font-semibold">{monthLabel}</p>
                <button
                    type="button"
                    onClick={() => onMonthChange(new Date(year, month + 1, 1))}
                    className="p-2 rounded-lg glass-card hover:bg-white/10 text-white/70 hover:text-white"
                    aria-label="Next month"
                >
                    <ChevronRight size={16} />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="text-center text-xs text-white/40 py-1">{day}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
                {cells.map((cellDate, index) => {
                    if (!cellDate) return <div key={`blank-${index}`} className="h-10" />;

                    const isoDate = toIsoDate(cellDate);
                    const isPast = cellDate < today;
                    const isUnavailable = unavailableSet.has(isoDate);
                    const isSelected = selectedDate === isoDate;
                    const disabled = isPast || isUnavailable || loading;

                    return (
                        <button
                            key={isoDate}
                            type="button"
                            disabled={disabled}
                            onClick={() => onSelectDate(isoDate)}
                            className={`h-10 rounded-lg text-sm transition-colors ${
                                isSelected
                                    ? "bg-purple-500 text-white"
                                    : isUnavailable
                                        ? "bg-red-500/10 text-red-300"
                                        : isPast
                                            ? "bg-white/5 text-white/25"
                                            : "bg-white/5 text-white/70 hover:bg-white/15 hover:text-white"
                            } disabled:cursor-not-allowed`}
                            title={isUnavailable ? "Unavailable" : isPast ? "Past date" : "Available"}
                        >
                            {cellDate.getDate()}
                        </button>
                    );
                })}
            </div>

            <div className="mt-4 flex items-center gap-5 text-xs text-white/50">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-white/20" /> Available</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-500/30" /> Unavailable</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-purple-500" /> Selected</span>
            </div>
        </div>
    );
}
