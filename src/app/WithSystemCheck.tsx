'use client'

import { Construction } from "lucide-react";
import { ComponentType, useEffect, useState } from "react";
import { Loading } from "@/app/components/Loading";
import { useTranslation } from "react-i18next";

// Define the system status type
type SystemStatus = 'checking' | 'active' | 'inactive';

// Define the HOC function with proper TypeScript generics
const WithSystemCheck = <P extends object>(
    WrappedComponent: ComponentType<P>
): ComponentType<P> => {
    const [t, i18n] = useTranslation();

    return function WithSystemCheckComponent(props: P) {
        const [systemStatus, setSystemStatus] = useState<SystemStatus>('checking');
        const [loading, setLoading] = useState<boolean>(true);

        const checkSystemStatus = (): void => {
            setLoading(true);
            fetch('/api/manage/system/status')
                .then(async (response: Response) => {
                    const data = await response.json();
                    if (!response.ok) {
                        const error = (data && data.message) || response.statusText;
                        throw new Error(error);
                    }
                    return data;
                })
                .then((data: { status: SystemStatus }) => {
                    setSystemStatus(data.status);
                    setLoading(false);
                })
                .catch((error: Error) => {
                    console.error('Error fetching system status:', error.message);
                    setLoading(false);
                });
        };

        useEffect(() => {
            checkSystemStatus();
        }, []);

        if (loading) {
            return (
                <Loading message={t('withsystemcheck.check_system_status')}/>
            );
        }

        if (systemStatus === 'active') {
            return <WrappedComponent {...props} />;
        }

        return (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <Construction className="w-4 h-4 text-red-400"/>
                    </div>
                    <h1 className="text-2xl font-semibold text-gray-900">{t('withsystemcheck.system_inactive')}</h1>
                </div>
                <p className="text-gray-500 text-sm">
                    {t('withsystemcheck.system_unavailable_message')}
                </p>
            </div>
        );
    };
};

export default WithSystemCheck;
