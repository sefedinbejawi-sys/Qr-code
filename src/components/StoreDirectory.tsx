import React, { useState, useEffect } from 'react';
import { Store, CommuneElOued, StoreCategory, Language } from '../types';
import { api } from '../services/api';
import { translations } from '../utils/translations';
import {
  Search,
  MapPin,
  Tag,
  Phone,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  QrCode,
  Filter,
  Sparkles,
} from 'lucide-react';

interface StoreDirectoryProps {
  lang?: Language;
  onOpenStore: (slug: string, store?: Store) => void;
  onOpenQrModal: (store: Store) => void;
}

export const StoreDirectory: React.FC<StoreDirectoryProps> = ({
  lang = 'ar',
  onOpenStore,
  onOpenQrModal,
}) => {
  const t = translations[lang];
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCommune, setSelectedCommune] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const communes: { id: string; label: string }[] = [
    { id: 'all', label: t.allCommunes },
    { id: 'الوادي', label: 'الوادي (المركز)' },
    { id: 'قمار', label: 'قمار' },
    { id: 'كوينين', label: 'كوينين' },
    { id: 'الرقيبة', label: 'الرقيبة' },
    { id: 'الدبيلة', label: 'الدبيلة' },
    { id: 'الرباح', label: 'الرباح' },
    { id: 'البياضة', label: 'البياضة' },
    { id: 'حاسي خليفة', label: 'حاسي خليفة' },
    { id: 'المقرن', label: 'المقرن' },
  ];

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'كافة الأنشطة' },
    { id: 'dates', label: '🌴 تمور ومنتجات صحراوية' },
    { id: 'food', label: '☕ مقاهي ومطاعم' },
    { id: 'electronics', label: '📱 إلكترونيات وهواتف' },
    { id: 'crafts', label: '🧵 أزياء وحرف سوفية' },
    { id: 'fashion', label: '👗 ألبسة وموضة' },
    { id: 'health', label: '💊 صحة وجمال' },
    { id: 'building', label: '🧱 مواد بناء وتجهيز' },
    { id: 'other', label: '✨ خدمات أخرى' },
  ];

  const fetchStores = async () => {
    setLoading(true);
    try {
      const data = await api.getStores({
        commune: selectedCommune,
        category: selectedCategory,
        search: searchQuery,
      });
      setStores(data);
    } catch (err) {
      console.error('Failed to load directory stores:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [selectedCommune, selectedCategory, searchQuery]);

  return (
    <section id="directory" className="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Directory Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-800 border border-amber-500/20 mb-3">
          <MapPin className="w-3.5 h-3.5 text-amber-600" />
          <span>{t.exploreDirectory}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 tracking-tight">
          دليل الأنشطة والمحلات في ولاية الوادي
        </h2>
        <p className="mt-2 text-sm text-stone-600">
          تصفح المحلات الموثقة في وادي سوف، تواصل مباشرة مع التجار وتصفح المنتجات عبر رمز QR.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200/80 shadow-xs mb-8 space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pr-12 pl-4 py-3 bg-stone-50 hover:bg-stone-100/70 focus:bg-white rounded-2xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all text-stone-900 placeholder:text-stone-400"
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-col md:flex-row gap-3">
          {/* Commune Pills */}
          <div className="flex-1 overflow-x-auto pb-1 scrollbar-none flex items-center gap-1.5">
            <span className="text-xs font-bold text-stone-500 shrink-0 ml-1">البلدية:</span>
            {communes.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCommune(c.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCommune === c.id
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Category Dropdown/Pills */}
          <div className="shrink-0 flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stores Grid */}
      {loading ? (
        <div className="text-center py-16 text-stone-500 text-sm">
          جاري تحميل محلات وادي سوف...
        </div>
      ) : stores.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <div
              key={store.id}
              className="bg-white rounded-3xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Store Cover */}
                <div className="relative h-40 w-full overflow-hidden bg-stone-100">
                  <img
                    src={store.coverImage}
                    alt={store.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Commune Badge */}
                  <span className="absolute top-3 right-3 bg-stone-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/10">
                    <MapPin className="w-3 h-3 text-amber-400" />
                    <span>{store.commune}</span>
                  </span>

                  {/* QR quick trigger */}
                  <button
                    onClick={() => onOpenQrModal(store)}
                    className="absolute top-3 left-3 p-2 rounded-full bg-white/90 hover:bg-white text-stone-900 shadow-md transition-all active:scale-90"
                    title="عرض كود الـ QR"
                  >
                    <QrCode className="w-4 h-4 text-amber-700" />
                  </button>

                  {/* Logo overlay */}
                  <div className="absolute -bottom-4 right-5 w-14 h-14 rounded-full bg-white p-1 shadow-lg border-2 border-amber-500 overflow-hidden">
                    <img
                      src={store.logo}
                      alt={store.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="pt-6 px-5 pb-3">
                  <div className="flex items-center gap-1 text-sm sm:text-base font-extrabold text-stone-900 mb-1">
                    <span>{store.name}</span>
                    {store.verified && (
                      <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" title="موثق" />
                    )}
                  </div>

                  <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed mb-3">
                    {store.description}
                  </p>

                  <div className="flex items-center gap-2 text-[11px] text-stone-600">
                    <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md font-semibold border border-amber-200/60">
                      {store.products.length} منتجات معروضة
                    </span>
                    <span className="text-stone-400">•</span>
                    <span>{store.stats.totalScans} عملية مسح</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="p-4 bg-stone-50/60 border-t border-stone-100 flex items-center gap-2">
                <button
                  onClick={() => onOpenStore(store.slug, store)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>تصفح المتجر</span>
                </button>

                <a
                  href={`https://wa.me/${store.whatsapp}?text=${encodeURIComponent('السلام عليكم، تواصلت معكم عبر منصة MY El Oued QR')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 transition-colors"
                  title="محادثة واتساب"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                </a>

                <a
                  href={`tel:${store.phone}`}
                  className="p-2.5 rounded-xl bg-stone-200/80 hover:bg-stone-300 text-stone-700 transition-colors"
                  title="اتصال هاتفي"
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8 max-w-md mx-auto">
          <p className="text-stone-700 font-bold text-base mb-1">لم يتم العثور على محلات مطابقة</p>
          <p className="text-xs text-stone-500 mb-4">
            جرّب تغيير خيارات التصفية أو اسم البلدية للبحث في كافة أرجاء ولاية الوادي.
          </p>
          <button
            onClick={() => {
              setSelectedCommune('all');
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold"
          >
            إعادة تعيين الفلاتر
          </button>
        </div>
      )}
    </section>
  );
};
