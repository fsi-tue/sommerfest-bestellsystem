'use client'

import {useEffect, useState} from "react";
import OrderQR from "@/app/components/order/OrderQR.jsx";
import { useRouter, useSearchParams } from "next/navigation";
import { getFromLocalStorage } from "@/lib/localStorage";


const Page = ({ params }: { params: { orderNumber: string } }) => {
	const [status, setStatus] = useState('');
	const [comment, setComment] = useState('');
	const [pizzas, setPizzas] = useState([] as { name: string, price: number }[]);

	// Check if logged in
	const router = useRouter();
	const token = getFromLocalStorage('token');


	useEffect(() => {
		// Get the order status from the server
		fetch(`/api/order/${params.orderNumber}`)
			.then(response => response.json())
			.then(data => {
				setStatus(data.status)
				setPizzas(data.pizzas)
				setComment(data.comment)
			});
	}, [params.orderNumber]);

	const statusToText = (status: string) => {
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
			return 'Unknown status';
		}
	}

	const hasComment = () => {
		return (
			typeof comment === "string" &&
			comment != "" && 
			comment.toLowerCase() !== "No comment".toLowerCase()
		);
	}


	return (
		<div className="content">

			<h2 className="text-2xl">Order Status</h2>

			<a className="text-xs font-light text-gray-500 mb-0"
			   href={params.orderNumber}>{params.orderNumber}</a>

			<div className="flex flex-row items-start p-4 rounded-lg shadow-md">
				<div>
					<h3 className="text-lg font-bold">QR Code</h3>
					<OrderQR orderId={params.orderNumber}/>

					<p className="mb-3 text-lg font-light text-gray-600 leading-7">
						{statusToText(status)}
					</p>
				</div>
				<div className="">
					<div className="ml-4">
						<h3 className="text-lg font-bold">Order details</h3>
						{hasComment() && (
							<div class="list-disc list-inside text-sm font-light text-gray-600 mb-4">
								<div class="flex flex-col">
									<span class="font-bold">Comment:</span>
									<span class="pl-4 italic">{comment}</span>
								</div>
							</div>
						)}
						<ul className="list-disc list-inside text-sm font-light text-gray-600 mb-4">
							{pizzas.map(pizza => (
								<li key={pizza.name}>{pizza.name}: {pizza.price}€</li>
							))}
						</ul>
						<p className="text-lg font-light text-gray-600">
							Total: {pizzas.reduce((total, pizza) => total + pizza.price, 0)}€
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Page;
