'use client'

import React from "react";
import ErrorMessage from "@/app/components/ErrorMessage";
import { Wrench } from "lucide-react";
import EditItem from "./EditItem";
import { Heading } from "@/app/components/layout/Heading";
import { useTranslations } from 'next-intl';
import { useItems } from "@/lib/fetch/item";
import { Loading } from "@/app/components/Loading";

const Page = () => {
    const t = useTranslations();

    const { data, error, isFetching } = useItems()

    if (isFetching) {
        return <Loading message={t('loading_menu')}/>
    }

    if (error) {
        return <ErrorMessage error={error.message}/>;
    }

    if (!data) {
        return null;
    }

    return (
        <div>
            <Heading title={t('Admin.Manage.Items.title')} description={t('Admin.Manage.Items.subtitle')}
                     icon={<Wrench className="w-10 h-10 text-gray-900"/>}/>

            {/* New Item */}
            <EditItem key="new" isNew={true}/>

            {/* Items */}
            <div className="flex flex-col space-y-4">
                {data.map(item => (
                    <EditItem key={item._id.toString()} item={item}/>
                ))}
            </div>
        </div>
    );
}

export default Page;
