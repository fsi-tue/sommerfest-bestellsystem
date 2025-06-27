import React, { ReactNode, useCallback, useState } from "react";

interface ButtonProps {
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    children: ReactNode;
    disabled?: boolean;
    rateLimitMs?: number;
    color?: string;
    textColor?: string;
    border?: boolean | string;
    className?: string;
    type?: 'button' | 'submit';
}

const Button = (button: ButtonProps) => {
    const [isRateLimited, setIsRateLimited] = useState(false);
    const { rateLimitMs = 100 } = button;
    const { type = 'button' } = button;

    const handleClick = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            if (isRateLimited || button.disabled || !button.onClick) {
                return;
            }

            // Execute the original onClick with the event
            button.onClick(e);

            // Apply rate limit
            setIsRateLimited(true);
            setTimeout(() => {
                setIsRateLimited(false);
            }, rateLimitMs);
        },
        [button.onClick, button.disabled, isRateLimited, rateLimitMs]
    );

    const isDisabled = button.disabled || isRateLimited;

    return (
        <button
            onClick={handleClick}
            className={`${!isDisabled ? 'cursor-pointer' : 'cursor-not-allowed'} ${button.color} ${button.textColor} ${button.border ? button.border + ' border-2' : ''} px-4 py-2 rounded-xl transition-all duration-200 ${button.className}`}
            disabled={isDisabled}
            type={type}
        >
            {button.children}
        </button>
    );
};

export default Button;
