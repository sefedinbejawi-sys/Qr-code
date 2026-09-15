import React, { useState } from 'react';
import { Store, Language } from '../types';
import { initialSeedStores } from '../data/seedStores';
import { translations } from '../utils/translations';
import { QrCodeView } from './QrCodeView';
import {
  Smartphone,
  QrCode,
  Sparkles,
  Phone,
  MessageCircle,
  MapPin,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Tag,
  Clock,
  Eye,
  Scan,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface InteractiveDemoProps {
  lang?: Language;
  onOpenStore: (slug: string, store?: Store) => void;
  onCreateStore: () => void;
}

export const InteractiveDemo: React.FC<InteractiveDemoProps> = ({
  lang = 'ar',
  onOpenStore,
  onCreateStore,
}) => {
  const t = translations[lang];
  const [selectedStoreIndex, setSelectedStoreIndex] = useState<number>(0);
  const [demoTab, setDemoTab] = useState<'qr' | 'mobile'>('mobile');
  const [simulatedAction, setSimulatedAction] = useState<string | null>(null);

  const currentStore: Store = initialSeedStores[selectedStoreIndex] || initialSeedStores[0];

  const handleSimulateClick = (actionName: string) => {
    setSimulatedAction(actionName);
    setTimeout(() => {
      setSimulatedAction(null);
    }, 2500);
  };

  return (
    <section className="relative py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-800 border border-amber-500/20 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>{t.demoTitle}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 tracking-tight">
          من رمز QR بسيط إلى هوية تجارية متكاملة
        </h2>
        <p className="mt-3 text-sm sm:text-base text-stone-600 leading-relaxed">
          {t.demoSubtitle}
        </p>

        {/* Store Selector Tabs for El Oued */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {initialSeedStores.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setSelectedStoreIndex(idx)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                selectedStoreIndex === idx
                  ? 'bg-stone-900 text-white shadow-md shadow-stone-900/20 ring-2 ring-amber-500'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              <span>{s.name}</span>
              <span className="text-[10px] opacity-70 bg-white/20 px-1.5 py-0.5 rounded">
                {s.commune}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Display Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
        {/* Left Side: QR Code + Explanation */}
        <div className="lg:col-span-6 flex flex-col items-center text-center lg:text-right bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-sm relative">
          <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-amber-600" />
              الخطوة 1: الرمز المطبوع في محلك
            </span>
            <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
              جاهز للطباعة والمسح
            </span>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed mb-6">
            اطبع هذا الرمز على ملصق باب المحل، بطاقة العمل، أو الفاتورة. عند مسحه بأي هاتف ذكي، يتحول فورًا إلى الصفحة المجاورة:
          </p>

          <div className="w-full flex justify-center">
            <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-200/50 max-w-xs w-full">
              <QrCodeView store={currentStore} lang={lang} onOpenStore={(slug) => onOpenStore(slug, currentStore)} />
            </div>
          </div>

          <div className="w-full mt-6 pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-stone-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>رابط ديناميكي ثابت لا ينتهي</span>
            </div>
            <button
              onClick={onCreateStore}
              className="font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
            >
              <span>أنشئ كود محلك مجاناً</span>
              <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />
            </button>
          </div>
        </div>

        {/* Right Side: Simulated Smartphone Frame with live store preview */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-2 px-2">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-amber-600" />
              الخطوة 2: تجربة الزبون على الهاتف
            </span>
            <span className="text-xs text-amber-700 font-bold">
              تصفح حي تفاعلي
            </span>
          </div>

          {/* Smartphone Mockup */}
          <div className="relative w-full max-w-[340px] sm:max-w-[370px] bg-stone-950 rounded-[44px] p-3 shadow-2xl border-4 border-stone-800 ring-1 ring-black">
            {/* Dynamic Island / Speaker Notch */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-30 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-stone-900 border border-stone-800 mr-2" />
              <div className="w-2 h-2 rounded-full bg-blue-950/70" />
            </div>

            {/* Screen Content */}
            <div className="relative bg-[#FAF7F2] rounded-[34px] overflow-hidden h-[580px] overflow-y-auto scrollbar-none text-[#1C1917] text-right">
              {/* Cover Banner inside mobile */}
              <div className="relative h-28 w-full bg-stone-900">
                <img
                  src={currentStore.coverImage}
                  alt={currentStore.name}
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#FAF7F2] via-transparent to-black/40" />
              </div>

              {/* Profile Card Header */}
              <div className="px-4 -mt-10 flex flex-col items-center text-center">
                <div className="relative w-16 h-16 rounded-full bg-white p-1 shadow-lg border-2 border-amber-500 overflow-hidden mb-2">
                  <img
                    src={currentStore.logo}
                    alt={currentStore.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-stone-900">
                  <span>{currentStore.name}</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                </div>

                <p className="text-[11px] text-stone-500 mt-0.5">
                  {currentStore.commune} • ولاية الوادي
                </p>

                {/* Simulated action toast */}
                <AnimatePresence>
                  {simulatedAction && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-2 px-3 py-1.5 rounded-full bg-stone-900 text-white text-[11px] font-bold shadow-lg"
                    >
                      ⚡ {simulatedAction}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Quick Action Grid */}
                <div className="grid grid-cols-3 gap-2 w-full mt-3">
                  <button
                    onClick={() => handleSimulateClick(`اتصال مباشر بـ ${currentStore.phone}`)}
                    className="p-2 rounded-xl bg-white border border-stone-200 text-stone-800 text-[10px] font-bold flex flex-col items-center hover:bg-stone-50 transition-colors shadow-2xs"
                  >
                    <Phone className="w-3.5 h-3.5 text-blue-600 mb-1" />
                    <span>اتصال</span>
                  </button>
                  <button
                    onClick={() => handleSimulateClick(`فتح محادثة واتساب مع ${currentStore.name}`)}
                    className="p-2 rounded-xl bg-emerald-600 text-white text-[10px] font-bold flex flex-col items-center hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-current mb-1" />
                    <span>واتساب</span>
                  </button>
                  <button
                    onClick={() => handleSimulateClick(`توجيه GPS لـ ${currentStore.commune}`)}
                    className="p-2 rounded-xl bg-white border border-stone-200 text-stone-800 text-[10px] font-bold flex flex-col items-center hover:bg-stone-50 transition-colors shadow-2xs"
                  >
                    <MapPin className="w-3.5 h-3.5 text-amber-600 mb-1" />
                    <span>الموقع</span>
                  </button>
                </div>

                {/* Offer Card Preview */}
                {currentStore.offers && currentStore.offers[0] && (
                  <div className="w-full mt-3 p-2.5 rounded-xl bg-amber-500 text-white text-right text-xs shadow-xs">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span>🏷️ {currentStore.offers[0].badge}</span>
                      <span>خصم {currentStore.offers[0].discountPercentage}%</span>
                    </div>
                    <p className="font-bold text-[11px] mt-0.5">{currentStore.offers[0].title}</p>
                  </div>
                )}

                {/* Sample Products */}
                <div className="w-full mt-4 text-right">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-stone-800">أبرز المنتجات</span>
                    <span className="text-[10px] text-amber-700">بالدينار الجزائري</span>
                  </div>

                  <div className="space-y-2">
                    {currentStore.products.slice(0, 2).map((prod) => (
                      <div
                        key={prod.id}
                        onClick={() => handleSimulateClick(`طلب: ${prod.name}`)}
                        className="flex items-center justify-between p-2 bg-white rounded-xl border border-stone-200/80 cursor-pointer hover:border-amber-400 transition-all text-xs"
                      >
                        <div className="flex items-center gap-2">
                          {prod.image && (
                            <img
                              src={prod.image}
                              alt={prod.name}
                              className="w-9 h-9 rounded-lg object-cover"
                            />
                          )}
                          <div className="text-right">
                            <p className="font-bold text-[11px] text-stone-900 line-clamp-1">
                              {prod.name}
                            </p>
                            <p className="text-[10px] text-amber-700 font-extrabold">
                              {prod.price.toLocaleString()} د.ج
                            </p>
                          </div>
                        </div>
                        <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                          طلب
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Open Store Full View Button */}
                <button
                  onClick={() => onOpenStore(currentStore.slug, currentStore)}
                  className="w-full mt-4 py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>تصفح الصفحة الكاملة للمحل</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
