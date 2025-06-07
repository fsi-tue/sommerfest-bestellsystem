import React, { ReactNode, useCallback, useState } from "react";

interface ButtonProps {
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    children: ReactNode;
    disabled?: boolean;
    rateLimitMs?: number;
    color?: string;
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

    const isButtonDisabled = button.disabled || isRateLimited;

    return (
        <button
            onClick={handleClick}
            className={`cursor-pointer ${button.className}`}
            disabled={isButtonDisabled}
            type={type}
        >
            {button.children}
        </button>
    );
};

export default Button;
