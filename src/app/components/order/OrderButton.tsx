import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import useOrderStore, { useCurrentOrder } from "@/app/zustand/order";
import Button from "@/app/components/Button";
import { useTranslations } from 'next-intl';
import { OrderDocument } from "@/model/order";
import { useShallow } from "zustand/react/shallow";

interface OrderButtonProps {
    setError: (error: string) => void;
}

const OrderButton: React.FC<OrderButtonProps> = ({ setError }) => {
        const router = useRouter();
        const [text, setText] = useState('')
        const [isButtonDisabled, setIsButtonDisabled] = useState(false);

        const t = useTranslations();

        const order = useCurrentOrder();
        const { addOrder, createNewOrder, totalItemsCount } = useOrderStore(
            useShallow((state) => ({
                addOrder: state.addOrder,
                createNewOrder: state.createNewOrder,
                totalItemsCount: state.getTotalItemCount(),
            }))
        )
        useEffect(() => {
            setIsButtonDisabled(true)
            if (totalItemsCount === 0) {
                // Select items
                setText(t('cart.messages.empty_cart'))
            } else if (order.name === '') {
                // Set name
                setText(t('cart.messages.name_not_set'))
            } else if (!order.timeslot) {
                // Select timeslot
                setText(t('cart.messages.timeslot_not_selected'))
            } else {
                // Order
                setText(t('order.order_button.order_now'))
                setIsButtonDisabled(false)
            }
        }, [order, totalItemsCount])

        // Function to order the pizzas
        const sendOrder = () => {
            if (isButtonDisabled || !order) {
                return;
            }
            setIsButtonDisabled(true);

            fetch('/api/order', {
                method: 'POST',
                credentials: 'include', body: JSON.stringify(order),
            })
                .then(async response => {
                    const data = await response.json();
                    if (!response.ok) {
                        const error = data?.message ?? response.statusText;
                        throw new Error(error);
                    }
                    return data as OrderDocument;
                })
                .then(createdOrder => {
                        if (!createdOrder) {
                            throw new Error('Error not created!');
                        }

                        // Add order to store and reset current order
                        addOrder(createdOrder);
                        createNewOrder()

                        // Redirect to thank you page
                        router.push(`/order/${createdOrder._id.toString()}`, { scroll: true })
                    }
                )
                .catch(error => {
                    console.log(error)
                    setError(error.message);
                })
                .finally(() => {
                    setIsButtonDisabled(false);
                });
        };

        return (
            <Button
                onClick={sendOrder}
                className={`w-full md:w-auto font-semibold px-4 py-3 rounded-2xl bg-orange-500 text-white shadow-lg transition-all duration-300 ease-out ${isButtonDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-400'}`}
                disabled={isButtonDisabled}
            >
                {text}
            </Button>
        );
    }
;

export default OrderButton;
