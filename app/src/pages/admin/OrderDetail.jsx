import { useEffect, useState } from "react";
import { API_ENDPOINT, THIS_ENDPOINT } from "../../globals.js";
import { useParams, useNavigate } from "react-router-dom";

const OrderDetail = () => {
    //this wont deter anyone
    const token  = localStorage.getItem('token') || "";
    const authed = token !== "";
    
    const navigate = useNavigate();
    if(!authed)
    {
        navigate("/");
    }

    const { orderNumber } = useParams();
    const [order, setOrder] = useState({
        pizzas:[],
        index:null,
    }); // state to hold order status
    const [buttons, setButtons] = useState([]); // state to hold order status
    const states = ["pending", "paid", "ready", "delivered","cancelled"];
    
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

    const getOrder = () => {
        // Get the order status from the server
        fetch(API_ENDPOINT + '/orders/' + orderNumber)
            .then(response => response.json())
            .then(data => {
                // console.log(data);
                setOrder(data);
            });
    }

    const updateButtons = () => {
        setButtons(states.map(state => (
            <button
                disabled={state === order.status} key={state}
                style={{background:order.status === state ? 'green' : 'gray'}}
                className={`text-white font-bold py-0.5 px-1 rounded`}
                onClick={() => updateOrderStatus(order._id, state)}
            >
                {state}
            </button>
        )))
    };

    const updateOrderStatus = (_id, status) => {
        fetch(API_ENDPOINT + '/orders', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ id: _id, status })
        })
            .then(response => response.json())
            .then(() => {
                getOrder();
            })
    }

    useEffect(() => {
        updateButtons();
    }, [order]);

    useEffect(() => {
        getOrder();
    }, [orderNumber]);

    return (
        <div className="content">

            <h2 className="text-2xl">Order Status</h2>

            <div className="flex flex-row items-start p-4 rounded-lg shadow-md">
            <div key={order._id} className="w-full px-2 py-2">
                <div className="bg-white border border-gray-300 rounded-lg shadow-md p-4 relative">
                    <a className="text-xs font-light text-gray-500 mb-0" href={"#"}>{order._id}</a>
                    <div className="text-xl font-semibold mb-2">{order.name}</div>
                    <div className="flex gap-1 items-center justify-start">
                        <span
                            className="text-xs text-gray-700 mr-2 uppercase tracking-wider mb-2 rounded px-2 py-0.5 bg-gray-200">
                            {order.status}
                        </span>
                        <span
                            className="text-xs text-gray-700 mr-2 uppercase tracking-wider mb-2 rounded px-2 py-0.5 bg-gray-200">
                            {order.totalPrice}€
                        </span>
                        <span
                            className="text-xs text-gray-700 mr-2 uppercase tracking-wider mb-2 rounded px-2 py-0.5 bg-gray-200">
                            {order.orderDate}
                        </span>
                    </div>
                    <ul className="list-disc list-inside text-sm font-light text-gray-600 mb-4">
                        {order.pizzas.map(pizza => (
                            <li key={pizza.name}>{pizza.name}: {pizza.price}€</li>
                        ))}
                    </ul>

                    <div className="flex gap-1 items-center justify-start font-light">
                        {buttons}
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
}


export default OrderDetail;
