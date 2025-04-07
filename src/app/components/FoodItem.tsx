import { FoodDocument } from '@/model/food'; // Assuming this path is correct

interface FoodItemProps {
    food: FoodDocument;
    onAddClick: () => void; // Renamed prop for clarity
}

const FoodItem = ({ food, onAddClick }: FoodItemProps) => {
    return (
        <li className="p-4 rounded-lg shadow-sm border border-gray-300 transition-shadow duration-300 mb-2">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex flex-wrap gap-2 mb-1"> {/* Use gap for spacing, flex-wrap for smaller screens */}
                        {food.dietary && (
                            <span className="px-3 py-1 text-xs border border-gray-100 rounded-full bg-gray-50">
                {food.dietary}
              </span>
                        )}
                        <span className="px-3 py-1 text-xs border border-gray-100 rounded-full bg-gray-50">
              {food.type}
            </span>
                    </div>
                    <span className="text-base font-semibold text-gray-900 block"> {/* Block for better layout */}
                        {food.price}€ {food.name}
          </span>
                </div>
                <div className="flex items-center ml-2"> {/* Added margin for spacing */}
                    <button
                        onClick={onAddClick}
                        className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-primary-400 shadow-primary-300 text-white rounded-md px-3 py-1 text-sm hover:bg-primary-500 transition-colors duration-200" // Added hover effect
                    >
                        Add
                    </button>
                </div>
            </div>
            {food.ingredients && food.ingredients.length > 0 && ( // Check if ingredients exist and array is not empty
                <div className="font-light leading-relaxed text-gray-700 mt-2 text-xs"> {/* Adjusted text color/leading */}
                    {food.ingredients.join(', ')}
                </div>
            )}
        </li>
    );
};

export default FoodItem;
