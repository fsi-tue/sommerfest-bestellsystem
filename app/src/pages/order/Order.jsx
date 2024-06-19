// Order.jsx
import './Order.css';
import {useEffect, useState} from "react";
import {API_ENDPOINT} from "../../globals.js";
import OrderButton from "../../components/order/OrderButton.jsx";
import Timeline from "../../components/Timeline.jsx";


const every_x_seconds = 60;

// Toy data
const toyPizzas = [
	// {name: "Margherita", price: 5},
	// {name: "Pepperoni", price: 7},
	// {name: "Vegetarian", price: 6},
	// {name: "Four Cheese", price: 8},
];

const Pizza = ({name, price, className, onClick}) => {
	return (
		<li className={className} onClick={onClick}>
			{price}€ {name}
		</li>
	);
}

// Order component
const Order = () => {
	// State to hold the order
	const [order, setOrder] = useState({name: '', pizzas: []})
	const [pizzas, setPizzas] = useState(toyPizzas);
	const setName = (e) => {
        const name = e.target.value;
		const pizzas = [...order.pizzas];
		setOrder({name: name, pizzas: pizzas});
	};

	const start = new Date();
	start.setHours(start.getHours() - 1);  // Previous hour
	start.setMinutes(0, 0, 0);

	const end = new Date();
	end.setHours(end.getHours() + 1);  // Next hour
	end.setMinutes(59, 59, 999);

	useEffect(() => {
		// Fetch the pizza menu from the server
		fetch(API_ENDPOINT + "/pizzas")
			.then(response => response.json())
			.then(data => {
				setPizzas(data);
			})
	}, []);

	// Function to add a pizza to the order
	const addToOrder = (pizza) => {
		const newOrder = [...order.pizzas];
		newOrder.push(pizza);
		setOrder({name: order.name, pizzas: newOrder});
	}

	// Function to remove a pizza from the order
	const removeFromOrder = (index) => {
		const newOrder = [...order.pizzas];
		newOrder.splice(index, 1);
		setOrder({name: order.name, pizzas: newOrder});
	}


	return (
		<div className="content">
			<h2 className="text-2xl">Order your favorite pizza</h2>
			<p className="mb-3 text-lg font-light text-gray-600 leading-7">
				Welcome to our pizza ordering service. Please select the pizzas you would like to order from the menu
				below.
			</p>

			<div className="flex justify-between gap-4 content-start pizza-menu-container">
				<div>
					<h3 className="text-xl">
						Menu:
					</h3>

					<ul className="pizza-list">
						{pizzas.map((pizza, index) => (
							<Pizza key={index} name={pizza.name} price={pizza.price} className="pizza"
							       onClick={() => addToOrder(pizza)}/>
						))}
						<p style={pizzas.length!=0?{display:"none"}:{color:"red"}}>Error: could not fetch pizzas</p>
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
						<input name="name" type='text' placeholder="Your name if you like (or anon)" className="p-2 border border-gray-300 rounded-lg shadow-md mb-4"
                		onChange={setName} />
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
				          every_x_seconds={every_x_seconds}/>
			</div>
		</div>
	);
};

export default Order;
