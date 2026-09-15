import React, { useState, useEffect } from 'react';
import { Language, PlatformStats } from '../types';
import { translations } from '../utils/translations';
import { DunesSvg, SoufiArch, PalmBranch } from './SaharanDecor';
import { api } from '../services/api';
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
  PhoneCall,
  MessageCircle,
  Store as StoreIcon,
  Users,
  Navigation,
  CheckCircle2,
  ChevronRight,
  Flame,
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
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);

  useEffect(() => {
    let isMounted = true;
    api.getPlatformStats().then((data) => {
      if (isMounted) setPlatformStats(data);
    }).catch((err) => {
      console.warn('Could not load platform stats', err);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const journeySteps = [
    {
      step: '01',
      title: 'تاجر يسجل',
      desc: 'في أقل من دقيقة',
      icon: StoreIcon,
      color: 'bg-amber-100 text-amber-800 border-amber-300',
    },
    {
      step: '02',
      title: 'صفحة رقمية',
      desc: 'معروضات وهوية كاملة',
      icon: Smartphone,
      color: 'bg-stone-100 text-stone-800 border-stone-300',
    },
    {
      step: '03',
      title: 'QR ذكي دائم',
      desc: 'للطاولة، المحل، والملصقات',
      icon: QrCode,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      step: '04',
      title: 'زبون سوفي يمسح',
      desc: 'دون تحميل أي تطبيق',
      icon: Users,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      step: '05',
      title: 'تواصل فوري',
      desc: 'اتصال، واتساب، GPS',
      icon: MessageCircle,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      step: '06',
      title: 'زيارة ومبيعات',
      desc: 'زبائن جدد لمحلك',
      icon: TrendingUp,
      color: 'bg-amber-600 text-white border-amber-600 shadow-sm',
    },
  ];

  return (
    <div className="relative overflow-hidden pt-8 sm:pt-14 pb-14 sm:pb-20 sahara-pattern">
      {/* Decorative ambient gradients */}
      <div className="absolute top-0 right-1/4 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-10 w-80 h-80 bg-stone-900/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Wilaya Tag & Platform Badge */}
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-600/30 text-amber-900 text-xs sm:text-sm font-bold shadow-xs mb-6">
            <SoufiArch className="w-4 h-4 text-amber-700" />
            <span>المنصة الأولى لظهور محلات وادي سوف • ولاية الوادي (39)</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            <span className="text-amber-800 font-medium">Digital Business + Local Discovery</span>
          </div>

          {/* Primary Powerful Headline as explicitly requested */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight leading-[1.18] max-w-4xl">
            <span className="block text-stone-950 mb-3">«خلّي زبائن الوادي يلقاو محلك.»</span>
            <span className="block text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 bg-clip-text text-transparent">
              صفحة رقمية احترافية + QR ذكي + ظهور محلي يساعدك على الوصول إلى زبائن جدد.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-base sm:text-lg text-stone-700 max-w-2xl leading-relaxed">
            لا تكتفِ بـ QR تقليدي. امنح نشاطك التجاري في ولاية الوادي حضوراً رقمياً حقيقياً يحول الزيارات إلى اتصالات هاتفية، رسائل واتساب، اتجاهات GPS، وزيارات حقيقية لمحلك.
          </p>

          {/* Primary & Secondary Call to Actions */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
            <button
              id="cta-create-store-hero"
              onClick={onCreateStore}
              className="w-full sm:w-auto py-4 px-8 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-base shadow-xl shadow-amber-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <StoreIcon className="w-5 h-5" />
              <span>أنشئ صفحة محلك مجانًا</span>
              <ArrowLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
            </button>

            <button
              id="cta-explore-directory-hero"
              onClick={onExploreDirectory}
              className="w-full sm:w-auto py-4 px-7 rounded-2xl bg-white hover:bg-stone-50 text-stone-800 font-bold text-base border border-stone-300 shadow-xs transition-all hover:border-amber-400 flex items-center justify-center gap-2 cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-amber-600" />
              <span>اكتشف محلات الوادي وعروض اليوم</span>
            </button>
          </div>

          {/* Real Platform Statistics (No fake numbers!) */}
          <div className="mt-10 max-w-4xl w-full bg-white/90 backdrop-blur-xs rounded-3xl border border-stone-200/80 p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
              <div className="flex items-center gap-2 text-xs font-extrabold text-stone-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>إحصائيات منصة MY El Oued الحقيقية بولاية الوادي:</span>
              </div>
              <span className="text-[11px] text-stone-500 font-medium">محدثة لحظياً من قاعدة البيانات</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
              <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-stone-200/60">
                <div className="text-2xl sm:text-3xl font-black text-stone-900">
                  {platformStats ? platformStats.totalStores : '...'}
                </div>
                <div className="text-xs font-bold text-stone-600 mt-1">محلات ونشاطات مسجلة</div>
              </div>

              <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-stone-200/60">
                <div className="text-2xl sm:text-3xl font-black text-amber-700">
                  {platformStats ? platformStats.totalScans.toLocaleString() : '...'}
                </div>
                <div className="text-xs font-bold text-stone-600 mt-1">مسحة QR حقيقية</div>
              </div>

              <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-stone-200/60">
                <div className="text-2xl sm:text-3xl font-black text-emerald-700">
                  {platformStats ? (platformStats.totalCalls + platformStats.totalWhatsapp).toLocaleString() : '...'}
                </div>
                <div className="text-xs font-bold text-stone-600 mt-1">اتصال وواتساب مباشر</div>
              </div>

              <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-stone-200/60">
                <div className="text-2xl sm:text-3xl font-black text-blue-800">
                  {platformStats ? platformStats.communesCount : '...'}
                </div>
                <div className="text-xs font-bold text-stone-600 mt-1">بلديات نشطة في وادي سوف</div>
              </div>
            </div>
          </div>

          {/* Interactive Visual Customer Journey Stepper */}
          <div className="mt-12 max-w-5xl w-full">
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-900 border border-amber-500/20 mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>دورة تحويل الزوار إلى زبائن حقيقيين</span>
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900">
                كيف يساعدك MY El Oued على مضاعفة زبائنك؟
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {journeySteps.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl p-3.5 border border-stone-200/80 shadow-2xs flex flex-col items-center text-center relative group hover:border-amber-500/50 hover:shadow-xs transition-all"
                  >
                    <span className="text-[10px] font-black text-stone-400 mb-2">{item.step}</span>
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center border mb-2.5 ${item.color}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="font-extrabold text-xs sm:text-sm text-stone-900 mb-0.5">{item.title}</div>
                    <div className="text-[11px] text-stone-500 leading-tight">{item.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Dunes SVG bottom divider */}
      <div className="w-full mt-12">
        <DunesSvg className="w-full" fill="#D97706" opacity={0.08} />
      </div>
    </div>
  );
};

