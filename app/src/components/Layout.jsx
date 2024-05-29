import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import {Outlet} from "react-router-dom";

const Layout = () => {
	return (
		<main>
			<Header/>
			<Outlet />
			<Footer/>
		</main>
	);
}

export default Layout;
