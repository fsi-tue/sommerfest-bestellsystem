'use client'

import {useEffect} from "react";
import {useRouter} from "next/navigation";
import {removeFromLocalStorage} from "@/lib/localStorage.js";

const Page = () => {
	const router = useRouter();
	removeFromLocalStorage('token')
	useEffect(() => {
		router.push('/');
		window.dispatchEvent(new CustomEvent("loginSuccessEvent"));
	}, []);

	return (
		<div className="content"/>
	);
}

export default Page;
