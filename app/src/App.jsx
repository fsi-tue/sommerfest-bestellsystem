// App.js
import PizzaMenu from './components/PizzaMenu.jsx';
import OrderQueue from './components/OrderQueue.jsx';
import {createBrowserRouter, createRoutesFromElements, Route, RouterProvider,} from "react-router-dom";
import Layout from "./components/Layout.jsx";
import OrderStatus from "./components/user/OrderStatus.jsx";

const router = createBrowserRouter(
	createRoutesFromElements(
		<Route path="/" element={<Layout/>}>
			<Route index element={<PizzaMenu/>}/>
			<Route path="order-queue" element={<OrderQueue/>}/>
			<Route path="order">
				<Route path="queue" element={<OrderQueue/>} />
				<Route path=":orderNumber" element={<OrderStatus/>} />
			</Route>
			<Route path="*" element={<h1>Not Found</h1>}/>
		</Route>
	)
);

const App = () => {
	return (
		<>
			<RouterProvider router={router}/>
		</>
	);
};

export default App;
