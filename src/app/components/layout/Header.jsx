'use client'

import Link from 'next/link'
import {useEffect, useState} from "react";
import {getFromLocalStorage} from "@/lib/localStorage.js";
import {Home, List, LogIn, Menu} from "lucide-react";

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
		{to: "/admin/prepare", text: "Prepare Items"}, // does not work yet
		{to: "/admin/manage", text: "Manage DB"},
		{to: "/admin/manage/order", text: "Manage Orders"},
		{to: "/admin/manage/pizza", text: "Manage Items"},
		{to: "/admin/logout", text: "Logout"},
	];

	// --- New Header Text ---
	const headerText = "Get Your Byte of Pizza!";
	const headerEmoji = "🍕";
	// -----------------------

	return (
		// Sticky header container, responsive padding, background, shadow, rounded corners, max width
		<header className="sticky top-0 bg-white shadow z-10 rounded-2xl p-2 md:p-4 mb-5 w-full max-w-7xl mx-auto">
			<div className="container mx-auto flex justify-between items-center px-2 md:px-4 py-4">
				<h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
					<Link href="/">
						{headerText} <span role="img" aria-label="pizza">{headerEmoji}</span>
					</Link>
				</h1>
			</div>
			{/* Navigation section */}
			<nav>
				<div className="container mx-auto flex justify-between items-center px-2 md:px-4 py-2">
					{/* Basic navigation links */}
					<div className="flex space-x-4 sm:space-x-6">
						<Link
							href="/"
							className="flex items-center space-x-2 text-black hover:text-primary-500 transition-colors duration-200 group"
						>
							<Home className="w-4 h-4 group-hover:scale-110 transition-transform duration-200"/>
							<span className="font-medium">Home</span>
						</Link>

						<Link
							href="/order/list"
							className="flex items-center space-x-2 text-black hover:text-primary-500 transition-colors duration-200 group"
						>
							<List className="w-4 h-4 group-hover:scale-110 transition-transform duration-200"/>
							<span className="font-medium">Your Orders</span>
						</Link>
					</div>

					{/* Conditional rendering for Login/Admin links */}
					{!authed && (
						<div className="flex space-x-4 sm:space-x-6">
							<Link
								href="/login"
								className="flex items-center space-x-2 text-black hover:text-primary-500 transition-colors duration-200 group"
							>
								<LogIn className="w-4 h-4 group-hover:scale-110 transition-transform duration-200"/>
								<span className="font-medium">Login</span>
							</Link>
						</div>
					)}

					{authed && (
						<>
							{/* Admin Links: Hidden on small screens, visible on medium+ */}
							<div className="hidden md:flex space-x-4 lg:space-x-6">
								{adminLinks.map(({to, text}) => (
									<Link key={to} href={to}
									      className="flex items-center space-x-2 text-black hover:text-primary-500 transition-colors duration-200 group">
										<span className="font-medium">{text}</span>
									</Link>
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
									<Menu/>
								</button>
							</div>
						</>
					)}
				</div>

				{/* Mobile Menu Dropdown: Rendered conditionally */}
				{menuOpen && authed && (
					<div className="lg:hidden border-t border-white/20 bg-white/5 backdrop-blur-md">
						<nav className="container mx-auto px-4 py-4 space-y-2">
							{adminLinks.map(({to, text}) => (
								<Link
									key={to}
									href={to}
									className="flex items-center space-y-3 text-black hover:text-primary-500 transition-colors duration-200 group"
									onClick={() => setMenuOpen(false)}
								>
									<span className="font-medium">{text}</span>
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
