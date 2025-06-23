interface ErrorMessageProps {
    error: string;
    t?: any
}

const ErrorMessage = ({ error }: ErrorMessageProps) => {
    return (
        <div className="flex flex-col border-4 border-gray-200 rounded-2xl p-4">
            <span className="text-lg font-semibold text-red-500">{error}</span>
        </div>
    );
}

export default ErrorMessage;
