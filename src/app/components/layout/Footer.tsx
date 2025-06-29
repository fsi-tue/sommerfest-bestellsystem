'use client'

import { useTranslations } from 'next-intl';

const Footer = () => {
    const currentYear = new Date().getFullYear(); // Get current year dynamically
    const t = useTranslations();

    return (
        <footer
            // Footer container: background, shadow, rounded, padding, margin, width, centered text
            className="bg-gray-50 shadow rounded-2xl p-4 mt-5 w-full max-w-7xl mx-auto text-center text-sm text-gray-600"
        >
            {/* Copyright and Credits - kept links and names */}
            <p>
                Copyright © {currentYear} <a href="https://www.fsi.uni-tuebingen.de"
                                             className="font-medium text-primary-600 hover:underline">Fachschaft
                Informatik
                Tübingen</a>
                <span className="mx-1">|</span>
                {t('Footer.fuel')}
                <a href="https://github.com/Zeilenschubser/"
                   className="font-medium text-primary-600 hover:underline">Zeilenschubser</a> & <a
                href="https://github.com/am9zZWY" className="font-medium text-primary-600 hover:underline">Josef
                Müller</a>
            </p>
        </footer>
    );
};

export default Footer;
