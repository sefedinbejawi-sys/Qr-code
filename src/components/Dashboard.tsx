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
  ShieldCheck,
  XCircle,
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
    'analytics' | 'qr' | 'profile' | 'contact' | 'hours' | 'products' | 'offers' | 'preview'
  >('analytics');

  const [formData, setFormData] = useState<Store>(store);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);
  const [upgradeContact, setUpgradeContact] = useState('');
  const [upgradeNotes, setUpgradeNotes] = useState('');
  const [upgradeSubmitting, setUpgradeSubmitting] = useState(false);

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
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  formData.plan === 'business'
                    ? 'bg-stone-900 text-amber-400 border border-stone-800'
                    : formData.plan === 'pro'
                    ? 'bg-amber-600 text-white'
                    : 'bg-stone-200 text-stone-700'
                }`}>
                  باقة {formData.plan || 'free'}
                </span>
              </div>
              <p className="text-xs text-stone-500 dir-ltr font-mono">
                qr.myeloued.com/q/{formData.slug}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>ترقية الباقة</span>
            </button>

            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                activeTab === 'preview'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
              }`}
            >
              <Smartphone className="w-4 h-4 text-amber-700" />
              <span>معاينة حية للمتجر</span>
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
            { id: 'preview', label: 'معاينة حية للمتجر (هاتف)', icon: Smartphone },
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

            <div className="space-y-3 max-w-2xl">
              {formData.offers?.map((offer) => {
                const isActive = offer.isActive !== false;
                return (
                  <div
                    key={offer.id}
                    className={`p-4 rounded-2xl transition-all border ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white border-amber-600 shadow-sm'
                        : 'bg-stone-100 text-stone-600 border-stone-200'
                    } flex items-start justify-between gap-4`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                            isActive ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-600'
                          }`}
                        >
                          {offer.badge || 'عرض خاص'} • {offer.discountPercentage}% تخفيض
                        </span>
                        {isActive ? (
                          <span className="text-[10px] bg-emerald-500 text-white font-bold px-2 py-0.5 rounded-full">
                            نشط ويظهر في «عروض اليوم»
                          </span>
                        ) : (
                          <span className="text-[10px] bg-stone-300 text-stone-700 font-bold px-2 py-0.5 rounded-full">
                            معطل مؤقتاً
                          </span>
                        )}
                      </div>
                      <h4 className="font-extrabold text-base mt-1">{offer.title}</h4>
                      <p className={`text-xs mt-1 ${isActive ? 'text-amber-50' : 'text-stone-500'}`}>
                        {offer.description}
                      </p>
                      {offer.validUntil && (
                        <p
                          className={`text-[10px] mt-2 ${
                            isActive ? 'text-amber-200' : 'text-stone-400'
                          }`}
                        >
                          صالح حتى: {offer.validUntil}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const updated = (formData.offers || []).map((o) =>
                            o.id === offer.id ? { ...o, isActive: !isActive } : o
                          );
                          setFormData({ ...formData, offers: updated });
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                          isActive
                            ? 'bg-white text-amber-800 hover:bg-amber-50'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {isActive ? 'إيقاف مؤقت' : 'تفعيل العرض'}
                      </button>
                      <button
                        onClick={() => handleDeleteOffer(offer.id)}
                        className="p-1.5 rounded-lg bg-black/20 hover:bg-black/30 text-white transition-colors"
                        title="حذف العرض"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {(!formData.offers || formData.offers.length === 0) && (
              <div className="text-center py-12 bg-white rounded-3xl border border-stone-200 text-stone-500 text-xs">
                لا توجد عروض ترويجية منشورة حالياً. انقر على «إضافة عرض جديد» لتظهر في قسم «عروض اليوم» في ولاية الوادي.
              </div>
            )}
          </div>
        )}

        {/* Tab 8: Live Store Smartphone Preview */}
        {activeTab === 'preview' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-100">
              <div>
                <h3 className="font-extrabold text-stone-900 text-lg flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-amber-600" />
                  <span>معاينة حية وتفاعلية لصفحة المحل على الهاتف</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  هكذا تظهر صفحة محلك بالضبط أمام الزبائن عند مسح رمز الـ QR أو النقر على الرابط في ولاية الوادي.
                </p>
              </div>

              <button
                onClick={() => onViewPublicPage(formData.slug, formData)}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <ExternalLink className="w-4 h-4" />
                <span>فتح في شاشة كاملة</span>
              </button>
            </div>

            {/* Centered Smartphone Frame */}
            <div className="flex justify-center">
              <div className="relative w-full max-w-[360px] sm:max-w-[380px] bg-stone-950 rounded-[44px] p-3.5 shadow-2xl border-4 border-stone-800 ring-1 ring-black">
                {/* Dynamic Island */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-30 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-stone-900 border border-stone-800 mr-2" />
                  <div className="w-2 h-2 rounded-full bg-blue-950/70" />
                </div>

                {/* Simulated Screen Body */}
                <div className="relative bg-[#FAF7F2] rounded-[34px] overflow-hidden h-[620px] overflow-y-auto scrollbar-none text-[#1C1917] text-right">
                  {/* Cover */}
                  <div className="relative h-32 w-full bg-stone-900">
                    <img
                      src={formData.coverImage}
                      alt={formData.name}
                      className="w-full h-full object-cover opacity-85"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#FAF7F2] via-transparent to-black/30" />
                  </div>

                  {/* Profile Header */}
                  <div className="px-4 -mt-12 flex flex-col items-center text-center">
                    <div className="relative w-20 h-20 rounded-full bg-white p-1 shadow-lg border-2 border-amber-500 overflow-hidden mb-2">
                      <img
                        src={formData.logo}
                        alt={formData.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 text-sm font-extrabold text-stone-900">
                      <span>{formData.name}</span>
                      {formData.verified && (
                        <ShieldCheck className="w-4 h-4 text-amber-600" />
                      )}
                    </div>

                    <p className="text-xs text-stone-500 mt-0.5">
                      {formData.commune} • ولاية الوادي
                    </p>

                    <p className="text-[11px] text-stone-600 mt-2 px-2 text-center leading-relaxed">
                      {formData.description}
                    </p>

                    {/* Action Buttons Grid */}
                    <div className="grid grid-cols-3 gap-2 w-full mt-4">
                      <a
                        href={`tel:${formData.phone}`}
                        className="p-2.5 rounded-xl bg-white border border-stone-200 text-stone-800 text-[11px] font-bold flex flex-col items-center hover:bg-stone-50 transition-colors shadow-2xs"
                      >
                        <Phone className="w-4 h-4 text-blue-600 mb-1" />
                        <span>اتصال</span>
                      </a>
                      <a
                        href={`https://wa.me/${formData.whatsapp || formData.phone}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-xl bg-emerald-600 text-white text-[11px] font-bold flex flex-col items-center hover:bg-emerald-700 transition-colors shadow-sm"
                      >
                        <Phone className="w-4 h-4 text-white mb-1" />
                        <span>واتساب</span>
                      </a>
                      <a
                        href={formData.location?.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(formData.address + ' ' + formData.commune)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-xl bg-white border border-stone-200 text-stone-800 text-[11px] font-bold flex flex-col items-center hover:bg-stone-50 transition-colors shadow-2xs"
                      >
                        <MapPin className="w-4 h-4 text-amber-600 mb-1" />
                        <span>الخريطة</span>
                      </a>
                    </div>

                    {/* Active Offers Section inside preview */}
                    {formData.offers && formData.offers.filter((o) => o.isActive !== false).length > 0 && (
                      <div className="w-full mt-4 text-right">
                        <span className="text-[11px] font-black text-amber-900 block mb-1.5">
                          العروض النشطة:
                        </span>
                        {formData.offers
                          .filter((o) => o.isActive !== false)
                          .map((offer) => (
                            <div
                              key={offer.id}
                              className="p-2.5 rounded-xl bg-amber-600 text-white text-[11px] mb-1.5 shadow-xs"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-black">{offer.title}</span>
                                <span className="bg-white/20 px-1.5 py-0.2 rounded font-bold">
                                  {offer.discountPercentage}%
                                </span>
                              </div>
                              <p className="text-[10px] text-amber-100 mt-0.5">{offer.description}</p>
                            </div>
                          ))}
                      </div>
                    )}

                    {/* Products Grid inside preview */}
                    {formData.products && formData.products.length > 0 && (
                      <div className="w-full mt-4 text-right">
                        <span className="text-[11px] font-black text-stone-800 block mb-2">
                          قائمة المنتجات ({formData.products.length}):
                        </span>
                        <div className="space-y-2">
                          {formData.products.slice(0, 4).map((p) => (
                            <div
                              key={p.id}
                              className="p-2 rounded-xl bg-white border border-stone-200 flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-2">
                                {p.image && (
                                  <img
                                    src={p.image}
                                    alt={p.name}
                                    className="w-10 h-10 rounded-lg object-cover"
                                  />
                                )}
                                <div>
                                  <div className="font-bold text-stone-900 text-[11px]">{p.name}</div>
                                  <div className="text-[10px] text-stone-400">{p.category}</div>
                                </div>
                              </div>
                              <span className="font-black text-amber-700 text-[11px]">
                                {p.price.toLocaleString()} د.ج
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Footer branding inside mobile */}
                    <div className="my-6 text-[10px] text-stone-400 flex items-center gap-1 font-mono">
                      <span>MY El Oued QR • ولاية الوادي</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upgrade Request Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 relative shadow-2xl border border-stone-200">
            <button
              onClick={() => {
                setShowUpgradeModal(false);
                setUpgradeSuccess(false);
              }}
              className="absolute top-4 left-4 p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>

            {upgradeSuccess ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-stone-900 mb-2">تم تسجيل طلب الترقية!</h3>
                <p className="text-xs text-stone-600 leading-relaxed mb-6">
                  سيتواصل معك فريق MY El Oued لتفعيل ميزات باقتك وتجهيز لافتات الـ QR لطاولات المحل.
                </p>
                <button
                  onClick={() => {
                    setShowUpgradeModal(false);
                    setUpgradeSuccess(false);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-600 text-white font-bold text-xs"
                >
                  حسناً، إغلاق
                </button>
              </div>
            ) : (
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                  <span>ترقية حساب محل {formData.name}</span>
                </div>
                <h3 className="text-xl font-black text-stone-900 mb-1">
                  اختر باقة الترقية المناسبة
                </h3>
                <p className="text-xs text-stone-600 mb-5 leading-relaxed">
                  احصل على ظهور في صدارة دليل محلات الوادي، وتخصيص هوية الـ QR، وطباعة الستاندات الأكريليك.
                </p>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!upgradeContact) return;
                    setUpgradeSubmitting(true);
                    try {
                      await api.requestUpgrade(formData.slug, {
                        plan: 'business',
                        contact: upgradeContact,
                        notes: upgradeNotes,
                      });
                      setUpgradeSuccess(true);
                    } catch (err) {
                      console.error(err);
                    } finally {
                      setUpgradeSubmitting(false);
                    }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      رقم الهاتف أو الواتساب للتواصل *
                    </label>
                    <input
                      type="tel"
                      required
                      value={upgradeContact}
                      onChange={(e) => setUpgradeContact(e.target.value)}
                      placeholder={formData.phone || '0661 00 00 00'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      ملاحظات أو طلبات خاصة (اختياري)
                    </label>
                    <textarea
                      rows={2}
                      value={upgradeNotes}
                      onChange={(e) => setUpgradeNotes(e.target.value)}
                      placeholder="طلب باقة Business أو تصميم خاص للمطبوعات..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={upgradeSubmitting}
                    className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {upgradeSubmitting ? (
                      <span>جاري الإرسال...</span>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>إرسال طلب الترقية الآن</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

