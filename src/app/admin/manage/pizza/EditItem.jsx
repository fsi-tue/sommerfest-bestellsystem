'use client'

import {useEffect, useState} from "react";
import ErrorMessage from "../../../components/ErrorMessage.jsx";
import {getFromLocalStorage} from "../../../../lib/localStorage.js";

const ItemPage = ({item, isNew}) => {
	const token = getFromLocalStorage('token');

	const [error, setError] = useState('');
	const [localItem, setLocalItem] = useState(item);

	useEffect(() => {
		setLocalItem(item);
	}, [item]);

	const headers = {
		'Content-Type': 'application/json',
		'Authorization': `Bearer ${token}`,
	}

	const updateItem = (item) => {
		fetch(`/api/pizza`, {
			method: 'PUT',
			headers: headers,
			body: JSON.stringify(item)
		})
			.then(async response => {
				const data = await response.json();
				if (!response.ok) {
					const error = (data && data.message) || response.statusText;
					throw new Error(error);
				}
				return data;
			})
			.then(data => setLocalItem(data))
			.catch(error => setError(error.message));
	}

	const createPizza = (item) => {
		fetch(`/api/pizza`, {
			method: 'POST',
			headers: headers,
			body: JSON.stringify(item)
		})
			.then(async response => {
				const data = await response.json();
				if (!response.ok) {
					const error = (data && data.message) || response.statusText;
					throw new Error(error);
				}
				return data;
			})
			.then(data => setLocalItem(data))
			.catch(error => setError(error.message));

	}

	const deleteItem = (_id) => {
		fetch(`/pizza/${_id}`, {
			method: 'DELETE',
			headers: headers,
		})
			.then(() => setLocalItem(null))
			.catch(error => setError(error.message));
	}

	if (error) return (<ErrorMessage error={error} t={t} />);

	return (
		<div className="w-full px-4 py-6">
			<div className="bg-white border border-gray-100 rounded-2xl shadow-md p-6">
				<div className="text-2xl font-bold mb-4">{localItem.name}</div>
				<div className="flex flex-wrap gap-2 mb-4">
      <span
	      className={`text-sm font-medium text-white py-1 px-3 rounded-full ${localItem.enabled ? 'bg-green-500' : 'bg-gray-500'}`}>
        {localItem.enabled ? t('admin.manage.pizza.edit_item.enabled') : t('admin.manage.pizza.edit_item.disabled')}
      </span>
					{localItem._id && <span
						className="text-sm font-medium text-gray-700 py-1 px-3 rounded-full bg-gray-200">{localItem._id}</span>}
					<span
						className="text-sm font-medium text-gray-700 py-1 px-3 rounded-full bg-gray-200">{localItem.price} €</span>
					{localItem.type && <span
						className="text-sm font-medium text-gray-700 py-1 px-3 rounded-full bg-gray-200">{localItem.type}</span>}
					{localItem.dietary && <span
						className="text-sm font-medium text-gray-700 py-1 px-3 rounded-full bg-gray-200">{localItem.dietary}</span>}
					<span className="text-sm font-medium text-gray-700 py-1 px-3 rounded-full bg-gray-200">
		{t('admin.manage.pizza.edit_item.items_available', {items: localItem.max})}
      </span>
				</div>
				<div className="flex gap-2 mb-4">
					{!isNew ? (
						<button
							onClick={() => updateItem(localItem)}
							className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-full transition duration-200"
						>
							{t('admin.manage.pizza.edit_item.update')}
						</button>
					) : (
						<button
							onClick={() => createPizza(localItem)}
							className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-full transition duration-200"
						>
							{t('admin.manage.pizza.edit_item.create')}
						</button>
					)}
					{!isNew && (
						<button
							onClick={() => localItem.enabled ? updateItem({...localItem, enabled: false}) : updateItem({
								...localItem,
								enabled: true
							})}
							className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-full transition duration-200"
						>
							{localItem.enabled ? t('admin.manage.pizza.edit_item.disable') : t('admin.manage.pizza.edit_item.enable')}
						</button>
					)}
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div className="flex flex-col">
						<label className="text-sm font-semibold mb-1">{t('admin.manage.pizza.edit_item.name')}</label>
						<input
							type="text"
							value={localItem.name}
							onChange={(event) => setLocalItem({...localItem, name: event.target.value})}
							className="border border-gray-100 px-3 py-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="Item Name"
						/>
					</div>
					<div className="flex flex-col">
						<label className="text-sm font-semibold mb-1">{t('admin.manage.pizza.edit_item.type')}</label>
						<input
							type="text"
							value={localItem.type}
							onChange={(event) => setLocalItem({...localItem, type: event.target.value})}
							className="border border-gray-100 px-3 py-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="Item Type, e.g. Pizza, Pasta, Salad"
						/>
					</div>
					<div className="flex flex-col">
						<label className="text-sm font-semibold mb-1">{t('admin.manage.pizza.edit_item.dietary')}</label>
						<input
							type="text"
							value={localItem.dietary}
							onChange={(event) => setLocalItem({...localItem, dietary: event.target.value})}
							className="border border-gray-100 px-3 py-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="Dietary, e.g. Vegan, Vegetarian, Gluten Free"
						/>
					</div>
					<div className="flex flex-col">
						<label className="text-sm font-semibold mb-1">{t('admin.manage.pizza.edit_item.price')}</label>
						<div className="flex items-center">
							<input
								type="number"
								value={localItem.price}
								onChange={(event) => setLocalItem({...localItem, price: event.target.value})}
								className="border border-gray-100 px-3 py-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								step="0.10"
								placeholder="Price (€)"
							/>
							<span className="ml-2">€</span>
						</div>
					</div>
					<div className="flex flex-col">
						<label className="text-sm font-semibold mb-1">{t('admin.manage.pizza.edit_item.max_items_available')}</label>
						<input
							type="number"
							value={localItem.max}
							onChange={(event) => setLocalItem({...localItem, max: event.target.value})}
							className="border border-gray-100 px-3 py-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="Max Items"
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

export default ItemPage;
