import React, { useState, useEffect } from 'react';
import { Store, User, AnalyticsSummary, StoreProduct, StoreOffer, QRConfig, Language } from '../types';
import { api } from '../services/api';
import { translations } from '../utils/translations';
import { QrCodeView } from './QrCodeView';
import {
  BarChart3,
  QrCode,
  Store as StoreIcon,
  ShoppingBag,
  Clock,
  Phone,
  Tag,
  Save,
  Check,
  Eye,
  Plus,
  Trash2,
  Share2,
  ExternalLink,
  Sparkles,
  Layers,
  MapPin,
  TrendingUp,
  Smartphone,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DashboardProps {
  store: Store;
  user: User | null;
  lang?: Language;
  onUpdateStore: (updated: Store) => void;
  onViewPublicPage: (slug: string, store?: Store) => void;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  store,
  user,
  lang = 'ar',
  onUpdateStore,
  onViewPublicPage,
  onLogout,
}) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<
    'analytics' | 'qr' | 'profile' | 'contact' | 'hours' | 'products' | 'offers'
  >('analytics');

  const [formData, setFormData] = useState<Store>(store);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New product form modal/state
  const [newProduct, setNewProduct] = useState<Partial<StoreProduct>>({
    name: '',
    price: 500,
    category: '',
    description: '',
    image: '',
    isAvailable: true,
  });
  const [showAddProduct, setShowAddProduct] = useState(false);

  // New offer form state
  const [newOffer, setNewOffer] = useState<Partial<StoreOffer>>({
    title: '',
    description: '',
    discountPercentage: 10,
    badge: 'تخفيض خاص',
    validUntil: '',
    isActive: true,
  });
  const [showAddOffer, setShowAddOffer] = useState(false);

  // Load real analytics from API
  useEffect(() => {
    let isMounted = true;
    api.getAnalytics(store.slug).then((res) => {
      if (isMounted) setAnalytics(res);
    });
    return () => {
      isMounted = false;
    };
  }, [store.slug]);

  // Sync state if prop changes
  useEffect(() => {
    setFormData(store);
  }, [store]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await api.updateStore(store.id, formData);
      onUpdateStore(updated);
      setSavedSuccess(true);
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء حفظ البيانات، يرجى المحاولة ثانية');
    } finally {
      setSaving(false);
    }
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price) {
      alert('يرجى كتابة اسم المنتج وسعره بالدينار');
      return;
    }
    const product: StoreProduct = {
      id: `prod_${Date.now()}`,
      name: newProduct.name,
      price: Number(newProduct.price),
      category: newProduct.category || 'عام',
      description: newProduct.description,
      image: newProduct.image || 'https://images.unsplash.com/photo-1596797882870-8c33deeac224?w=600&auto=format&fit=crop&q=80',
      isAvailable: true,
    };
    const updatedProducts = [...(formData.products || []), product];
    setFormData({ ...formData, products: updatedProducts });
    setShowAddProduct(false);
    setNewProduct({ name: '', price: 500, category: '', description: '', image: '', isAvailable: true });
  };

  const handleDeleteProduct = (id: string) => {
    const filtered = (formData.products || []).filter((p) => p.id !== id);
    setFormData({ ...formData, products: filtered });
  };

  const handleAddOffer = () => {
    if (!newOffer.title) {
      alert('يرجى كتابة عنوان العرض الترويجي');
      return;
    }
    const offer: StoreOffer = {
      id: `offer_${Date.now()}`,
      title: newOffer.title,
      description: newOffer.description || '',
      discountPercentage: Number(newOffer.discountPercentage) || 0,
      badge: newOffer.badge || 'عرض خاص',
      validUntil: newOffer.validUntil,
      isActive: true,
    };
    const updatedOffers = [...(formData.offers || []), offer];
    setFormData({ ...formData, offers: updatedOffers });
    setShowAddOffer(false);
    setNewOffer({ title: '', description: '', discountPercentage: 10, badge: 'عرض خاص', validUntil: '', isActive: true });
  };

  const handleDeleteOffer = (id: string) => {
    const filtered = (formData.offers || []).filter((o) => o.id !== id);
    setFormData({ ...formData, offers: filtered });
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24 antialiased">
      {/* Top Merchant Sub-Header */}
      <div className="bg-white border-b border-stone-200 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
              <img src={formData.logo} alt={formData.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-stone-900 text-sm sm:text-base">{formData.name}</h1>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                  {formData.commune}
                </span>
              </div>
              <p className="text-xs text-stone-500 dir-ltr font-mono">
                qr.myeloued.com/q/{formData.slug}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewPublicPage(formData.slug, formData)}
              className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Eye className="w-4 h-4 text-amber-700" />
              <span>معاينة صفحة المتجر</span>
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>تم الحفظ!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'جاري الحفظ...' : t.saveChanges}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Navigation Tabs Bar */}
        <div className="flex overflow-x-auto pb-2 scrollbar-none gap-2 mb-6 border-b border-stone-200/80">
          {[
            { id: 'analytics', label: t.analytics, icon: BarChart3 },
            { id: 'qr', label: t.qrSettings, icon: QrCode },
            { id: 'profile', label: t.editProfile, icon: StoreIcon },
            { id: 'contact', label: t.contactInfo, icon: Phone },
            { id: 'hours', label: t.workingHours, icon: Clock },
            { id: 'products', label: t.manageProducts, icon: ShoppingBag },
            { id: 'offers', label: t.manageOffers, icon: Tag },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Analytics & Scans */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Top Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs">
                <span className="text-xs font-bold text-stone-500">{t.totalViews}</span>
                <div className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
                  {analytics?.totalViews.toLocaleString() || formData.stats.totalViews}
                </div>
                <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
                  ↑ زيارات حقيقية مسجلة
                </span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs">
                <span className="text-xs font-bold text-stone-500">{t.totalScans}</span>
                <div className="text-2xl sm:text-3xl font-black text-amber-700 mt-1">
                  {analytics?.totalScans.toLocaleString() || formData.stats.totalScans}
                </div>
                <span className="text-[11px] text-amber-600 font-semibold mt-1 block">
                  رمز QR المطبوع
                </span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs">
                <span className="text-xs font-bold text-stone-500">نقرات واتساب</span>
                <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">
                  {analytics?.whatsappClicks || formData.stats.whatsappClicks}
                </div>
                <span className="text-[11px] text-stone-500 mt-1 block">محادثات مباشرة</span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs">
                <span className="text-xs font-bold text-stone-500">توجيه خرائط GPS</span>
                <div className="text-2xl sm:text-3xl font-black text-blue-700 mt-1">
                  {analytics?.mapClicks || formData.stats.mapClicks}
                </div>
                <span className="text-[11px] text-stone-500 mt-1 block">زيارات ميدانية</span>
              </div>
            </div>

            {/* Daily Scans & Views Chart */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs">
              <h3 className="font-extrabold text-stone-900 text-base mb-1">
                تطور المسح والزيارات خلال آخر 14 يوماً
              </h3>
              <p className="text-xs text-stone-500 mb-6">
                مقارنة بين عدد مرات مسح الرمز QR والزيارات المباشرة لصفحة المتجر في وادي سوف
              </p>

              <div className="h-48 flex items-end gap-2 sm:gap-4 pt-6 border-b border-stone-100">
                {analytics?.dailyViews.map((item, idx) => {
                  const maxVal = Math.max(
                    ...analytics.dailyViews.map((d) => Math.max(d.views, d.scans)),
                    10
                  );
                  const viewHeight = Math.round((item.views / maxVal) * 100);
                  const scanHeight = Math.round((item.scans / maxVal) * 100);

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group relative">
                      {/* Tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-stone-900 text-white text-[10px] px-2 py-0.5 rounded shadow pointer-events-none transition-opacity whitespace-nowrap z-10">
                        {item.views} زيارة / {item.scans} مسح
                      </div>

                      <div className="w-full flex items-end justify-center gap-1 h-full">
                        {/* Views bar */}
                        <div
                          style={{ height: `${viewHeight}%` }}
                          className="w-1.5 sm:w-2.5 bg-stone-300 rounded-t-sm"
                          title={`زيارات: ${item.views}`}
                        />
                        {/* Scans bar */}
                        <div
                          style={{ height: `${scanHeight}%` }}
                          className="w-1.5 sm:w-2.5 bg-amber-600 rounded-t-sm"
                          title={`مسح كود: ${item.scans}`}
                        />
                      </div>
                      <span className="text-[9px] sm:text-[10px] text-stone-400 font-mono">
                        {item.date}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-center gap-6 mt-4 text-xs font-semibold text-stone-600">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-amber-600" />
                  <span>مسح رمز QR</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-stone-300" />
                  <span>زيارات الرابط المباشر</span>
                </div>
              </div>
            </div>

            {/* Devices & Actions Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Devices */}
              <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs">
                <h3 className="font-extrabold text-stone-900 text-base mb-4 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-amber-600" />
                  <span>أجهزة الزوار في وادي سوف</span>
                </h3>

                <div className="space-y-4">
                  {analytics?.devices.map((dev, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between text-xs font-bold text-stone-800 mb-1">
                        <span>{dev.name}</span>
                        <span>{dev.percentage}%</span>
                      </div>
                      <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${dev.percentage}%` }}
                          className={`h-full rounded-full ${
                            idx === 0 ? 'bg-amber-600' : idx === 1 ? 'bg-blue-600' : 'bg-stone-500'
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Breakdown */}
              <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs">
                <h3 className="font-extrabold text-stone-900 text-base mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>التفاعلات الأكثر استخداماً من الزبائن</span>
                </h3>

                <div className="space-y-3">
                  {analytics?.actions.map((act, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200/60 text-xs"
                    >
                      <span className="font-semibold text-stone-800">{act.name}</span>
                      <span className="font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                        {act.count} نقرة
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: QR Settings & Customizer */}
        {activeTab === 'qr' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs">
            <QrCodeView
              store={formData}
              lang={lang}
              showCustomizer={true}
              onUpdateConfig={(newConfig) => {
                setFormData({ ...formData, qrConfig: newConfig });
              }}
              onOpenStore={(slug) => onViewPublicPage(slug, formData)}
            />
          </div>
        )}

        {/* Tab 3: Store Profile */}
        {activeTab === 'profile' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-6 max-w-2xl">
            <h3 className="font-extrabold text-stone-900 text-lg">البيانات الأساسية للمحل التجاري</h3>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">اسم المحل أو النشاط</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">البلدية (ولاية الوادي)</label>
                <select
                  value={formData.commune}
                  onChange={(e) => setFormData({ ...formData, commune: e.target.value as any })}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                >
                  {['الوادي', 'قمار', 'كوينين', 'الرقيبة', 'الدبيلة', 'الرباح', 'البياضة', 'حاسي خليفة', 'المقرن', 'الطالب العربي', 'سيدي عون', 'جامعة', 'المغير'].map(
                    (c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">نوع النشاط</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                >
                  <option value="dates">🌴 تمور ومنتجات صحراوية</option>
                  <option value="food">☕ مقاهي ومطاعم</option>
                  <option value="electronics">📱 هواتف وإلكترونيات</option>
                  <option value="crafts">🧵 قشابيات وأزياء تقليدية</option>
                  <option value="fashion">👗 ألبسة وموضة</option>
                  <option value="health">💊 صحة وصيدلة</option>
                  <option value="building">🧱 مواد بناء وتجهيز</option>
                  <option value="other">✨ نشاط تجاري آخر</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">العنوان بالتفصيل</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="مثال: شارع أول نوفمبر، مقابل المركز التجاري، الوادي"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">نبذة ووصف عن المحل</label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">رابط الشعار (Logo URL)</label>
                <input
                  type="text"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">رابط صورة الغلاف (Cover)</label>
                <input
                  type="text"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'جاري الحفظ...' : t.saveChanges}</span>
            </button>
          </div>
        )}

        {/* Tab 4: Contact & Social */}
        {activeTab === 'contact' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-6 max-w-2xl">
            <h3 className="font-extrabold text-stone-900 text-lg">أرقام التواصل وحسابات السوشيال ميديا</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">رقم الهاتف للاتصال</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0661234567"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none dir-ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">رقم الواتساب (WhatsApp)</label>
                <input
                  type="text"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="213661234567"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none dir-ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">رسالة الواتساب الافتراضية</label>
              <input
                type="text"
                value={formData.whatsappMessage || ''}
                onChange={(e) => setFormData({ ...formData, whatsappMessage: e.target.value })}
                placeholder="السلام عليكم، تواصلت معكم عبر MY El Oued QR..."
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">رابط صفحة Facebook</label>
                <input
                  type="text"
                  value={formData.socialLinks?.facebook || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, facebook: e.target.value },
                    })
                  }
                  placeholder="https://facebook.com/..."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none dir-ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">رابط صفحة Instagram</label>
                <input
                  type="text"
                  value={formData.socialLinks?.instagram || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, instagram: e.target.value },
                    })
                  }
                  placeholder="https://instagram.com/..."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none dir-ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">رابط موقع Google Maps المباشر</label>
              <input
                type="text"
                value={formData.location?.googleMapsUrl || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: { ...formData.location, googleMapsUrl: e.target.value },
                  })
                }
                placeholder="https://maps.google.com/?q=..."
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none dir-ltr"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'جاري الحفظ...' : t.saveChanges}</span>
            </button>
          </div>
        )}

        {/* Tab 5: Working Hours */}
        {activeTab === 'hours' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs max-w-2xl">
            <h3 className="font-extrabold text-stone-900 text-lg mb-2">أوقات العمل الأسبوعية</h3>
            <p className="text-xs text-stone-500 mb-6">
              يتم حساب حالة المتجر (مفتوح الآن / مغلق حالياً) تلقائياً على صفحة الهاتف بناءً على هذا الجدول.
            </p>

            <div className="space-y-3">
              {formData.workingHours?.map((wh, idx) => (
                <div
                  key={wh.dayKey}
                  className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2 font-bold text-stone-900 w-24">
                    <span>{wh.day}</span>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={wh.isOpen}
                      onChange={(e) => {
                        const copy = [...formData.workingHours];
                        copy[idx].isOpen = e.target.checked;
                        setFormData({ ...formData, workingHours: copy });
                      }}
                      className="rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="font-semibold">{wh.isOpen ? 'مفتوح' : 'عطلة'}</span>
                  </label>

                  {wh.isOpen && (
                    <div className="flex items-center gap-2 dir-ltr">
                      <input
                        type="time"
                        value={wh.openTime}
                        onChange={(e) => {
                          const copy = [...formData.workingHours];
                          copy[idx].openTime = e.target.value;
                          setFormData({ ...formData, workingHours: copy });
                        }}
                        className="px-2 py-1 rounded-lg border border-stone-200 bg-white text-xs font-mono"
                      />
                      <span>-</span>
                      <input
                        type="time"
                        value={wh.closeTime}
                        onChange={(e) => {
                          const copy = [...formData.workingHours];
                          copy[idx].closeTime = e.target.value;
                          setFormData({ ...formData, workingHours: copy });
                        }}
                        className="px-2 py-1 rounded-lg border border-stone-200 bg-white text-xs font-mono"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-6 px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'جاري الحفظ...' : t.saveChanges}</span>
            </button>
          </div>
        )}

        {/* Tab 6: Products & Services */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-stone-900 text-lg">قائمة المنتجات والخدمات المعروضة</h3>
              <button
                onClick={() => setShowAddProduct(true)}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة منتج جديد</span>
              </button>
            </div>

            {/* Add Product Modal */}
            {showAddProduct && (
              <div className="bg-amber-50/60 p-5 rounded-3xl border border-amber-200 max-w-xl space-y-4">
                <h4 className="font-bold text-stone-900 text-sm">بيانات المنتج الجديد</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="اسم المنتج (مثال: تمر غروس معسل فاخر)"
                    value={newProduct.name || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs"
                  />
                  <input
                    type="number"
                    placeholder="السعر بالدينار (د.ج)"
                    value={newProduct.price || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                    className="px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs"
                  />
                </div>
                <input
                  type="text"
                  placeholder="التصنيف (مثال: تمور، مشروبات، قشابيات)"
                  value={newProduct.category || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs"
                />
                <input
                  type="text"
                  placeholder="رابط صورة المنتج (URL)"
                  value={newProduct.image || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs font-mono"
                />
                <textarea
                  placeholder="وصف مختصر للمنتج..."
                  value={newProduct.description || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-white text-xs"
                  rows={2}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddProduct}
                    className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs"
                  >
                    حفظ المنتج في القائمة
                  </button>
                  <button
                    onClick={() => setShowAddProduct(false)}
                    className="px-4 py-2 rounded-xl bg-stone-200 text-stone-800 font-bold text-xs"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            )}

            {/* Existing products list */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {formData.products?.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    {prod.image && (
                      <img src={prod.image} alt={prod.name} className="w-14 h-14 rounded-xl object-cover" />
                    )}
                    <div>
                      <h4 className="font-bold text-stone-900 text-xs sm:text-sm">{prod.name}</h4>
                      <p className="text-xs font-extrabold text-amber-700 mt-0.5">
                        {prod.price.toLocaleString()} د.ج
                      </p>
                      {prod.category && (
                        <span className="text-[10px] text-stone-400">{prod.category}</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteProduct(prod.id)}
                    className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
                    title="حذف المنتج"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {(!formData.products || formData.products.length === 0) && (
              <div className="text-center py-12 bg-white rounded-3xl border border-stone-200 text-stone-500 text-xs">
                لم تقم بإضافة أي منتجات حتى الآن. انقر على «إضافة منتج جديد» للبدء.
              </div>
            )}
          </div>
        )}

        {/* Tab 7: Special Offers */}
        {activeTab === 'offers' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-stone-900 text-lg">العروض والتخفيضات الترويجية</h3>
              <button
                onClick={() => setShowAddOffer(true)}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة عرض جديد</span>
              </button>
            </div>

            {showAddOffer && (
              <div className="bg-amber-50/60 p-5 rounded-3xl border border-amber-200 max-w-xl space-y-4">
                <h4 className="font-bold text-stone-900 text-sm">بيانات العرض الترويجي</h4>
                <input
                  type="text"
                  placeholder="عنوان العرض (مثال: عرض نهاية الأسبوع على التمور)"
                  value={newOffer.title || ''}
                  onChange={(e) => setNewOffer({ ...newOffer, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="نسبة التخفيض % (مثال: 20)"
                    value={newOffer.discountPercentage || ''}
                    onChange={(e) => setNewOffer({ ...newOffer, discountPercentage: Number(e.target.value) })}
                    className="px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs"
                  />
                  <input
                    type="date"
                    placeholder="صالح حتى تاريخ"
                    value={newOffer.validUntil || ''}
                    onChange={(e) => setNewOffer({ ...newOffer, validUntil: e.target.value })}
                    className="px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs"
                  />
                </div>
                <textarea
                  placeholder="تفاصيل وشروط العرض..."
                  value={newOffer.description || ''}
                  onChange={(e) => setNewOffer({ ...newOffer, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-white text-xs"
                  rows={2}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddOffer}
                    className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs"
                  >
                    نشر العرض
                  </button>
                  <button
                    onClick={() => setShowAddOffer(false)}
                    className="px-4 py-2 rounded-xl bg-stone-200 text-stone-800 font-bold text-xs"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3 max-w-xl">
              {formData.offers?.map((offer) => (
                <div
                  key={offer.id}
                  className="p-4 rounded-2xl bg-amber-600 text-white shadow-xs flex items-start justify-between gap-4"
                >
                  <div>
                    <span className="text-[11px] font-bold bg-white/20 px-2 py-0.5 rounded-full">
                      {offer.badge} • {offer.discountPercentage}%
                    </span>
                    <h4 className="font-extrabold text-base mt-1">{offer.title}</h4>
                    <p className="text-xs text-amber-50 mt-1">{offer.description}</p>
                    {offer.validUntil && (
                      <p className="text-[10px] text-amber-200 mt-2">صالح حتى: {offer.validUntil}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteOffer(offer.id)}
                    className="p-1.5 rounded-lg bg-black/20 hover:bg-black/30 text-white transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {(!formData.offers || formData.offers.length === 0) && (
              <div className="text-center py-12 bg-white rounded-3xl border border-stone-200 text-stone-500 text-xs">
                لا توجد عروض ترويجية منشورة حالياً.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
