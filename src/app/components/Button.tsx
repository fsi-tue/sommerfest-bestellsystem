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
    let color: string = '';
    if (button.color) {
        if (button.color !== "white" && button.color !== "black" && button.color !== "gray") {
            color = `bg-${button.color}-500`;
            if (!isDisabled) {
                color += ` hover:bg-${button.color}-600`
            }
        } else if (button.color === "gray") {
            color = `bg-${button.color}-100`;
            if (!isDisabled) {
                color += ` hover:bg-${button.color}-300`
            }
        } else if (button.color === "white") {
            color = "bg-white";
        } else if (button.color === "black") {
            color = "bg-black";
        }
    }

    let textColor: string = '';
    if (button.textColor) {
        if (button.textColor !== "white" && button.textColor !== "black") {
            textColor = `text-${button.textColor}-500`;
        } else if (button.textColor === "white") {
            textColor = "text-white"
        } else if (button.textColor === "black") {
            textColor = "text-black";
        }
    }

    let border: string = '';
    if (button.border === true) {
        border = `border-2 border-${button.color ?? 'gray'}-500`
    } else if (typeof button.border === 'string') {
        border = `border-2 border-${button.border}-500`
    }

    return (
        <button
            onClick={handleClick}
            className={`${!isDisabled ? 'cursor-pointer' : 'cursor-not-allowed'} ${color} ${textColor} ${border} px-4 py-2 rounded-xl transition-all duration-200 ${button.className}`}
            disabled={isDisabled}
            type={type}
        >
            {button.children}
        </button>
    );
};

export default Button;
