import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import {API_ENDPOINT} from "../../globals.js";
import Pizza from "./Pizza.jsx";
import {ErrorMessage} from "../../components/ErrorMessage.jsx";

const ManagePizzas = () => {
	const token = localStorage.getItem('token') || "";
	const authed = token !== "";

	const navigate = useNavigate();
	if (!authed) {
		navigate("/");
	}

	const [pizzas, setPizzas] = useState([]);
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetch(API_ENDPOINT + '/pizzas/', {
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

			<div className="flex flex-col space-y-4">
				{pizzas.map(pizza => (
					<Pizza key={pizza._id} pizza={pizza}/>
				))
				}
			</div>
		</div>
	);
}

export default ManagePizzas;
