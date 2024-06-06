import { useState } from "react";
import { useParams } from 'react-router-dom';
import { API_ENDPOINT } from "../../globals.js";

const Status = () => {
    const [status, setStatus] = useState('Please wait...'); // state to hold order status
    const { orderNumber } = useParams();

    fetch(API_ENDPOINT + '/orders/' + orderNumber)
        .then(response => response.json())
        .then(data => setStatus(data.status));

    return (
        <div className="content">
            <h2>Order Status</h2>
            <p>{status}</p>
        </div>
    );
}

export default Status;
