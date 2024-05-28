import {Link, useParams} from "react-router-dom";

const ThankYou = () => {
    const { orderNumber } = useParams();

    return (
        <div>
            <h1>Thank you for your order!</h1>

            <p>Your order number is: <Link to={`/order/${orderNumber}`}>{orderNumber}</Link></p>
        </div>
    )
}

export default ThankYou;
