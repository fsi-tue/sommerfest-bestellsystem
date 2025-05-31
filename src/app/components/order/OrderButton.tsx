import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { addToLocalStorage, getFromLocalStorage } from "../../../lib/localStorage";
import { useCurrentOrder } from "@/app/zustand/order";
import { useTranslation } from "react-i18next";

interface OrderButtonProps {
    setError: (error: string) => void;
}

const OrderButton: React.FC<OrderButtonProps> = ({ setError }) => {
    const router = useRouter();
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);
    const [t, i18n] = useTranslation();

    const order = useCurrentOrder();

    // Function to order the pizzas
    const orderPizza = () => {
        if (isButtonDisabled || !order) {
            return;
        }
        setIsButtonDisabled(true);

        fetch('/api/order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(order),
        })
            .then(async response => {
                const data = await response.json();
                if (!response.ok) {
                    const error = (data && data.message) || response.statusText;
                    console.log('Error placing order:', error);
                    throw new Error(error);
                }
                return data;
            })
            .then(data => {
                if (data.orderId) {
                    // Add order ID to local storage
                    const localStorageOrders = JSON.parse(getFromLocalStorage('localStorageOrders')) ?? [];
                    localStorageOrders.push({
                        id: data.orderId,
                        items: Object.values(data.orderItems),
                        timeslot: order?.timeslot,
                    });
                    addToLocalStorage('localStorageOrders', JSON.stringify(localStorageOrders));

                    // Redirect to thank you page
                    router.push(`/order/thank-you/${data.orderId}`);
                }
            })
            .catch(error => {
                console.log(error)
                setError(error.message);
                setIsButtonDisabled(false); // Re-enable the button in case of error
            });
    };

    return (
        <button
            onClick={orderPizza}
            className={`w-full bg-green-700 text-white px-4 py-2 rounded-2xl md:w-auto  ${isButtonDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-800'}`}
            disabled={isButtonDisabled}
        >
            {t('cart.order_now')}
        </button>
    );
};

export default OrderButton;
