'use client'

import {useEffect, useState} from "react";
import {addToLocalStorage, getFromLocalStorage} from "@/lib/localStorage.js";
import WithAuth from "../WithAuth.jsx";
import {formatDateTime} from "@/lib/time";
import ErrorMessage from "@/app/components/ErrorMessage.jsx";

const FoodItemHistory = ({items, disabled, actions}) => {
	const handleForward = actions.forward;
	const handleBack = actions.back;
	const handleDone = actions.done;
	const handleSkip = actions.skip;
	const handleCancel = actions.cancel;

	const hasBack = () => true;
	const hasForward = () => true;

	return (
		<div className="flex justify-between items-center h-12">
			<button onClick={handleBack}
			        className="font-bold bg-silver-400 px-4 py-2 rounded-lg w-full md:w-auto hover:bg-silver-300"
			        disabled={!hasBack()}>Back
			</button>
			{disabled === false && <button onClick={handleSkip}
			                               className="bg-orange-950 text-white px-4 py-2 rounded-lg w-full md:w-auto hover:bg-orange-800"
			                               disabled={disabled}>Skip Order(for now)</button>}
			{disabled === false && <button onClick={handleCancel}
			                               className="bg-red-950 text-white px-4 py-2 rounded-lg w-full md:w-auto hover:bg-red-800"
			                               disabled={disabled}>Cancel Order</button>}
			{disabled === false && <button onClick={handleDone}
			                               className="bg-green-950 text-white px-4 py-2 rounded-lg w-full md:w-auto hover:bg-green-800"
			                               disabled={disabled}>Order is now Baking</button>}
			<button onClick={handleForward}
			        className="font-bold bg-silver-400 px-4 py-2 rounded-lg w-full md:w-auto hover:bg-silver-300"
			        disabled={!hasForward()}>Forward
			</button>
		</div>
	);
};


const Checkbox = ({label, disabled, checked}) => {
	return (
		<div className="flex items-center mb-4">
			<label className="inline-flex items-center">
				<input type="checkbox" className="form-checkbox h-6 w-6 rounded" disabled={disabled} checked={checked}/>
				<span className="ml-2 text-gray-700" disabled={disabled}>{label}</span>
			</label>
		</div>
	);
};

const FoodItem = ({item, disabled}) => {
	return (
		<div className="flex flex-col">
			<div className="flex justify-between items-center mb-2">
				<h3 className="font-bold">{item.name || ""}</h3>
				<h5 className="font-bold underline">Ingredients</h5>
				<Checkbox label="Done"/>
			</div>
			<div className="bg-silver-400 px-4 py-2 rounded-lg mb-2">
				<table className="table-auto w-full">
					<thead>
					<tr>
						<th className="px-4 py-2">Ingredient</th>
						<th className="px-4 py-2">Amount</th>
						<th className="px-4 py-2">Added?</th>
					</tr>
					</thead>
					<tbody>
					{Object.entries(item.ingredients).map(([name, amount]) => (
						<tr>
							<td className="border px-4 py-2">{name}</td>
							<td className="border px-4 py-2">{amount}</td>
							<td className="border px-4 py-2">
								<Checkbox label="Added" disabled={disabled}/>
							</td>
						</tr>
					))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

const getHeaders = () => {
	const token = getFromLocalStorage('token', '');
	return {
		'Content-Type': 'application/json',
		'Authorization': `Bearer ${token}`,
	};
};


const Page = () => {
	const [error, setError] = useState('');
	const [isDisabled, setDisabled] = useState({});
	const [order, setOrder] = useState({});
	const [orderNumber, setOrderNumber] = useState("");
	const [history, setHistory] = useState([]);
	const validOrderStates = ["paid", "pending"];

	const ingredients = {
		'667bc9f81ad7a76bb34dbf4a': {'Cheese': 'grated', 'Tomato Sauce': 'all over', 'Mushrooms': '2'},
	};
	useEffect(() => {
		// Get the order status from the server
		if (!orderNumber) {
			setOrder({
				"_id": "no current order",
				"name": "",
				"comment": "",
				"items": [],
				"orderDate": new Date(),
				"timeslot": new Date(),
				"totalPrice": 0,
				"finishedAt": null,
				"status": "Waiting for new order"
			})
			//set to true if the order is not in valid order states
			setDisabled(true)
			setTimeout(() => {
				// do a reload
			}, 15000);//15 ms callback
		} else {
			fetch(`/api/order/${orderNumber}`)
				.then(response => response.json())
				.then(data => {
					setOrder(data)
					//set to true if the order is not in valid order states
					setDisabled(validOrderStates.indexOf(data.status) < 0)
				});
		}
	}, [orderNumber]);

	const updateOrderStatus = (_id, status) => {
		return fetch('/api/order', {
			method: 'PUT',
			headers: getHeaders(),
			body: JSON.stringify({id: _id, status})
		})
			.then(response => response.json())
			.catch(error => setError('ErrorMessage updating order status'));
	}

	const foodItems = (order.items || []).map(item => {
		return {
			orderid: order.orderid || "",
			state: order.status || "",
			name: item.name,
			ingredients: ingredients[item._id] || {"missing ingredients for": item._id},
		}
	});

	const getNextOrderId = async () => {
		// Get the order status from the server
		return fetch('/api/order/', {
			headers: getHeaders(),
		})
			.then(response => response.json())
			.then(data => {
				//now we have orders
				//find the oldest that is in valid states
				const next_orders = data.filter((order) => validOrderStates.indexOf(order.status) >= 0).filter((order) => history.indexOf(order._id) < 0);
				const sorted_orders = next_orders.toSorted((a, b) => new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime()) // Sort by date; latest first
				if (sorted_orders.length === 0) {
					return "";
				}
				return sorted_orders[0]._id || "";
			})
			.catch(error => setError('ErrorMessage fetching getNextOrderId'));
	};

	const hasComment = (order) => {
		return (
			typeof order.comment === "string" &&
			order.comment !== "" &&
			order.comment.toLowerCase() !== "No comment".toLowerCase()
		);
	};

	const actions = {
		// TODO:
		back: () => {
			const historyIndex = history.indexOf(orderNumber);
			if (historyIndex > 0)
				setOrderNumber(history[historyIndex]);
		},
		forward: () => {
			getNextOrderId().then(nextOrderId => {
				if (!nextOrderId) {
					// no current Order
					setOrderNumber("");
				} else {
					const new_history = [...history, nextOrderId];
					setHistory(new_history);
					addToLocalStorage('baking.orderhistory', new_history);
					setOrderNumber(nextOrderId);
				}
			});
		},
		skip: () => {
			getNextOrderId().then(nextOrderId => {
				if (!nextOrderId) {
					// no current Order
					setOrderNumber("");
				} else {
					const new_history = [...history, nextOrderId];
					setHistory(new_history);
					addToLocalStorage('baking.orderhistory', new_history);
					setOrderNumber(nextOrderId);
				}
			});
		},
		cancel: () => {
			//get the current orderid
			if (!isDisabled)
				updateOrderStatus(order._id, 'cancelled').then(() => {
					actions.forward();
				});
		},
		done: () => {
			//get the current orderid
			if (!isDisabled)
				updateOrderStatus(order._id, 'baking').then(() => {
					actions.forward();
				});
		},
	};


	useEffect(() => {
		setHistory(getFromLocalStorage('baking.orderhistory', []));
		if (history.length === 0) actions.forward();
	});


	return (
		<div className="content">
			{error && <ErrorMessage error={error}/>}
			<div className="p-4">
				<h2 className="text-2xl mb-4">Preparing Food</h2>
				<span className="font-bold bg-gray-200 px-4 py-2 rounded-lg">
					Order: {order._id || ''}
				</span>
				<div className="flex gap-1 mt-5 items-center justify-start">
					<span
						className="text-xs text-gray-700 mr-2 uppercase tracking-wider mb-2 rounded px-2 py-0.5 bg-gray-200">
						{order.status}
					</span>
					<span
						className="text-xs text-gray-700 mr-2 uppercase tracking-wider mb-2 rounded px-2 py-0.5 bg-gray-200">
						{order.totalPrice}€
					</span>
					<span
						className="text-xs text-gray-700 mr-2 uppercase tracking-wider mb-2 rounded px-2 py-0.5 bg-gray-200">
						{(order.items || []).length} items
					</span>

					<span
						className="text-xs text-gray-700 mr-2 uppercase tracking-wider mb-2 rounded px-2 py-0.5 bg-gray-200">
						{formatDateTime(new Date(order.orderDate))}
					</span>
				</div>
				<div className="list-disc list-inside text-sm font-light text-gray-600 mb-4">
					<div className="flex flex-col">
						<span className="font-bold">For:</span>
						<span className="pl-4 italic">{order.name}</span>
					</div>
				</div>
				{hasComment(order) && (
					<div className="list-disc list-inside text-sm font-light text-gray-600 mb-4">
						<div className="flex flex-col">
							<span className="font-bold">Comment:</span>
							<span className="pl-4 italic">{order.comment}</span>
						</div>
					</div>
				)}
			</div>
			<div className="">
				<FoodItemHistory items={foodItems} disabled={isDisabled} actions={actions}/>
			</div>
			{foodItems.map(item => (
				<div className="w-full px-2 py-2">
					<div
						className={"border border-gray-300 rounded-lg shadow-md p-4 relative" + (isDisabled ? " bg-gray-400" : " bg-white")}>
						<FoodItem item={item} disabled={isDisabled}/>
					</div>
				</div>
			))}
		</div>
	);
}

export default WithAuth(Page);
