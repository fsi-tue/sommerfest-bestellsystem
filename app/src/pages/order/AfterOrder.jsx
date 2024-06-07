import {Link, useParams} from "react-router-dom";
import OrderQR from "../../components/order/OrderQR.jsx";

const AfterOrder = () => {
	const {orderNumber} = useParams();

	// Link to the order page
	const orderLink = `/order/${orderNumber}`;

	return (
		<div className="content">
			<h1 className="text-2xl font-bold mb-4 text-center text-gray-800">Thank you for your order! 🍕</h1>
			<div className="flex flex-col items-center p-4 rounded-lg shadow-md">

				<OrderQR orderId={orderNumber}/>

				<p className="mb-3 text-lg font-light text-gray-600 leading-7">
					Your order number is: <Link to={orderLink} className="font-bold hover:underline">{orderNumber}</Link>
				</p>
				<p className="mb-3 text-lg font-light text-gray-600 leading-7">
					Please proceed to pay at the counter.
				</p>

				<div className="flex space-x-4">
					<Link to="/" className="bg-primary-950 text-white px-4 py-2 rounded-lg mt-4 w-full md:w-auto hover:bg-primary-800">Order
						again</Link>
					<Link to="/order/list" className="bg-primary-950 text-white px-4 py-2 rounded-lg mt-4 w-full md:w-auto hover:bg-primary-800">View
						orders</Link>
				</div>
			</div>
		</div>
	);
}

export default AfterOrder;
