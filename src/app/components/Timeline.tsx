'use client'

import React, { useCallback, useEffect, useState } from 'react';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useOrderActions } from "@/app/zustand/order";
import {useTranslations} from 'next-intl';


interface TimeSlot {
    time: string;
    height: number;
    Orders?: number;
    color?: string;
    border?: string;
    borderwidth?: number;
}

interface TimelineProps {
    startDate: Date;
    stopDate: Date;
    every_x_seconds: number;
}

// Helper function to generate fallback timeslots
const generateFallbackTimeslots = (startDate: Date, stopDate: Date): TimeSlot[] => {
    const timeSlots: TimeSlot[] = [];
    const currentTime = new Date(startDate);

    while (currentTime <= stopDate) {
        timeSlots.push({
            time: currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            height: 0,
        });
        currentTime.setMinutes(currentTime.getMinutes() + 5);
    }

    return timeSlots;
};

const Timeline: React.FC<TimelineProps> = ({
                                               startDate,
                                               stopDate,
                                               every_x_seconds
                                           }) => {
    const [timeslots, setTimeslots] = useState<TimeSlot[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const t = useTranslations();

    const orderActions = useOrderActions();

    const fetchTimeline = useCallback(async () => {
        setError(null);
        const response = await fetch('/api/timeline');

        if (!response.ok) {
            console.error('Error fetching timeline timeslots:', error);
            setError('Failed to fetch timeline data');

            // Generate fallback data
            const fallbackTimeslots = generateFallbackTimeslots(startDate, stopDate);
            setTimeslots(fallbackTimeslots);
            setIsLoading(false);
            return;
        }

        const jsonData: TimeSlot[] = await response.json();
        setTimeslots(jsonData);
    }, [startDate, stopDate]);

    useEffect(() => {
        fetchTimeline();

        const interval = setInterval(fetchTimeline, every_x_seconds * 1000);

        return () => clearInterval(interval);
    }, [fetchTimeline, every_x_seconds]);

    const handleBarClick = useCallback((event: any) => {
        if (event?.activeLabel) {
            orderActions.setTimeslot(event.activeLabel);
        }
    }, [orderActions]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[300px]">
                <div className="text-gray-500">{t('components.timeline.loading')}</div>
            </div>
        );
    }

    return (
        <div className="w-full">
            {error && (
                <div className="mb-2 p-2 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
                    {t('components.timeline.warning', { error: error })}
                </div>
            )}

            <ResponsiveContainer height={300}>
                <BarChart
                    data={timeslots}
                    onClick={handleBarClick}
                    margin={{ top: 5, right: 30, left: -30, bottom: 5 }}
                >
                    <XAxis dataKey="time"/>
                    <YAxis/>
                    <Tooltip/>
                    <Bar dataKey="Orders" fill="#007bff">
                        {timeslots.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.color ?? "#007bff"}
                                stroke={entry.border}
                                strokeWidth={entry.borderwidth || 0}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default Timeline;
