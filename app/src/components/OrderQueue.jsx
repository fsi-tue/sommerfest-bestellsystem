// OrderQueue.jsx
import React from 'react';
import Timeline from './Timeline.jsx';


const API_ENDPOINT = "http://localhost:3000";
const every_x_seconds = 60;

const OrderQueue = () => {
    const start = new Date();
    start.setHours(start.getHours() - 1);  // Previous hour
    start.setMinutes(0, 0, 0);

    const end = new Date();
    end.setHours(end.getHours() + 1);  // Next hour
    end.setMinutes(59, 59, 999);

    return (
        <div>
            <p>OrderQueue</p>
            <div className="timeline-container">
                <Timeline startDate={start} stopDate={end} API_ENDPOINT={API_ENDPOINT} every_x_seconds={every_x_seconds} />
            </div>
        </div>
    );
};

export default OrderQueue;
