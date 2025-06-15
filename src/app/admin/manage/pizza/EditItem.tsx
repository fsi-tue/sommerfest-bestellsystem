'use client'

import { useEffect, useState } from "react";
import { Item, ItemDocument } from "@/model/item";
import ErrorMessage from "@/app/components/ErrorMessage";
import Button from "@/app/components/Button";
import { useTranslations } from "next-intl";


interface EditItemProps {
    item?: Item;
    isNew?: boolean
}

const EditItem = ({ item, isNew }: EditItemProps) => {
    const [error, setError] = useState<string>('');
    const [localItem, setLocalItem] = useState<Item>(item ??
        {
            name: 'New Pizza',
            type: 'pizza',
            price: 0,
            size: 1,
            enabled: true,
        }
    );
    const t = useTranslations();

    useEffect(() => {
        if (item) {
            setLocalItem(item);
        }
    }, [item]);

    const updateItem = (parts: Partial<ItemDocument>) => {
        setLocalItem({
            ...item,
            ...parts
        } as ItemDocument)
    }
    const saveItem = (parts: Partial<ItemDocument>) => {
        fetch(`/api/pizza`, {
            method: 'PUT',
            credentials: 'include',
            body: JSON.stringify({ ...item, ...parts })
        })
            .then(async response => {
                const data = await response.json();
                if (!response.ok) {
                    const error = data?.message ?? response.statusText;
                    throw new Error(error);
                }
                return data;
            })
            .then(data => setLocalItem(data))
            .catch(error => setError(error.message));
    }

    const createItem = (item: Item) => {
        fetch(`/api/pizza`, {
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify(item)
        })
            .then(async response => {
                const data = await response.json();
                if (!response.ok) {
                    const error = data?.message ?? response.statusText;
                    throw new Error(error);
                }
                return data;
            })
            .then(data => setLocalItem(data))
            .catch(error => setError(error.message));

    }

    if (error) {
        return (<ErrorMessage error={error}/>);
    }

    return (
        <div className="w-full px-4 py-6">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-md p-6">
                <div className="text-2xl font-bold mb-4">{localItem.name}</div>
                <div className="flex flex-wrap gap-2 mb-4">
      <span
          className={`text-sm font-medium text-white py-1 px-3 rounded-full ${localItem.enabled ? 'bg-green-500' : 'bg-gray-500'}`}>
                            {localItem.enabled ? t('admin.manage.pizza.edit_item.disabled') : t('admin.manage.pizza.edit_item.enabled')}
      </span>
                    <span
                        className="text-sm font-medium text-gray-700 py-1 px-3 rounded-full bg-gray-200">{localItem.price} €</span>
                    {localItem.type && <span
											className="text-sm font-medium text-gray-700 py-1 px-3 rounded-full bg-gray-200">{localItem.type}</span>}
                    {localItem.dietary && <span
											className="text-sm font-medium text-gray-700 py-1 px-3 rounded-full bg-gray-200">{localItem.dietary}</span>}
                </div>
                <div className="flex gap-2 mb-4">
                    {!isNew ? (
                        <Button
                            onClick={() => saveItem(localItem)}
                            className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-full transition duration-200"
                        >
                            {t('admin.manage.pizza.edit_item.update')}
                        </Button>
                    ) : (
                        <Button
                            onClick={() => createItem(localItem)}
                            className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-full transition duration-200"
                        >
                            {t('admin.manage.pizza.edit_item.create')}
                        </Button>
                    )}
                    {!isNew && (
                        <Button
                            onClick={() => localItem.enabled ? saveItem({
                                ...localItem,
                                enabled: false
                            }) : saveItem({
                                ...localItem,
                                enabled: true
                            })}
                            className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-full transition duration-200"
                        >
                            {localItem.enabled ? t('admin.manage.pizza.edit_item.disable') : t('admin.manage.pizza.edit_item.enable')}
                        </Button>
                    )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold mb-1">{t('admin.manage.pizza.edit_item.name')}</label>
                        <input
                            type="text"
                            value={localItem.name}
                            onChange={(event) => updateItem({ name: event.target.value })}
                            className="border border-gray-100 px-3 py-2 rounded-md w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Item Name"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold mb-1">{t('admin.manage.pizza.edit_item.type')}</label>
                        <input
                            type="text"
                            value={localItem.type}
                            onChange={(event) => updateItem({ type: event.target.value })}
                            className="border border-gray-100 px-3 py-2 rounded-md w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Item Type, e.g. Pizza, Pasta, Salad"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label
                            className="text-sm font-semibold mb-1">{t('admin.manage.pizza.edit_item.dietary')}</label>
                        <input
                            type="text"
                            value={localItem.dietary}
                            onChange={(event) => updateItem({ dietary: event.target.value })}
                            className="border border-gray-100 px-3 py-2 rounded-md w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Dietary, e.g. Vegan, Vegetarian, Gluten Free"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold mb-1">{t('admin.manage.pizza.edit_item.price')}</label>
                        <div className="flex items-center">
                            <input
                                type="number"
                                value={localItem.price}
                                onChange={(event) => updateItem({
                                    price: Number.parseInt(event.target.value)
                                })}
                                className="border border-gray-100 px-3 py-2 rounded-md w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                step="0.10"
                                placeholder="Price (€)"
                            />
                            <span className="ml-2">€</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EditItem;
