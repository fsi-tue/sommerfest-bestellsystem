import LoadingSpinner from "@/app/[lng]/components/LoadingSpinner";

export const Loading = ({ message }: { message: string }) => {
    return (
        <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-center text-center">
                    <LoadingSpinner/>
                    <p className="text-gray-700">{message}</p>
                </div>
            </div>
        </div>
    )
}
