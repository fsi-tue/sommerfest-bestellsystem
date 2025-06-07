'use client'

import React, { useEffect, useState } from "react";
import { getFromLocalStorage } from "@/lib/localStorage";
import ErrorMessage from "@/app/components/ErrorMessage";
import WithAuth from "../../WithAuth.jsx";
import { Wrench } from "lucide-react";
import EditItem from "./EditItem";
import { ITEM_CONFIG } from "@/config";
import { Heading } from "@/app/components/layout/Heading";

const Page = () => {
    const token = getFromLocalStorage('token', '');

    const [items, setItems] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    }

    useEffect(() => {
        fetch('/api/pizza/', {
            headers: headers,
        })
            .then(async response => {
                const data = await response.json();
                if (!response.ok) {
                    const error = (data && data.message) || response.statusText;
                    throw new Error(error);
                }
                return data;
            })
            .then(data => {
                setItems(data);
                setLoading(false);
            })
            .catch(() => {
                console.error('Error fetching pizzas');
                setError('Error fetching pizzas');
                setLoading(false);
            });
    }, [token]);

    if (loading) {
        return <div>Loading...</div>;
    }
    if (error) {
        return (<ErrorMessage error={error}/>);
    }

    return (
        <div>
            <Heading title={"Manage Items"} description={"Add, remove and disable items"}
                     icon={<Wrench className="w-10 h-10 text-gray-900"/>}/>

            {/* New Item */}
            <EditItem key="new" item={{ name: 'New Pizza', price: 0, enabled: true, max: ITEM_CONFIG.MAX_ITEMS }}
                      isNew={true}/>

            {/* Items */}
            <div className="flex flex-col space-y-4">
                {items.map(item => (
                    <EditItem key={item._id} item={item}/>
                ))}
            </div>
        </div>
    );
}

export default WithAuth(Page);
