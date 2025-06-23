'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTranslations } from 'next-intl';
import useOrderStore from "@/app/zustand/order";
import { AggregatedSlotData } from "@/model/timeslot";
import { timeslotToLocalTime } from "@/lib/time";
import { useShallow } from "zustand/react/shallow";
import { useSystem } from "@/lib/fetch/system";

const Timeline = ({
                      noClick
                  }: { noClick: boolean } = { noClick: false }) => {
    // All hooks must be called at the top level, in the same order every time
    const [timeslots, setTimeslots] = useState<AggregatedSlotData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const t = useTranslations();

    const { setTimeslot, order, totalItems } = useOrderStore(
        useShallow((state) => ({
            setTimeslot: state.setTimeslot,
            order: state.currentOrder,
            totalItems: state.getTotalItemCount()
        }))
    );

    const { data, error: systemError, isFetching } = useSystem();

    // Generate fallback timeslots
    const generateFallbackSlots = useCallback(() => {
        const slots: AggregatedSlotData[] = [];
        const start = new Date();
        start.setHours(start.getHours() - 1, 0, 0, 0);

        const end = new Date();
        end.setHours(end.getHours() + 1, 59, 59, 999);

        const current = new Date(start);
        while (current <= end) {
            slots.push({
                time: current.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                height: 0,
            });
            current.setMinutes(current.getMinutes() + 5);
        }
        return slots;
    }, []);

    const fetchTimeline = useCallback(async () => {
        setError(null);
        try {
            const response = await fetch('/api/timeline');
            let apiSlots: AggregatedSlotData[];

            if (!response.ok) {
                setError('Failed to fetch timeline data');
                apiSlots = generateFallbackSlots();
            } else {
                apiSlots = await response.json();
                apiSlots = apiSlots.map(item => ({
                    ...item,
                    time: timeslotToLocalTime(item.time),
                })) as AggregatedSlotData[];
            }

            setTimeslots(apiSlots);
        } catch (err) {
            setError('Network error');
            setTimeslots(generateFallbackSlots());
        } finally {
            setIsLoading(false);
        }
    }, [generateFallbackSlots]);

    const handleBarClick = useCallback((event: any) => {
        if (!noClick && event?.activeLabel) {
            setTimeslot(event.activeLabel);
        }
    }, [noClick, setTimeslot]);

    const enhancedTimeslots = useMemo(() => {
        if (!data) {
            return timeslots;
        }

        const TIME_SLOT_CONFIG = data.config.TIME_SLOT_CONFIG;
        const selectedTime = timeslotToLocalTime(order.timeslot);
        return timeslots.map(slot => ({
            ...slot,
            ...(slot.time === selectedTime && {
                border: TIME_SLOT_CONFIG.BORDER_STYLES.CURRENT_SLOT_COLOR,
                borderwidth: TIME_SLOT_CONFIG.BORDER_STYLES.CURRENT_SLOT_WIDTH,
                color: TIME_SLOT_CONFIG.STATUS_COLORS.SELECT,
                ordersAmount: totalItems > 0 ? totalItems : 1
            })
        }));
    }, [timeslots, order.timeslot, totalItems, data]);

    useEffect(() => {
        if (data) {
            const TIME_SLOT_CONFIG = data.config.TIME_SLOT_CONFIG;
            fetchTimeline();
            const interval = setInterval(fetchTimeline, TIME_SLOT_CONFIG.UPDATE_EVERY_SECONDS * 1000);
            return () => clearInterval(interval);
        }
    }, [fetchTimeline, data]);

    if (!data) {
        return null;
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[300px]">
                <div className="text-gray-500">{t('Misc.timeline.loading')}</div>
            </div>
        );
    }

    return (
        <div className="w-full">
            {error && (
                <div className="mb-2 p-2 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
                    {t('Misc.timeline.warning', { error })}
                </div>
            )}

            <ResponsiveContainer height={300}>
                <BarChart
                    data={enhancedTimeslots}
                    onClick={handleBarClick}
                    margin={{ top: 5, right: 30, left: -30, bottom: 5 }}
                >
                    <XAxis dataKey="time"/>
                    <YAxis domain={[0, data.config.ORDER_CONFIG.ORDER_AMOUNT_THRESHOLDS.MAX]}/>
                    <Tooltip/>
                    <Bar dataKey="ordersAmount" name="Orders" fill="#007bff">
                        {enhancedTimeslots.map((entry, index) => (
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
