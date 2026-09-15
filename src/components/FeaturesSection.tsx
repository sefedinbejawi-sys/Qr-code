import React from 'react';
import { Language } from '../types';
import { translations } from '../utils/translations';
import {
  QrCode,
  Smartphone,
  PhoneCall,
  BarChart3,
  Palette,
  ShoppingBag,
  Sparkles,
  Printer,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { SoufiArch, DunesSvg } from './SaharanDecor';

interface FeaturesSectionProps {
  lang?: Language;
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ lang = 'ar' }) => {
  const t = translations[lang];

  const features = [
    {
      icon: QrCode,
      title: t.feature1Title,
      desc: t.feature1Desc,
      tag: 'ثابت ودائم',
      color: 'text-amber-600 bg-amber-50 border-amber-200/80',
    },
    {
      icon: Smartphone,
      title: t.feature2Title,
      desc: t.feature2Desc,
      tag: 'خفيفة وسريعة',
      color: 'text-stone-800 bg-stone-100 border-stone-200',
    },
    {
      icon: PhoneCall,
      title: t.feature3Title,
      desc: t.feature3Desc,
      tag: 'تواصل فوري',
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200/80',
    },
    {
      icon: ShoppingBag,
      title: t.feature4Title,
      desc: t.feature4Desc,
      tag: 'دينار جزائري د.ج',
      color: 'text-amber-700 bg-amber-50 border-amber-200/80',
    },
    {
      icon: BarChart3,
      title: t.feature5Title,
      desc: t.feature5Desc,
      tag: 'تحليلات دقيقة',
      color: 'text-blue-700 bg-blue-50 border-blue-200/80',
    },
    {
      icon: Palette,
      title: t.feature6Title,
      desc: t.feature6Desc,
      tag: 'هوية وادي سوف',
      color: 'text-amber-800 bg-amber-100/60 border-amber-300/60',
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-white relative overflow-hidden border-t border-b border-stone-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-800 border border-amber-500/20 mb-3">
            <SoufiArch className="w-3.5 h-3.5 text-amber-700" />
            <span>{t.featuresTitle}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            كل ما يحتاجه نشاطك التجاري في وادي سوف للنمو الرقمي
          </h2>
          <p className="mt-3 text-sm sm:text-base text-stone-600 leading-relaxed">
            {t.featuresSubtitle}
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const IconComponent = feat.icon;
            return (
              <div
                key={idx}
                className="bg-[#FAF7F2] rounded-3xl p-6 border border-stone-200/80 hover:border-amber-500/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-xs ${feat.color}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-extrabold text-amber-800 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                      {feat.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-stone-900 mb-2">{feat.title}</h3>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{feat.desc}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-stone-200/60 flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>مضمّن في النسخة V1</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Saharan Identity Statement Banner */}
        <div className="mt-14 rounded-3xl p-6 sm:p-8 bg-[#1C1917] text-[#FAF7F2] relative overflow-hidden border-2 border-amber-600/30">
          <div className="relative z-10 max-w-2xl">
            <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider mb-2 block">
              هوية صحراوية عصرية • أصالة وادي سوف
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white mb-2">
              لسنا مجرد أداة توليد QR؛ نحن منصة هوية رقمية متكاملة لمدينتنا
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              استلهمنا الخطوط، الألوان، والمشاعر من تموجات رمال وادي سوف، دفء شمس الصحراء، وبساتين النخيل، وقدمناها في قالب تكنولوجي فاخر يليق بتجار ومبدعي ولاية الوادي.
            </p>
          </div>
          <DunesSvg className="absolute -bottom-10 right-0 w-full opacity-20" fill="#D97706" />
        </div>
      </div>
    </section>
  );
};
