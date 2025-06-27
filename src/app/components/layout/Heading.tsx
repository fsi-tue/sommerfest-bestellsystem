import React from "react";

interface HeadingProps extends React.PropsWithChildren {
    title: string,
    description?: string,
    icon: any
    sticky?: boolean
}

export const Heading: React.FC<HeadingProps> = ({ title, description, icon, sticky, children }) => {
    return (
        <div
            className={`mb-4 p-2 text-black rounded-2xl shadow-lg ${sticky ? 'sticky top-0 md:top-40 p-6 -m-4 z-[100] backdrop-blur-sm bg-white/95' : 'z-50 bg-white'}`}>
            <div className={`flex flex-col md:flex-row justify-between`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 m-1">
                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                            {icon}
                        </div>
                        <div>
                            <h1 className="text-lg md:text-2xl font-bold">{title}</h1>
                            {description && <p className="text-sm md:text-md opacity-70">{description}</p>}
                        </div>
                    </div>
                </div>
                {children}
            </div>
        </div>
    )
}
