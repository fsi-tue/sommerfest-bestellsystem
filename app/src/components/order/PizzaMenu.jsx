// PizzaMenu.jsx
import './PizzaMenu.css';
import {useEffect, useState} from "react";
import PropTypes from "prop-types";
import {redirect, useNavigate} from "react-router-dom";

// Toy data
const toyPizzas = [
    {name: "Margherita", price: 5},
    {name: "Pepperoni", price: 7},
    {name: "Vegetarian", price: 6},
    {name: "Four Cheese", price: 8},
];

const API_ENDPOINT = "http://localhost:3000";

// Estimate the wait time for the order
const WaitTime = ({waitTime}) => {
    if (!waitTime) {
        return;
    }

    return (
        <p>
            Estimated wait time: {waitTime} minutes
        </p>
    );
}

// Button to order the pizzas
const OrderPizza = ({order}) => {
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
            <WaitTime waitTime={order.length * 10}/>
            <button onClick={() => orderPizza()}>
                Order now
            </button>
        </>
    );
}

OrderPizza.parameters = {
    order: [],
}

OrderPizza.propTypes = {
    order: PropTypes.array,
}

const Pizza = ({name, price, className, onClick}) => {
    return (
        <li className={className} onClick={onClick}>
            {price}€ {name}
        </li>
    );
}

// PizzaMenu component
const PizzaMenu = () => {
    // State to hold the order
    const [order, setOrder] = useState([]);
    const [pizzas, setPizzas] = useState(toyPizzas);

    useEffect(() => {
        // Fetch the pizza menu from the server
        fetch(API_ENDPOINT + "/pizzas")
            .then(response => response.json())
            .then(data => {
                setPizzas(data);
            })
    }, []);

    // Function to add a pizza to the order
    const addToOrder = (pizza) => {
        setOrder([...order, pizza]);
    }

    // Function to remove a pizza from the order
    const removeFromOrder = (index) => {
        const newOrder = [...order];
        newOrder.splice(index, 1);
        setOrder(newOrder);
    }


    return (
        <div className="content">
            <h2>Pizza Menu</h2>

            <div className="pizza-menu-container">
                <div className="pizza-menu">
                    <h3>
                        Menu
                    </h3>

                    <ul className="pizza-list">
                        {pizzas.map((pizza, index) => (
                            <Pizza key={index} name={pizza.name} price={pizza.price} className="pizza"
                                   onClick={() => addToOrder(pizza)}/>
                        ))}
                    </ul>
                </div>
                <div className="pizza-order">
                    <h3>
                        Your current order
                    </h3>

                    <ul className="pizza-list">
                        {order.map((pizza, index) => (
                            <Pizza key={index} name={pizza.name} price={pizza.price} className="pizza order"
                                   onClick={() => removeFromOrder(index)}/>
                        ))}
                    </ul>

                    <p>
                        Total: {order.reduce((total, pizza) => total + pizza.price, 0)}€
                    </p>
                    <OrderPizza order={order}/>
                </div>
            </div>
        </div>
    );
};

export default PizzaMenu;
