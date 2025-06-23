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
    const [localItem, setLocalItem] = useState<Item | null>();
    const [isLoading, setIsLoading] = useState(false);
    const t = useTranslations();

    useEffect(() => {
        if (item) {
            setLocalItem(item)
        } else {
            setLocalItem({
                name: 'New Pizza',
                type: 'pizza',
                price: 0,
                size: 1,
                enabled: true,
            })
        }
    }, [item, isNew]);

    const updateItem = (parts: Partial<ItemDocument>) => {
        setLocalItem({
            ...localItem,
            ...parts
        } as ItemDocument)
    }

    const saveItem = async (parts: Partial<ItemDocument>) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/pizza`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...localItem, ...parts })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data?.message ?? response.statusText);
            }
            setLocalItem(data);
        } catch (error: any) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    }

    const createItem = async (item: Item) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/pizza`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item)
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data?.message ?? response.statusText);
            }
            setLocalItem(data);
        } catch (error: any) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    }

    if (!localItem) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (error) {
        return <ErrorMessage error={error} />;
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-primary-50 to-primary-100 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">{localItem.name}</h2>
                            <div className="flex items-center gap-3 mt-2">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                    localItem.enabled
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {localItem.enabled ? '✓ Enabled' : '✕ Disabled'}
                                </span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                                    €{localItem.price.toFixed(2)}
                                </span>
                                {localItem.type && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                                        {localItem.type}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Content */}
                <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Basic Information */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {t('admin.manage.pizza.edit_item.name')}
                                        </label>
                                        <input
                                            type="text"
                                            value={localItem.name}
                                            onChange={(e) => updateItem({ name: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                                            placeholder="Enter item name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {t('admin.manage.pizza.edit_item.type')}
                                        </label>
                                        <input
                                            type="text"
                                            value={localItem.type || ''}
                                            onChange={(e) => updateItem({ type: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                                            placeholder="e.g., Pizza, Pasta, Salad"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {t('admin.manage.pizza.edit_item.dietary')}
                                        </label>
                                        <input
                                            type="text"
                                            value={localItem.dietary || ''}
                                            onChange={(e) => updateItem({ dietary: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                                            placeholder="e.g., Vegan, Vegetarian, Gluten Free"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pricing & Settings */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing & Settings</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {t('admin.manage.pizza.edit_item.price')}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={localItem.price}
                                                onChange={(e) => updateItem({ price: Number.parseFloat(e.target.value) || 0 })}
                                                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                                                step="0.10"
                                                min="0"
                                                placeholder="0.00"
                                            />
                                            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">€</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Size
                                        </label>
                                        <input
                                            type="number"
                                            value={localItem.size}
                                            onChange={(e) => updateItem({ size: Number.parseFloat(e.target.value) || 0 })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                                            step="0.5"
                                            min="0"
                                            placeholder="Size"
                                        />
                                    </div>

                                    {/* Status Toggle */}
                                    <div className="pt-2">
                                        <label className="flex items-center space-x-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={localItem.enabled}
                                                onChange={(e) => updateItem({ enabled: e.target.checked })}
                                                className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                            />
                                            <span className="text-sm font-medium text-gray-700">
                                                Item is available for ordering
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            {isNew ? 'Ready to add this item?' : 'Save your changes'}
                        </div>
                        <div className="flex items-center space-x-3">
                            {!isNew && (
                                <Button
                                    onClick={() => saveItem({ enabled: !localItem.enabled })}
                                    disabled={isLoading}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors disabled:opacity-50"
                                >
                                    {localItem.enabled ? 'Disable' : 'Enable'}
                                </Button>
                            )}
                            <Button
                                onClick={() => isNew ? createItem(localItem) : saveItem(localItem)}
                                disabled={isLoading}
                                className="px-6 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>{isNew ? 'Creating...' : 'Saving...'}</span>
                                    </div>
                                ) : (
                                    isNew ? t('admin.manage.pizza.edit_item.create') : t('admin.manage.pizza.edit_item.update')
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EditItem;
