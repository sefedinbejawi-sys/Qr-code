import React, { useState, useEffect } from 'react';
import { Store, Language, PlanTier } from '../types';
import { api } from '../services/api';
import {
  ShieldCheck,
  Store as StoreIcon,
  Crown,
  Eye,
  Scan,
  Phone,
  MessageCircle,
  Tag,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Search,
  Filter,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  Clock,
  MapPin,
  Calendar,
} from 'lucide-react';

interface AdminDashboardProps {
  lang?: Language;
  onViewStore: (slug: string, store?: Store) => void;
  onBackToApp: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  lang = 'ar',
  onViewStore,
  onBackToApp,
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPlan, setFilterPlan] = useState('all');
  const [updatingStoreId, setUpdatingStoreId] = useState<string | null>(null);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminOverview();
      setData(res);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleToggleVerified = async (store: Store) => {
    setUpdatingStoreId(store.id);
    try {
      await api.updateStoreStatus(store.id, { verified: !store.verified });
      await loadAdminData();
    } catch (err) {
      console.error('Failed to update verification:', err);
    } finally {
      setUpdatingStoreId(null);
    }
  };

  const handleToggleFeatured = async (store: Store) => {
    setUpdatingStoreId(store.id);
    try {
      await api.updateStoreStatus(store.id, { isFeatured: !store.isFeatured });
      await loadAdminData();
    } catch (err) {
      console.error('Failed to update featured status:', err);
    } finally {
      setUpdatingStoreId(null);
    }
  };

  const handleChangePlan = async (store: Store, newPlan: PlanTier) => {
    setUpdatingStoreId(store.id);
    try {
      await api.updateStoreStatus(store.id, { plan: newPlan });
      await loadAdminData();
    } catch (err) {
      console.error('Failed to update plan:', err);
    } finally {
      setUpdatingStoreId(null);
    }
  };

  const filteredStores: Store[] = (data?.stores || []).filter((s: Store) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.commune.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.slug.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat = filterCategory === 'all' || s.category === filterCategory;
    const matchesPlan = filterPlan === 'all' || s.plan === filterPlan;

    return matchesSearch && matchesCat && matchesPlan;
  });

  return (
    <div className="min-h-screen bg-[#F7F4EE] pb-24 antialiased text-stone-900">
      {/* Top Admin Navigation Header */}
      <div className="bg-stone-900 text-white sticky top-0 z-30 px-4 sm:px-6 lg:px-8 py-3.5 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-black">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm sm:text-base text-white">
                  لوحة تحكم منصة MY El Oued QR المركزية
                </h1>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold px-2 py-0.5 rounded-full">
                  الإدارة التقنية • ولاية الوادي
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                إدارة المحلات، التحقق، الصدارة في الدليل، وطلبات الترقية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadAdminData}
              disabled={loading}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold transition-colors flex items-center gap-1.5"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
              <span className="hidden sm:inline">تحديث</span>
            </button>
            <button
              onClick={onBackToApp}
              className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors"
            >
              العودة إلى الموقع
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* 1. Global Metrics Overview */}
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-stone-500 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-600" />
            <span>إحصائيات المنصة الإجمالية المباشرة (ولاية الوادي)</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-stone-500">المحلات المسجلة</span>
              <div className="text-2xl font-black text-stone-900 mt-1">
                {data?.stats?.totalStores || 0}
              </div>
              <span className="text-[10px] text-amber-700 font-semibold mt-1 block">
                نشاط تجاري موثق
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-stone-500">إجمالي الزيارات</span>
              <div className="text-2xl font-black text-stone-900 mt-1">
                {data?.stats?.totalViews?.toLocaleString() || 0}
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">
                زيارة حقيقية
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-stone-500">مسح رموز QR</span>
              <div className="text-2xl font-black text-amber-700 mt-1">
                {data?.stats?.totalScans?.toLocaleString() || 0}
              </div>
              <span className="text-[10px] text-amber-600 font-semibold mt-1 block">
                عبر كاميرا الهاتف
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-stone-500">محادثات WhatsApp</span>
              <div className="text-2xl font-black text-emerald-700 mt-1">
                {data?.stats?.totalWhatsappClicks?.toLocaleString() || 0}
              </div>
              <span className="text-[10px] text-stone-500 mt-1 block">تحويل لطلب مباشر</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-stone-500">العروض النشطة</span>
              <div className="text-2xl font-black text-rose-700 mt-1">
                {data?.stats?.activeOffers || 0}
              </div>
              <span className="text-[10px] text-stone-500 mt-1 block">في «عروض اليوم»</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-stone-500">طلبات الترقية</span>
              <div className="text-2xl font-black text-blue-700 mt-1">
                {data?.stats?.totalUpgradeRequests || 0}
              </div>
              <span className="text-[10px] text-blue-600 font-semibold mt-1 block">
                {data?.stats?.pendingUpgradeRequests || 0} قيد المتابعة
              </span>
            </div>
          </div>
        </div>

        {/* 2. Upgrade Requests from Merchants */}
        {data?.upgradeRequests && data.upgradeRequests.length > 0 && (
          <div className="bg-white rounded-3xl border border-amber-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-600" />
                <h3 className="font-extrabold text-stone-900 text-base">
                  طلبات ترقية الباقات الواردة من التجار ({data.upgradeRequests.length})
                </h3>
              </div>
              <span className="text-xs bg-amber-100 text-amber-900 font-bold px-3 py-1 rounded-full">
                مباشرة من أصحاب المحلات
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.upgradeRequests.map((req: any) => (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200 text-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-extrabold text-stone-900 text-sm">{req.storeSlug}</span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-600 text-white font-black text-[10px] uppercase">
                        باقة {req.plan}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-stone-700 font-semibold mb-1">
                      <Phone className="w-3.5 h-3.5 text-amber-700" />
                      <span>{req.contact}</span>
                    </div>
                    {req.notes && (
                      <p className="text-stone-500 italic mt-1 border-t border-amber-200/50 pt-1">
                        «{req.notes}»
                      </p>
                    )}
                  </div>
                  <div className="mt-3 pt-2 border-t border-amber-200/60 flex items-center justify-between text-[11px]">
                    <span className="text-stone-400">
                      {req.createdAt ? new Date(req.createdAt).toLocaleDateString('ar-DZ') : 'حديثاً'}
                    </span>
                    <a
                      href={`https://wa.me/${req.contact?.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>مراسلة عبر واتساب</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Stores Management Grid with Instant Actions */}
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-stone-900 text-lg flex items-center gap-2">
                <StoreIcon className="w-5 h-5 text-amber-600" />
                <span>إدارة ومراقبة محلات ولاية الوادي ({filteredStores.length})</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                تفعيل شارة التحقق (Verified)، تثبيت المحل في الصدارة (Featured)، وتغيير الباقة
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="بحث عن محل، بلدية..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-9 pl-3 py-1.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-stone-200 text-xs font-semibold bg-white"
              >
                <option value="all">كل النشاطات</option>
                <option value="dates">تمور ومنتجات صحراوية</option>
                <option value="food">مطاعم ومقاهي</option>
                <option value="electronics">هواتف وإلكترونيات</option>
                <option value="crafts">أزياء وقشابيات</option>
                <option value="fashion">ألبسة</option>
                <option value="health">صحة وصيدلة</option>
                <option value="building">مواد بناء</option>
              </select>

              <select
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-stone-200 text-xs font-semibold bg-white"
              >
                <option value="all">كل الباقات</option>
                <option value="free">باقة مجانية Free</option>
                <option value="pro">باقة Pro</option>
                <option value="business">باقة Business</option>
              </select>
            </div>
          </div>

          {/* Table of Stores */}
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 font-bold">
                  <th className="py-3 px-3">المحل التجاري</th>
                  <th className="py-3 px-3">البلدية</th>
                  <th className="py-3 px-3">الباقة</th>
                  <th className="py-3 px-3 text-center">التحقق (Verified)</th>
                  <th className="py-3 px-3 text-center">الصدارة (Featured)</th>
                  <th className="py-3 px-3 text-center">الإحصائيات</th>
                  <th className="py-3 px-3 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredStores.map((s) => {
                  const isUpdating = updatingStoreId === s.id;
                  return (
                    <tr key={s.id} className="hover:bg-stone-50/60 transition-colors">
                      {/* Store info */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={s.logo}
                            alt={s.name}
                            className="w-10 h-10 rounded-xl object-cover border border-stone-200 shrink-0"
                          />
                          <div>
                            <div className="font-extrabold text-stone-900 flex items-center gap-1.5">
                              <span>{s.name}</span>
                              {s.verified && (
                                <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              )}
                            </div>
                            <span className="text-[11px] text-stone-400 font-mono">
                              /q/{s.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Commune */}
                      <td className="py-3.5 px-3 text-stone-600 font-semibold">
                        {s.commune}
                      </td>

                      {/* Plan selector */}
                      <td className="py-3.5 px-3">
                        <select
                          disabled={isUpdating}
                          value={s.plan || 'free'}
                          onChange={(e) => handleChangePlan(s, e.target.value as PlanTier)}
                          className={`text-xs font-black px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                            s.plan === 'business'
                              ? 'bg-stone-900 text-amber-400 border-stone-800'
                              : s.plan === 'pro'
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-stone-100 text-stone-700 border-stone-200'
                          }`}
                        >
                          <option value="free">Free مجاني</option>
                          <option value="pro">Pro محترف</option>
                          <option value="business">Business مميز</option>
                        </select>
                      </td>

                      {/* Verified Toggle */}
                      <td className="py-3.5 px-3 text-center">
                        <button
                          disabled={isUpdating}
                          onClick={() => handleToggleVerified(s)}
                          className={`px-2.5 py-1 rounded-lg font-bold text-[11px] inline-flex items-center gap-1 transition-all ${
                            s.verified
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                          }`}
                        >
                          {s.verified ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>موثق</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-stone-400" />
                              <span>غير موثق</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Featured Toggle */}
                      <td className="py-3.5 px-3 text-center">
                        <button
                          disabled={isUpdating}
                          onClick={() => handleToggleFeatured(s)}
                          className={`px-2.5 py-1 rounded-lg font-bold text-[11px] inline-flex items-center gap-1 transition-all ${
                            s.isFeatured
                              ? 'bg-amber-500 text-stone-950 hover:bg-amber-400 shadow-xs'
                              : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{s.isFeatured ? 'في الصدارة ★' : 'عادي'}</span>
                        </button>
                      </td>

                      {/* Real Stats */}
                      <td className="py-3.5 px-3 text-center font-mono text-[11px]">
                        <span className="text-amber-700 font-bold">{s.stats?.totalScans || 0} مسح</span>
                        <span className="text-stone-300 mx-1">|</span>
                        <span className="text-stone-600">{s.stats?.totalViews || 0} زيارة</span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-3 text-center">
                        <button
                          onClick={() => onViewStore(s.slug, s)}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-amber-100 hover:text-amber-800 text-stone-700 transition-colors"
                          title="معاينة الصفحة العامة"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
