'use client'

import './order/Order.css';
import {useEffect, useState} from "react";
import OrderButton from "@/app/components/order/OrderButton.jsx";
import Timeline from "@/app/components/Timeline.jsx";
import ErrorMessage from "@/app/components/ErrorMessage.jsx";

const EVERY_X_SECONDS = 60;

const Pizza = ({name, price, className, onClick}) => {
	return (
		<li className={className} onClick={onClick}>
			{price}€ {name}
		</li>
	);
}

// Order component
const Page = () => {
	// State to hold the order
	const [error, setError] = useState('');
	const [pizzas, setPizzas] = useState([]);
	const [timeslot, _setTimeslot] = useState('');
	const [order, setOrder] = useState({name: '', pizzas: [], timeslot: '', comment: ''});

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
				setPizzas(data);
			})
	}, []);

	/**
	 * Set the name of the order
	 * @param e
	 */
	const setName = (e) => {
		const name = e.target.value;
		const pizzas = [...order.pizzas];
		setOrder({name: name, pizzas: pizzas, timeslot: order.timeslot});
	};

	/**
	 * Set the comment of the order
	 */
	const setComment = (e) => {
		const comment = e.target.value;
		setOrder({name: order.name, pizzas: order.pizzas, timeslot: order.timeslot, comment: comment});
	}

	/**
	 * Set the timeslot of the order
	 * @param timeslot the timeslot as string in the format HH:MM
	 */
	const setTimeslot = (timeslot) => {
		setError('');

		// Check if the timeslot is not in the past
		const time = new Date();
		time.setHours(timeslot.split(':')[0]);
		time.setMinutes(timeslot.split(':')[1]);

		const currentTime = new Date();
		if (time < currentTime) {
			setError('You cannot choose a timeslot in the past.');
			return;
		}

		// Minimum time per pizza is 5 minutes
		const minTime = new Date();
		minTime.setMinutes(minTime.getMinutes() + order.pizzas.length * 5);
		if (time < minTime) {
			setError('Minimum time for the order is ' + minTime.toLocaleTimeString());
			return;
		}

		_setTimeslot(timeslot);
		setOrder({name: order.name, pizzas: order.pizzas, timeslot: timeslot});
	}

	/**
	 * Add a pizza to the order
	 * @param pizza
	 */
	const addToOrder = (pizza) => {
		const newOrder = [...order.pizzas];
		newOrder.push(pizza);
		setOrder({name: order.name, pizzas: newOrder, timeslot: order.timeslot});
	}

	/**
	 * Remove a pizza from the order
	 * @param index
	 */
	const removeFromOrder = (index) => {
		const newOrder = [...order.pizzas];
		newOrder.splice(index, 1);
		setOrder({name: order.name, pizzas: newOrder, timeslot: order.timeslot});
	}


	return (
		<div className="content">
			<h2 className="text-2xl">Order your pizza at Sommerfest 2024!</h2>
			<div className="mb-3 text-lg font-light text-gray-600 leading-7">
				{/*Hey hey, welcome to Sommerfest 2024! This is the official ordering system for pizzas, so feel free to choose your pizza(-s) below and pay when collecting at the counter (cash!) . You can then choose your pick-up time (please note: some slots may be overfilled).
All of our pizzas can be ordered as whole or halved; see the irgedients list below for details on each pizza.
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
						{pizzas
							.filter(pizza => pizza.enabled)
							.map((pizza, index) => (
								<Pizza key={index} name={pizza.name} price={pizza.price} className="pizza"
								       onClick={() => addToOrder(pizza)}/>
							))}
						{!pizzas.length && <p>Loading...</p>}
					</ul>
				</div>
				<div>
					<h3 className="text-xl">
						Your current order:
					</h3>

					<ul className="pizza-list">
						{order.pizzas.map((pizza, index) => (
							<Pizza key={index} name={pizza.name} price={pizza.price} className="pizza order"
							       onClick={() => removeFromOrder(index)}/>
						))}
					</ul>

					<div className="mb-3">
						<p>
							Total: {order.pizzas.reduce((total, pizza) => total + pizza.price, 0)}€
						</p>
						{timeslot && <p className="font-light text-xs">
							Your order will be ready at {timeslot}
						</p>
						}
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

				<Timeline startDate={start} stopDate={end} setTimeslot={(entry) => setTimeslot(entry)}
				          every_x_seconds={EVERY_X_SECONDS}/>
			</div>
		</div>
	);
};

export default Page;
