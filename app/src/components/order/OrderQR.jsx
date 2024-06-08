import { useEffect, useRef } from "react";
import QRCode from "qrcode";

const OrderQR = (orderId) => {
    const canvasRef = useRef(null);

    // Link to the order page
    const orderLink = `/order/${orderId.orderId}`;
    console.log("orderID in OrderQR:", orderId.orderId)

    // Generate QR code
    useEffect(() => {
        if (orderId) {
            QRCode.toCanvas(canvasRef.current, orderLink, { errorCorrectionLevel: 'H' }, (error) => {
                if (error) console.error(error);
            });
        }
    }, [orderId, orderLink]);

    return (
        <canvas ref={canvasRef} className="border rounded-lg mb-4"></canvas>
    )
}

export default OrderQR;
