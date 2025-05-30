import FloatingIslandElement from "@/app/components/FloatingIslandElement";
import React from "react";
import { useCurrentOrder, useOrderActions } from "@/app/zustand/order";
import { useTranslation } from "react-i18next";

interface FloatingOrderSummaryProps {
    isOpen: boolean;
    error: string;
    onToggleOpen: () => void;
}

const FloatingOrderSummary: React.FC<FloatingOrderSummaryProps> = ({
                                                                       isOpen,
                                                                       error,
                                                                       onToggleOpen,
                                                                   }: FloatingOrderSummaryProps) => {
    const order = useCurrentOrder();
    const orderActions = useOrderActions();
    const [t, i18n] = useTranslation();

    function format_price(currency: string, value: number): string {
        return `${value.toFixed(2)}${currency}`;
    }

    return (
        <div
            className={`fixed bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-[90vw] max-w-md rounded-xl md:rounded-2xl bg-primary-950 shadow-primary-400 shadow-lg text-white transition-all duration-300 ease-out ${isOpen ? 'h-auto p-4' : 'h-16 p-1'}`}>
            <div className={`relative flex items-center justify-between h-full ${isOpen ? 'flex-col' : 'flex-row'}`}>
                {!isOpen && !error && (
                    <>
                        <FloatingIslandElement title={t('cart.items')} content={orderActions.getTotalItemCount()}/>
                        <div className="mx-1 md:mx-2 bg-white bg-opacity-30 w-px h-8 inline-block"/>
                        {/* Adjusted divider */}
                        <FloatingIslandElement title={t('cart.total_price')}
                                               content={format_price(t('cart.currency'), orderActions.getCurrentOrderTotal())}/> {/* Ensure 2 decimal places */}
                        <div className="mx-1 md:mx-2 bg-white bg-opacity-30 w-px h-8 inline-block"/>
                        <FloatingIslandElement title={t('cart.timeslot')} content={order.timeslot ?? t('cart.timeslot_not_selected')}/>
                        {/* Clickable area for opening */}
                        <button onClick={onToggleOpen} className="absolute inset-0 cursor-pointer"
                                aria-label={t('cart.open_order_summary')}></button>
                    </>
                )}

                {/* Error Display (Collapsed View) */}
                {!isOpen && error && (
                    <div className="w-full text-center px-2 flex items-center justify-center h-full">
                        {/* Use ErrorMessage component or simple text */}
                        <p className="text-sm text-red-200 bg-red-800 bg-opacity-50 px-3 py-1 rounded">{error}</p>
                        {/* Make error clickable to dismiss? */}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FloatingOrderSummary;
