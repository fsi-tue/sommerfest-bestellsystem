import './Login.css';
import {useNavigate} from "react-router-dom";
import {useState} from "react";
import {API_ENDPOINT} from "../globals.js";

const Login = () => {
	const [errorMessage, setErrorMessage] = useState('')

	const navigate = useNavigate();


	const handleSubmit = (event) => {
		event.preventDefault();
		const token = event.target.token.value;

		fetch(API_ENDPOINT + '/api/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({token}),
		})
			.then((response) => {
				if (response.ok) {
					return response.json();
				} else {
					throw new Error('Login failed');
				}
			})
			.then((data) => {
				localStorage.setItem('token', data.token);
				navigate('/');
			}).catch((error) => {
			setErrorMessage(error.message);
		});
	}


	return (
		<div className="content">
			<form onSubmit={handleSubmit}>
				<label htmlFor="token">Token</label>
				<input type="text" id="token" name="token"/>
				<button type="submit">Login</button>
				{errorMessage && <p>{errorMessage}</p>}
			</form>
		</div>
	);
}

export default Login;
