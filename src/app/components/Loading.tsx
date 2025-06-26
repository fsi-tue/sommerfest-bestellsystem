import LoadingSpinner from "@/app/components/LoadingSpinner";

export const Loading = ({ message }: { message?: string }) => {
    return (
        <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-100">
                <div className="flex items-center justify-center text-center">
                    <LoadingSpinner/>
                    {message && <p className="text-gray-700">{message}</p>}
                </div>
            </div>
        </div>
    )
}
