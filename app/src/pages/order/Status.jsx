import {useEffect, useState} from "react";
import {useParams} from 'react-router-dom';
import {API_ENDPOINT} from "../../globals.js";

const Status = () => {
	const [status, setStatus] = useState(''); // state to hold order status
	const {orderNumber} = useParams();

	useEffect(() => {
		// Get the order status from the server
		fetch(API_ENDPOINT + '/orders/' + orderNumber)
			.then(response => response.json())
			.then(data => setStatus(data.status));
	}, [orderNumber]);

	const statusToText = (status) => {
		if (status === 'ready') {
			return 'Your order is ready for pickup!';
		} else if (status === 'pending') {
			return 'Please pay at the counter.';
		} else if (status === 'paid') {
			return 'Your order is being prepared...';
		} else if (status === 'delivered') {
			return 'Your order has been delivered!';
		} else if (status === 'cancelled') {
			return 'Your order has been cancelled.';
		} else {
			return 'Please wait...';
		}
	}

	const statusToStyle = (status) => {
		if (status === 'ready') {
			return 'bg-green-200 text-green-800';
		} else if (status === 'pending') {
			return 'bg-yellow-200 text-yellow-800';
		} else if (status === 'paid') {
			return 'bg-blue-200 text-blue-800';
		} else if (status === 'delivered') {
			return 'bg-purple-200 text-purple-800';
		} else if (status === 'cancelled') {
			return 'bg-red-200 text-red-800';
		} else {
			return 'bg-gray-200 text-gray-800';
		}
	}

	return (
		<div className="flex flex-col items-center p-4 bg-gray-100 rounded-lg shadow-md">
			<h2 className="text-2xl font-bold mb-4 text-center text-gray-700">Order Status</h2>
			<div className={`p-4 rounded-lg text-center ${statusToStyle(status)} animate-fade-in`}>
				<p className="text-lg font-semibold">
					{statusToText(status)}
				</p>
			</div>
		</div>
	)
		;
}

export default Status;
