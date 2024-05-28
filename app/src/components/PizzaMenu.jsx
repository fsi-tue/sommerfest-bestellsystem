// PizzaMenu.jsx
import './PizzaMenu.css';
import {useState} from "react";
import PropTypes from "prop-types";

// Toy data
const pizzas = [
	{name: "Margherita", price: 5},
	{name: "Pepperoni", price: 7},
	{name: "Vegetarian", price: 6},
	{name: "Four Cheese", price: 8},
];


// Fetch the pizza menu from the server
fetch('/api/pizzas')
	.then(response => response.json())
	.then(data => {
		console.log(data);
	})

const OrderPizza = ({order}) => {
	if (!order || order.length === 0) {
		return;
	}

	// Function to order the pizzas
	const orderPizza = () => {
		fetch('/api/order', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(order),
		})
			.then(response => response.json())
			.then(data => {
				console.log(data);
			})
	}

	return (
		<button onClick={() => orderPizza()}>
			Order now
		</button>
	);
}

OrderPizza.parameters = {
	order: [],
}

OrderPizza.propTypes = {
	order: PropTypes.array,
}

// PizzaMenu component
const PizzaMenu = () => {
	// State to hold the order
	const [order, setOrder] = useState([]);

	// Function to add a pizza to the order
	const addToOrder = (pizza) => {
		setOrder([...order, pizza]);
	}

	// Function to remove a pizza from the order
	const removeFromOrder = (index) => {
		const newOrder = [...order];
		newOrder.splice(index, 1);
		setOrder(newOrder);
	}


	return (
		<div className="content">
			<h2>Pizza Menu</h2>

			<div className="pizza-menu-container">
				<div className="pizza-menu">
					<p>
						Here is our current menu:
					</p>
					<ul className="pizza-list">
						{pizzas.map((pizza, index) => (
							<li key={index} className="pizza" onClick={() => addToOrder(pizza)}>
								{pizza.price}€ {pizza.name}
							</li>
						))}
					</ul>
				</div>
				<div className="pizza-order">
					<p>
						Your order:
					</p>
					<ul className="pizza-list">
						{order.map((pizza, index) => (
							<li key={index} className="pizza order" onClick={() => removeFromOrder(index)}>
								{pizza.price}€ {pizza.name}
							</li>
						))}
					</ul>

					<p>
						Total: {order.reduce((total, pizza) => total + pizza.price, 0)}€
					</p>
					<OrderPizza order={order}/>
				</div>
			</div>
		</div>
	);
};

export default PizzaMenu;
