'use client'

import {useEffect, useState} from "react";
import Pizza from "./Pizza.jsx";
import {ErrorMessage} from "@/app/components/ErrorMessage.jsx";
import {useRouter} from "next/navigation";
import {getFromLocalStorage} from "@/lib/localStorage.js";

const ManagePizzas = () => {
	// If there is some script kiddie trying to access this page,
	// and they manage to get here with an invalid token,
	// they should have a cookie or something.
	// Keep it simple, just check if the token is present.
	const token = getFromLocalStorage('token', '');
	const authed = token !== "";
	const router = useRouter();
	if (!authed) {
		router.push('/');
	}

	const [pizzas, setPizzas] = useState([]);
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetch('/api/pizza/', {
			headers: {
				'Authorization': `Bearer ${token}`,
			}
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
			<Pizza key="new" pizza={{name: 'New Pizza', price: 0, enabled: true}} isNew={true}/>

			{/* Pizzas */}
			<div className="flex flex-col space-y-4">
				{pizzas.map(pizza => (
					<Pizza key={pizza._id} pizza={pizza}/>
				))}
			</div>
		</div>
	);
}

export default ManagePizzas;
