'use client'

import Link from 'next/link'

import './Header.css';
import {useEffect, useState} from "react";

const Header = () => {
	const [authed, setAuthed] = useState(false);
	useEffect(() => {
		const token = localStorage.getItem('token');
		setAuthed(token != null);
		window.addEventListener("loginSuccessEvent", (e) => {
			const token = localStorage.getItem('token');
			setAuthed(token != null);
		});
	}, []);


	const adminLinks = [
		{to: "/admin/manage/order", text: "Manage Orders"},
		{to: "/admin/manage/pizza", text: "Manage Pizzas"},
		{to: "/admin/logout", text: "Logout"},
	];

	return (
		<header className="border-primary border-2 p-4">
			<h1
				className="text-3xl font-extrabold text-primary mb-4 text-center md:text-left md:mb-0 md:mr-4 md:inline-block w-full md:w-auto">
				<Link href="/">Pizza Ordering System 🍕</Link>
			</h1>
			<nav>
				<ul>
					<li>
						<Link href="/">Home</Link>
					</li>
					<li>
						<Link href="/order/list">Your Orders</Link>
					</li>
				</ul>
				{authed && (
					<ul>
						{adminLinks.map(({to, text}) => (
							<li key={to}>
								<Link href={to}>{text}</Link>
							</li>
						))}
					</ul>
				)}
			</nav>
		</header>
	);
};

export default Header;
