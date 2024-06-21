// App.js
// Pages and components
// Layout
import Default from "./layout/Default.jsx";

// Default
import Order from "./pages/order/Order.jsx";
import AfterOrder from "./pages/order/AfterOrder.jsx";
import Orders from "./pages/order/Orders.jsx";
import Status from "./pages/order/Status.jsx";

// Admin
import Login from "./pages/Login.jsx";
import Logout from "./pages/Logout.jsx";
import AdminOrders from "./pages/admin/Orders.jsx";
import AdminOrderDetail from "./pages/admin/OrderDetail.jsx";
import AdminManagePizzas from "./pages/admin/ManagePizzas.jsx";

// Redux
import {Provider} from 'react-redux'

// React Router
import {createBrowserRouter, createRoutesFromElements, Route, RouterProvider,} from "react-router-dom";
import {store} from './store'

// Create a router with the routes
const router = createBrowserRouter(
	createRoutesFromElements(
		<Route path="/" element={<Default/>}>
			<Route index element={<Order/>}/>
			<Route path="order">
				<Route path="list" element={<Orders/>}/>
				<Route path="thank-you/:orderNumber" element={<AfterOrder/>}/>
				<Route path=":orderNumber" element={<Status/>}/>
			</Route>
			<Route path="login" element={<Login/>}/>
			<Route path="admin">
				<Route path="" element={<AdminOrders/>}/>
				<Route path="pizzas" element={<AdminManagePizzas/>}/>
				<Route path=":orderNumber" element={<AdminOrderDetail/>}/>
			</Route>
			<Route path="logout" element={<Logout/>}/>
			<Route path="*" element={<h1>Not Found</h1>}/>
		</Route>
	)
);


const App = () => {
	return (
		<>
			<Provider store={store}>
				<RouterProvider router={router}/>
			</Provider>
		</>
	);
};

export default App;
