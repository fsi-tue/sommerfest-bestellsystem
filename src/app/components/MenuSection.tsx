import { FoodDocument } from '@/model/food';
import FoodItem from "@/app/components/FoodItem";

interface MenuSectionProps {
    foods: { [_id: string]: FoodDocument[] };
    onAddToOrder: (food: FoodDocument) => void;
}

const MenuSection = ({ foods, onAddToOrder }: MenuSectionProps) => {
    // Flatten and filter enabled foods once
    const availableFoods = Object.values(foods)
        .flatMap(foodList => foodList)
        .filter(food => food.enabled);

    return (
        <div className="md:w-1/2 w-full">
            <h3 className="text-2xl font-semibold mb-4 text-gray-900">Menu</h3>
            <p className="mb-6 text-base font-light leading-relaxed text-gray-700">
                Select your pizza from the list below. Ingredients are listed with each pizza.
            </p>
            <a id="selectorder" className="block -mt-20 pt-20"></a>
            <ul className="space-y-3"> {/* Adjusted spacing */}
                {availableFoods.length > 0 ? (
                    availableFoods.map((food) => (
                        <FoodItem
                            // Use a more stable key if possible, e.g., food._id if unique and stable
                            key={food._id?.toString() || food.name}
                            food={food}
                            onAddClick={() => onAddToOrder(food)}
                        />
                    ))
                ) : (
                    <p className="text-gray-500">Loading menu...</p>
                )}
            </ul>
        </div>
    );
};

export default MenuSection;
