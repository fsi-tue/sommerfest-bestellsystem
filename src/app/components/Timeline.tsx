'use client'

import React, { useCallback, useEffect, useState } from 'react';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTranslations } from 'next-intl';
import useOrderStore from "@/app/zustand/order";
import { AggregatedSlotData } from "@/model/timeslot";
import { ORDER_CONFIG } from "@/config";

const MIN_BAR_HEIGHT = 0.5;

interface TimelineProps {
    startDate: Date;
    stopDate: Date;
    every_x_seconds: number;
}

// Helper function to generate fallback timeslots
const generateAllTimeslots = (startDate: Date, stopDate: Date): AggregatedSlotData[] => {
    const timeSlots: AggregatedSlotData[] = [];
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
    const [timeslots, setTimeslots] = useState<AggregatedSlotData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const t = useTranslations();

    const { setTimeslot, currentOrder } = useOrderStore();

    const mergeTimeslots = (
        allSlots: AggregatedSlotData[],
        apiSlots: AggregatedSlotData[]
    ): AggregatedSlotData[] => {
        const apiSlotMap = new Map(apiSlots.map(slot => [slot.time, slot]));
        return allSlots.map(slot => ({
            ...slot,
            ...apiSlotMap.get(slot.time), // Overwrite defaults with API data if present
        }));
    };
    const fetchTimeline = useCallback(async () => {
        setError(null);
        let apiSlots: AggregatedSlotData[] = [];
        const response = await fetch('/api/timeline');
        if (!response.ok) {
            setError('Failed to fetch timeline data');
            apiSlots = generateAllTimeslots(startDate, stopDate);
        } else {
            apiSlots = await response.json();
        }

        setTimeslots(apiSlots);
        setIsLoading(false);
    }, [startDate, stopDate, every_x_seconds]);

    useEffect(() => {
        fetchTimeline();
        const interval = setInterval(fetchTimeline, every_x_seconds * 1000);
        return () => clearInterval(interval);
    }, [fetchTimeline, every_x_seconds]);

    const handleBarClick = useCallback((event: any) => {
        if (event?.activeLabel) {
            setTimeslot(event.activeLabel);
        }
    }, []);

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
                    <YAxis domain={[0, ORDER_CONFIG.MAX_ITEMS_PER_TIMESLOT]}/>
                    <Tooltip/>

                    <Bar dataKey="ordersAmount" name="Orders" fill="#007bff">
                        {timeslots.map((entry, index) => (
                            <Cell
                                key={`cell-${index}-${entry.time}`}
                                fill={entry.color ?? "#007bff"}
                                stroke={entry.border}
                                strokeWidth={entry.borderwidth ?? 0}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default Timeline;
