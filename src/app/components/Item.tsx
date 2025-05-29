import { ItemDocument } from '@/model/item';

interface ItemItemProps {
    item: ItemDocument;
    onAddClick: () => void;
}

const Item = ({ item, onAddClick }: ItemItemProps) => {
    // Helper function to get dietary badge colors
    const getDietaryBadgeStyle = (dietary: string) => {
        const styles: Record<string, string> = {
            'vegetarian': 'bg-green-50 text-green-700 border border-green-200',
            'vegan': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
            'gluten-free': 'bg-orange-50 text-orange-700 border border-orange-200',
            'dairy-free': 'bg-blue-50 text-blue-700 border border-blue-200',
        };
        return styles[dietary.toLowerCase()] || 'bg-gray-50 text-gray-700 border border-gray-100';
    };

    return (
        <div
            className="bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 cursor-pointer">
            <div className="px-4 py-6 flex items-start justify-between gap-4">
                {/* Left Content */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-1">
                        {item.name}
                    </h3>

                    {/* Ingredients/Description */}
                    {item.ingredients && item.ingredients.length > 0 && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                            {item.ingredients.join(', ')}
                        </p>
                    )}

                    {/* Price */}
                    <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-gray-900">
                            €{item.price.toFixed(2)}
                        </span>
                    </div>
                </div>

                {/* Right Content - Add Button */}
                <div className="flex-shrink-0 flex flex-col items-end">
                    <button
                        onClick={onAddClick}
                        className="bg-white border-2 border-gray-100 text-gray-700 font-medium px-4 py-2 rounded-2xl hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 min-w-[80px] text-sm"
                    >
                        Add
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Item;
