// Button to order the pizzas
import PropTypes from "prop-types";
import {useNavigate} from "react-router-dom";
import {API_ENDPOINT} from "../../globals.js";

const OrderButton = ({order}) => {
	const navigate = useNavigate();

	const pizzas = order.pizzas;
	const name = order.name;

	if (pizzas.length === 0) {
		return;
	}

	const body = {
		name: name,
		pizzas: pizzas
	}

	// Function to order the pizzas
	const orderPizza = () => {
		fetch(API_ENDPOINT + '/orders', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		})
			.then(response => response.json())
			.then(data => {
				if (data.orderId) {
					console.log(`Order ID: ${data.orderId}`)
					navigate(`/order/thank-you/${data.orderId}`)
				}
			})
	}

	return (
		<>
			<button onClick={() => orderPizza()}>
				Order now
			</button>
		</>
	);
}

OrderButton.parameters = {
	order: {}
}

OrderButton.propTypes = {
	order: PropTypes.object
}

export default OrderButton;
