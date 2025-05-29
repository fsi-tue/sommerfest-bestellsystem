import Timeline from "@/app/components/Timeline"; // Assuming .tsx or adjust if needed
import ErrorMessage from "@/app/components/ErrorMessage";
import { useCurrentOrder, useOrderActions } from "@/app/zustand/order";
import React from "react";
import { useTranslation } from "react-i18next";

interface OrderSectionProps {
    error: string;
    start: Date;
    end: Date;
    every_x_seconds: number;
}

const OrderSection: React.FC<OrderSectionProps> = ({
                                                       error,
                                                       start,
                                                       end,
                                                       every_x_seconds
                                                   }) => {

    const order = useCurrentOrder()
    const orderActions = useOrderActions()
    const [t, i18n] = useTranslation();

    return (
        <div className="md:w-1/2 w-full">
            <a id="order" className="block -mt-20 pt-20"></a>
            {error && <ErrorMessage error={error}/>}

            {/* Form Inputs */}
            <div className="mb-6 space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">{t("order_view.order.name")}</label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        value={order.name} // Controlled component
                        placeholder={t("order_view.order.name_placeholder")}
                        className="mt-1 p-3 border border-gray-100 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm"
                        onChange={(e) => orderActions.setName(e.target.value)}
                        required
                    />
                </div>
            </div>

            {/* Timeline Section */}
            <div className="timeline-container mt-8">
                <h4 className="text-xl font-semibold mb-2 text-gray-900">{t("order_view.timeslot.title")}</h4> {/* Adjusted heading level */}
                <p className="mb-4 text-base font-light leading-relaxed text-gray-700"> {/* Adjusted text size/leading */}
                    {t("order_view.timeslot.subtitle")}
                </p>
                <Timeline
                    startDate={start}
                    stopDate={end}
                    every_x_seconds={every_x_seconds}
                />
            </div>
        </div>
    );
};

export default OrderSection;
