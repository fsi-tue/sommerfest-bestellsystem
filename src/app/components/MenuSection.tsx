import { ItemDocument } from '@/model/item';
import Item from "@/app/components/Item";
import { useTranslation } from 'react-i18next';

interface MenuSectionProps {
    items: { [_id: string]: ItemDocument[] };
    onAddToOrder: (item: ItemDocument) => void;
}

const MenuSection = ({ items, onAddToOrder }: MenuSectionProps) => {
    // Flatten and filter enabled items once
    const availableItems = Object.values(items)
        .flatMap(itemList => itemList)
        .filter(item => item.enabled);

    const [t, i18n] = useTranslation();

    return (
        <div className="md:w-1/2 w-full">
            <a id="selectorder" className="block -mt-20 pt-20"></a>
            <ul className="space-y-3"> {/* Adjusted spacing */}
                {availableItems.length > 0 ? (
                    availableItems.map((item) => (
                        <Item
                            // Use a more stable key if possible, e.g., item._id if unique and stable
                            key={item._id?.toString() || item.name}
                            item={item}
                            onAddClick={() => onAddToOrder(item)}
                        />
                    ))
                ) : (
                    <p className="text-gray-500">{t('components.menusection.loading')}</p>
                )}
            </ul>
        </div>
    );
};

export default MenuSection;
