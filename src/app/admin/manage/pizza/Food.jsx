'use client'

import {useEffect, useState} from "react";
import ErrorMessage from "../../../components/ErrorMessage.jsx";
import {getFromLocalStorage} from "../../../../lib/localStorage.js";

const Food = ({food, isNew}) => {
	const token = getFromLocalStorage('token');

	const [error, setError] = useState('');
	const [localFood, setLocalFood] = useState(food);

	useEffect(() => {
		setLocalFood(food);
	}, [food]);

	const headers = {
		'Content-Type': 'application/json',
		'Authorization': `Bearer ${token}`,
	}

	const updateFood = (food) => {
		fetch(`/api/pizza`, {
			method: 'PUT',
			headers: headers,
			body: JSON.stringify(food)
		})
			.then(response => response.json())
			.then(data => setLocalFood(data))
			.catch(error => setError('Error updating food'));
	}

	const createPizza = (food) => {
		fetch(`/api/pizza`, {
			method: 'POST',
			headers: headers,
			body: JSON.stringify(food)
		}).then(response => response.json())
			.then(data => setLocalFood(data))
			.catch(error => setError('Error creating food'));

	}

	const deleteFood = (_id) => {
		fetch(`/pizza/${_id}`, {
			method: 'DELETE',
			headers: headers,
		})
			.then(() => setLocalFood(null))
			.catch(error => setError('Error deleting food'));
	}

	if (error) return (<ErrorMessage error={error}/>);

	return (
		<div className="w-full px-4 py-6">
			<div className="bg-white border border-gray-200 rounded-lg shadow-md p-6">
				<div className="text-2xl font-bold mb-4">{localFood.name}</div>
				<div className="flex flex-wrap gap-2 mb-4">
      <span
	      className={`text-sm font-medium text-white py-1 px-3 rounded-full ${localFood.enabled ? 'bg-green-500' : 'bg-gray-500'}`}>
        {localFood.enabled ? 'Enabled' : 'Disabled'}
      </span>
					{localFood._id && <span className="text-sm font-medium text-gray-700 py-1 px-3 rounded-full bg-gray-200">{localFood._id}</span>}
					<span
						className="text-sm font-medium text-gray-700 py-1 px-3 rounded-full bg-gray-200">{localFood.price} €</span>
					{localFood.type && <span className="text-sm font-medium text-gray-700 py-1 px-3 rounded-full bg-gray-200">{localFood.type}</span>}
					{localFood.dietary && <span
						className="text-sm font-medium text-gray-700 py-1 px-3 rounded-full bg-gray-200">{localFood.dietary}</span>}
					<span className="text-sm font-medium text-gray-700 py-1 px-3 rounded-full bg-gray-200">
        {localFood.max} items available
      </span>
				</div>
				<div className="flex gap-2 mb-4">
					{!isNew ? (
						<button
							onClick={() => updateFood(localFood)}
							className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-full transition duration-200"
						>
							Update
						</button>
					) : (
						<button
							onClick={() => createPizza(localFood)}
							className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-full transition duration-200"
						>
							Create
						</button>
					)}
					{!isNew && (
						<button
							onClick={() => localFood.enabled ? updateFood({...localFood, enabled: false}) : updateFood({
								...localFood,
								enabled: true
							})}
							className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-full transition duration-200"
						>
							{localFood.enabled ? 'Disable' : 'Enable'}
						</button>
					)}
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div className="flex flex-col">
						<label className="text-sm font-semibold mb-1">Name</label>
						<input
							type="text"
							value={localFood.name}
							onChange={(event) => setLocalFood({...localFood, name: event.target.value})}
							className="border border-gray-300 px-3 py-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="Food Name"
						/>
					</div>
					<div className="flex flex-col">
						<label className="text-sm font-semibold mb-1">Type</label>
						<input
							type="text"
							value={localFood.type}
							onChange={(event) => setLocalFood({...localFood, type: event.target.value})}
							className="border border-gray-300 px-3 py-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="Food Type, e.g. Pizza, Pasta, Salad"
						/>
					</div>
					<div className="flex flex-col">
						<label className="text-sm font-semibold mb-1">Dietary</label>
						<input
							type="text"
							value={localFood.dietary}
							onChange={(event) => setLocalFood({...localFood, dietary: event.target.value})}
							className="border border-gray-300 px-3 py-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="Dietary, e.g. Vegan, Vegetarian, Gluten Free"
						/>
					</div>
					<div className="flex flex-col">
						<label className="text-sm font-semibold mb-1">Price</label>
						<div className="flex items-center">
							<input
								type="number"
								value={localFood.price}
								onChange={(event) => setLocalFood({...localFood, price: event.target.value})}
								className="border border-gray-300 px-3 py-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								step="0.10"
								placeholder="Price (€)"
							/>
							<span className="ml-2">€</span>
						</div>
					</div>
					<div className="flex flex-col">
						<label className="text-sm font-semibold mb-1">Max. Items available</label>
						<input
							type="number"
							value={localFood.max}
							onChange={(event) => setLocalFood({...localFood, max: event.target.value})}
							className="border border-gray-300 px-3 py-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="Max Items"
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Food;
