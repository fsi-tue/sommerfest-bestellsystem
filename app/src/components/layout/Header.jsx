// Header.jsx
import { Link } from "react-router-dom";
import './Header.css';
import { useEffect, useState } from "react";

const Header = () => {
	const [authed, setAuthed] = useState(false);
	//this wont deter anyone
	useEffect(() => {
		const token = localStorage.getItem('token');
		setAuthed(token != null);
		window.addEventListener("loginSuccessEvent", (e) => {
			const token = localStorage.getItem('token');
			setAuthed(token != null);
		});
	},[localStorage.getItem('token')]);
	

	const adminLinks = [
		{to: "/admin/", text:"Admin Orders"},
		{to: "/admin/pizzas", text:"Admin Pizzas"},
		{to: "/logout", text:"Logout"},
	];
	
	return (
		<header className="border-primary border-2 p-4">
			<h1
				className="text-3xl font-extrabold text-primary mb-4 text-center md:text-left md:mb-0 md:mr-4 md:inline-block w-full md:w-auto">
				<Link to="/">Pizza Ordering System 🍕</Link>
			</h1>
			<nav>
				<ul>
					<li>
						<Link to="/">Home</Link>
					</li>
					<li>
						<Link to="/order/list">Your Orders</Link>
					</li>
					{authed && adminLinks.map(({to, text}) => (
						<li>
							<Link to={to}>{text}</Link>
						</li>
					))}
				</ul>
			</nav>
		</header>
	);
};

export default Header;
