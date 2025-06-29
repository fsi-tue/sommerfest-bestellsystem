"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/app/components/Button";
import { useTranslations } from 'next-intl';
import useAuthStore from "@/app/zustand/auth";
import ErrorMessage from "@/app/components/ErrorMessage";

const Page = () => {
    const [token, setToken] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const t = useTranslations();
    const authStore = useAuthStore();

    const router = useRouter();

    // Check for token in URL when component mounts
    useEffect(() => {
        // Read the token from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = urlParams.get('token');

        if (tokenFromUrl) {
            setToken(tokenFromUrl);
            handleAuthentication(tokenFromUrl);
        }
    }, []);

    const handleAuthentication = async (tokenToUse: string) => {
        setIsLoading(true);
        setErrorMessage('');

        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: tokenToUse }),
            credentials: 'include',
        });

        if (response.ok) {
            authStore.signIn();
            router.push('/admin/prepare/pizza', { scroll: true })
        } else {
            const errorData = await response.json();
            authStore.signOut()
            setErrorMessage(errorData.error ?? 'Login failed');
        }
        setIsLoading(false);
    };

    const handleSubmit = (event: any) => {
        event.preventDefault();
        const submittedToken = token || event.target.token.value;
        handleAuthentication(submittedToken);
    };

    return (
        <div className="flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md">
                <div className="px-6 py-8 shadow-2xl rounded-2xl sm:px-10">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Admin Login</h2>
                        </div>

                        <div>
                            <label htmlFor="token" className="block text-sm font-medium text-gray-700">
                                {t('LoginPage.fsik_token')}
                            </label>
                            <div className="mt-1">
                                <input
                                    id="token"
                                    name="token"
                                    type="text"
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    autoComplete="current-password"
                                    required
                                    className="block w-full rounded-md border-gray-100 border-2 py-2 px-3 text-gray-900 placeholder-gray-400
                  focus:border-primary-500 focus:outline-none focus:ring-primary-500 shadow-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="flex w-full justify-center rounded-md border-2 border-transparent bg-primary-600 py-3 px-4 text-sm font-medium text-white shadow-sm
                hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                disabled:opacity-75 disabled:cursor-not-allowed transition-all duration-200"
                            >
                                {isLoading ? t('LoginPage.authenticating') : t('LoginPage.login')}
                            </Button>
                        </div>

                        {errorMessage && (
                            <ErrorMessage error={errorMessage}/>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Page;
