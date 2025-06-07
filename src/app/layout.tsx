import Header from "@/app/components/layout/Header";
import Footer from "@/app/components/layout/Footer";

import "./globals.css";
import { Metadata } from "next";
import React from "react";


export const metadata: Metadata = {
    title: "🍕 FSI/K Sommerfest Pizza",
    description: "Order your pizza for the FSI/K Sommerfest 2024",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body>
        <main className="max-h-fit flex flex-col bg-gray-50">
            <Header/>
            <div className="p-4 md:p-8 my-5 w-full max-w-7xl mx-auto min-h-screen">
                {children}
            </div>
            <Footer/>
        </main>
        </body>
        </html>
    );
}
