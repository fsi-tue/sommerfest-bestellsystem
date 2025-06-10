'use client'

import { Construction } from "lucide-react";
import { ComponentType, useCallback, useEffect, useMemo, useState } from "react";
import { Loading } from "@/app/components/Loading";
import { useTranslations } from 'next-intl';

// Define the system status type
type SystemStatus = 'checking' | 'active' | 'inactive';

let globalSystemStatus: SystemStatus | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 30000; // 30 seconds

const WithSystemCheck = <P extends object>(
    WrappedComponent: ComponentType<P>
): ComponentType<P> => {

    return function WithSystemCheckComponent(props: P) {
        const t = useTranslations();
        const [systemStatus, setSystemStatus] = useState<SystemStatus>(() => {
            const now = Date.now();
            if (globalSystemStatus && (now - lastFetchTime) < CACHE_DURATION) {
                return globalSystemStatus;
            }
            return 'checking';
        });
        const [loading, setLoading] = useState<boolean>(() => {
            const now = Date.now();
            return !(globalSystemStatus && (now - lastFetchTime) < CACHE_DURATION);
        });

        const checkSystemStatus = useCallback(async (): Promise<void> => {
            const now = Date.now();
            if (globalSystemStatus && (now - lastFetchTime) < CACHE_DURATION) {
                setSystemStatus(globalSystemStatus);
                setLoading(false);
                return;
            }

            setLoading(true);

            try {
                const response = await fetch('/api/manage/system/status', {
                    method: 'GET',
                    credentials: 'include',
                    // Add cache control for browser caching
                    cache: 'no-store'
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data: { status: SystemStatus } = await response.json();

                // Update global cache
                globalSystemStatus = data.status;
                lastFetchTime = Date.now();

                setSystemStatus(data.status);
            } catch (error) {
                console.error('Error fetching system status:', error);
                // Keep previous status if available, otherwise set to inactive
                if (!globalSystemStatus) {
                    setSystemStatus('inactive');
                }
            } finally {
                setLoading(false);
            }
        }, []);

        useEffect(() => {
            checkSystemStatus();
        }, [checkSystemStatus]);

        // Memoize the inactive system UI to prevent unnecessary re-renders
        const inactiveSystemUI = useMemo(() => (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <Construction className="w-4 h-4 text-red-400"/>
                    </div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        {t('withsystemcheck.system_inactive')}
                    </h1>
                </div>
                <p className="text-gray-500 text-sm">
                    {t('withsystemcheck.system_unavailable_message')}
                </p>
            </div>
        ), [t]);

        // Memoize loading component
        const loadingUI = useMemo(() => (
            <Loading message={t('withsystemcheck.check_system_status')}/>
        ), [t]);

        if (loading) {
            return loadingUI;
        }

        if (systemStatus === 'active') {
            return <WrappedComponent {...props} />;
        }

        return inactiveSystemUI;
    };
};

export default WithSystemCheck;
