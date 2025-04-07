'use client'

import { useEffect, useState } from "react";

const WithSystemCheck = (WrappedComponent) => {
	return function WithSystemCheckComponent(props) {
		const [systemStatus, setSystemStatus] = useState('checking');
		const [loading, setLoading] = useState(true);

		const checkSystemStatus = () => {
			setLoading(true);
			fetch('/api/manage/system/status')
				.then(async response => {
					const data = await response.json();
					if (!response.ok) {
						const error = (data && data.message) || response.statusText;
						throw new Error(error);
					}
					return data;
				})
				.then(data => {
					setSystemStatus(data.status);
					setLoading(false);
				})
				.catch(error => {
					console.error('Error fetching system status:', error.message);
					setLoading(false);
				});
		};

		useEffect(() => {
			checkSystemStatus();
		}, []);

		if (loading) {
			return (
				<div>
					<div className="flex items-center justify-center">
						<div className="text-center">
							<svg className="animate-spin h-10 w-10 text-blue-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg"
							     fill="none" viewBox="0 0 24 24">
								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
								<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8V12H4z"></path>
							</svg>
							<p className="text-gray-700">Checking system status...</p>
						</div>
					</div>
				</div>
			);
		}

		if (systemStatus === 'active') {
			return <WrappedComponent {...props} />;
		}

		return (
			<div>
				<div className="flex items-center justify-center">
					<div className="text-center p-6">
						<h2 className="text-2xl font-semibold text-gray-800 mb-4">System Inactive</h2>
						<p className="text-gray-600 mb-4">
							Our system is currently undergoing maintenance. We apologize for any
							inconvenience this may cause. Please try again later.
						</p>
					</div>
				</div>
			</div>
		);
	};
};

export default WithSystemCheck;
