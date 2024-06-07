import {useEffect, useRef} from 'react';
import {Link, useParams} from "react-router-dom";
import QRCode from 'qrcode';

const AfterOrder = () => {
	const {orderNumber} = useParams();
	const canvasRef = useRef(null);

	// Link to the order page
	const orderLink = `/order/${orderNumber}`;

	// Generate QR code
	useEffect(() => {
		if (orderNumber) {
			QRCode.toCanvas(canvasRef.current, orderLink, {errorCorrectionLevel: 'H'}, (error) => {
				if (error) console.error(error);
			});
		}
	}, [orderNumber]);


	return (
		<div className="flex flex-col items-center p-4 bg-gray-100 rounded-lg shadow-md">
			<h1 className="text-2xl font-bold mb-4 text-center text-gray-800">Thank you for your order!</h1>

			<canvas ref={canvasRef} className="border rounded-lg mb-4"></canvas>

			<p className="text-lg text-gray-700">
				Your order number is: <Link to={orderLink} className="text-blue-500 hover:underline">{orderNumber}</Link>
			</p>
			<p className="text-lg text-gray-700">
				Please proceed to pay at the counter.
			</p>
		</div>
	);
}

export default AfterOrder;
