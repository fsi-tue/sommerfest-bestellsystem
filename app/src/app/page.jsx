'use client'

import './order/Order.css';
import {useEffect, useState} from "react";
import {API_ENDPOINT} from "./globals.js";
import OrderButton from "./components/order/OrderButton.jsx";
import Timeline from "./components/Timeline.jsx";

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
	const [order, setOrder] = useState({name: '', pizzas: []})
	const [pizzas, setPizzas] = useState([]);

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
		setOrder({name: name, pizzas: pizzas});
	};

	/**
	 * Add a pizza to the order
	 * @param pizza
	 */
	const addToOrder = (pizza) => {
		const newOrder = [...order.pizzas];
		newOrder.push(pizza);
		setOrder({name: order.name, pizzas: newOrder});
	}

	/**
	 * Remove a pizza from the order
	 * @param index
	 */
	const removeFromOrder = (index) => {
		const newOrder = [...order.pizzas];
		newOrder.splice(index, 1);
		setOrder({name: order.name, pizzas: newOrder});
	}


	return (
		<div className="content">
			<h2 className="text-2xl">Order your pizza at Sommerfest 2024!</h2>
			<div className="mb-3 text-lg font-light text-gray-600 leading-7">
				{/*Hey hey, welcome to Sommerfest 2024! This is the official ordering system for pizzas, so feel free to choose your pizza(-s) below and pay when collecting at the counter (cash!) . You can then choose your pick-up time (please note: some slots may be overfilled).
All of our pizzas can be ordered as whole or halved; see the irgedients list below for details on each pizza.
Earliest pick-up time: 17:25, latest order time: 23:40. Thank you for your order and enjoy your evening! */}

				<ul className="list-disc list-inside space-y-2">
					<li><strong>Choose Pizza:</strong> Select whole or halved from the list below.</li>
					<li><strong>Pick-Up Time:</strong> Choose a time (some slots may be full).</li>
					<li><strong>Pay in Cash:</strong> Pay when collecting at the counter.</li>
				</ul>
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
						{order.length > 0 && <p className="font-light text-xs">
							Your order will be ready in {order.length * 10} minutes
						</p>}
					</div>
					<div className='mb-3'>
						<input name="name" type="text" placeholder="Enter your name (optional)"
						       className="p-2 border border-gray-300 rounded-lg shadow-md mb-4" onChange={setName}/>
					</div>
					<OrderButton order={order}/>
				</div>
			</div>
			<div className="timeline-container">
				<h2 className="text-2xl">Timeline</h2>
				<p className="mb-3 text-lg font-light text-gray-600 leading-7">
					Here is the timeline of the orders.
				</p>

				<Timeline startDate={start} stopDate={end} API_ENDPOINT={API_ENDPOINT}
				          every_x_seconds={EVERY_X_SECONDS}/>
			</div>
		</div>
	);
};

export default Page;
