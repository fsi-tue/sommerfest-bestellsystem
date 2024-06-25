'use client'

import {getFromLocalStorage} from "@/lib/localStorage";
import {useRouter} from "next/navigation";

const WithAuth = (WrappedComponent) => {
	return (props) => {
		const token = getFromLocalStorage('token');
		const router = useRouter();

		if (!token) {
			setTimeout(() => {
				router.push('/');
			}, 0);
			return (<></>)
		}

		return <WrappedComponent {...props} />;
	};
};

export default WithAuth;
