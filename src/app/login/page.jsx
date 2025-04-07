'use client'

import './Login.css';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addToLocalStorage } from "@/lib/localStorage";

const Page = () => {
	const [token, setToken] = useState('');
	const [errorMessage, setErrorMessage] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const router = useRouter();

	// Check for token in URL when component mounts
	useEffect(() => {
		// Read the token from the URL
		const urlParams = new URLSearchParams(window.location.search);
		const tokenFromUrl = urlParams.get('token');

		if (tokenFromUrl) {
			setToken(tokenFromUrl); // Pre-fill the token input field
		}
	}, []);

	const handleAuthentication = (tokenToUse) => {
		setIsLoading(true);
		setErrorMessage('');

		fetch('/api/auth/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ token: tokenToUse }),
		})
			.then((response) => {
				if (response.ok) {
					return response.json();
				} else {
					throw new Error('Login failed');
				}
			})
			.then((data) => {
				addToLocalStorage('token', data.token);
				window.dispatchEvent(new CustomEvent("loginSuccessEvent"));
				router.push('/admin/prepare');
			})
			.catch((error) => {
				setErrorMessage(error.message);
				setIsLoading(false);
			});
	};

	const handleSubmit = (event) => {
		event.preventDefault();
		const submittedToken = token || event.target.token.value;
		handleAuthentication(submittedToken);
	};

	return (
		<div className="login-container">
			<form onSubmit={handleSubmit}>
				<h2>Admin Login</h2>
				<div className="input-group">
					<label htmlFor="token">FSI/K Token</label>
					<input
						type="text"
						id="token"
						name="token"
						value={token}
						onChange={(e) => setToken(e.target.value)}
						autoComplete="current-password"
						required
					/>
				</div>
				<button type="submit" disabled={isLoading}>
					{isLoading ? 'Authenticating...' : 'Login'}
				</button>
				{errorMessage && <p className="error-message">{errorMessage}</p>}
			</form>
		</div>
	);
};

export default Page;
