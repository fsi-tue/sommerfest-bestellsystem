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
        <meta charSet="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title>🍕</title>
        <meta name="description" content="Order your pizza for the FSI Sommerfest 2024"/>
        <body>
        <main className="max-h-full">
            <Header/>
            {children}
            <Footer/>
        </main>
        </body>
        </html>
    );
}
