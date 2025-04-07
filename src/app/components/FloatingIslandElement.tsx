interface FloatingIslandElementProps {
    content: string | number;
    title: string;
}

const FloatingIslandElement = ({ content, title }: FloatingIslandElementProps) => {
    return (
        <div className="p-2.5 text-nowrap h-full flex flex-col items-center justify-center flex-1 min-w-0"> {/* Added flex-1 and min-w-0 for better flex distribution */}
            <div className="flex flex-col items-center justify-center max-w-full overflow-hidden text-center"> {/* Allow content to wrap if needed, removed fixed width */}
                <div className="text-sm font-medium truncate"> {/* Truncate long content */}
                    {content}
                </div>
            </div>
            <div className="mt-1 font-light text-xs leading-tight"> {/* Adjusted text size/leading */}
                {title}
            </div>
        </div>
    );
};

export default FloatingIslandElement;
