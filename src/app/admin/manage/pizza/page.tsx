'use client'

import React, { useEffect, useState } from "react";
import ErrorMessage from "@/app/components/ErrorMessage";
import { Wrench } from "lucide-react";
import EditItem from "./EditItem";
import { Heading } from "@/app/components/layout/Heading";
import { useTranslations } from 'next-intl';
import { ItemDocument } from "@/model/item";

const Page = () => {

    const [items, setItems] = useState<ItemDocument[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const t = useTranslations();
    useEffect(() => {
        fetch('/api/pizza/', {
            credentials: 'include',        })
            .then(async response => {
                const data = await response.json();
                if (!response.ok) {
                    const error = data?.message ?? response.statusText;
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
                setError(t('admin.manage.pizza.errors.error_fetching'));
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }
    if (error) {
        return (<ErrorMessage error={error}/>);
    }

    return (
        <div>
            <Heading title={t('admin.manage.pizza.title')} description={t('admin.manage.pizza.subtitle')}
                     icon={<Wrench className="w-10 h-10 text-gray-900"/>}/>

            {/* New Item */}
            <EditItem key="new" isNew={true}/>

            {/* Items */}
            <div className="flex flex-col space-y-4">
                {items.map(item => (
                    <EditItem key={item._id.toString()} item={item}/>
                ))}
            </div>
        </div>
    );
}

export default Page;
