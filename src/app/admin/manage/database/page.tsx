'use client'

import React, { useEffect, useState } from "react";
import { Database } from "lucide-react";
import Button from "@/app/components/Button";
import { Heading } from "@/app/components/layout/Heading";

import { useTranslations } from 'next-intl';
import { SystemStatus } from "@/model/system";

export default function ManagePage() {
    const [message, setMessage] = useState('');
    const [enable, setEnable] = useState(false)
    const states: SystemStatus[] = ['active', 'inactive']
    const [status, setStatus] = useState<'active' | 'inactive' | 'maintenance'>('active')
    const t = useTranslations();

    const deleteDatabase = () => {
        if (!enable) {
            return;
        }

        fetch('/api/manage/db/delete', {
            method: 'POST',
            credentials: 'include',        })
            .then(() => setMessage('Database deleted'))
            .catch((error) => setMessage(error))
    }

    const prepareDatabase = () => {
        if (!enable) {
            return;
        }

        fetch('/api/manage/db/prepare', {
            method: 'POST',
            credentials: 'include',        })
            .then(() => setMessage('Database prepared'))
            .catch((error) => {
                console.error('Error preparing database', error);
                setMessage(error => error)
            })
    }

    const getSystemStatus = () => {
        fetch('/api/manage/system/status', {
            credentials: 'include',        })
            .then(async response => {
                const data = await response.json();
                if (!response.ok) {
                    const error = data?.message ?? response.statusText;
                    throw new Error(error);
                }
                return data;
            })
            .then(data => setStatus(data.status))
            .catch((error) => {
                console.error('There was an error!', error);
                setMessage('Error getting system status')
            })
    }

    useEffect(() => {
        getSystemStatus()
    }, [])

    const updateSystemStatus = (status: SystemStatus) => {
        fetch(`/api/manage/system/status/${status}`, {
            method: 'POST',
            credentials: 'include',        })
            .then(() => {
                setMessage(`System ${status}`)
                setStatus(status)
            })
            .catch((error) => {
                console.error('Error updating system status', error);
                setMessage(error)
            })
    }

    return (
        <div>
            <Heading title={t('admin.manage.database.title')} description={message}
                     icon={<Database className="w-10 h-10 text-primary-500"/>}/>

            <div className="w-full px-2 py-2">
                <div className="bg-white border border-gray-100 rounded-2xl shadow-md p-4 relative">
                    <div className="mb-4 flex items-center gap-4">
                        <label htmlFor="enable" className="block text-sm font-medium text-gray-700 mb-2">
                            {t('admin.manage.database.enable_system')}
                        </label>
                        <input
                            type="checkbox"
                            id="enable"
                            name="enable"
                            checked={enable}
                            onChange={() => setEnable(!enable)}
                            className="h-4 w-4 text-primary-950 focus:ring-primary-800 border-gray-100 rounded"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap justify-start">
                        <Button
                            onClick={prepareDatabase}
                            className="rounded-full px-4 py-2 text-sm font-medium transition duration-200 bg-gray-300 text-gray-700 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed">
                            {t('admin.manage.database.prepare_database')}
                        </Button>
                        <Button
                            onClick={deleteDatabase}
                            className="rounded-full px-4 py-2 text-sm font-medium transition duration-200 bg-red-300 text-gray-700 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed">
                            {t('admin.manage.database.delete_database')}
                        </Button>
                    </div>
                    <div className="flex gap-2 flex-wrap justify-start mt-4">
                        {states.map(state => (
                            <Button
                                key={state}
                                disabled={state === status}
                                className={`rounded-full px-4 py-2 text-sm font-medium transition duration-200 ${state === status ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                                onClick={() => updateSystemStatus(state)}
                            >
                                {t('admin.manage.database.system_state', { state: state })}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
