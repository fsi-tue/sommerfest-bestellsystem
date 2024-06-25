'use client'

import {useState} from "react";
import {getFromLocalStorage} from "../../../lib/localStorage.js";
import WithAuth from "../WithAuth.jsx";

const Manage = () => {
	const token = getFromLocalStorage('token', '');

	const [message, setMessage] = useState('');
	const [enable, setEnable] = useState(false)

	const headers = {
		'Content-Type': 'application/json',
		'Authorization': `Bearer ${token}`,
	}

	const deleteDatabase = () => {
		if (!enable) {
			return;
		}

		fetch('/api/db/delete', {
			method: 'POST',
			headers: headers,
		})
			.then(() => setMessage('Database deleted'))
			.catch((error) => setMessage(error))
	}

	const prepareDatabase = () => {
		if (!enable) {
			return;
		}

		fetch('/api/db/prepare', {
			method: 'POST',
			headers: headers,
		})
			.then(() => setMessage('Database prepared'))
			.catch((error) => setMessage(error))
	}

	return (
		<div className="content">
			<div className="p-4">
				<h2 className="text-2xl mb-4">Manage Database</h2>
				{message && <div className="text-red-600">{message}</div>}
			</div>
			<div className="w-full px-2 py-2">
				<div className="bg-white border border-gray-300 rounded-lg shadow-md p-4 relative">
					<div>
						<label htmlFor="enable" className="block text-sm font-medium text-gray-700 mb-2">
							Enable
						</label>
						<input
							type="checkbox"
							id="enable"
							name="enable"
							checked={enable}
							onChange={() => setEnable(!enable)}
							className="h-4 w-4 text-primary-950 focus:ring-primary-800 border-gray-300 rounded"
						/>
					</div>
					<div className="w-full px-2 py-2 flex flex-row space-x-4">
						<button
							onClick={prepareDatabase}
							className="bg-primary-950 text-white px-4 py-2 rounded-lg mt-4 w-full md:w-auto hover:bg-primary-800">
							Prepare Database
						</button>
						<button
							onClick={deleteDatabase}
							className="bg-red-600 text-white px-4 py-2 rounded-lg mt-4 w-full md:w-auto hover:bg-red-800">
							Delete Database
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default WithAuth(Manage);
