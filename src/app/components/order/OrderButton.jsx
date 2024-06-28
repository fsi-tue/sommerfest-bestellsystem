import PropTypes from "prop-types";
import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import {addToLocalStorage, getFromLocalStorage} from "../../../lib/localStorage";

const OrderButton = ({order, setError}) => {
	const router = useRouter();
	const [isButtonDisabled, setIsButtonDisabled] = useState(false);

	const items = order.items;
	const name = order.name;
	const timeslot = order.timeslot;
	const comment = order.comment;

	useEffect(() => {
		if (items.length === 0 || !timeslot) {
			setIsButtonDisabled(true);
		} else {
			setIsButtonDisabled(false);
		}
	}, [items, timeslot]);

	const body = {
		name: name,
		pizzas: items,
		timeslot: timeslot,
		comment: comment
	};

	// Function to order the pizzas
	const orderPizza = () => {
		if (isButtonDisabled) return; // Early return if button is already disabled
		setIsButtonDisabled(true);

		fetch('/api/order', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		})
			.then(async response => {
				const data = await response.json();
				if (!response.ok) {
					const error = (data && data.message) || response.statusText;
					console.log('Error:', error);
					throw new Error(error);
				}
				return data;
			})
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
			.catch(error => {
				console.log(error)
				setError(error.message);
				setIsButtonDisabled(false); // Re-enable the button in case of error
			});
	};

	return (
		<button
			onClick={orderPizza}
			className={`w-full bg-green-700 text-white px-4 py-2 rounded-lg md:w-auto  ${isButtonDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-800'}`}
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
