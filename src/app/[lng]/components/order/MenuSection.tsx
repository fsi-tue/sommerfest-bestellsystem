import { ItemDocument } from '@/model/item';
import Item from "@/app/[lng]/components/Item";
import { useT } from "@/app/i18n/i18nClient";

interface MenuSectionProps {
    items: { [_id: string]: ItemDocument[] };
}

const MenuSection = ({ items }: MenuSectionProps) => {
    const availableItems = Object.values(items)
        .flatMap(itemList => itemList)
        .filter(item => item.enabled);

    const { t } = useT();

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
