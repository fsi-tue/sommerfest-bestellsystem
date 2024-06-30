'use client'

import {useEffect, useState} from 'react';
import PropTypes from "prop-types";
import {Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';

const Timeline = ({startDate, stopDate, every_x_seconds, setTimeslot}) => {
	const [data, setData] = useState([]);

	useEffect(() => {
		const fetchData = () => {
			fetch('/api/timeline')
				.then(response => response.json())
				.then(jsonData => setData(jsonData))
				.catch(error => {
					console.error('Error fetching timeline data', error);
					const timeSlots = [];
					const currentTime = new Date(startDate);

					// Generate time slots
					while (currentTime <= stopDate) {
						timeSlots.push({time: currentTime.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})});
						currentTime.setMinutes(currentTime.getMinutes() + 5);
					}
					setData(timeSlots.map(timeSlot=> ({
						time: timeSlot.time,
						height: 0,
					})));
				})
		};

		fetchData(); // Fetch data initially
		const interval = setInterval(fetchData, every_x_seconds * 1000); // Fetch data every x seconds
		return () => clearInterval(interval); // Clear interval on unmounting
	}, []); // Run effect only once on mount

	return (
		<ResponsiveContainer height={300}>
			<BarChart data={data} onClick={(event) => setTimeslot(event.activeLabel)}
			          margin={{top: 5, right: 30, left: -30, bottom: 5}}>
				<XAxis dataKey="time"/>
				<YAxis/>
				<Tooltip/>
				<Bar dataKey="Orders" fill="#007bff">
					{
						data.map((entry, index) => (
							<Cell
								key={`cell-${index}`}
								fill={entry.color}
								stroke={entry.border}
								strokeWidth={entry.borderwidth}/>
						))
					}
				</Bar>
			</BarChart>
		</ResponsiveContainer>
	);
};

Timeline.propTypes = {
	startDate: PropTypes.instanceOf(Date),
	stopDate: PropTypes.instanceOf(Date),
	every_x_seconds: PropTypes.number,
	setTimeslot: PropTypes.func
};

Timeline.parameters = {
	startDate: new Date(),
	stopDate: new Date(),
	every_x_seconds: 60,
	setTimeslot: () => {
	}
};

export default Timeline;
