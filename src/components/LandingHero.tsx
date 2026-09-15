import React from 'react';
import { Language } from '../types';
import { translations } from '../utils/translations';
import { DunesSvg, SoufiArch, PalmBranch } from './SaharanDecor';
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  QrCode,
  Smartphone,
  TrendingUp,
  MapPin,
  CheckCircle,
} from 'lucide-react';

interface LandingHeroProps {
  lang?: Language;
  onCreateStore: () => void;
  onExploreDirectory: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  lang = 'ar',
  onCreateStore,
  onExploreDirectory,
}) => {
  const t = translations[lang];

  return (
    <div className="relative overflow-hidden pt-8 sm:pt-14 pb-16 sm:pb-24 sahara-pattern">
      {/* Decorative ambient gradients */}
      <div className="absolute top-0 right-1/4 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-10 w-80 h-80 bg-stone-900/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Wilaya Tag & Tech Badge */}
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-600/30 text-amber-900 text-xs sm:text-sm font-bold shadow-xs mb-6">
            <SoufiArch className="w-4 h-4 text-amber-700" />
            <span>منصة وادي سوف الرقمية • ولاية الوادي (39)</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            <span className="text-amber-700 font-normal">عاصمة الكثبان والنخيل</span>
          </div>

          {/* Strong Hero Headlines from prompt */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight leading-[1.15] max-w-4xl">
            <span className="block text-stone-900 mb-2">«محلك يستحق حضورًا رقميًا.»</span>
            <span className="block bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 bg-clip-text text-transparent">
              «QR واحد... كل معلومات محلك في مكان واحد.»
            </span>
          </h1>

          {/* Refined Saharan Subtitle */}
          <p className="mt-5 text-base sm:text-lg lg:text-xl text-stone-600 max-w-2xl leading-relaxed">
            المنصة الجزائرية المحلية المصممة خصيصاً للمحلات والأنشطة التجارية في ولاية الوادي.
            صفحة رقمية سريعة + رمز QR ديناميكي دائم بهوية صحراوية فاخرة تعكس أصالة وادي سوف.
          </p>

          {/* Primary & Secondary Call to Actions */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onCreateStore}
              className="w-full sm:w-auto py-3.5 sm:py-4 px-8 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-base shadow-lg shadow-amber-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <QrCode className="w-5 h-5" />
              <span>{t.createQrNow}</span>
              <ArrowLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
            </button>

            <button
              onClick={onExploreDirectory}
              className="w-full sm:w-auto py-3.5 sm:py-4 px-7 rounded-2xl bg-white hover:bg-stone-50 text-stone-800 font-bold text-base border border-stone-200 shadow-sm transition-all hover:border-stone-300 flex items-center justify-center gap-2"
            >
              <MapPin className="w-4 h-4 text-amber-600" />
              <span>{t.exploreDirectory}</span>
            </button>
          </div>

          {/* Trust Highlights Row */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl w-full text-center">
            <div className="p-3 bg-white/70 backdrop-blur-xs rounded-2xl border border-stone-200/60 shadow-2xs">
              <div className="font-extrabold text-lg text-stone-900">QR دائم</div>
              <div className="text-xs text-stone-500 mt-0.5">ثابت عند تعديل البيانات</div>
            </div>
            <div className="p-3 bg-white/70 backdrop-blur-xs rounded-2xl border border-stone-200/60 shadow-2xs">
              <div className="font-extrabold text-lg text-emerald-700">واتساب مباشر</div>
              <div className="text-xs text-stone-500 mt-0.5">مع رسالة ترحيبية جاهزة</div>
            </div>
            <div className="p-3 bg-white/70 backdrop-blur-xs rounded-2xl border border-stone-200/60 shadow-2xs">
              <div className="font-extrabold text-lg text-amber-700">GPS دقيق</div>
              <div className="text-xs text-stone-500 mt-0.5">اتجاهات خرائط Google</div>
            </div>
            <div className="p-3 bg-white/70 backdrop-blur-xs rounded-2xl border border-stone-200/60 shadow-2xs">
              <div className="font-extrabold text-lg text-stone-900">إحصائيات حقيقية</div>
              <div className="text-xs text-stone-500 mt-0.5">تتبع المسح والزيارات</div>
            </div>
          </div>
        </div>
      </div>

      {/* Dunes SVG bottom divider */}
      <div className="w-full mt-10">
        <DunesSvg className="w-full" fill="#D97706" opacity={0.08} />
      </div>
    </div>
  );
};
