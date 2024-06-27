'use client'

import Link from 'next/link'
import {useEffect, useState} from "react";
import {getFromLocalStorage} from "@/lib/localStorage.js";

const Header = () => {
	const [authed, setAuthed] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);

	useEffect(() => {
		const token = getFromLocalStorage('token');
		setAuthed(token != null);
		window.addEventListener("loginSuccessEvent", () => {
			const token = getFromLocalStorage('token');
			setAuthed(token != null);
		});
	}, []);

	const adminLinks = [
		// {to: "/admin/preparing", text: "Prepare Foods"}, //does not work yet
		{to: "/admin/manage", text: "ManageDB"},
		{to: "/admin/manage/order", text: "Manage Orders"},
		{to: "/admin/manage/pizza", text: "Manage Foods"},
		{to: "/admin/logout", text: "Logout"},
	];

	return (
		<header className="sticky top-0 bg-gray-50 shadow z-10 p-6 rounded-lg my-5 w-full max-w-4xl mx-auto">
			<div className="container mx-auto flex justify-between items-center px-4 py-4">
				<h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
					<Link href="/">Pizza Ordering System <span role="img" aria-label="pizza">🍕</span></Link>
				</h1>
			</div>
			<nav className="bg-gray-50">
				<div className="container mx-auto flex justify-between items-center px-4 py-2">
					<div className="flex space-x-6">
						<Link href="/" className="text-gray-700 hover:text-gray-900">Home</Link>
						<Link href="/order/list" className="text-gray-700 hover:text-gray-900">Your Orders</Link>
					</div>
					{authed && (
						<>
							<div className="hidden md:flex space-x-6">
								{adminLinks.map(({to, text}) => (
									<Link key={to} href={to} className="text-gray-700 hover:text-gray-900">{text}</Link>
								))}
							</div>
							<div className="md:hidden">
								<button className="text-gray-700 focus:outline-none" onClick={() => setMenuOpen(!menuOpen)}>
									<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
									     xmlns="http://www.w3.org/2000/svg">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
										      d="M4 6h16M4 12h16m-7 6h7"></path>
									</svg>
								</button>
							</div>
						</>
					)}
				</div>
				{menuOpen && authed && (
					<div className="md:hidden bg-white">
						<nav className="px-4 py-2 space-y-2">
							{authed && adminLinks.map(({to, text}) => (
								<Link key={to} href={to} className="block text-gray-700 hover:text-gray-900">{text}</Link>
							))}
						</nav>
					</div>
				)}
			</nav>
		</header>
	);
};

export default Header;
