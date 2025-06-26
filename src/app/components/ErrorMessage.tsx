import { AlertCircle, X } from "lucide-react";
import React from "react";

interface ErrorMessageProps {
    error: string;
    onCancel?: () => void
}

const ErrorMessage = ({ error, onCancel }: ErrorMessageProps) => {
    return (
        <div
            className="fixed left-1/2 transform -translate-x-1/2 bottom-8 md:right-8 md:left-auto md:transform-none md:translate-x-0 bg-red-500 text-white rounded-xl px-6 py-4 flex items-center gap-3 shadow-2xl z-100 max-w-sm md:max-w-none">
            <AlertCircle className="w-6 h-6"/>
            <span className="text-md md:text-2xl">{error}</span>
            {onCancel && <button
							onClick={() => onCancel()}
							className="ml-2 text-white hover:text-gray-200"
						>
							<X className="w-5 h-5"/>
						</button>
            }
        </div>
    );
}

export default ErrorMessage;
