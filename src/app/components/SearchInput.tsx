import React, { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import Button from "@/app/components/Button";
import {useTranslations} from 'next-intl';

interface SearchInputProps {
    search: (value: string) => void;
    searchValue?: string;
    placeholder?: string;
    className?: string;
}

const SearchInput = ({
                         search,
                         searchValue = '',
                         placeholder = '',
                         className = ''
                     }: SearchInputProps) => {
    const [value, setValue] = useState(searchValue);
    const inputRef = useRef<HTMLInputElement>(null);
    const t = useTranslations();
    placeholder = placeholder || t('components.searchinput.placeholder');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setValue(newValue);
        search(newValue);
    };

    const handleClear = () => {
        setValue('');
        search('');
        inputRef.current?.focus();
    };

    useEffect(() => {
        setValue(searchValue);
    }, [searchValue]);

    return (
        <div className={`relative ${className}`}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-10 py-3 bg-white border border-gray-100 rounded-2xl
                     text-gray-900 placeholder-gray-500
                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                     transition-all duration-200 ease-in-out
                     hover:border-gray-100"
                />
                {value && (
                    <Button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2
                       p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100
                       transition-all duration-200 ease-in-out
                       focus:outline-none focus:ring-2 focus:ring-gray-300"
                        aria-label="Clear search"
                    >
                        <X className="w-4 h-4"/>
                    </Button>
                )}
            </div>
        </div>
    );
};

export default SearchInput;
