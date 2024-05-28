// App.js
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import Footer from './components/Footer.jsx';
import PizzaMenu from './components/PizzaMenu.jsx';
import OrderQueue from './components/OrderQueue.jsx';
import ManufacturedOrders from './components/ManufacturedOrders.jsx';
import Header from "./components/Header.jsx";
import OrderStatus from "./components/OrderStatus.jsx";

const App = () => {
	return (
		<>
			<Router>
				<main>
					<Header/>
					<Switch>
						<Route path="/" exact>
							<PizzaMenu/>
						</Route>
						<Route path="/order/:orderNumber">
							<OrderStatus/>
						</Route>
						<Route path="/order-queue">
							<OrderQueue/>
						</Route>
						<Route path="/manufactured-orders">
							<ManufacturedOrders/>
						</Route>
					</Switch>
					<Footer/>
				</main>
			</Router>
		</>
	);
};

export default App;
