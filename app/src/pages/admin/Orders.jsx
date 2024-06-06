import {useState} from "react";
import {API_ENDPOINT} from "../../globals.js";

const toyOrders = [
    {orderNumber: 1, status: 'pending'},
    {orderNumber: 2, status: 'pending'},
    {orderNumber: 3, status: 'pending'},
    {orderNumber: 4, status: 'pending'},
    {orderNumber: 5, status: 'pending'},
];

const Orders = () => {
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

          <table className="min-w-full bg-white border border-gray-300">
              <thead>
              <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Order Number</th>
                  <th className="py-3 px-6 text-left">Status</th>
                  <th className="py-3 px-6 text-left">Actions</th>
              </tr>
              </thead>
              <tbody className="text-gray-600 text-sm font-light">
              {orders.map(order => (
                <tr key={order.orderNumber} className="border-b border-gray-200 hover:bg-gray-100">
                    <td className="py-3 px-6 text-left whitespace-nowrap">{order.orderNumber}</td>
                    <td className="py-3 px-6 text-left">{order.status}</td>
                    <td className="py-3 px-6 text-left">
                        <button
                          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded"
                          onClick={() => updateOrderStatus(order.orderNumber, 'pending')}
                        >
                            Pending
                        </button>
                        <button
                          className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded ml-2"
                          onClick={() => updateOrderStatus(order.orderNumber, 'completed')}
                        >
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


export default Orders;
