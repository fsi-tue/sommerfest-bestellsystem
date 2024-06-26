'use client'

import { useEffect, useState } from "react";
import { getFromLocalStorage } from "@/lib/localStorage";
import WithAuth from "../WithAuth.jsx";

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
            .catch((error) => setMessage('Error preparing database'))
    }

    const getSystemStatus = () => {
        fetch('/api/manage/system/status', {
            headers: headers,
        })
            .then(response => response.json())
            .then(data => setStatus(data.status))
            .catch((error) => setMessage('Error getting system status'))
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
            .catch((error) => setMessage('Error updating system status'))
    }

    return (
        <div>
            <div className="p-4">
                <h2 className="text-2xl mb-4">Manage Database</h2>
                {message && <div className="text-red-600">{message}</div>}
            </div>
            <div className="w-full px-2 py-2">
                <div className="bg-white border border-gray-300 rounded-lg shadow-md p-4 relative">
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
                            className="h-4 w-4 text-primary-950 focus:ring-primary-800 border-gray-300 rounded"
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

export default WithAuth(Page);
