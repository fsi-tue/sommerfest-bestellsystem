import PropTypes from "prop-types";
import {useRouter} from "next/navigation";
import {useState} from "react";
import {addToLocalStorage, getFromLocalStorage} from "../../../lib/localStorage";

const OrderButton = ({order}) => {
	const router = useRouter();
	const [isButtonDisabled, setIsButtonDisabled] = useState(false);

	const items = order.items;
	const name = order.name;
	const comment = order.comment;

	if (items.length === 0) {
		return null;
	}

	const body = {
		name: name,
		pizzas: items,
		comment: comment
	};

	// Function to order the pizzas
	const orderPizza = () => {
		setIsButtonDisabled(true);

		fetch('/api/order', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		})
			.then(response => response.json())
			.then(data => {
				if (data.orderId) {
					// Add order ID to local storage
					const orderIds = JSON.parse(getFromLocalStorage('orderIds')) || [];
					orderIds.push(data.orderId);
					addToLocalStorage('orderIds', JSON.stringify(orderIds));

					// Redirect to thank you page
					router.push(`/order/thank-you/${data.orderId}`);
				}
			})
			.finally(() => {
				setIsButtonDisabled(false);
			});
	};

	return (
		<button
			onClick={() => orderPizza()}
			className={`bg-primary-950 text-white px-4 py-2 rounded-lg mt-4 w-full md:w-auto hover:bg-primary-800 ${isButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
			disabled={isButtonDisabled}
		>
			Order now
		</button>
	);
};

OrderButton.parameters = {
	order: {}
};

OrderButton.propTypes = {
	order: PropTypes.object.isRequired
};

export default OrderButton;
