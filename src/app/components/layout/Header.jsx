// Header.jsx
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
		// Listen for custom login event to update header state without page reload
		const handleLoginSuccess = () => {
			const updatedToken = getFromLocalStorage('token');
			setAuthed(updatedToken != null);
		};
		window.addEventListener("loginSuccessEvent", handleLoginSuccess);

		// Cleanup listener on component unmount
		return () => {
			window.removeEventListener("loginSuccessEvent", handleLoginSuccess);
		};
	}, []);

	const adminLinks = [
		{to: "/admin/prepare", text: "Prepare Foods"}, // does not work yet
		{to: "/admin/manage", text: "Manage DB"},
		{to: "/admin/manage/order", text: "Manage Orders"},
		{to: "/admin/manage/pizza", text: "Manage Foods"},
		{to: "/admin/logout", text: "Logout"},
	];

	// --- New Header Text ---
	const headerText = "Get Your Byte of Pizza!";
	const headerEmoji = "🍕";
	// -----------------------

	return (
		// Sticky header container, responsive padding, background, shadow, rounded corners, max width
		<header className="sticky top-0 bg-gray-50 shadow z-10 rounded-lg p-2 md:p-4 my-5 w-full max-w-7xl mx-auto">
			<div className="container mx-auto flex justify-between items-center px-2 md:px-4 py-4">
				<h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
					<Link href="/">
						{headerText} <span role="img" aria-label="pizza">{headerEmoji}</span>
					</Link>
				</h1>
			</div>
			{/* Navigation section */}
			<nav className="bg-gray-50">
				<div className="container mx-auto flex justify-between items-center px-2 md:px-4 py-2">
					{/* Basic navigation links */}
					<div className="flex space-x-4 sm:space-x-6">
						<Link href="/" className="text-gray-700 hover:text-gray-900 text-sm sm:text-base">Home</Link>
						<Link href="/order/list" className="text-gray-700 hover:text-gray-900 text-sm sm:text-base">Your
							Orders</Link>
					</div>

					{/* Conditional rendering for Login/Admin links */}
					{!authed && (
						<div className="flex space-x-4 sm:space-x-6">
							<Link href="/login" className="text-gray-700 hover:text-gray-900 text-sm sm:text-base">
								Login
							</Link>
						</div>
					)}

					{authed && (
						<>
							{/* Admin Links: Hidden on small screens, visible on medium+ */}
							<div className="hidden md:flex space-x-4 lg:space-x-6">
								{adminLinks.map(({to, text}) => (
									<Link key={to} href={to}
									      className="text-gray-700 hover:text-gray-900 text-sm lg:text-base">{text}</Link>
								))}
							</div>
							{/* Hamburger Menu Button: Visible only on small screens */}
							<div className="md:hidden">
								<button
									className="text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 rounded"
									onClick={() => setMenuOpen(!menuOpen)}
									aria-label="Toggle admin menu"
									aria-expanded={menuOpen}
								>
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

				{/* Mobile Menu Dropdown: Rendered conditionally */}
				{menuOpen && authed && (
					<div className="md:hidden border-t border-gray-200 bg-white shadow-md">
						<nav className="px-4 py-3 space-y-2">
							{adminLinks.map(({to, text}) => (
								<Link
									key={to}
									href={to}
									className="block text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded px-2 py-1"
									onClick={() => setMenuOpen(false)} // Close menu on link click
								>
									{text}
								</Link>
							))}
						</nav>
					</div>
				)}
			</nav>
		</header>
	);
};

export default Header;
