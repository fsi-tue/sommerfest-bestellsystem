import { Clock, Euro, Search } from "lucide-react";
import { useTranslations } from 'next-intl';

const IntroductionSection = () => {
    const t = useTranslations();
    return (
        <div className="bg-white text-gray-700 rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="font-light leading-relaxed space-y-6">
                <ol className="list-none space-y-6">
                    <li className="flex flex-col md:flex-row md:items-baseline gap-2">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary-50 rounded-full flex items-center justify-center">
                                <Search className="w-4 h-4 text-primary-500"/>
                            </div>
                            <p className="text-lg font-bold text-gray-900">{t('order.introduction.choose_your_item')}</p>
                        </div>
                    </li>
                    <li className="flex flex-col md:flex-row md:items-baseline gap-2">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary-50 rounded-full flex items-center justify-center">
                                <Clock className="w-4 h-4 text-primary-500"/>
                            </div>
                            <p className="text-lg font-bold text-gray-900">{t('order.introduction.pick_up_time')}</p>
                        </div>
                    </li>
                    <li className="flex flex-col md:flex-row md:items-baseline gap-2">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary-50 rounded-full flex items-center justify-center">
                                <Euro className="w-4 h-4 text-primary-500"/>
                            </div>
                            <p className="text-lg font-bold text-gray-900">{t('order.introduction.pay_in_cash')}</p>
                        </div>
                    </li>
                </ol>
                <p className="mt-8 text-center text-xl font-medium text-gray-800 pt-4 border-t border-gray-100">
                    {t('order.introduction.closer')}
                </p>
            </div>
        </div>
    );
};

export default IntroductionSection;
