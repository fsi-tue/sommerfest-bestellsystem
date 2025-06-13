'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTranslations } from 'next-intl';
import useOrderStore from "@/app/zustand/order";
import { AggregatedSlotData } from "@/model/timeslot";
import { ORDER_AMOUNT_THRESHOLDS, TIME_SLOT_CONFIG } from "@/config";
import { timeslotToLocalTime } from "@/lib/time";

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

const Timeline = () => {
    const [timeslots, setTimeslots] = useState<AggregatedSlotData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const t = useTranslations();

    // Timeline date range calculation (can be done outside component if static)
    const { startDate, stopDate } = useMemo(() => {
        const startDate = new Date()
        startDate.setHours(startDate.getHours() - 1);
        startDate.setMinutes(0, 0, 0);

        const stopDate = new Date();
        stopDate.setHours(stopDate.getHours() + 1);
        stopDate.setMinutes(59, 59, 999);
        return { startDate, stopDate };
    }, []);

    const { setTimeslot } = useOrderStore();
    const fetchTimeline = useCallback(async () => {
        setError(null);
        let apiSlots: AggregatedSlotData[] = [];
        const response = await fetch('/api/timeline');
        if (!response.ok) {
            setError('Failed to fetch timeline data');
            apiSlots = generateAllTimeslots(startDate, stopDate);
        } else {
            apiSlots = await response.json()
            apiSlots = apiSlots.map((item: AggregatedSlotData) => ({
                ...item,
                time: timeslotToLocalTime(item.time),
            }))
        }

        setTimeslots(apiSlots);
        setIsLoading(false);
    }, [startDate, stopDate, TIME_SLOT_CONFIG.UPDATE_EVERY_SECONDS]);

    useEffect(() => {
        fetchTimeline();
        const interval = setInterval(fetchTimeline, TIME_SLOT_CONFIG.UPDATE_EVERY_SECONDS * 1000);
        return () => clearInterval(interval);
    }, [fetchTimeline, TIME_SLOT_CONFIG.UPDATE_EVERY_SECONDS]);

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
                    <YAxis domain={[0, ORDER_AMOUNT_THRESHOLDS.MAX]}/>
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
