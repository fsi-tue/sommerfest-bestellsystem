import { useEffect, useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { API_ENDPOINT } from "../../globals.js";
import OrderQR from "../../components/order/OrderQR.jsx";

const Status = () => {
    const [status, setStatus] = useState(''); // state to hold order status
    const [pizzas, setPizzas] = useState([]); // state to hold order status
    const token  = localStorage.getItem('token') || "";
    const authed = token !== "";
    
    const navigate = useNavigate();
    const { orderNumber } = useParams();
    if(authed)
    {
        // console.log("authed, forwarding...");
        navigate("/admin/"+orderNumber);
    }

    useEffect(() => {
        // Get the order status from the server
        fetch(API_ENDPOINT + '/orders/' + orderNumber)
            .then(response => response.json())
            .then(data => {
                setStatus(data.status)
                setPizzas(data.pizzas)
            });
    }, [orderNumber]);

    const statusToText = (status) => {
        if (status === 'ready') {
            return 'Your order is ready for pickup!';
        } else if (status === 'pending') {
            return 'Please pay at the counter.';
        } else if (status === 'paid') {
            return 'Your order is being prepared...';
        } else if (status === 'delivered') {
            return 'Your order has been delivered!';
        } else if (status === 'cancelled') {
            return 'Your order has been cancelled.';
        } else {
            return 'Unknown status';
        }
    }

    return (
        <div className="content">

            <h2 className="text-2xl">Order Status</h2>

            <div className="flex flex-row items-start p-4 rounded-lg shadow-md">
                <div>
                    <h3 className="text-lg font-bold">QR Code</h3>
                    <OrderQR orderId={orderNumber} />

                    <p className="mb-3 text-lg font-light text-gray-600 leading-7">
                        {statusToText(status)}
                    </p>
                </div>
                <div className="">
                    <div className="ml-4">
                        <h3 className="text-lg font-bold">Order details</h3>
                        <ul className="list-disc list-inside text-sm font-light text-gray-600 mb-4">
                            {pizzas.map(pizza => (
                                <li key={pizza.name}>{pizza.name}: {pizza.price}€</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
        ;
}

export default Status;
