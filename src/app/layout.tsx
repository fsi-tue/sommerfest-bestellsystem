import Header from "@/app/components/layout/Header";
import Footer from "@/app/components/layout/Footer";

import "./globals.css";
import { Metadata } from "next";
import React from "react";
import { getLocale } from "next-intl/server";
import Providers from "@/app/providers";
import { NextIntlClientProvider } from "next-intl";


export const metadata: Metadata = {
    title: "🍕 FSI/K Sommerfest Pizza",
    description: "Order your pizza for the FSI/K Sommerfest 2025",
};

export default async function RootLayout({
                                             children,
                                         }: Readonly<{
    children: React.ReactNode;
}>) {
    const locale = await getLocale();

    return (
        <html lang={locale}>
        <body>
        <main className="max-h-fit flex flex-col bg-gray-50">
            <NextIntlClientProvider>
                <Providers>
                    <div className="mx-auto w-full max-w-7xl">
                        <Header/>
                        <div className="p-4 md:p-8 my-5 min-h-screen">
                            {children}
                        </div>
                        <Footer/>
                    </div>
                </Providers>
            </NextIntlClientProvider>
        </main>
        </body>
        </html>
    );
}
