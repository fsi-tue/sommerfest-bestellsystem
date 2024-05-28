// Header.jsx
import { Link } from "react-router-dom";
import './Header.css';

const Header = () => {
	return (
		<header>
			<h1>Pizza Ordering</h1>
			<nav>
				<ul>
					<li>
						<Link to="/">Home</Link>
					</li>
					<li>
						<Link to="/order/queue">Order Queue</Link>
					</li>
				</ul>
			</nav>
		</header>
	);
};

export default Header;
