'use client'

import {useEffect, useState} from "react";
import {API_ENDPOINT} from "../../../globals.js";
import {ErrorMessage} from "../../../components/ErrorMessage.jsx";
import {getFromLocalStorage} from "../../../../lib/localStorage.js";

const Pizza = ({pizza, isNew}) => {
	const token = getFromLocalStorage('token');

	const [error, setError] = useState('');
	const [localPizza, setLocalPizza] = useState(pizza);

	useEffect(() => {
		setLocalPizza(pizza);
	}, [pizza]);

	const updatePizza = (pizza) => {
		fetch(`/api/pizza`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`,
			},
			body: JSON.stringify(pizza)
		})
			.then(response => response.json())
			.then(data => setLocalPizza(data))
			.catch(error => setError('Error updating pizza'));
	}

	const createPizza = (pizza) => {
		fetch(`${API_ENDPOINT}/pizzas`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`,
			},
			body: JSON.stringify(pizza)
		}).then(response => response.json())
			.then(data => setLocalPizza(data))
			.catch(error => setError('Error creating pizza'));

	}

	const deletePizza = (_id) => {
		fetch(`${API_ENDPOINT}/pizzas/${_id}`, {
			method: 'DELETE',
			headers: {
				'Authorization': `Bearer ${token}`,
			}
		})
			.then(() => setLocalPizza(null))
			.catch(error => setError('Error deleting pizza'));
	}

	if (error) return (<ErrorMessage error={error}/>);

	return (
		<div className="w-full px-2 py-2">
			<div className="bg-white border border-gray-300 rounded-lg shadow-md p-4 relative">
				<div className="text-xl font-semibold mb-2">{localPizza.name}</div>
				<div className="flex gap-1 items-center justify-start">
                                    <span
	                                    className="text-xs text-gray-700 mr-2 uppercase tracking-wider mb-2 rounded px-2 py-0.5 bg-gray-200">
                                        {localPizza.enabled ? 'Enabled' : 'Disabled'}
                                    </span>
					<span
						className="text-xs text-gray-700 mr-2 uppercase tracking-wider mb-2 rounded px-2 py-0.5 bg-gray-200">
                                        {localPizza._id}
                                    </span>
					<span
						className="text-xs text-gray-700 mr-2 uppercase tracking-wider mb-2 rounded px-2 py-0.5 bg-gray-200">
                                        {localPizza.price} €
                                    </span>
				</div>
				<div className="flex gap-1 items-center justify-start font-light">
					{!isNew ? (
						<button
							onClick={() => updatePizza(localPizza)}
							className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-0.5 px-1 rounded"
						>
							Update
						</button>
					) : (
						<button
							onClick={() => createPizza(localPizza)}
							className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-0.5 px-1 rounded"
						>
							Create
						</button>
					)}
					{!isNew &&
						<button
							onClick={() => localPizza.enabled ? updatePizza({
								...localPizza,
								enabled: false
							}) : updatePizza({...localPizza, enabled: true})}
							className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-0.5 px-1 rounded"
						>
							{localPizza.enabled ? 'Disable' : 'Enable'}
						</button>
					}
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
					<input
						type="text"
						value={localPizza.name}
						onChange={(event) => setLocalPizza({...localPizza, name: event.target.value})}
						className="border px-2 py-1 rounded-md w-full"
						placeholder="Pizza Name"
					/>
					<div className="flex items-center">
						<input
							type="number"
							value={localPizza.price}
							onChange={(event) => setLocalPizza({...localPizza, price: event.target.value})}
							className="border px-2 py-1 rounded-md w-full"
							step="0.10"
							placeholder="Price (€)"
						/>
						<span className="ml-2">€</span>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Pizza;
