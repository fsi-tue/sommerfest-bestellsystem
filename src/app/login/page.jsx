"use client"

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {addToLocalStorage} from "@/lib/localStorage.js";

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
			body: JSON.stringify({token: tokenToUse}),
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
		<div className="flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
			<div className="w-full max-w-md">
				<div className="px-6 py-8 shadow-2xl rounded-xl sm:px-10">
					<form onSubmit={handleSubmit} className="space-y-6">
						<div className="text-center">
							<h2 className="text-3xl font-bold tracking-tight text-gray-900">Admin Login</h2>
						</div>

						<div>
							<label htmlFor="token" className="block text-sm font-medium text-gray-700">
								FSI/K Token
							</label>
							<div className="mt-1">
								<input
									id="token"
									name="token"
									type="text"
									value={token}
									onChange={(e) => setToken(e.target.value)}
									autoComplete="current-password"
									required
									className="block w-full rounded-md border-gray-300 border py-2 px-3 text-gray-900 placeholder-gray-400
                  focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 shadow-sm"
								/>
							</div>
						</div>

						<div>
							<button
								type="submit"
								disabled={isLoading}
								className="flex w-full justify-center rounded-md border border-transparent bg-primary-600 py-3 px-4 text-sm font-medium text-white shadow-sm
                hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                disabled:opacity-75 disabled:cursor-not-allowed transition-all duration-200"
							>
								{isLoading ? 'Authenticating...' : 'Login'}
							</button>
						</div>

						{errorMessage && (
							<div className="rounded-md bg-red-50 p-4 mt-4">
								<div className="flex">
									<div className="text-sm text-red-700">
										{errorMessage}
									</div>
								</div>
							</div>
						)}
					</form>
				</div>
			</div>
		</div>
	);
};

export default Page;
