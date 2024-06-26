'use client'

import Header from "@/app/components/layout/Header";
import Footer from "@/app/components/layout/Footer";

import "./globals.css";

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <head>
            <meta charSet="utf-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <title>🍕 FSI/K Sommerfest Pizza</title>
            <meta name="description" content="Order your pizza for the FSI/K Sommerfest 2024"/>
        </head>
        <body>
        <main className="max-h-full">
            <Header/>
            <div className="p-6 bg-gray-50 rounded-lg shadow-lg my-5 w-full max-w-4xl mx-auto">
                {children}
            </div>
            <Footer/>
        </main>
        </body>
        </html>
    );
}
