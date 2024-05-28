// Header.jsx
import {Link} from "react-router-dom";
import './Header.css';

const Header = () => {
    return (
        <header className="border-primary border-2 p-4">
            <h1 className="text-3xl font-extrabold">
                <Link to="/">Order your pizza</Link>
            </h1>
            <nav>
                <ul>
                    <li>
                        <Link to="/">Home</Link>
                    </li>
                    <li>
                        <Link to="/order/queue">Order Queue</Link>
                    </li>
                </ul>
                <ul>
                    <li>
                        <Link to="/login">Login</Link>
                    </li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;
