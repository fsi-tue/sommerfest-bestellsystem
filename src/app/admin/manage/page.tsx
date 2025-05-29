'use client'

import { useEffect, useState } from "react";
import { getFromLocalStorage } from "@/lib/localStorage";
import { Database } from "lucide-react";

const Page = () => {
    const token = getFromLocalStorage('token', '');

    const [message, setMessage] = useState('');
    const [enable, setEnable] = useState(false)
    const states: ('active' | 'inactive' | 'maintenance')[] = ['active', 'inactive']
    const [status, setStatus] = useState<'active' | 'inactive' | 'maintenance'>('active')

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    }

    const deleteDatabase = () => {
        if (!enable) {
            return;
        }

        fetch('/api/manage/db/delete', {
            method: 'POST',
            headers: headers,
        })
            .then(() => setMessage('Database deleted'))
            .catch((error) => setMessage(error))
    }

    const prepareDatabase = () => {
        if (!enable) {
            return;
        }

        fetch('/api/manage/db/prepare', {
            method: 'POST',
            headers: headers,
        })
            .then(() => setMessage('Database prepared'))
            .catch((error) => {
                console.error('Error preparing database', error);
                setMessage(error)
            })
    }

    const getSystemStatus = () => {
        fetch('/api/manage/system/status', {
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
            .then(data => setStatus(data.status))
            .catch((error) => {
                console.error('There was an error!', error);
                setMessage('Error getting system status')
            })
    }

    useEffect(() => {
        getSystemStatus()
    }, [])

    const updateSystemStatus = (status: 'active' | 'inactive' | 'maintenance') => {
        fetch(`/api/manage/system/status/${status}`, {
            method: 'POST',
            headers: headers
        })
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
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <Database className="w-4 h-4 text-primary-500"/>
                    </div>
                    <h1 className="text-2xl font-semibold text-gray-900">Manage Database</h1>
                </div>
                <p className="text-red-500 text-sm">{message}</p>
            </div>

            <div className="w-full px-2 py-2">
                <div className="bg-white border border-gray-100 rounded-2xl shadow-md p-4 relative">
                    <div className="mb-4 flex items-center gap-4">
                        <label htmlFor="enable" className="block text-sm font-medium text-gray-700 mb-2">
                            Enable
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
                        <button
                            onClick={prepareDatabase}
                            className="rounded-full px-4 py-2 text-sm font-medium transition duration-200 bg-gray-300 text-gray-700 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
                            Prepare Database
                        </button>
                        <button
                            onClick={deleteDatabase}
                            className="rounded-full px-4 py-2 text-sm font-medium transition duration-200 bg-red-300 text-gray-700 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
                            Delete Database
                        </button>
                    </div>
                    <div className="flex gap-2 flex-wrap justify-start mt-4">
                        {states.map(state => (
                            <button
                                key={state}
                                disabled={state === status}
                                className={`rounded-full px-4 py-2 text-sm font-medium transition duration-200 ${state === status ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                                onClick={() => updateSystemStatus(state)}
                            >
                                System {state}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Page;
