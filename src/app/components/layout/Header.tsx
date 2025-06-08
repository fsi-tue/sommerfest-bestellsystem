'use client'

import { useEffect, useState } from "react";
import { Home, List, LogIn, Menu } from "lucide-react";
import Button from "@/app/components/Button";
import LanguageSelector from "@/app/components/LanguageSelector";
import { useTranslations } from 'next-intl';
import { getFromLocalStorage } from "@/lib/localStorage";

const Header = () => {
    const [authed, setAuthed] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const t = useTranslations();

    useEffect(() => {
        const isAuthenticated = getFromLocalStorage('authed', false);
        setAuthed(isAuthenticated);

        // Listen for custom login event to update header state without page reload
        const handleLoginSuccess = () => {
            const isAuthenticated = getFromLocalStorage('authed', false);
            setAuthed(isAuthenticated);
        };
        window.addEventListener("loginSuccessEvent", handleLoginSuccess);

        // Cleanup listener on component unmount
        return () => {
            window.removeEventListener("loginSuccessEvent", handleLoginSuccess);
        };
    }, []);

    const adminLinks = [
        { to: `/admin/prepare`, text: t('header.adminlinks.prepare') }, // does not work yet
        { to: `/admin/order`, text: t('header.adminlinks.manage_orders') },
        { to: `/admin/manage`, text: t('header.adminlinks.manage_db') },
        { to: `/admin/manage/pizza`, text: t('header.adminlinks.manage_items') },
        { to: `/admin/logout`, text: t('header.adminlinks.logout') },
    ];

    const headerText = t('app_title');
    const headerEmoji = "🍕";

    return (
        // Sticky header container, responsive padding, background, shadow, rounded corners, max width
        <header className="sticky top-0 bg-white shadow z-10 rounded-2xl p-2 md:p-4 mb-5 w-full max-w-7xl mx-auto">
            <div className="container mx-auto flex justify-between items-center px-2 md:px-4 py-4">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                    <a href={`/`}>
                        {headerText} <span aria-label="pizza">{headerEmoji}</span>
                    </a>
                </h1>
                <LanguageSelector/>
            </div>


            <nav>
                <div className="container mx-auto flex justify-between items-center px-2 md:px-4 py-2">
                    {/* Basic navigation links */}
                    <div className="flex space-x-4 sm:space-x-6">
                        <a href={`/`}
                           className="flex items-center space-x-2 text-black hover:text-primary-500 transition-colors duration-200 group"
                        >
                            <Home className="w-4 h-4 group-hover:scale-110 transition-transform duration-200"/>
                            <span className="font-medium">{t('header.menu.home')}</span>
                        </a>

                        <a
                            href={`/order/list`}
                            className="flex items-center space-x-2 text-black hover:text-primary-500 transition-colors duration-200 group"
                        >
                            <List className="w-4 h-4 group-hover:scale-110 transition-transform duration-200"/>
                            <span className="font-medium">{t('header.menu.orders')}</span>
                        </a>
                    </div>

                    {!authed && (
                        <div className="flex space-x-4 sm:space-x-6">
                            <a
                                href={`/login`}
                                className="flex items-center space-x-2 text-black hover:text-primary-500 transition-colors duration-200 group"
                            >
                                <LogIn className="w-4 h-4 group-hover:scale-110 transition-transform duration-200"/>
                                <span className="font-medium">{t('header.menu.login')}</span>
                            </a>
                        </div>
                    )}

                    {authed && (
                        <>
                            {/* Admin Links: Hidden on small screens, visible on medium+ */}
                            <div className="hidden md:flex space-x-4 lg:space-x-6">
                                {adminLinks.map(({ to, text }) => (
                                    <a key={to} href={to}
                                       className="flex items-center space-x-2 text-black hover:text-primary-500 transition-colors duration-200 group">
                                        <span className="font-medium">{text}</span>
                                    </a>
                                ))}
                            </div>
                            {/* Hamburger Menu Button: Visible only on small screens */}
                            <div className="md:hidden">
                                <Button
                                    className="text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 rounded"
                                    onClick={() => setMenuOpen(!menuOpen)}
                                    aria-label="Toggle admin menu"
                                    aria-expanded={menuOpen}
                                >
                                    <Menu/>
                                </Button>
                            </div>
                        </>
                    )}
                </div>

                {menuOpen && authed && (
                    <div className="lg:hidden border-t border-white/20 bg-white/5 backdrop-blur-md">
                        <nav className="container mx-auto px-4 py-4 space-y-2">
                            {adminLinks.map(({ to, text }) => (
                                <a
                                    key={to}
                                    href={to}
                                    className="flex items-center space-y-3 text-black hover:text-primary-500 transition-colors duration-200 group"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <span className="font-medium">{text}</span>
                                </a>
                            ))}
                        </nav>
                    </div>
                )}
            </nav>
        </header>
    );
};

export default Header;
