import React from "react";

interface HeadingProps extends React.PropsWithChildren {
    title: string,
    description: string,
    icon: any
}

export const Heading: React.FC<HeadingProps> = ({ title, description, icon, children }) => {
    return (
        <div className="mb-4 p-2 text-black sticky top-40 z-50 bg-white rounded-2xl shadow-lg">
            <div className="flex flex-col md:flex-row justify-between">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 m-2">
                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                            {icon}
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold">{title}</h1>
                            <p className="text-md opacity-70">{description}</p>
                        </div>
                    </div>
                </div>
                {children}
            </div>
        </div>
    )
}
