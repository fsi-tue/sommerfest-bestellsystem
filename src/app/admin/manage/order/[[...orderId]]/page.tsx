'use client'

import { useEffect, useState } from "react";
import { IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner";
import { getFromLocalStorage } from "@/lib/localStorage";
import WithAuth from "@/app/admin/WithAuth";
import { ORDER_STATUS_VALUES, OrderDocument, OrderStatus } from "@/model/order";
import { formatDateTime, getDateFromTimeSlot } from "@/lib/time";
import SearchInput from "@/app/components/SearchInput";
import ErrorMessage from "@/app/components/ErrorMessage";
import { QrCodeIcon } from "lucide-react";
import {useTranslations} from 'next-intl';

const Page = ({ params }: { params: { orderId: string } }) => {
    const [error, setError] = useState('');

    const [orders, setOrders] = useState<OrderDocument[]>([]);
    const [filteredOrders, setFilteredOrders] = useState([] as OrderDocument[]); // state to hold order status]
    const [filter, setFilter] = useState(''); // state to hold order status

    const [noFinished, setNoFinished] = useState(true);

    const t = useTranslations();

    // Order states
    const orderStates = ORDER_STATUS_VALUES

    const token = getFromLocalStorage('token', '');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    }

    // Fetch the order status from the server
    useEffect(() => {
        // Get the order status from the server
        fetch('/api/order/', {
            headers: headers,
        })
            .then(async response => {
                const data = await response.json();
                if (!response.ok) {
                    const error = data?.message ??response.statusText;
                    throw new Error(error);
                }
                return data;
            })
            .then(data => setOrders(data as OrderDocument[]))
            .catch(error => {
                console.error('Error fetching orders', error);
                setError(error.message)
            });
    }, []);

    // Update the filtered orders when the orders change
    useEffect(() => {
        setFilteredOrders(orders);
    }, [orders]);

    // Set params to filter
    useEffect(() => {
        if (params.orderId) {
            setFilter(params.orderId[0]);
        }
    }, [params.orderId]);

    // Filter the orders
    useEffect(() => {
        if (filter) {
            setFilteredOrders(orders.filter((order) => {
                if (order.name.toLowerCase().includes(filter.toLowerCase())) {
                    return true;
                }
                if (order._id.toString().toLowerCase().includes(filter.toLowerCase())) {
                    return true;
                }
                if (order.status.toLowerCase().includes(filter.toLowerCase())) {
                    return true;
                }
                return (order.items || []).some((item) => item.item.name.toLowerCase().includes(filter.toLowerCase()));
            }));
        } else {
            setFilteredOrders(orders);
        }
    }, [filter, orders]);

    /**
     * Function to update the order status
     * @param _id
     * @param status
     */
    const updateOrderStatus = (_id: string, status: OrderStatus) => {
        const order = orders.find(order => order._id.toString() === _id);
        if (!order) {
            setError(t('admin.manage.order.errors.order_not_found'));
            return;
        }

        const newOrder = { ...order, status };

        fetch('/api/order', {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify({ id: _id, order: newOrder })
        })
            .then(async response => {
                const data = await response.json();
                if (!response.ok) {
                    const error = data?.message ??response.statusText;
                    throw new Error(error);
                }
                return data;
            })
            .then(() => {
                setOrders(orders.map(order => order._id.toString() === _id ? newOrder as OrderDocument : order));
            })
            .catch(error => setError(error.message));
    }

    const setOrderAsPaid = (_id: string, isPaid: boolean) => {
        fetch(`/api/order/${_id}/pay`, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify({ isPaid: isPaid })
        })
            .then(async response => {
                const data = await response.json();
                if (!response.ok) {
                    const error = data?.message ??response.statusText;
                    throw new Error(error);
                }
                return data;
            })
            .then(() => {
                // Update the order by id
                const newOrders = orders.map((order) => {
                    if (order._id.toString() === _id) {
                        order.isPaid = isPaid;
                    }
                    return order;
                });
                setOrders(newOrders);
            })
            .catch(error => setError(error.message));
    }

    /**
     * Function to convert barcode to order
     * @param barcode
     */
    const barcodeToOrder = (barcode: Array<IDetectedBarcode>) => {
        setError('');
        const linkToOrder = barcode[0].rawValue
        const extractedId = linkToOrder.split('/').pop()
        if (!extractedId) {
            setError(t('admin.manage.order.errors.barcode_fail'));
            return;
        }
        setFilter(extractedId);
    }

    const order_url = function (id: string) {
        return `/admin/order/${id}`;
    }

    const hasComment = (order: OrderDocument) => {
        return (
            typeof order.comment === "string" &&
            order.comment != "" &&
            order.comment.toLowerCase() !== "No comment".toLowerCase()
        );
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <QrCodeIcon className="w-4 h-4 text-primary-500"/>
                    </div>
                    <h1 className="text-2xl font-semibold text-gray-900">{t('admin.manage.order.order_history')}</h1>
                </div>
                <p className="text-gray-500 text-sm">{t('admin.manage.order.scan_qr_code_text')}</p>
                <div className="flex items-center justify-between">
                    <div className="w-32 h-32">
                        <Scanner
                            allowMultiple={true} scanDelay={250} paused={false}
                            onScan={(result) => barcodeToOrder(result)}
                        />
                    </div>
                </div>
            </div>

            {error && <ErrorMessage error={error} t={t}/>}

            <div className="md:p-4">
                <SearchInput search={setFilter} searchValue={filter}/>
            </div>

            <div className="py-2 md:p-4">
                <button className={`rounded-full px-4 py-2 text-sm font-medium transition duration-200
    ${noFinished ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                        onClick={() => setNoFinished(!noFinished)}
                >
                    {noFinished ? t('admin.manage.order.show_finished') : t('admin.manage.order.hide_finished')}
                </button>
            </div>

            <div className="flex flex-col space-y-4">
                {filteredOrders && filteredOrders.length > 0 && filteredOrders
                    .filter(order => noFinished ? !['delivered', 'cancelled'].includes(order.status) : true) // Filter by finished
                    .toSorted((a, b) => getDateFromTimeSlot(a.timeslot).getTime() - getDateFromTimeSlot(b.timeslot).getTime()) // Sort by date
                    .map((order, index) => (
                        <div key={order._id.toString() + index}
                             className="w-full px-4 py-4 bg-white rounded-2xl shadow-sm">
                            <div className="mb-4 p-4 bg-white rounded-2xl shadow-sm">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-lg font-semibold text-gray-800">{order.name}</span>
                                    <a className="text-xs font-light text-gray-500"
                                       href={order_url(order._id.toString())}>
                                        {order._id.toString()}
                                    </a>
                                </div>

                                <div className="mb-2 grid grid-cols-1 gap-1 text-sm text-gray-700">
                                    <div className="flex justify-between">
                                        <span className="font-medium">{t('admin.manage.order.status')}</span>
                                        <span>{order.status}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium">{t('admin.manage.order.price')}</span>
                                        <span>{order.totalPrice}€</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium">{t('admin.manage.order.items')}</span>
                                        <span>{order.items.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium">{t('admin.manage.order.order_date')}</span>
                                        <span>{formatDateTime(new Date(order.orderDate))}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium">{t('admin.manage.order.timeslot')}</span>
                                        <span>{formatDateTime(getDateFromTimeSlot(order.timeslot))}</span>
                                    </div>
                                </div>
                            </div>

                            {order.comment && (
                                <div className="mb-4">
                                    <div className="text-sm font-light text-gray-600">
                                        <span className="font-bold">{t('admin.manage.order.comment')}</span>
                                        <span className="pl-4 italic">{order.comment}</span>
                                    </div>
                                </div>
                            )}

                            <ul className="list-none text-sm font-light text-gray-600 mb-4">
                                {order.items.map((item, index) => (
                                    <li key={`${order._id.toString()}-${item.item._id.toString()}-${index}`}
                                        className="flex justify-between items-center mb-2 p-2 bg-white rounded-md shadow-sm hover:shadow-md transition-shadow duration-200">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-800">{item.item.name}</span>
                                            <div className="flex gap-1 mt-1">
                                                {item.item.dietary && (
                                                    <span
                                                        className="px-2 py-0.5 text-xs font-semibold text-white bg-blue-500 rounded-full">{item.item.dietary}</span>
                                                )}
                                                <span
                                                    className="px-2 py-0.5 text-xs font-semibold text-white bg-green-500 rounded-full">{item.item.type}</span>
                                                <span
                                                    className="px-2 py-0.5 text-xs font-semibold border border-gray-100 rounded-full">{item.status}</span>
                                            </div>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-800">{item.item.price}€</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="flex gap-2 flex-wrap justify-start">
                                {orderStates.map(state => (
                                    <button
                                        key={state}
                                        disabled={state === order.status}
                                        className={`rounded-full px-4 py-2 text-sm font-medium transition duration-200 ${state === order.status ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                                        onClick={() => updateOrderStatus(order._id.toString(), state)}
                                    >
                                        {state}
                                    </button>
                                ))}
                                <button
                                    className={`rounded-full px-4 py-2 text-sm font-medium transition duration-200 
    ${order.isPaid ? 'bg-green-300 text-green-700 hover:bg-green-400' : 'bg-red-300 text-red-700 hover:bg-red-400'} 
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                                    onClick={() => setOrderAsPaid(order._id.toString(), !order.isPaid)}
                                >
                                    {order.isPaid ? t('admin.manage.order.paid') : t('admin.manage.order.not_paid')}
                                </button>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
}


export default Page;
