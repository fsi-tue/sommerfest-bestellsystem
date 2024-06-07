// Orders.jsx


import Timeline from "../../components/Timeline.jsx";

import {API_ENDPOINT} from "../../globals.js";

const every_x_seconds = 60;

const Orders = () => {
	const start = new Date();
	start.setHours(start.getHours() - 1);  // Previous hour
	start.setMinutes(0, 0, 0);

	const end = new Date();
	end.setHours(end.getHours() + 1);  // Next hour
	end.setMinutes(59, 59, 999);

	// Get the order IDs from local storage
	const orderIds = JSON.parse(localStorage.getItem('orderIds')) || [];

	return (
		<div className="content">
			<h2 className="text-2xl">History</h2>

			{orderIds.length === 0 &&
				<p className="text-lg font-light text-gray-600 leading-7">
					You have no orders.
				</p>}

			{orderIds.length > 0 &&
				<div className="text-lg font-light text-gray-600 leading-7">
					Your orders:
					<ul className="list-disc pl-8">
						{orderIds.map((orderId, index) => (
							<li key={index}>
								<a href={`/order/${orderId}`}>{orderId}</a>
							</li>
						))}
					</ul>
				</div>
			}

			<div className="timeline-container">
				<h2 className="text-2xl">Timeline</h2>
				<p className="mb-3 text-lg font-light text-gray-600 leading-7">
					Here is the timeline of the orders.
				</p>

				<Timeline startDate={start} stopDate={end} API_ENDPOINT={API_ENDPOINT}
				          every_x_seconds={every_x_seconds}/>
			</div>
		</div>
	);
};

export default Orders;
