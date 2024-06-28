'use client'

import './order/Order.css';
import { useEffect, useState } from "react";
import OrderButton from "@/app/components/order/OrderButton.jsx";
import Timeline from "@/app/components/Timeline.jsx";
import ErrorMessage from "@/app/components/ErrorMessage.jsx";
import { ORDER } from "@/config";
import WithSystemCheck from "./WithSystemCheck.jsx";

const EVERY_X_SECONDS = 60;

const Food = ({ food, className, onClick }) => {
	return (
		<li
			className={`${className} flex items-center justify-between p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 mb-4`}
			onClick={onClick}>
			<div>
				<span className="text-base font-semibold text-gray-900">{food.price}€ {food.name}</span>
			</div>
			<div className="flex space-x-2">
				{food.dietary && <span
					className="px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full">{food.dietary}</span>}
				<span className="px-3 py-1 text-xs font-semibold text-green-600 bg-green-100 rounded-full">{food.type}</span>
			</div>
		</li>
	);
};

const FloatingIslandElement = ({content, title}) => {
	return (
		<div className="bg-white-50 dark:bg-white-700 p-2 text-nowrap h-full flex flex-col items-center justify-center">
			<div className="flex flex-col items-center justify-center max-w-48 overflow-x-auto text-center">
				<div className="">
					{content}
				</div>
			</div>
			<div className="self-start mt-1 font-light leading-7 text-gray-800">
				{title}
			</div>
		</div>
	)
}


const PizzaIngredientsTable = () => {
	const tableCellClass = "border border-gray-300 px-4 py-2";
	const headerCellClass = `bg-gray-200 ${tableCellClass}`;

	const pizzas = [
		{ name: "Salami", ingredients: ["Cheese 🧀","Tomato Sauce 🍅","Salami 🍕"] },
		{ name: "Ham and mushrooms", ingredients: ["Cheese 🧀","Tomato Sauce 🍅", "Ham 🥓", "Mushrooms 🍄"] },
		{ name: "Capriccosa", ingredients: ["Cheese 🧀","Tomato Sauce 🍅","Mushrooms 🍄", "Artichokes 🌱", "Olives 🫒", "Ham 🥓", "Basil 🌿"] },
		{ name: "Margherita", ingredients: ["Cheese 🧀","Tomato Sauce 🍅","Basil 🌿"] },
		{ name: "Veggies", ingredients: ["Cheese 🧀", "Tomato Sauce 🍅", "Mushrooms 🍄", "Onions 🧅", "Green Peppers 🫑", "Olives 🫒"] },
		{ name: "Margherita vegan", ingredients: ["Vegan Cheese 🧀","Tomato Sauce 🍅","Basil 🌿"] },
		{ name: "Capriccosa vegan", ingredients: ["Vegan Cheese 🧀","Tomato Sauce 🍅","Mushrooms 🍄", "Artichokes 🌱", "Olives 🫒", "Basil 🌿"] }
	];

	return (
		<div className="container mx-auto p-4">
			<h2 className="text-2xl font-bold mb-4">Pizza Ingredients</h2>
			<table className="table-auto w-full border-collapse border border-gray-300">
				<thead>
					<tr>
						<th className={headerCellClass}>Pizza</th>
						<th className={headerCellClass}>Ingredients</th>
					</tr>
				</thead>
				<tbody>
					{pizzas.map((pizza, index) => (
						<tr key={index}>
							<td className={tableCellClass}>
								<a href="#selectorder">{pizza.name}</a>
							</td>
							<td className={tableCellClass}>
								<a href="#selectorder">{pizza.ingredients.join(", ")}</a>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

// Order component
const Page = () => {
	// State to hold the order
	const [error, setError] = useState('');
	const [foods, setFoods] = useState([]);
	const [order, setOrder] = useState({name: '', items: [], comment: '', timeslot: null});

	// Set the start and end date for the timeline
	const start = new Date();
	start.setHours(start.getHours() - 1);  // Previous hour
	start.setMinutes(0, 0, 0);

	const end = new Date();
	end.setHours(end.getHours() + 1);  // Next hour
	end.setMinutes(59, 59, 999);

	// Fetch the pizza menu from the server
	useEffect(() => {
		// Fetch the pizza menu from the server
		fetch("/api/pizza")
			.then(async response => {
				const data = await response.json();
				if (!response.ok) {
					const error = (data && data.message) || response.statusText;
					throw new Error(error);
				}
				return data;
			})
			.then(data => {
				setFoods(data);
			})
			.catch(error => {
				console.error('There was an error!', error);
				setError(error.message);
			});
	}, []);

	/**
	 * Update the order with the new values
	 * @param updatedOrder
	 */
	const updateOrder = (updatedOrder) => {
		setOrder({...order, ...updatedOrder});
	};

	/**
	 * Add food to the order
	 * @param food
	 */
	const addToOrder = (food) => {
		setError('');
		const newOrder = [...order.items];
		newOrder.push(food);
		updateOrder({ items: newOrder });
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

	/**
	 * Set the timeslot of the order
	 */
	const setTimeslot = (timeslot) => {
		updateOrder({timeslot: timeslot});
	}

	/**
	 * Set the name of the order
	 * @param name
	 */
	const setName = (name) => {
		updateOrder({name: name});
	};

	/**
	 * Set the comment of the order
	 */
	const setComment = (e) => {
		updateOrder({comment: e.target.value});
	}


	return (
		<div>
			<h2 className="text-4xl font-extrabold mb-6 text-center text-gray-900">Order your pizza at Sommerfest 2024!</h2>
			<div className="mb-8 font-light leading-7 text-gray-800">
				<ol className="list-decimal list-inside space-y-4">
					<li>
						<p className="text-lg font-semibold">Choose Pizza:</p>
						<p>Select whole or halved from the list below (a whole pizza has a diameter of 12 inches / 30 cm).</p>
					</li>
					<li>
						<p className="text-lg font-semibold">Pick-Up Time:</p>
						<p>Choose a time (some slots may be full).</p>
					</li>
					<li>
						<p className="text-lg font-semibold">Pay in Cash:</p>
						<p>Pay when collecting at the counter.</p>
					</li>
				</ol>
				<div className="mt-6">
					<p className="text-lg font-semibold">Order Times:</p>
					<p>Earliest pick-up: 17:25</p>
					<p>Latest order: 23:40</p>
				</div>
				<p className="mt-8 text-center text-xl text-gray-700">Enjoy your evening!</p>
			</div>

			<div className="flex flex-col md:flex-row justify-between gap-8">
				<div className="md:w-1/2 w-full">
					<h3 className="text-2xl font-semibold mb-6 text-gray-900">Menu:</h3>
					<a id='selectorder'></a>
					<ul className="space-y-4">
						{foods
							.filter(food => food.enabled)
							.map((food, index) => (
								<Food
									key={index}
									food={food}
									className="pizza"
									onClick={() => addToOrder(food)}
								/>
							))}
						{!foods.length && <p>Loading...</p>}
					</ul>
				</div>

				<div className="md:w-1/2 w-full">
					<a id="order"/>
					<h3 className="text-2xl font-semibold mb-6 text-gray-900">Your current order:</h3>
					{error && <ErrorMessage error={error} />}
					<ul className="space-y-4 mb-6">
						{order.items
							.map((food, index) => (
								<Food
									key={index}
									food={food}
									className="pizza order"
									onClick={() => removeFromOrder(food)}
								/>
							))}
					</ul>

					{/* <div className="mb-6">
						<p
							className="text-lg font-semibold text-gray-900">Total: {order.items.reduce((total, pizza) => total + pizza.price, 0)}€</p>
						<p className="text-lg font-semibold text-gray-900">Timeslot: {order.timeslot}</p>
					</div> */}

					<div className="mb-6">
						<label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
						<input
							id="name"
							name="name"
							type="text"
							placeholder="Enter your name (optional)"
							className="mt-1 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm mb-4"
							onChange={(e) => setName(e.target.value)}
						/>
						<label htmlFor="comment" className="block text-sm font-medium text-gray-700">Comment</label>
						<textarea
							id="comment"
							name="comment"
							placeholder="Enter your comment (optional)"
							className="mt-1 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm mb-4"
							onChange={(e) => setComment(e.target.value)}
						/>
					</div>

					<div className="timeline-container mt-8">
						<h2 className="text-2xl font-semibold mb-4 text-gray-900">Timeslot</h2>
						<p className="mb-4 text-lg font-light leading-7 text-gray-800">Select your timeslot for pick-up.</p>

						<Timeline startDate={start} stopDate={end} setTimeslot={setTimeslot} every_x_seconds={EVERY_X_SECONDS} />
					</div>
					<PizzaIngredientsTable />
				</div>
			</div>

			{/* Floating island */}
			<div
				className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-white px-3 py-3 rounded-2xl shadow-2xl transition-shadow duration-300">
				<div className="flex items-center justify-between">
					<FloatingIslandElement title="Pizzas" content={order.items.reduce((total, item) => total + item.size, 0)}/>
					<div className="mx-2 bg-gray-300 dark:bg-white-600 w-px h-10 inline-block"/>
					<FloatingIslandElement title="Total Price"
					                       content={`${order.items.reduce((total, item) => total + item.price, 0)}€`}/>
					<div className="mx-2 bg-gray-300 dark:bg-white-600 w-px h-10 inline-block"/>
					<FloatingIslandElement title="Timeslot" content={order.timeslot ?? 'Not selected'}/>
					<div className="mx-2 bg-gray-300 dark:bg-white-600 w-px h-10 inline-block"/>
					<OrderButton order={order} setError={setError}/>
				</div>
			</div>
		</div>
	);
};

export default WithSystemCheck(Page);
