// Button to order the pizzas
import PropTypes from "prop-types";
import {useNavigate} from "react-router-dom";
import {API_ENDPOINT} from "../../globals.js";

const OrderButton = ({order}) => {
    if (!order || order.length === 0) {
        return;
    }

    const navigate = useNavigate();

    // Function to order the pizzas
    const orderPizza = () => {
        fetch(API_ENDPOINT + '/order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(order),
        })
            .then(response => response.json())
            .then(data => {
                if (data.orderNumber) {
                    console.log(`Order number: ${data.orderNumber}`)
                    navigate(`/order/thank-you/${data.orderNumber}`)
                }
            })
    }

    return (
        <>
            <button onClick={() => orderPizza()}>
                Order now
            </button>
        </>
    );
}

OrderButton.parameters = {
    order: [],
}

OrderButton.propTypes = {
    order: PropTypes.array,
}

export default OrderButton;
