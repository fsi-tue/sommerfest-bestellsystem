'use client'

import {useEffect, useState} from "react";
import {getFromLocalStorage} from "@/lib/localStorage";
import ErrorMessage from "@/app/components/ErrorMessage.jsx";
import WithAuth from "../../WithAuth.jsx";
import {Wrench} from "lucide-react";
import EditItem from "./EditItem.jsx";
import {ITEM_CONFIG} from "@/config/index.ts";
import { useTranslation } from "react-i18next";

const Page = () => {
	const token = getFromLocalStorage('token', '');

	const [items, setItems] = useState([]);
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(true);
	const [t, i18n] = useTranslation();

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
				setItems(data);
				setLoading(false);
			})
			.catch(() => {
				console.error('Error fetching pizzas');
				setError(t('admin.manage.pizza.errors.error_fetching'));
				setLoading(false);
			});
	}, [token]);

	if (loading) return <div>Loading...</div>;
	if (error) return (<ErrorMessage error={error} t={t} />);

	return (
		<div>
			<div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
				<div className="flex items-center gap-3 mb-2">
					<div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
						<Wrench className="w-4 h-4 text-primary-500"/>
					</div>
					<h1 className="text-2xl font-semibold text-gray-900">{t('admin.manage.pizza.title')}</h1>
				</div>
				<p className="text-gray-500 text-sm">{t('admin.manage.pizza.subtitle')}</p>
			</div>

			{/* New Item */}
			<EditItem key="new" item={{name: t('admin.manage.pizza.new_pizza_name'), price: 0, enabled: true, max: ITEM_CONFIG.MAX_ITEMS}} isNew={true}/>

			{/* Items */}
			<div className="flex flex-col space-y-4">
				{items.map(item => (
					<EditItem key={item._id} item={item}/>
				))}
			</div>
		</div>
	);
}

export default WithAuth(Page);
