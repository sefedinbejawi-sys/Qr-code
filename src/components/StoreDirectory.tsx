import React, { useState, useEffect } from 'react';
import { Store, CommuneElOued, StoreCategory, Language } from '../types';
import { api } from '../services/api';
import { translations } from '../utils/translations';
import { checkStoreOpenStatus, getCategoryLabel } from '../utils/storeHelpers';
import {
  Search,
  MapPin,
  Tag,
  Phone,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  QrCode,
  Sparkles,
  Flame,
  Clock,
  CheckCircle2,
  Percent,
  Compass,
  X,
} from 'lucide-react';

interface StoreDirectoryProps {
  lang?: Language;
  onOpenStore: (slug: string, store?: Store) => void;
  onOpenQrModal: (store: Store) => void;
}

type FilterMode = 'all' | 'open_now' | 'offers_only' | 'verified_only' | 'most_popular' | 'newest';

export const StoreDirectory: React.FC<StoreDirectoryProps> = ({
  lang = 'ar',
  onOpenStore,
  onOpenQrModal,
}) => {
  const t = translations[lang];
  const [stores, setStores] = useState<Store[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCommune, setSelectedCommune] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');

  const communes: { id: string; label: string }[] = [
    { id: 'all', label: 'كل البلديات' },
    { id: 'الوادي', label: 'الوادي (المركز)' },
    { id: 'قمار', label: 'قمار' },
    { id: 'كوينين', label: 'كوينين' },
    { id: 'الرقيبة', label: 'الرقيبة' },
    { id: 'الدبيلة', label: 'الدبيلة' },
    { id: 'الرباح', label: 'الرباح' },
    { id: 'البياضة', label: 'البياضة' },
    { id: 'حاسي خليفة', label: 'حاسي خليفة' },
    { id: 'المقرن', label: 'المقرن' },
    { id: 'جامعة', label: 'جامعة' },
    { id: 'المغير', label: 'المغير' },
  ];

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'كافة التصنيفات' },
    { id: 'dates', label: '🌴 تمور وغراس' },
    { id: 'food', label: '☕ مقاهي ومطاعم' },
    { id: 'sweets', label: '🍰 حلويات ومخابز' },
    { id: 'fashion', label: '👗 ملابس وأزياء' },
    { id: 'electronics', label: '📱 هواتف وإلكترونيات' },
    { id: 'crafts', label: '🧵 حرف وأزياء سوفية' },
    { id: 'realestate', label: '🏠 عقارات وتهيئة' },
    { id: 'hotels', label: '🏨 فنادق وسياحة' },
    { id: 'health', label: '💊 صحة وجمال' },
    { id: 'building', label: '🧱 مواد بناء ومقاولات' },
    { id: 'services', label: '🛠️ خدمات وحرفيون' },
    { id: 'automotive', label: '🚗 سيارات ونقل' },
    { id: 'other', label: '✨ أنشطة أخرى' },
  ];

  const filterTabs: { id: FilterMode; label: string; icon?: any }[] = [
    { id: 'all', label: 'الكل' },
    { id: 'open_now', label: '🟢 مفتوح الآن' },
    { id: 'offers_only', label: '🏷️ عروض اليوم' },
    { id: 'verified_only', label: '🛡️ محلات موثقة' },
    { id: 'most_popular', label: '🔥 الأكثر تفاعلاً' },
    { id: 'newest', label: '✨ محلات جديدة' },
  ];

  const fetchStores = async () => {
    setLoading(true);
    try {
      const data = await api.getStores({
        commune: selectedCommune,
        category: selectedCategory,
        search: searchQuery,
        filter: filterMode,
      });

      // If 'open_now' client-side check
      let finalStores = data;
      if (filterMode === 'open_now') {
        finalStores = finalStores.filter((s) => checkStoreOpenStatus(s.workingHours).isOpen);
      }

      setStores(finalStores);
    } catch (err) {
      console.error('Failed to load directory stores:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [selectedCommune, selectedCategory, searchQuery, filterMode]);

  useEffect(() => {
    api.getOffers().then((res) => {
      setOffers(res || []);
    }).catch((err) => console.warn('Could not load offers', err));
  }, []);

  return (
    <section id="directory" className="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Directory Title and Introduction */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-800 border border-amber-500/20 mb-3">
          <Compass className="w-3.5 h-3.5 text-amber-600" />
          <span>دليل محلات وأنشطة وادي سوف (Local Discovery)</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
          اكتشف أفضل محلات وتجار ولاية الوادي
        </h2>
        <p className="mt-2 text-sm sm:text-base text-stone-600">
          تصفح المحلات الموثقة في بلديات الوادي، اكتشف عروض اليوم، وتواصل فوراً مع التجار عبر واتساب أو الاتصال المباشر.
        </p>
      </div>

      {/* Today's Offers Carousel (If any offers exist) */}
      {offers.length > 0 && (
        <div className="mb-10 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-600/10 rounded-3xl p-4 sm:p-6 border border-amber-300/40">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-600 text-white shadow-xs">
                <Flame className="w-4 h-4" />
              </span>
              <h3 className="font-extrabold text-sm sm:text-base text-stone-900">
                عروض وتخفيضات اليوم في الوادي
              </h3>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-200">
              {offers.length} عروض نشطة
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {offers.slice(0, 3).map((offer, idx) => (
              <div
                key={idx}
                onClick={() => onOpenStore(offer.storeSlug)}
                className="bg-white p-3.5 rounded-2xl border border-amber-200/80 shadow-2xs hover:shadow-sm hover:border-amber-400 transition-all cursor-pointer flex items-center gap-3 group"
              >
                <img
                  src={offer.storeLogo}
                  alt={offer.storeName}
                  className="w-12 h-12 rounded-xl object-cover border border-stone-200 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-xs font-black text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">
                      {offer.badge || 'خصم مميز'}
                    </span>
                    <span className="text-[11px] text-stone-500 truncate">{offer.storeName}</span>
                  </div>
                  <div className="text-xs font-extrabold text-stone-900 truncate group-hover:text-amber-700 transition-colors">
                    {offer.title}
                  </div>
                  <div className="text-[11px] text-stone-500 truncate">{offer.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Smart Search & Multi-Filter Control Hub */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-stone-200/80 shadow-xs mb-8 space-y-4">
        {/* Search input with clean reset button */}
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 pointer-events-none" />
          <input
            id="store-directory-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ماذا تبحث عنه في الوادي؟ (مثال: تمر دقلة نور، قهوة مختصة، هواتف، كوينين...)"
            className="w-full pr-12 pl-10 py-3.5 bg-stone-50 hover:bg-stone-100/70 focus:bg-white rounded-2xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all text-stone-900 placeholder:text-stone-400 font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-stone-200 text-stone-400 hover:text-stone-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Filter Mode Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-stone-100 pt-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterMode(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                filterMode === tab.id
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
          <span className="text-xs font-bold text-stone-500 shrink-0 ml-1">التصنيف:</span>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === c.id
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'bg-stone-50 text-stone-700 border border-stone-200/80 hover:bg-stone-100'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Communes Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
          <span className="text-xs font-bold text-stone-500 shrink-0 ml-1">البلدية:</span>
          {communes.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCommune(c.id)}
              className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCommune === c.id
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stores Grid */}
      {loading ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-200">
          <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <div className="text-sm font-bold text-stone-700">جاري تحميل محلات وادي سوف...</div>
          <div className="text-xs text-stone-400 mt-1">يتم جلب البيانات الحقيقية من قاعدة بيانات ولاية الوادي</div>
        </div>
      ) : stores.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-4 text-xs font-bold text-stone-600">
            <span>تم العثور على {stores.length} نشاط ومحل تجاري:</span>
            <span>الترتيب الافتراضي: المحلات المميزة والنشطة أولاً</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => {
              const status = checkStoreOpenStatus(store.workingHours);
              const activeOffer = (store.offers || []).find((o) => o.isActive);

              return (
                <div
                  key={store.id}
                  className="bg-white rounded-3xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group relative"
                >
                  <div>
                    {/* Store Cover Image */}
                    <div className="relative h-44 w-full overflow-hidden bg-stone-100">
                      <img
                        src={store.coverImage}
                        alt={store.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-3 right-3 flex flex-wrap gap-1.5 items-center">
                        <span className="bg-stone-900/85 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/10 shadow-xs">
                          <MapPin className="w-3 h-3 text-amber-400" />
                          <span>{store.commune}</span>
                        </span>
                        {store.isFeatured && (
                          <span className="bg-amber-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>مميز</span>
                          </span>
                        )}
                      </div>

                      {/* Open / Closed Status Badge */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border shadow-2xs ${
                            status.isOpen
                              ? 'bg-emerald-600 text-white border-emerald-700'
                              : 'bg-stone-800/90 text-stone-200 border-stone-700'
                          }`}
                        >
                          {status.label}
                        </span>

                        {/* QR Code Quick Modal Trigger */}
                        <button
                          onClick={() => onOpenQrModal(store)}
                          className="p-1.5 rounded-full bg-white/95 hover:bg-white text-stone-900 shadow-md transition-all active:scale-95 cursor-pointer"
                          title="عرض كود الـ QR"
                        >
                          <QrCode className="w-4 h-4 text-amber-700" />
                        </button>
                      </div>

                      {/* Store Logo overlapping the cover */}
                      <div className="absolute -bottom-4 right-5 w-14 h-14 rounded-2xl bg-white p-1 shadow-md border border-stone-200 overflow-hidden">
                        <img
                          src={store.logo}
                          alt={store.name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="pt-6 px-5 pb-3">
                      <div className="flex items-center gap-1.5 text-base font-black text-stone-900 mb-1">
                        <span>{store.name}</span>
                        {store.verified && (
                          <ShieldCheck
                            className="w-4 h-4 text-amber-600 shrink-0 fill-amber-50"
                            title="محل موثق رسميًا"
                          />
                        )}
                      </div>

                      <div className="text-xs font-bold text-amber-700 mb-2">
                        {getCategoryLabel(store.category)}
                      </div>

                      <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-3">
                        {store.description}
                      </p>

                      {/* Active Offer Banner */}
                      {activeOffer && (
                        <div className="mb-3 bg-amber-500/10 border border-amber-500/25 rounded-xl p-2 flex items-center gap-2">
                          <Percent className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                          <div className="text-[11px] font-bold text-amber-900 truncate">
                            {activeOffer.title}
                          </div>
                        </div>
                      )}

                      {/* Metrics & Highlights */}
                      <div className="flex items-center gap-2 text-[11px] text-stone-500 pt-1 border-t border-stone-100">
                        <span className="font-semibold text-stone-700">
                          {store.products.length} معروضات
                        </span>
                        <span>•</span>
                        <span>{store.stats.totalScans} مسحة QR</span>
                        <span>•</span>
                        <span className="truncate">{store.location.landmark || store.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Fast Action Buttons Footer */}
                  <div className="p-3.5 bg-stone-50/70 border-t border-stone-100 flex items-center gap-2">
                    <button
                      onClick={() => onOpenStore(store.slug, store)}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>تصفح المحل</span>
                    </button>

                    <a
                      href={`https://wa.me/${store.whatsapp}?text=${encodeURIComponent(
                        `السلام عليكم، رأيت محلكم «${store.name}» في منصة MY El Oued QR وأود الاستفسار.`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 transition-colors flex items-center justify-center cursor-pointer"
                      title="مراسلة واتساب"
                    >
                      <MessageCircle className="w-4 h-4 fill-emerald-600 text-white" />
                    </a>

                    <a
                      href={`tel:${store.phone}`}
                      className="p-2.5 rounded-xl bg-stone-200/80 hover:bg-stone-300 text-stone-800 transition-colors flex items-center justify-center cursor-pointer"
                      title="اتصال هاتفي"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8 max-w-md mx-auto">
          <Compass className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-800 font-extrabold text-base mb-1">
            لم يتم العثور على محلات مطابقة
          </p>
          <p className="text-xs text-stone-500 mb-5 leading-relaxed">
            جرّب توسيع خيارات البحث، إزالة بعض الفلاتر، أو اختيار بلدية أخرى في ولاية الوادي.
          </p>
          <button
            onClick={() => {
              setSelectedCommune('all');
              setSelectedCategory('all');
              setSearchQuery('');
              setFilterMode('all');
            }}
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            إعادة تعيين جميع الفلاتر
          </button>
        </div>
      )}
    </section>
  );
};
