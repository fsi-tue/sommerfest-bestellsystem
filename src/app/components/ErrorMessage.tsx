import { AlertCircle, X } from "lucide-react";
import React from "react";

interface ErrorMessageProps {
    error: string;
    onCancel?: () => void
}

const ErrorMessage = ({ error, onCancel }: ErrorMessageProps) => {
    return (
        <div
            className="fixed bottom-8 right-8 bg-red-500 text-white rounded-xl px-6 py-4 flex items-center gap-3 shadow-2xl z-50">
            <AlertCircle className="w-6 h-6"/>
            <span className="text-2xl">{error}</span>
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
