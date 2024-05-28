import {useState} from "react";
import {useParams} from 'react-router-dom';

const OrderStatus = () => {
	const [status, setStatus] = useState(''); // state to hold order status
	const {orderNumber} = useParams();

	fetch('/api/order/' + orderNumber)
		.then(response => response.json())
		.then(data => setStatus(data.status));

	return (
		<div className="content">
			<h2>Order Status</h2>
			<p>{status}</p>
		</div>
	);
}

export default OrderStatus;
