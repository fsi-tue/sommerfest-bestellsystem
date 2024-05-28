// App.js
import {useState} from 'react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import Footer from './components/Footer.jsx';
import PizzaMenu from './components/PizzaMenu.jsx';
import OrderSubmit from './components/OrderSubmit.jsx';
import OrderQueue from './components/OrderQueue.jsx';
import ManufacturedOrders from './components/ManufacturedOrders.jsx';
import Header from "./components/Header.jsx";

const App = () => {
	const [order, setOrder] = useState(null); // state to hold selected order

	return (
		<>
			<Router>
				<main>
					<Header/>
					<Switch>
						<Route path="/" exact>
							<PizzaMenu setOrder={setOrder}/>
						</Route>
						<Route path="/order/:orderNumber">
							<OrderSubmit order={order}/>
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
