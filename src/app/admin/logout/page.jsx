'use client'

import {useEffect} from "react";
import {useRouter} from "next/navigation";
import {addToLocalStorage} from "../../../lib/localStorage.js";

const Page = () => {
	const router = useRouter();
	useEffect(() => {
		router.push('/');
		window.dispatchEvent(new CustomEvent("loginSuccessEvent"));
		addToLocalStorage('authed', false);
	}, []);

	return (
		<div className="content"/>
	);
}

export default Page;
