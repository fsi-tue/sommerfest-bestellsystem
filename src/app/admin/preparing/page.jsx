'use client'

import { useEffect, useState } from "react";
import { getFromLocalStorage } from "@/lib/localStorage.js";
import WithAuth from "../WithAuth.jsx";

const FoodItemHistory = ({ items, disabled, actions}) => {
	const handleForward = actions.forward;
	const handleBack = actions.back;
	const handleDone = actions.done;
	const handleSkip = actions.skip;

	const hasBack = () => true;
	const hasForward = () => true;

	return (
		<div className="flex justify-between items-center h-12">
			<button onClick={handleBack} className="font-bold bg-silver-400 px-4 py-2 rounded-lg w-full md:w-auto hover:bg-silver-300" disabled={!hasBack()}>Back</button>
			{disabled == false && <button onClick={handleSkip} className="bg-red-950 text-white px-4 py-2 rounded-lg w-full md:w-auto hover:bg-red-800" disabled={disabled}>Skip Order(for now)</button>}
			{disabled == false && <button onClick={handleDone} className="bg-green-950 text-white px-4 py-2 rounded-lg w-full md:w-auto hover:bg-green-800" disabled={disabled}>Order is now Baking</button>}
			<button onClick={handleForward} className="font-bold bg-silver-400 px-4 py-2 rounded-lg w-full md:w-auto hover:bg-silver-300" disabled={!hasForward()}>Forward</button>
		</div>
	);
};


const Checkbox = ({ label, disabled, checked}) => {
	return (
		<div className="flex items-center mb-4">
			<label className="inline-flex items-center">
				<input type="checkbox" className="form-checkbox h-6 w-6 rounded" disabled={disabled} checked={checked}/>
				<span className="ml-2 text-gray-700" disabled={disabled}>{label}</span>
			</label>
		</div>
	);
};

const FoodItem = ({ item, disabled}) => {

	console.log(item);
	return (
		<div className="flex flex-col">
			<div className="flex justify-between items-center mb-2">
				<h3 className="font-bold">{item.name || ""}</h3>
				<h5 className="font-bold underline">Ingredients</h5>
				<Checkbox label="Done" />
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

const Page = () => {
	const [isDisabled, setDisabled] = useState({});
	const [order, setOrder] = useState({});
	const validOrderStates = ["paid", "pending"];

	const ingredients = {
		'667bc9f81ad7a76bb34dbf4a': {'Cheese':'grated', 'Tomato Sauce':'all over', 'Mushrooms':'2'},
	};
	const orderNumber = "667bf4c0e5899fb9cfd98f54";
	useEffect(() => {
		// Get the order status from the server
		fetch(`/api/order/${orderNumber}`)
			.then(response => response.json())
			.then(data => {
				setOrder(data)
				//set to true if the order is not in valid order states
				setDisabled(validOrderStates.indexOf(order.state) < 0)
			});
	}, [orderNumber]);
	const FoodItemData = {
		orderid: 'string',
		state: 'OrderState',
		name: 'string',
		ingredients: ['string'],
	};
	const foodItems = (order.items || []).map(item => {
		return {
			orderid: order.orderid || "",
			state: order.status || "",
			name: item.name,
			ingredients: ingredients[item._id] || {"missing ingredients for":item._id},
		}
	});

	const actions = {
		// TODO:
		back: () =>{},
		forward: () =>{},
		skip: () =>{},
		done: () =>{},		
	};

	return (
		<div className="content">
			<div className="p-4">
				<h2 className="text-2xl mb-4">Preparing Food</h2>
				<span className="font-bold bg-gray-200 px-4 py-2 rounded-lg">
					Order: {order._id || ''}
				</span>
				<span className="bg-gray-200 px-4 py-2 rounded-lg">Status:{order.status || "error"}</span>
			</div>
				<div className="">
					<FoodItemHistory items={foodItems} disabled={isDisabled} actions={actions}/>
				</div>
				{foodItems.map(item => (
					<div className="w-full px-2 py-2">
						<div className={"border border-gray-300 rounded-lg shadow-md p-4 relative"+(isDisabled?" bg-gray-400":" bg-white")}>
							<FoodItem item={item} disabled={isDisabled}/>
						</div>
					</div>
				))}
		</div>
	);
}

export default WithAuth(Page);
