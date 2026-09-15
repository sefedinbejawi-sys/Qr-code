import React, { useState, useEffect } from 'react';
import { Store, StoreProduct, Language } from '../types';
import { api } from '../services/api';
import { initialSeedStores } from '../data/seedStores';
import { downloadVCard } from '../utils/vcard';
import { translations } from '../utils/translations';
import { DunesSvg, SoufiArch } from './SaharanDecor';
import { QrCodeView } from './QrCodeView';
import {
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Share2,
  Check,
  Sparkles,
  ExternalLink,
  Tag,
  ShoppingBag,
  ChevronRight,
  ShieldCheck,
  UserPlus,
  ArrowRight,
  X,
  QrCode,
  Store as StoreIcon,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export interface StorePublicPageProps {
  store?: Store | null;
  slug?: string;
  lang?: Language;
  onBackHome?: () => void;
  onBackToHome?: () => void;
  onCreateOwnQr?: () => void;
}

export const StorePublicPage: React.FC<StorePublicPageProps> = ({
  store: initialStore,
  slug,
  lang = 'ar',
  onBackHome,
  onBackToHome,
  onCreateOwnQr,
}) => {
  const t = translations[lang];
  const handleBack = onBackHome || onBackToHome;

  // Resolve active store state: either passed prop, or matched from seed data, or fetched via API
  const [currentStore, setCurrentStore] = useState<Store | null>(() => {
    if (initialStore) return initialStore;
    if (slug) {
      return initialSeedStores.find((s) => s.slug === slug || s.id === slug) || null;
    }
    return null;
  });

  const [loading, setLoading] = useState<boolean>(!currentStore);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showScanWelcome, setShowScanWelcome] = useState<boolean>(false);

  // Check if user came from scanning a QR code
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('from') === 'qr' || window.location.pathname.includes('/scan/')) {
      setShowScanWelcome(true);
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.15 } });
    }
  }, []);

  // Fetch or sync store data
  useEffect(() => {
    if (initialStore) {
      setCurrentStore(initialStore);
      setLoading(false);
      return;
    }

    const targetSlug = slug;
    if (!targetSlug) {
      if (!currentStore) setNotFound(true);
      return;
    }

    // Try finding in initial seed stores immediately
    const seedMatch = initialSeedStores.find((s) => s.slug === targetSlug || s.id === targetSlug);
    if (seedMatch && !currentStore) {
      setCurrentStore(seedMatch);
    }

    let isMounted = true;
    api
      .getStoreBySlug(targetSlug)
      .then((data) => {
        if (isMounted && data) {
          setCurrentStore(data);
          setLoading(false);
          setNotFound(false);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch store from API, using fallback:', err);
        if (isMounted) {
          if (!seedMatch && !currentStore) {
            setNotFound(true);
          }
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [slug, initialStore]);

  // Record visit once store is resolved
  useEffect(() => {
    if (currentStore?.slug) {
      api.recordVisit(currentStore.slug);
    }
  }, [currentStore?.slug]);

  // If store not found
  if (notFound) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] text-stone-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4 shadow-sm border border-amber-200">
          <AlertTriangle className="w-8 h-8 text-amber-600" />
        </div>
        <h1 className="text-2xl font-extrabold text-stone-900 mb-2">المحل غير متواجد حالياً</h1>
        <p className="text-sm text-stone-600 max-w-md mb-6 leading-relaxed">
          عذراً، لم نتمكن من العثور على المحل المطلوب في ولاية الوادي. قد يكون الرابط قد تم تعديله أو أن المحل غير مسجل بعد.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          {handleBack && (
            <button
              onClick={handleBack}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-sm transition-all"
            >
              العودة إلى دليل محلات الوادي
            </button>
          )}
          {onCreateOwnQr && (
            <button
              onClick={onCreateOwnQr}
              className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm shadow-sm transition-all"
            >
              أنشئ كود محلك مجاناً
            </button>
          )}
        </div>
      </div>
    );
  }

  // If loading and no store cached yet
  if (loading && !currentStore) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-3">
          <Loader2 className="w-7 h-7 text-amber-600 animate-spin" />
        </div>
        <p className="text-sm font-bold text-stone-700">جاري فتح الصفحة الرقمية للمحل...</p>
        <p className="text-xs text-stone-400 mt-1">منصة MY El Oued QR • وادي سوف</p>
      </div>
    );
  }

  // Safe reference
  const store = currentStore!;
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://qr.myeloued.com';
  const publicStoreUrl = `${origin}/q/${store.slug}`;

  // Check if store is open right now
  const isCurrentlyOpen = (): { isOpen: boolean; text: string } => {
    const daysMap: Record<number, string> = {
      0: 'sun',
      1: 'mon',
      2: 'tue',
      3: 'wed',
      4: 'thu',
      5: 'fri',
      6: 'sat',
    };
    const now = new Date();
    const dayKey = daysMap[now.getDay()];
    const todaySchedule = store.workingHours?.find((h) => h.dayKey === dayKey);

    if (!todaySchedule || !todaySchedule.isOpen) {
      return { isOpen: false, text: t.closedNow };
    }

    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const currentTotalMin = currentHour * 60 + currentMin;

    const [openH, openM] = (todaySchedule.openTime || '08:00').split(':').map(Number);
    const [closeH, closeM] = (todaySchedule.closeTime || '20:00').split(':').map(Number);
    const openTotalMin = openH * 60 + openM;
    const closeTotalMin = closeH * 60 + closeM;

    if (currentTotalMin >= openTotalMin && currentTotalMin <= closeTotalMin) {
      return { isOpen: true, text: `${t.openNow} (حتى ${todaySchedule.closeTime})` };
    }
    return { isOpen: false, text: `${t.closedNow} (يفتح ${todaySchedule.openTime})` };
  };

  const status = isCurrentlyOpen();

  // Handlers with real API action logging
  const handleCall = () => {
    api.recordAction(store.slug, 'call');
    window.location.href = `tel:${store.phone}`;
  };

  const handleWhatsApp = (productName?: string) => {
    api.recordAction(store.slug, 'whatsapp');
    let msg = store.whatsappMessage || `السلام عليكم، تواصلت معكم عبر منصة MY El Oued QR`;
    if (productName) {
      msg = `السلام عليكم ورحمة الله، أود الاستفسار والطلب بخصوص: ${productName} المعروض في صفحتكم على MY El Oued QR.`;
    }
    const cleanPhone = (store.whatsapp || store.phone || '').replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const handleLocation = () => {
    api.recordAction(store.slug, 'maps');
    if (store.location?.googleMapsUrl) {
      window.open(store.location.googleMapsUrl, '_blank');
    } else {
      window.open(`https://maps.google.com/?q=${encodeURIComponent(`${store.name} ${store.commune} الوادي`)}`, '_blank');
    }
  };

  const handleSaveContact = () => {
    api.recordAction(store.slug, 'vcard');
    downloadVCard(store, publicStoreUrl);
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.9 } });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: store.name,
          text: `${store.name} - ولاية الوادي: تفضل بزيارة صفحتنا الرسمية والتواصل المباشر`,
          url: publicStoreUrl,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(publicStoreUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const productCategories = [
    'all',
    ...Array.from(new Set((store.products || []).map((p) => p.category).filter(Boolean))),
  ];

  const filteredProducts =
    activeCategory === 'all'
      ? (store.products || [])
      : (store.products || []).filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1917] pb-16 antialiased">
      {/* Top Floating App Bar */}
      <div className="sticky top-0 z-40 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-amber-900/10 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {handleBack && (
            <button
              onClick={handleBack}
              className="p-1.5 rounded-xl hover:bg-stone-200/60 text-stone-700 transition-colors flex items-center gap-1.5 text-xs font-bold"
              title="العودة للرئيسية"
            >
              <ArrowRight className="w-4 h-4 rtl:rotate-0 ltr:rotate-180 text-amber-700" />
              <span>الرئيسية</span>
            </button>
          )}
          <div className="flex items-center gap-1.5 mr-1">
            <span className="w-2 h-2 rounded-full bg-amber-600"></span>
            <span className="font-bold text-xs tracking-tight text-stone-800 font-sans">
              MY EL OUED QR
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQrModal(true)}
            className="p-2 rounded-xl bg-amber-100/70 hover:bg-amber-100 text-amber-900 text-xs font-bold flex items-center gap-1 transition-all"
            title="عرض كود الـ QR"
          >
            <QrCode className="w-4 h-4 text-amber-700" />
            <span className="hidden sm:inline">كود الـ QR</span>
          </button>
          <button
            onClick={handleShare}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center gap-1 transition-all"
            title="مشاركة"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{copiedLink ? 'تم النسخ' : 'مشاركة'}</span>
          </button>
        </div>
      </div>

      {/* Welcome Banner from QR scan */}
      {showScanWelcome && (
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-4 py-2.5 shadow-md flex items-center justify-between text-xs sm:text-sm animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-200 shrink-0" />
            <span className="font-bold">
              مرحباً بك! تم مسح رمز QR بنجاح لمحل {store.name} في ولاية الوادي.
            </span>
          </div>
          <button
            onClick={() => setShowScanWelcome(false)}
            className="p-1 rounded-full hover:bg-black/10 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Container constrained to Mobile/Tablet clean column */}
      <main className="max-w-xl mx-auto px-4 pt-3">
        {/* Cover Photo & Header Section */}
        <div className="relative rounded-3xl overflow-hidden shadow-lg bg-stone-900 border border-stone-200/40">
          {/* Cover Image */}
          <div className="h-44 sm:h-52 w-full relative overflow-hidden">
            <img
              src={store.coverImage || 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1200&auto=format&fit=crop&q=80'}
              alt={store.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <DunesSvg className="absolute -bottom-1 left-0 right-0 w-full" fill="#FAF7F2" opacity={1} />
          </div>

          {/* Logo & Identity Info */}
          <div className="relative px-5 pb-5 -mt-14 flex flex-col items-center text-center">
            {/* Logo Badge */}
            <div className="relative w-24 h-24 rounded-full bg-white p-1.5 shadow-xl border-2 border-amber-500 overflow-hidden mb-3">
              <img
                src={store.logo || 'https://images.unsplash.com/photo-1596797882870-8c33deeac224?w=300&auto=format&fit=crop&q=80'}
                alt={store.name}
                className="w-full h-full object-cover rounded-full"
              />
              {store.verified && (
                <div
                  className="absolute bottom-0 right-0 bg-amber-600 text-white rounded-full p-1 shadow-md border-2 border-white"
                  title="نشاط تجاري موثق"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            {/* Store Name */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mb-1">
              {store.name}
            </h1>

            {/* Commune & Location Badge */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-stone-600 mb-2">
              <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60">
                <MapPin className="w-3 h-3 text-amber-600" />
                <span>{store.commune} • ولاية الوادي</span>
              </span>
              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                <span
                  className={`w-2 h-2 rounded-full ${status.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}
                />
                <span>{status.text}</span>
              </span>
            </div>

            {/* Description */}
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed max-w-md mx-auto mb-4">
              {store.description}
            </p>

            {/* Save to Contacts Button */}
            <button
              onClick={handleSaveContact}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold border border-stone-200 transition-all shadow-sm active:scale-95"
            >
              <UserPlus className="w-4 h-4 text-amber-600" />
              <span>{t.saveContact}</span>
            </button>
          </div>
        </div>

        {/* Primary Action Buttons (Call, WhatsApp, GPS Location) */}
        <div className="grid grid-cols-3 gap-2.5 mt-3">
          {/* Call Button */}
          <button
            onClick={handleCall}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white hover:bg-stone-50 border border-stone-200/90 shadow-sm transition-all active:scale-95 text-stone-800"
          >
            <div className="w-11 h-11 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5 shadow-inner">
              <Phone className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold">{t.callNow}</span>
            <span className="text-[10px] text-stone-500 mt-0.5 dir-ltr">{store.phone}</span>
          </button>

          {/* WhatsApp Button */}
          <button
            onClick={() => handleWhatsApp()}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all active:scale-95"
          >
            <div className="w-11 h-11 rounded-full bg-emerald-500/80 text-white flex items-center justify-center mb-1.5 shadow-inner">
              <MessageCircle className="w-5 h-5 fill-current" />
            </div>
            <span className="text-xs font-bold">{t.chatWhatsapp}</span>
            <span className="text-[10px] text-emerald-100 mt-0.5">محادثة فورية</span>
          </button>

          {/* Location / GPS Button */}
          <button
            onClick={handleLocation}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white hover:bg-stone-50 border border-stone-200/90 shadow-sm transition-all active:scale-95 text-stone-800"
          >
            <div className="w-11 h-11 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-1.5 shadow-inner">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold">{t.viewLocation}</span>
            <span className="text-[10px] text-stone-500 mt-0.5">خرائط Google</span>
          </button>
        </div>

        {/* Social Links Row */}
        {(store.socialLinks?.facebook ||
          store.socialLinks?.instagram ||
          store.socialLinks?.tiktok ||
          store.socialLinks?.website) && (
          <div className="flex items-center justify-center gap-3 mt-3 py-2 bg-white/70 backdrop-blur-sm rounded-2xl border border-stone-200/60">
            {store.socialLinks.facebook && (
              <a
                href={store.socialLinks.facebook}
                target="_blank"
                rel="noreferrer"
                onClick={() => api.recordAction(store.slug, 'social')}
                className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-xs font-semibold flex items-center gap-1"
              >
                <span>فيسبوك</span>
              </a>
            )}
            {store.socialLinks.instagram && (
              <a
                href={store.socialLinks.instagram}
                target="_blank"
                rel="noreferrer"
                onClick={() => api.recordAction(store.slug, 'social')}
                className="p-2 rounded-xl bg-pink-50 text-pink-600 hover:bg-pink-100 transition-colors text-xs font-semibold flex items-center gap-1"
              >
                <span>إنستغرام</span>
              </a>
            )}
            {store.socialLinks.tiktok && (
              <a
                href={store.socialLinks.tiktok}
                target="_blank"
                rel="noreferrer"
                onClick={() => api.recordAction(store.slug, 'social')}
                className="p-2 rounded-xl bg-stone-100 text-stone-900 hover:bg-stone-200 transition-colors text-xs font-semibold flex items-center gap-1"
              >
                <span>تيك توك</span>
              </a>
            )}
            {store.socialLinks.website && (
              <a
                href={store.socialLinks.website}
                target="_blank"
                rel="noreferrer"
                onClick={() => api.recordAction(store.slug, 'social')}
                className="p-2 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors text-xs font-semibold flex items-center gap-1"
              >
                <span>الموقع الإلكتروني</span>
              </a>
            )}
          </div>
        )}

        {/* Special Offers Banner (if any) */}
        {store.offers && store.offers.length > 0 && (
          <div className="mt-4 space-y-2.5">
            {store.offers.map((offer) => (
              <div
                key={offer.id}
                className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold mb-1.5">
                      <Tag className="w-3 h-3" />
                      <span>{offer.badge || t.specialOffers}</span>
                      {offer.discountPercentage && <span>• تخفيض {offer.discountPercentage}%</span>}
                    </div>
                    <h3 className="font-extrabold text-base sm:text-lg">{offer.title}</h3>
                    <p className="text-xs text-amber-50 mt-1 leading-relaxed">{offer.description}</p>
                    {offer.validUntil && (
                      <p className="text-[10px] text-amber-200 mt-2">صالح حتى: {offer.validUntil}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleWhatsApp(`الاستفادة من ${offer.title}`)}
                    className="shrink-0 px-3 py-2 rounded-xl bg-white text-amber-900 font-bold text-xs shadow-sm hover:bg-amber-50 active:scale-95 transition-transform"
                  >
                    استفد الآن
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Photo Gallery (if available) */}
        {store.gallery && store.gallery.length > 0 && (
          <div className="mt-5">
            <h3 className="text-sm font-bold text-stone-800 mb-2.5 flex items-center gap-1.5">
              <span>صور المتجر والمنتجات</span>
            </h3>
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none snap-x">
              {store.gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className="shrink-0 w-28 h-28 rounded-2xl overflow-hidden border border-stone-200/80 shadow-sm snap-start hover:opacity-90 transition-opacity"
                >
                  <img src={img} alt={`${store.name} gallery ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Products & Services Section */}
        <section className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base sm:text-lg font-extrabold text-stone-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-600" />
              <span>{t.productsTitle}</span>
            </h2>
            <span className="text-xs text-stone-500 font-medium">
              {filteredProducts.length} عنصر متوفر
            </span>
          </div>

          {/* Category Tabs */}
          {productCategories.length > 2 && (
            <div className="flex gap-2 overflow-x-auto pb-2.5 scrollbar-none mb-3">
              {productCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat || 'all')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    activeCategory === cat
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {cat === 'all' ? 'الكل' : cat}
                </button>
              ))}
            </div>
          )}

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-stone-200/80 p-3 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {product.image && (
                    <div className="relative h-36 w-full rounded-xl overflow-hidden mb-2.5 bg-stone-100">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      {product.isFeatured && (
                        <span className="absolute top-2 right-2 bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                          مميز
                        </span>
                      )}
                    </div>
                  )}

                  <h3 className="font-bold text-sm text-stone-900 leading-snug mb-1">
                    {product.name}
                  </h3>

                  {product.description && (
                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed mb-2">
                      {product.description}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                  <div className="font-extrabold text-amber-700 text-sm">
                    {product.price.toLocaleString()} {t.dzd}
                  </div>
                  <button
                    onClick={() => handleWhatsApp(product.name)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-current" />
                    <span>طلب / استفسار</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-10 bg-white rounded-2xl border border-stone-200 text-stone-500 text-xs">
              لا توجد منتجات مضافة في هذا القسم حالياً.
            </div>
          )}
        </section>

        {/* Working Hours Schedule */}
        <section className="mt-6 bg-white rounded-2xl border border-stone-200/80 p-4 shadow-sm">
          <h3 className="font-bold text-sm text-stone-900 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>{t.workingHours}</span>
          </h3>

          <div className="space-y-1.5 text-xs">
            {store.workingHours?.map((wh) => (
              <div
                key={wh.dayKey}
                className="flex items-center justify-between py-1 border-b border-stone-100 last:border-0"
              >
                <span className="font-medium text-stone-700">{wh.day}</span>
                {wh.isOpen ? (
                  <span className="font-mono text-stone-600 dir-ltr">
                    {wh.openTime} - {wh.closeTime}
                  </span>
                ) : (
                  <span className="text-rose-600 font-semibold">عطلة أسبوعية</span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Address and Location Map Section */}
        <section className="mt-6 bg-white rounded-2xl border border-stone-200/80 p-4 shadow-sm">
          <h3 className="font-bold text-sm text-stone-900 mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-600" />
            <span>العنوان الدقيق والموقع الجغرافي</span>
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed mb-3">{store.address}</p>
          {store.location.landmark && (
            <p className="text-xs text-stone-500 mb-3 font-medium">
              📍 علامة دالة: {store.location.landmark}
            </p>
          )}
          <button
            onClick={handleLocation}
            className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <ExternalLink className="w-4 h-4 text-amber-400" />
            <span>فتح الاتجاهات المباشرة على Google Maps</span>
          </button>
        </section>

        {/* Merchant Call-to-Action */}
        <section className="mt-8 bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 text-white rounded-3xl p-5 sm:p-6 border border-amber-500/20 text-center shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>لتجار ومهنيي وادي سوف</span>
            </span>
            <h3 className="text-base sm:text-lg font-black text-white mb-1">
              هل تملك متجراً أو نشاطاً في ولاية الوادي؟
            </h3>
            <p className="text-xs text-stone-300 max-w-sm mx-auto mb-4 leading-relaxed">
              احصل على صفحتك الرقمية التفاعلية وكود QR ديناميكي جاهز للطباعة مجاناً في دقيقتين فقط.
            </p>
            <button
              onClick={onCreateOwnQr || handleBack}
              className="py-2.5 px-5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md transition-all inline-flex items-center gap-2"
            >
              <span>أنشئ كود QR لمحلك مجاناً</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>

        {/* Footer Brand Credit */}
        <div className="mt-8 text-center text-xs text-stone-400 pb-6 flex flex-col items-center gap-1">
          <div className="flex items-center gap-1 font-semibold text-amber-700/80">
            <SoufiArch className="w-4 h-4" />
            <span>MY El Oued QR • منصة تجارة وادي سوف الذكية</span>
          </div>
          <p className="text-[11px]">مدينة الألف قبة وقبة • ولاية الوادي</p>
        </div>
      </main>

      {/* QR Code Popup Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm bg-[#FAF7F2] rounded-3xl p-6 shadow-2xl border border-amber-900/10 animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 left-4 p-1.5 rounded-full bg-stone-200/70 hover:bg-stone-300 text-stone-700 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <QrCodeView
              store={store}
              lang={lang}
              onOpenStore={() => setShowQrModal(false)}
            />
          </div>
        </div>
      )}

      {/* Image Preview Lightbox Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-xl max-h-[85vh]">
            <img
              src={selectedImage}
              alt="Preview"
              className="w-full h-full object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
