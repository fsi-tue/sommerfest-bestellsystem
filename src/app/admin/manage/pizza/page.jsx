'use client'

import {useEffect, useState} from "react";
import Food from "./Food.jsx";
import {getFromLocalStorage} from "@/lib/localStorage";
import ErrorMessage from "@/app/components/ErrorMessage.jsx";
import WithAuth from "../../WithAuth.jsx";
import {FOOD} from "@/config";

const Page = () => {
	const token = getFromLocalStorage('token', '');

	const [foods, setFoods] = useState([]);
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(true);

	const headers = {
		'Content-Type': 'application/json',
		'Authorization': `Bearer ${token}`,
	}

	useEffect(() => {
		fetch('/api/pizza/', {
			headers: headers,
		})
			.then(async response => {
				const data = await response.json();
				if (!response.ok) {
					const error = (data && data.message) || response.statusText;
					throw new Error(error);
				}
				return data;
			})
			.then(data => {
				setFoods(data);
				setLoading(false);
			})
			.catch(() => {
				console.error('Error fetching pizzas');
				setError('Error fetching pizzas');
				setLoading(false);
			});
	}, [token]);

	if (loading) return <div>Loading...</div>;
	if (error) return (<ErrorMessage error={error}/>);

	return (
		<div>
			<div className="p-4">
				<h2 className="text-2xl mb-4">Manage Foods 🍕</h2>
			</div>

			{/* New Food */}
			<Food key="new" food={{name: 'New Pizza', price: 0, enabled: true, max: FOOD.MAX_ITEMS}} isNew={true}/>

			{/* Foods */}
			<div className="flex flex-col space-y-4">
				{foods.map(food => (
					<Food key={food._id} food={food}/>
				))}
			</div>
		</div>
	);
}

export default WithAuth(Page);
