import React, { useState } from 'react';
import { Language, PlanTier } from '../types';
import { api } from '../services/api';
import {
  Check,
  Sparkles,
  Zap,
  Crown,
  ShieldCheck,
  QrCode,
  Store,
  PhoneCall,
  Printer,
  TrendingUp,
  X,
  MessageCircle,
} from 'lucide-react';

interface PricingSectionProps {
  lang?: Language;
  onCreateFreeStore: () => void;
  activeStoreSlug?: string;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  lang = 'ar',
  onCreateFreeStore,
  activeStoreSlug,
}) => {
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<PlanTier | null>(null);
  const [storeName, setStoreName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleOpenUpgrade = (plan: PlanTier) => {
    setSelectedPlanForUpgrade(plan);
    setSubmitSuccess(false);
  };

  const handleSubmitUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setIsSubmitting(true);
    try {
      await api.requestUpgrade(activeStoreSlug || 'new-merchant', {
        plan: (selectedPlanForUpgrade as any) || 'pro',
        contact: `${storeName ? storeName + ' - ' : ''}${phone}`,
        notes: notes,
      });
      setSubmitSuccess(true);
    } catch (err) {
      console.error('Failed to submit upgrade:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="pricing" className="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
      {/* Section Heading */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-900 border border-amber-500/20 mb-3">
          <Crown className="w-3.5 h-3.5 text-amber-600" />
          <span>خطط تناسب جميع الأنشطة التجارية بولاية الوادي</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
          باقات مصممة لمضاعفة زبائنك ومبيعاتك
        </h2>
        <p className="mt-3 text-sm sm:text-base text-stone-600 leading-relaxed">
          اختر الباقة المناسبة لحجم نشاطك. ابدأ مجاناً اليوم، ورقّ حسابك عندما ترغب في تصدر نتائج البحث وظهور محلك في صدارة ولاية الوادي.
        </p>
      </div>

      {/* 3 Tier Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch max-w-6xl mx-auto">
        {/* Free Plan */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:border-stone-300 transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black uppercase tracking-wider text-stone-500 bg-stone-100 px-3 py-1 rounded-full">
                الباقة المجانية
              </span>
              <Store className="w-5 h-5 text-stone-400" />
            </div>

            <h3 className="text-xl font-black text-stone-900 mb-1">Free الأساسية</h3>
            <p className="text-xs text-stone-500 mb-6">لكل محل يبدأ أولى خطواته الرقمية في الوادي</p>

            <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-stone-100">
              <span className="text-4xl font-black text-stone-900">0</span>
              <span className="text-xs font-extrabold text-stone-500">د.ج / مجاناً دائماً</span>
            </div>

            <ul className="space-y-3.5 text-xs text-stone-700">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>صفحة رقمية أساسية للمحل</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>رمز QR Code أساسي وديناميكي</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>معلومات الاتصال وساعات العمل والـ GPS</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>عرض في دليل محلات الوادي</span>
              </li>
            </ul>
          </div>

          <div className="pt-8">
            <button
              onClick={onCreateFreeStore}
              className="w-full py-3.5 px-4 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-extrabold text-xs transition-all text-center cursor-pointer"
            >
              ابدأ مجاناً الآن
            </button>
          </div>
        </div>

        {/* Pro Plan (Most Popular) */}
        <div className="bg-gradient-to-b from-amber-500/5 via-white to-amber-500/10 rounded-3xl border-2 border-amber-500 p-6 sm:p-8 flex flex-col justify-between shadow-lg shadow-amber-500/10 relative">
          {/* Most popular badge */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-600 text-white text-[11px] font-black px-4 py-1 rounded-full shadow-md flex items-center gap-1.5 whitespace-nowrap">
            <Sparkles className="w-3.5 h-3.5" />
            <span>الأكثر طلباً بين تجار الوادي</span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4 mt-1">
              <span className="text-xs font-black uppercase tracking-wider text-amber-900 bg-amber-100 px-3 py-1 rounded-full">
                باقة المحترفين
              </span>
              <Zap className="w-5 h-5 text-amber-600" />
            </div>

            <h3 className="text-xl font-black text-stone-900 mb-1">Pro المتقدمة</h3>
            <p className="text-xs text-stone-600 mb-6">للمحلات التي تريد عرض منتجاتها وزيادة المبيعات</p>

            <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-amber-200/60">
              <span className="text-4xl font-black text-amber-800">1,500</span>
              <span className="text-xs font-extrabold text-stone-600">د.ج / شهرياً</span>
            </div>

            <ul className="space-y-3.5 text-xs text-stone-800">
              <li className="flex items-center gap-2.5 font-semibold">
                <Check className="w-4 h-4 text-amber-600 shrink-0" />
                <span>تخصيص كامل لرمز الـ QR (شعار المحل + هوية صحراوية)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-amber-600 shrink-0" />
                <span>إضافة المنتجات والخدمات وقائمة الأسعار والصور</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-amber-600 shrink-0" />
                <span>زر واتساب تفاعلي مع رسالة ترحيبية مخصصة</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-amber-600 shrink-0" />
                <span>إحصائيات متقدمة لعدد المسحات والزيارات والاتصالات</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-amber-600 shrink-0" />
                <span>دعم فني محلي مباشر داخل ولاية الوادي</span>
              </li>
            </ul>
          </div>

          <div className="pt-8">
            <button
              onClick={() => handleOpenUpgrade('pro')}
              className="w-full py-3.5 px-4 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md shadow-amber-600/25 transition-all cursor-pointer"
            >
              طلب ترقية باقة المحترفين Pro
            </button>
          </div>
        </div>

        {/* Business & Discovery Plan */}
        <div className="bg-stone-900 text-white rounded-3xl border border-stone-800 p-6 sm:p-8 flex flex-col justify-between shadow-xl relative">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 bg-stone-800 px-3 py-1 rounded-full border border-stone-700">
                باقة الأعمال والظهور
              </span>
              <Crown className="w-5 h-5 text-amber-400" />
            </div>

            <h3 className="text-xl font-black text-white mb-1">Business & Discovery</h3>
            <p className="text-xs text-stone-400 mb-6">الظهور في صدارة وادي سوف + طباعة الستاندات والملصقات</p>

            <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-stone-800">
              <span className="text-4xl font-black text-amber-400">3,500</span>
              <span className="text-xs font-extrabold text-stone-400">د.ج / شهرياً</span>
            </div>

            <ul className="space-y-3.5 text-xs text-stone-300">
              <li className="flex items-center gap-2.5 font-bold text-amber-400">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>كل ميزات باقة المحترفين Pro</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>ظهور دائم في صدارة دليل محلات الوادي (Featured)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>ترويج العروض والتخفيضات في واجهة «عروض اليوم»</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Printer className="w-4 h-4 text-amber-400 shrink-0" />
                <span>تصميم وطباعة ستاند طاولة أكريليك فاخر + ملصقات QR</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>دعم مباشر وزيارات ميدانية لمحلك داخل ولاية الوادي</span>
              </li>
            </ul>
          </div>

          <div className="pt-8">
            <button
              onClick={() => handleOpenUpgrade('business')}
              className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs shadow-md transition-all cursor-pointer"
            >
              طلب باقة Business والظهور الأقصى
            </button>
          </div>
        </div>
      </div>

      {/* Direct Upgrade Request Modal */}
      {selectedPlanForUpgrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 relative shadow-2xl border border-stone-200">
            <button
              onClick={() => setSelectedPlanForUpgrade(null)}
              className="absolute top-4 left-4 p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {submitSuccess ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-stone-900 mb-2">
                  تم استلام طلب الترقية بنجاح!
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed mb-6">
                  سيتواصل معك فريق منصة MY El Oued في ولاية الوادي في أقرب وقت لتفعيل الباقة وتجهيز تصاميمك.
                </p>
                <div className="flex flex-col gap-2">
                  <a
                    href="https://wa.me/213661003939?text=السلام%20عليكم،%20أرسلت%20طلب%20ترقية%20لباقة%20MY%20El%20Oued"
                    target="_blank"
                    rel="noreferrer"
                    className="py-3 px-4 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>تأكيد الطلب مباشرة عبر واتساب</span>
                  </a>
                  <button
                    onClick={() => setSelectedPlanForUpgrade(null)}
                    className="py-2.5 px-4 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 transition-colors"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 mb-3">
                  <Crown className="w-3.5 h-3.5 text-amber-700" />
                  <span>
                    ترقية إلى باقة{' '}
                    {selectedPlanForUpgrade === 'business' ? 'Business & Discovery' : 'Pro المحترفين'}
                  </span>
                </div>

                <h3 className="text-xl font-black text-stone-900 mb-1">
                  تأكيد طلب الترقية
                </h3>
                <p className="text-xs text-stone-600 mb-5 leading-relaxed">
                  اترك معلومات محلك وسيتواصل معك مستشار المنصة بولاية الوادي لتفعيل الميزات وتجهيز الـ QR والمطبوعات.
                </p>

                <form onSubmit={handleSubmitUpgrade} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      اسم المحل أو النشاط
                    </label>
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="مثال: تمور الألف قبة، صيدلية النخيل..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      رقم الهاتف أو الواتساب (إلزامي) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0661 00 00 00"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      ملاحظات أو استفسارات إضافية
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="أي متطلبات خاصة بالطباعة أو المنتجات..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <span>جاري الإرسال...</span>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>إرسال طلب الترقية بنقرة واحدة</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                  <span>أو تواصل فورياً:</span>
                  <a
                    href="https://wa.me/213661003939"
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>واتساب الإدارة: 0661003939</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
