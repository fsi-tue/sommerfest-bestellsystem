'use client'

import './order/Order.css';
import {useEffect, useState} from "react";
import OrderButton from "@/app/components/order/OrderButton.jsx";
import Timeline from "@/app/components/Timeline.jsx";
import ErrorMessage from "@/app/components/ErrorMessage.jsx";
import {ORDER} from "@/config";
import WithSystemCheck from "./WithSystemCheck.jsx";

const EVERY_X_SECONDS = 60;

const Food = ({ food, className, onClick }) => {
	return (
		<li
			className={`${className} flex items-center justify-between p-3 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 mb-3`}
			onClick={onClick}>
			<div>
				<span className="text-base font-semibold text-gray-900">{food.price}€ {food.name}</span>
			</div>
			<div className="flex space-x-2">
				{food.dietary && <span className="px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">{food.dietary}</span>}
				<span className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">{food.type}</span>
			</div>
		</li>
	);
};

// Order component
const Page = () => {
	// State to hold the order
	const [error, setError] = useState('');
	const [foods, setFoods] = useState([]);
	const [order, setOrder] = useState({name: '', items: [], comment: ''});

	const start = new Date();
	start.setHours(start.getHours() - 1);  // Previous hour
	start.setMinutes(0, 0, 0);

	const end = new Date();
	end.setHours(end.getHours() + 1);  // Next hour
	end.setMinutes(59, 59, 999);

	useEffect(() => {
		// Fetch the pizza menu from the server
		fetch("/api/pizza")
			.then(response => response.json())
			.then(data => {
				setFoods(data);
			})
	}, []);

	const updateOrder = (updatedOrder) => {
		setOrder({ ...order, ...updatedOrder });
	  };

	/**
	 * Set the name of the order
	 * @param e
	 */
	const setName = (e) => {
		updateOrder({ name: e.target.value });
	};

	/**
	 * Set the comment of the order
	 */
	const setComment = (e) => {
		updateOrder({comment: e.target.value});
	}

	/**
	 * Add food to the order
	 * @param food
	 */
	const addToOrder = (food) => {
		setError('');
		if (order.items.length >= ORDER.MAX_ITEMS) {
			setError(`You can only order a maximum of ${ORDER.MAX_ITEMS} items.`);
			setTimeout(() => setError(''), 5000);
			return;
		}

		const newOrder = [...order.items];
		newOrder.push(food);
		updateOrder({ items: newOrder, comment: order.comment });
	}

	/**
	 * Remove food from the order
	 * @param index
	 */
	const removeFromOrder = (index) => {
		setError('');
		const newOrder = [...order.items];
		newOrder.splice(index, 1);
		updateOrder({ items: newOrder });
	}


	return (
		<div>
			<h2 className="text-3xl font-semibold mb-4 text-center">Order your pizza at Sommerfest 2024!</h2>
			<div className="mb-6 text-gray-700 font-light leading-7">
				<ol className="list-decimal list-inside space-y-2">
					<li><strong>Choose Pizza:</strong> Select whole or halved from the list below (a whole pizza has a diameter of
						12 inches / 30 cm).
					</li>
					<li><strong>Pick-Up Time:</strong> Choose a time (some slots may be full).</li>
					<li><strong>Pay in Cash:</strong> Pay when collecting at the counter.</li>
				</ol>
				<div className="mt-4">
					<p><strong>Order Times:</strong></p>
					<p>Earliest pick-up: 17:25</p>
					<p>Latest order: 23:40</p>
				</div>
				<p className="mt-6 text-center text-xl">Enjoy your evening!</p>
			</div>

			<div className="flex flex-col-reverse md:flex-row justify-between gap-6">
				<div className="md:w-1/2 w-full">
					<h3 className="text-2xl font-semibold mb-4">Menu:</h3>
					<ul className="space-y-4">
						{foods
							.filter(food => food.enabled)
							.map((food, index) => (
								<Food key={index} food={food} className="pizza" onClick={() => addToOrder(food)}/>
							))}
						{!foods.length && <p>Loading...</p>}
					</ul>
				</div>

				<div className="md:w-1/2 w-full">
					<h3 className="text-2xl font-semibold mb-4">Your current order:</h3>
					<ul className="space-y-4 mb-6">
						{order.items.map((item, index) => (
							<Food key={index} food={item} className="pizza order" onClick={() => removeFromOrder(index)}/>
						))}
					</ul>

					<div className="mb-6">
						<p
							className="text-lg font-semibold">Total: {order.items.reduce((total, pizza) => total + pizza.price, 0)}€</p>
					</div>

					<div className="mb-6">
						<label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
						<input
							id="name"
							name="name"
							type="text"
							placeholder="Enter your name (optional)"
							className="mt-1 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm mb-4"
							onChange={setName}
						/>
						<label htmlFor="comment" className="block text-sm font-medium text-gray-700">Comment</label>
						<textarea
							id="comment"
							name="comment"
							placeholder="Enter your comment (optional)"
							onChange={setComment}
							className="mt-1 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm mb-4"
						/>
					</div>

					{error && <ErrorMessage error={error}/>}
					<OrderButton order={order} setError={setError}/>

					<div className="timeline-container">
						<h2 className="text-2xl">Timeline</h2>
						<p className="mb-3 text-lg font-light text-gray-600 leading-7">
							Here is the timeline of the orders.
						</p>

						<Timeline startDate={start} stopDate={end}
						          every_x_seconds={EVERY_X_SECONDS}/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default WithSystemCheck(Page);
