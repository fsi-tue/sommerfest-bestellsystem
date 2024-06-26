'use client'

import './Login.css';
import {useState} from "react";
import {useRouter} from "next/navigation";
import {addToLocalStorage} from "@/lib/localStorage";

const Page = () => {
	const [errorMessage, setErrorMessage] = useState('')

	const router = useRouter();

	const handleSubmit = (event) => {
		event.preventDefault();
		const token = event.target.token.value;

		fetch('/api/auth/login', {
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
				addToLocalStorage('token', data.token);
				window.dispatchEvent(new CustomEvent("loginSuccessEvent"))
				router.push('/admin/manage/order');
			}).catch((error) => {
			setErrorMessage(error.message);
		});
	}


	return (
		<div>
			<form onSubmit={handleSubmit}>
				<label htmlFor="token">FSI/K Token</label>
				<input type="password" id="token" name="token" autocomplete="current-password" required/>
				<button type="submit">Login</button>
				{errorMessage && <p>{errorMessage}</p>}
			</form>
		</div>
	);
}

export default Page;
