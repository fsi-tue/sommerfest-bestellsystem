'use client'

import {getFromLocalStorage} from "@/lib/localStorage";
import {useRouter} from "next/navigation";
import {useEffect} from "react";

const WithAuth = (WrappedComponent) => {
	return (props) => {
		const token = getFromLocalStorage('token');
		const router = useRouter();

		if (!token) {
			useEffect(() => {
				setTimeout(() => {
					router.push('/');
				}, 0);
			})
			return (<></>)
		}

		return <WrappedComponent {...props} />;
	};
};

export default WithAuth;
