'use client'

import './order/Order.css';
import {useEffect, useState} from "react";
import OrderButton from "@/app/components/order/OrderButton.jsx";
import Timeline from "@/app/components/Timeline.jsx";
import ErrorMessage from "@/app/components/ErrorMessage.jsx";
import {ORDER} from "@/config";

const EVERY_X_SECONDS = 60;

const Food = ({ food, className, onClick }) => {
	return (
		<li className={`${className} flex items-center justify-between p-4 bg-gray-100 rounded-md shadow-md mb-4`} onClick={onClick}>
			<div>
				<span className="font-bold">{food.price}€ {food.name}</span>
			</div>
			<div className="flex space-x-2">
				<span className="px-2 py-1 text-xs font-semibold text-white bg-blue-500 rounded-full">{food.dietary}</span>
				<span className="px-2 py-1 text-xs font-semibold text-white bg-green-500 rounded-full">{food.type}</span>
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

	/**
	 * Set the name of the order
	 * @param e
	 */
	const setName = (e) => {
		const name = e.target.value;
		setOrder({name: name, items: order.items, comment: order.comment});
	};

	/**
	 * Set the comment of the order
	 */
	const setComment = (e) => {
		const comment = e.target.value;
		setOrder({name: order.name, items: order.items, comment: comment});
	}

	/**
	 * Add food to the order
	 * @param food
	 */
	const addToOrder = (food) => {
		setError('');
		if (order.items.length >= ORDER.MAX_ITEMS) {
			setError('You can only order a maximum of 5 pizzas');
			return;
		}

		const newOrder = [...order.items];
		newOrder.push(food);
		setOrder({name: order.name, items: newOrder, comment: order.comment});
	}

	/**
	 * Remove food from the order
	 * @param index
	 */
	const removeFromOrder = (index) => {
		const newOrder = [...order.items];
		newOrder.splice(index, 1);
		setOrder({name: order.name, items: newOrder, comment: order.comment});
	}


	return (
		<div className="content">
			<h2 className="text-2xl">Order your pizza at Sommerfest 2024!</h2>
			<div className="mb-3 text-lg font-light text-gray-600 leading-7">
				{/*Hey hey, welcome to Sommerfest 2024! This is the official ordering system for food, so feel free to choose your pizza(-s) below and pay when collecting at the counter (cash!) . You can then choose your pick-up time (please note: some slots may be overfilled).
All of our food can be ordered as whole or halved; see the irgedients list below for details on each pizza.
Earliest pick-up time: 17:25, latest order time: 23:40. Thank you for your order and enjoy your evening! */}

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
				<p className="mt-6 text-center">Enjoy your evening!</p>
			</div>

			<div className="flex justify-between gap-4 content-start pizza-menu-container">
				<div>
					<h3 className="text-xl">
						Menu:
					</h3>

					<ul className="pizza-list">
						{foods
							.filter(food => food.enabled)
							.map((food, index) => (
								<Food key={index} food={food} className="pizza"
								       onClick={() => addToOrder(food)}/>
							))}
						{!foods.length && <p>Loading...</p>}
					</ul>
				</div>
				<div>
					<h3 className="text-xl">
						Your current order:
					</h3>

					<ul className="pizza-list">
						{order.items.map((item, index) => (
							<Food key={index} food={item} className="pizza order"
							       onClick={() => removeFromOrder(index)}/>
						))}
					</ul>

					<div className="mb-3">
						<p>
							Total: {order.items.reduce((total, pizza) => total + pizza.price, 0)}€
						</p>
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
					{error === '' && <OrderButton order={order}/>}
				</div>
			</div>
			<div className="timeline-container">
				<h2 className="text-2xl">Timeline</h2>
				<p className="mb-3 text-lg font-light text-gray-600 leading-7">
					Here is the timeline of the orders.
				</p>

				<Timeline startDate={start} stopDate={end} setTimeslot={(entry) => {}}
				          every_x_seconds={EVERY_X_SECONDS}/>
			</div>
		</div>
	);
};

export default Page;
