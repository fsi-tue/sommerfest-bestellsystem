'use client'

import {useEffect, useState} from "react";
import Pizza from "./Pizza.jsx";
import {getFromLocalStorage} from "@/lib/localStorage";
import ErrorMessage from "@/app/components/ErrorMessage.jsx";
import WithAuth from "../../WithAuth.jsx";
import {FOOD} from "@/config";

const Page = () => {
	const token = getFromLocalStorage('token', '');

	const [pizzas, setPizzas] = useState([]);
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
			.then(response => response.json())
			.then(data => {
				setPizzas(data);
				setLoading(false);
			})
			.catch(error => {
				setError('Error fetching pizzas');
				setLoading(false);
			});
	}, [token]);

	if (loading) return <div>Loading...</div>;
	if (error) return (<ErrorMessage error={error}/>);

	return (
		<div className="content">
			<div className="p-4">
				<h2 className="text-2xl mb-4">Manage Pizzas 🍕</h2>
			</div>

			{/* New Pizza */}
			<Pizza key="new" pizza={{name: 'New Pizza', price: 0, enabled: true, max: FOOD.MAX_ITEMS}} isNew={true}/>

			{/* Pizzas */}
			<div className="flex flex-col space-y-4">
				{pizzas.map(pizza => (
					<Pizza key={pizza._id} pizza={pizza}/>
				))}
			</div>
		</div>
	);
}

export default WithAuth(Page);
