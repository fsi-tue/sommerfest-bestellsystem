import { ItemDocument } from '@/model/item';
import Item from "@/app/components/order/Item";
import { useTranslations } from 'next-intl';

interface MenuSectionProps {
    items: ItemDocument[]
}

const MenuSection = ({ items }: MenuSectionProps) => {
    const availableItems = items
        .filter(item => item.enabled);

    const t = useTranslations();

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
