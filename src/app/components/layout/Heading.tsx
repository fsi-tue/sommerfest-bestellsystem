import React from "react";

interface HeadingProps extends React.PropsWithChildren {
    title: string,
    description: string,
    icon: any
}

export const Heading: React.FC<HeadingProps> = ({ title, description, icon, children }) => {
    return (
        <div className="mb-8 text-black">
            <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 flex flex-col md:flex-row justify-between">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 m-4">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                            {icon}
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-4xl font-bold">{title}</h1>
                            <p className="text-xl opacity-70">{description}</p>
                        </div>
                    </div>
                </div>
                {children}
            </div>
        </div>
    )
}
