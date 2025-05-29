import {useEffect, useRef} from "react";
import QRCode from "qrcode";

const OrderQR = (orderId) => {
	const canvasRef = useRef(null);

	// Link to the order page
	const orderLink = `/order/${orderId.orderId}`;

	// Generate QR code
	useEffect(() => {
		if (orderId) {
			QRCode.toCanvas(canvasRef.current, orderLink, {errorCorrectionLevel: 'H'}, (error) => {
				if (error) {
					console.error(error);
				}
			});
		}
	}, [orderId, orderLink]);

	return (
		<a href={orderLink}>
			<canvas ref={canvasRef} className="border rounded-2xl mb-4 w-32 h-32"/>
		</a>
	)
}

export default OrderQR;
