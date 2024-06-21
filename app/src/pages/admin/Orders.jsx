import {useEffect, useRef, useState} from "react";
import {API_ENDPOINT, THIS_ENDPOINT} from "../../globals.js";
import {useNavigate} from "react-router-dom";
import {Scanner} from "@yudiel/react-qr-scanner";

const Orders = () => {
	// If there is some script kiddie trying to access this page,
	// and they manage to get here with an invalid token,
	// they should have a cookie or something.
	// Keep it simple, just check if the token is present.
	const token = localStorage.getItem('token') || "";
	const authed = token !== "";
	const navigate = useNavigate();
	if (!authed) {
		navigate("/");
	}

	const [orders, setOrders] = useState([]); // state to hold order status
	const [filter, setFilter] = useState(''); // state to hold order status
	const [filteredOrders, setFilteredOrders] = useState([]); // state to hold order status]
	const [error, setError] = useState('');
	const inputRef = useRef(null);

	// Order states
	const states = ["pending", "paid", "ready", "delivered", "cancelled"];


	// Fetch the order status from the server
	useEffect(() => {
		// Get the order status from the server
		fetch(API_ENDPOINT + '/orders/', {
			headers: {
				'Authorization': `Bearer ${token}`,
			}
		})
			.then(response => response.json())
			.then(data => setOrders(data))
			.catch(error => setError('Error fetching orders'));
	}, []);

	// Update the filtered orders when the orders change
	useEffect(() => {
		setFilteredOrders(orders);
	}, [orders]);

	// Filter the orders
	useEffect(() => {
		if (filter) {
			setFilteredOrders(orders.filter(order => {
				if (order.name.toLowerCase().includes(filter.toLowerCase())) return true;
				if (order._id.toLowerCase().includes(filter.toLowerCase())) return true;
				if (order.status.toLowerCase().includes(filter.toLowerCase())) return true;
				return (order.pizzas || []).some(pizza => pizza.name.toLowerCase().includes(filter.toLowerCase()));
			}));
			// Set input value to filter
			inputRef.current.value = filter;
		} else {
			setFilteredOrders(orders);
		}
	}, [filter, orders]);

	/**
	 * Function to update the order status
	 * @param _id
	 * @param status
	 */
	const updateOrderStatus = (_id, status) => {
		fetch(API_ENDPOINT + '/orders', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`,
			},
			body: JSON.stringify({id: _id, status})
		})
			.then(response => response.json())
			.then(() => {
				// Update the order by id
				const newOrders = orders.map(order => {
					if (order._id === _id) {
						order.status = status;
					}
					return order;
				});
				setOrders(newOrders);
			})
			.catch(error => setError('Error updating order status'));
	}

	/**
	 * Function to convert barcode to order
	 * @param barcode
	 */
	const barcodeToOrder = (barcode) => {
		const linkToOrder = barcode[0].rawValue
		const extractedId = linkToOrder.split('/').pop()
		setFilter(extractedId);
	}

	/**
	 * Function to search the orders
	 * @param e
	 */
	const search = (e) => {
		setFilter(e.target.value);
	}

	const order_url = function (id) {
		return THIS_ENDPOINT + `/order/${id}`;
	}

	return (
		<div className="content">
			<div className="p-4">
				<h2 className="text-2xl mb-4">Order Status</h2>
				<div className="flex items-center justify-between">
					<div className="w-1/2">
						<p className="text-lg">Your order status will be displayed here.</p>
					</div>
					<div className="w-24 h-24">
						<Scanner
							className="w-full h-full border border-gray-300 rounded-md"
							allowMultiple={true} scanDelay={250} paused={false}
							onScan={(result) => barcodeToOrder(result)}
						/>
					</div>
				</div>
			</div>

			<input type="text" placeholder="Search by Name, OrderId, State or Pizza"
			       className="w-full p-2 border border-gray-300 rounded-lg shadow-md mb-4"
			       onChange={search} ref={inputRef}/>

			<div className="flex flex-col space-y-4">
				{filteredOrders && filteredOrders.length > 0 && filteredOrders
					.toSorted((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort by date
					.toSorted((a, b) => {
						if (a.status === b.status) return 0;
						if (a.status === 'pending') return -1;
						if (b.status === 'pending') return 1;
						if (a.status === 'paid') return -1;
						if (b.status === 'paid') return 1;
						if (a.status === 'ready') return -1;
						if (b.status === 'ready') return 1;
						if (a.status === 'delivered') return -1;
						if (b.status === 'delivered') return 1;
						return 0;
					})
					.map((order, index) => ( // Map the orders
						<div key={order._id + index} className="w-full px-2 py-2">
							<div className="bg-white border border-gray-300 rounded-lg shadow-md p-4 relative">
								<a className="text-xs font-light text-gray-500 mb-0" href={order_url(order._id)}>{order._id}</a>
								<div className="text-xl font-semibold mb-2">{order.name}</div>
								<div className="flex gap-1 items-center justify-start">
                                    <span
	                                    className="text-xs text-gray-700 mr-2 uppercase tracking-wider mb-2 rounded px-2 py-0.5 bg-gray-200">
                                        {order.status}
                                    </span>
									<span
										className="text-xs text-gray-700 mr-2 uppercase tracking-wider mb-2 rounded px-2 py-0.5 bg-gray-200">
                                        {order.totalPrice}€
                                    </span>
									<span
										className="text-xs text-gray-700 mr-2 uppercase tracking-wider mb-2 rounded px-2 py-0.5 bg-gray-200">
                                        {order.createdAt}
                                    </span>
								</div>
								<ul className="list-disc list-inside text-sm font-light text-gray-600 mb-4">
									{(order.pizzas || []).map(pizza => (
										<li key={pizza.name}>{pizza.name}: {pizza.price}€</li>
									))}
								</ul>

								<div className="flex gap-1 items-center justify-start font-light">
									{states.map(state => (
										<button
											disabled={state === order.status} key={state}
											style={{background: order.status === state ? 'green' : 'gray'}}
											className={`bg-${state === order.status ? 'green' : 'gray'}-500 hover:bg-${state === order.status ? 'green' : 'gray'}-600 text-white font-bold py-0.5 px-1 rounded`}
											onClick={() => updateOrderStatus(order._id, state)}
										>
											{state}
										</button>
									))}
								</div>
							</div>
						</div>
					))}
			</div>
		</div>
	);
}


export default Orders;
