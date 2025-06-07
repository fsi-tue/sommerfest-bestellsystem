'use client'

import {getFromLocalStorage} from "@/lib/localStorage.js";
import {useRouter} from "next/navigation";
import {useEffect} from "react";

const WithAuth = (WrappedComponent) => {
	// Return a named function component
	return function WithAuthComponent(props) {
		const router = useRouter();

		// Check authentication inside the component body
		useEffect(() => {
			const token = getFromLocalStorage('token');
			if (!token) {
				router.push('/');
			}
		}, [router]);

		// During initial render, check synchronously if we have a token
		// This helps prevent flash of content before redirect
		if (typeof window !== 'undefined') {
			const token = getFromLocalStorage('token');
			if (!token) {
				return null;
			}
		}

		return <WrappedComponent {...props} />;
	};
};

export default WithAuth;
