'use client'

import {useEffect, useState} from "react";
import {getFromLocalStorage} from "@/lib/localStorage";
import ErrorMessage from "@/app/components/ErrorMessage.jsx";
import {formatDateTime, getDateFromTimeSlot} from "@/lib/time";
import WithAuth from "../WithAuth.jsx";


const Page = () => {
	const [error, setError] = useState('');
	const [orders, setOrders] = useState([]);
	const [currentTime, setCurrentTime] = useState(new Date());
	const [isClient, setIsClient] = useState(false);

	const token = getFromLocalStorage('token', '');
	const headers = {
		'Content-Type': 'application/json',
		'Authorization': `Bearer ${token}`,
	};

	useEffect(() => {
		setIsClient(true);
	}, []);

	useEffect(() => {
		if (isClient) {
			fetch('/api/order', {headers})
				.then(async response => {
					const data = await response.json();
					if (!response.ok) {
						const error = (data && data.message) || response.statusText;
						throw new Error(error);
					}
					setOrders(data);
				})
				.catch(error => setError(error.message));
		}
	}, [isClient]);

	/**
	 * Function to update the order status
	 * @param _id
	 * @param status
	 */
	const updateOrderStatus = (_id, status) => {
		fetch('/api/order', {
			method: 'PUT',
			headers: headers,
			body: JSON.stringify({ id: _id, status })
		})
			.then(async response => {
				const data = await response.json();
				if (!response.ok) {
					const error = (data && data.message) || response.statusText;
					throw new Error(error);
				}
				return data;
			})
			.then(() => {
				// Update the order by id
				setOrders(prevOrders =>
					prevOrders.map(order =>
						order._id === _id ? { ...order, status } : order
					)
				);
			})
			.catch(error => setError(error.message));
	};

	useEffect(() => {
		if (isClient) {
			const timer = setInterval(() => {
				setCurrentTime(new Date());
			}, 1000);

			return () => clearInterval(timer); // Cleanup timer on component unmount
		}
	}, []);

	const hasComment = (order) => {
		return (
			typeof order.comment === "string" &&
			order.comment !== "" &&
			order.comment.toLowerCase() !== "No comment".toLowerCase()
		);
	};

	const actions = {
		cancel: (_id) => {
			updateOrderStatus(_id, 'cancelled');
		},
		setFoodStatus: (order, item, checked) => {
			const index = order.items.indexOf(item);
			const newOrder = { ...order };
			newOrder.items[index] = { ...item, status: checked ? 'done' : 'pending' };
			setOrders(prevOrders =>
				prevOrders.map(o =>
					o._id === order._id ? newOrder : o
				)
			);
		},
		undone: (_id) => {
			updateOrderStatus(_id, 'pending');
		},
		done: (_id) => {
			updateOrderStatus(_id, 'baking');
		},
	};

	return (
		<div>
			<div>
				<div className="p-4">
					<h2 className="text-2xl mb-4">Food Pipeline 🍕</h2>
				</div>

				<div className="flex flex-col space-y-2">
					{orders && orders.length > 0 && orders
						.toSorted((a, b) => new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime()) // Sort by date
						.filter(order => !['ready', 'delivered', 'cancelled'].includes(order.status))
						.map((order, index) => (
							<div key={index} className="bg-white rounded-lg shadow-sm p-2">
								<div className="mb-2">
									<div className="flex justify-between items-center">
										<div className="flex space-x-2 flex-wrap">
										    <span
											    className="inline-flex items-center px-2.5 py-0.5 m-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
											    {order._id}
										    </span>
											<span
												className="inline-flex items-center px-2.5 py-0.5 m-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
										      {order.name}
										    </span>
											<span
												className={`inline-flex items-center px-2.5 py-0.5 m-0.5 rounded-full text-sm font-medium text-gray-800
												    ${order.status === 'pending' ? 'bg-yellow-100' : ''}
												    ${order.status === 'paid' ? 'bg-orange-100' : ''}
												    ${order.status === 'baking' ? 'bg-green-100' : ''}`}>
												  {order.status}
												</span>
										</div>
									</div>
									{hasComment(order) && <div className="text-sm ml-2">
										<span>Comment:</span>
										<span className="pl-4 italic">{order.comment}</span>
									</div>}
									<div className="text-xs font-light text-gray-600">
										{order.items && (
											<table className="w-full text-left">
												<thead>
												<tr>
													<th className="px-2 py-1 w-1/2">Item</th>
													<th className="px-2 py-1 w-1/4">Timeslot</th>
													<th className="px-2 py-1 w-1/4">Status</th>
												</tr>
												</thead>
												<tbody>
												{order.items.map((item, itemIndex) => (
													<tr key={itemIndex} className="border-t">
														<td className="px-2 py-1 text-sm font-bold w-1/2">{item.name}</td>
														<td
															className={`px-2 py-1 w-1/4
																${getDateFromTimeSlot(order.timeslot).toDate().getTime() < new Date().getTime() && item.status !== 'done' ? 'bg-red-100' : ''}`}>
															{formatDateTime(getDateFromTimeSlot(order.timeslot).toDate())}
														</td>
														<td className="px-2 py-1 w-1/4">
															<label className="inline-flex items-center">
																<input type="checkbox" className="form-checkbox h-6 w-6 rounded"
																       onChange={(event) => actions.setFoodStatus(order, item, event.target.checked)}/>
																<span className="ml-2 text-gray-700">Done</span>
															</label>
														</td>
													</tr>
												))}
												</tbody>
											</table>
										)}
									</div>
								</div>
								<div className="flex justify-between items-center">
									<button onClick={() => actions.cancel(order._id)}
									        className="px-2 py-1 text-xs rounded border border-gray-300 hover:bg-gray-100">Cancel
									</button>
									<button onClick={() => actions.undone(order._id)}
									        disabled={order.status === 'pending'}
									        className="px-2 py-1 text-xs rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50">Undone
									</button>
									<button onClick={() => actions.done(order._id)}
									        disabled={order.items.some(item => item.status !== 'done')}
									        className="px-2 py-1 text-xs rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50">Done
									</button>
								</div>
							</div>
						))}
				</div>
			</div>
		</div>
	);
}

export default WithAuth(Page);
