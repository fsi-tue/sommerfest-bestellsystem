import {useState} from "react";
import {API_ENDPOINT} from "../../globals.js";

const toyOrders = [
    {orderNumber: 1, status: 'pending'},
    {orderNumber: 2, status: 'pending'},
    {orderNumber: 3, status: 'pending'},
    {orderNumber: 4, status: 'pending'},
    {orderNumber: 5, status: 'pending'},
];

const OrderStatus = () => {
    const [orders, setOrders] = useState(toyOrders); // state to hold order status

    // Get the order status from the server
    fetch(API_ENDPOINT + '/orders/')
        .then(response => response.json())
        .then(data => setOrders(data));

    // Function to update the order status
    const updateOrderStatus = (orderNumber, status) => {
        fetch(API_ENDPOINT + '/orders/' + orderNumber, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({status}),
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
            })
    }

    return (
        <div className="content">
            <h2>Order Status</h2>

            <table>
                <thead>
                <tr>
                    <th>Order Number</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {orders.map(order => (
                    <tr key={order.orderNumber}>
                        <td>{order.orderNumber}</td>
                        <td>{order.status}</td>
                        <td>
                            <button onClick={() => updateOrderStatus(order.orderNumber, 'pending')}>
                                Pending
                            </button>
                            <button onClick={() => updateOrderStatus(order.orderNumber, 'completed')}>
                                Completed
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}


export default OrderStatus;
