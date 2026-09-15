import React from 'react';
import { Language } from '../types';
import { translations } from '../utils/translations';
import { SoufiArch, DunesSvg, PalmBranch } from './SaharanDecor';
import { MapPin, Phone, Mail, Heart, QrCode, ShieldCheck } from 'lucide-react';

interface FooterProps {
  lang?: Language;
  onExploreDirectory: () => void;
  onCreateStore: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  lang = 'ar',
  onExploreDirectory,
  onCreateStore,
}) => {
  const t = translations[lang];

  return (
    <footer className="bg-[#1C1917] text-[#FAF7F2] relative overflow-hidden border-t-4 border-amber-600">
      {/* Subtle dunes backdrop */}
      <DunesSvg className="absolute top-0 right-0 w-full opacity-10 pointer-events-none" fill="#D97706" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: Brand & Identity */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-md">
                <SoufiArch className="w-6 h-6" />
              </div>
              <span className="text-xl font-black text-white">MY El Oued QR</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed mb-4">
              المنصة التكنولوجية الرائدة في ولاية الوادي لمنح المحلات والأنشطة التجارية في وادي سوف هوية رقمية ورمز QR دائم يواكب التطور التجاري الجزائري.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-800 text-[11px] text-amber-400 border border-stone-700">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>فخر الصناعة البرمجية المحلية في وادي سوف</span>
            </div>
          </div>

          {/* Col 2: Communes of El Oued */}
          <div>
            <h4 className="text-sm font-extrabold text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-500" />
              <span>بلديات ولاية الوادي (39)</span>
            </h4>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs text-stone-300">
              <span>• الوادي المركز</span>
              <span>• قمار</span>
              <span>• كوينين</span>
              <span>• الرقيبة</span>
              <span>• الدبيلة</span>
              <span>• الرباح</span>
              <span>• البياضة</span>
              <span>• حاسي خليفة</span>
              <span>• المقرن</span>
              <span>• سيدي عون</span>
            </div>
          </div>

          {/* Col 3: Quick Links */}
          <div>
            <h4 className="text-sm font-extrabold text-amber-400 uppercase tracking-wider mb-4">
              روابط المنصة
            </h4>
            <ul className="space-y-2 text-xs text-stone-300">
              <li>
                <button onClick={onCreateStore} className="hover:text-amber-400 transition-colors">
                  ← إنشاء QR محلك مجاناً
                </button>
              </li>
              <li>
                <button onClick={onExploreDirectory} className="hover:text-amber-400 transition-colors">
                  ← دليل محلات ولاية الوادي
                </button>
              </li>
              <li>
                <span className="text-stone-400">← تصاميم استاند الطاولات والملصقات</span>
              </li>
              <li>
                <span className="text-stone-400">← سياسة الخصوصية وحماية بيانات التجار</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact and Support */}
          <div>
            <h4 className="text-sm font-extrabold text-amber-400 uppercase tracking-wider mb-4">
              فريق الدعم في وادي سوف
            </h4>
            <div className="space-y-2.5 text-xs text-stone-300">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                <span>وسط مدينة الوادي، ولاية الوادي 39000</span>
              </p>
              <p className="flex items-center gap-2 dir-ltr text-right">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <span>+213 (0) 32 14 00 39</span>
              </p>
              <p className="flex items-center gap-2 dir-ltr text-right">
                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                <span>contact@myeloued.dz</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <p>© {new Date().getFullYear()} MY El Oued QR. جميع الحقوق محفوظة لولاية الوادي - الجزائر.</p>
          <div className="flex items-center gap-1.5 text-stone-400">
            <span>صُنع بعناية واعتزاز بتراث وادي سوف</span>
            <PalmBranch className="w-4 h-4 text-amber-500" />
          </div>
        </div>
      </div>
    </footer>
  );
};
