'use client'

import { Construction } from "lucide-react";
import React, { ComponentType } from "react";
import { Loading } from "@/app/components/Loading";
import { useTranslations } from 'next-intl';
import ErrorMessage from "./components/ErrorMessage";
import { useSystem } from "@/lib/fetch/system";

const WithSystemCheck = <P extends object>(
    WrappedComponent: ComponentType<P>
): ComponentType<P> => {

    return function WithSystemCheckComponent(props: P) {
        const t = useTranslations();


        const { data, error, isFetching } = useSystem()

        if (isFetching) {
            return <Loading message={t('SystemCheck.check_system_status')}/>
        }

        if (error) {
            return <ErrorMessage error={error.message}/>;
        }

        if (!data) {
            return null;
        }

        if (data.status.active) {
            return <WrappedComponent {...props} />;
        }

        return (
            <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <Construction className="w-4 h-4 text-red-400"/>
                    </div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        {t('SystemCheck.system_inactive')}
                    </h1>
                </div>
                <p className="text-gray-500 text-md">
                    {data.status.message ?? t('SystemCheck.system_unavailable_message')}
                </p>
            </div>
        )
    };
};

export default WithSystemCheck;
