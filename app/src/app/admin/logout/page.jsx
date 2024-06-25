'use client'

import {useEffect} from "react";
import {useRouter} from "next/navigation";

const Page = () => {
	const router = useRouter();
	localStorage.removeItem('token');
	useEffect(() => {
		router.push('/');
		window.dispatchEvent(new CustomEvent("loginSuccessEvent"));
	}, []);

	return (
		<div className="content">

		</div>
	);
}

export default Page;
