// Timeline.js
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Timeline = ({ startDate, stopDate, API_ENDPOINT, every_x_seconds }) => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(API_ENDPOINT + "/timeline");
                const jsonData = await response.json();
                setData(jsonData);
            } catch (error) {
                console.error('Error fetching data:', error);
                const timeSlots = [];
                const currentTime = new Date(startDate);

                // Generate time slots every 5 minutes
                while (currentTime <= stopDate) {
                    timeSlots.push({ time: currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
                    currentTime.setMinutes(currentTime.getMinutes() + 5);
                }
                setData(timeSlots.map((timeSlot, index) => ({
                    time: timeSlot.time,
                    height: 0,
                })));
            }
        };

        const interval = setInterval(fetchData, every_x_seconds * 1000); // Fetch data every minute
        fetchData(); // Fetch data initially
        return () => clearInterval(interval); // Clear interval on unmount
    }, []); // Run effect only once on mount

    return (
        <ResponsiveContainer width="80%" height={300}>
            <BarChart data={data}>
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="height" fill="#007bff">
                    {
                        data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                                stroke={entry.border}
                                strokeWidth={entry.width} />
                        ))
                    }
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

export default Timeline;
