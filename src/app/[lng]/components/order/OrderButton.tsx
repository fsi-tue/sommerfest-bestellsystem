import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { addToLocalStorage, getFromLocalStorage } from "@/lib/localStorage";
import { useCurrentOrder, useOrderActions } from "@/app/zustand/order";
import Button from "@/app/[lng]/components/Button";
import { useT } from "@/app/i18n/i18nClient";

interface OrderButtonProps {
    setError: (error: string) => void;
}

const OrderButton: React.FC<OrderButtonProps> = ({ setError }) => {
    const router = useRouter();
    const [text, setText] = useState('')
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);

    const { t } = useT();

    const order = useCurrentOrder();
    const orderActions = useOrderActions();
    useEffect(() => {
        setIsButtonDisabled(true)
        if (orderActions.getTotalItemCount() === 0) {
            setText("Choose Items")
        } else if (order.name === '') {
            setText("Set Name");
        } else if (!order.timeslot) {
            setText(t('cart.timeslot_not_selected'))
        } else {
            setText(t('order.order_button.order_now'))
            setIsButtonDisabled(false)
        }
    }, [order])

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
                return data as { orderId: string };
            })
            .then(data => {
                if (data.orderId) {
                    // Add order ID to local storage
                    const localStorageOrders = JSON.parse(getFromLocalStorage('localStorageOrders')) ?? [];
                    localStorageOrders.push({
                        id: data.orderId,
                        items: Object.values(order.items).flat().map((item) => item.name),
                        timeslot: order.timeslot,
                    });
                    addToLocalStorage('localStorageOrders', JSON.stringify(localStorageOrders));

                    // Redirect to thank you page
                    router.push(`/order/thank-you/${data.orderId}`);
                }
            })
            .catch(error => {
                console.log(error)
                setError(error.message);
                setIsButtonDisabled(false); // Re-enable the Button in case of error
            });
    };

    return (
        <Button
            onClick={orderPizza}
            className={`w-full md:w-auto font-semibold px-4 py-3 rounded-2xl bg-orange-500 text-white shadow-lg transition-all duration-300 ease-out ${isButtonDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-400'}`}
            disabled={isButtonDisabled}
        >
            {text}
        </Button>
    );
};

export default OrderButton;
