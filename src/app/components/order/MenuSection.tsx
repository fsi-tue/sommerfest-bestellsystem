import { ItemDocument } from '@/model/item';
import Item from "@/app/components/Item";
import { useTranslation } from 'react-i18next';

interface MenuSectionProps {
    items: { [_id: string]: ItemDocument[] };
}

const MenuSection = ({ items }: MenuSectionProps) => {
    const availableItems = Object.values(items)
        .flatMap(itemList => itemList)
        .filter(item => item.enabled);

    const [t, i18n] = useTranslation();

    return (
        <div className="w-full">
            <ul className="space-y-3"> {/* Adjusted spacing */}
                {availableItems.length > 0 ? (
                    availableItems.map((item) => (
                        <Item
                            key={item._id?.toString() || item.name}
                            item={item}
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
