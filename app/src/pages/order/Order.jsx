// Order.jsx
import './Order.css';
import {useEffect, useState} from "react";
import {API_ENDPOINT} from "../../globals.js";
import OrderButton from "../../components/order/OrderButton.jsx";

// Toy data
const toyPizzas = [
	{name: "Margherita", price: 5},
	{name: "Pepperoni", price: 7},
	{name: "Vegetarian", price: 6},
	{name: "Four Cheese", price: 8},
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
				<div className="pizza-menu">
					<h3 className="text-xl">
						Menu:
					</h3>

					<ul className="pizza-list">
						{pizzas.map((pizza, index) => (
							<Pizza key={index} name={pizza.name} price={pizza.price} className="pizza"
							       onClick={() => addToOrder(pizza)}/>
						))}
					</ul>
				</div>
				<div className="pizza-order">
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
					<OrderButton order={order}/>
				</div>
			</div>
		</div>
	);
};

export default Order;
