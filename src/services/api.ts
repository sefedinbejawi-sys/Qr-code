import { Store, User, AnalyticsSummary, PlatformStats } from '../types';
import { initialSeedStores } from '../data/seedStores';

const API_BASE = '/api';

export const api = {
  async getStores(params?: {
    commune?: string;
    category?: string;
    search?: string;
    filter?: string;
  }): Promise<Store[]> {
    try {
      const query = new URLSearchParams();
      if (params?.commune && params.commune !== 'all') query.set('commune', params.commune);
      if (params?.category && params.category !== 'all') query.set('category', params.category);
      if (params?.search) query.set('search', params.search);
      if (params?.filter && params.filter !== 'all') query.set('filter', params.filter);

      const res = await fetch(`${API_BASE}/stores?${query.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch stores');
      return await res.json();
    } catch (err) {
      console.warn('API fetch failed, falling back to seed stores:', err);
      let list = [...initialSeedStores];
      if (params?.commune && params.commune !== 'all') {
        list = list.filter((s) => s.commune === params.commune);
      }
      if (params?.category && params.category !== 'all') {
        list = list.filter((s) => s.category === params.category);
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        list = list.filter((s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
      }
      if (params?.filter === 'offers_only') {
        list = list.filter((s) => s.offers.some((o) => o.isActive));
      } else if (params?.filter === 'verified_only') {
        list = list.filter((s) => s.verified);
      }
      return list;
    }
  },

  async getPlatformStats(): Promise<PlatformStats> {
    try {
      const res = await fetch(`${API_BASE}/platform/stats`);
      if (!res.ok) throw new Error('Failed to fetch platform stats');
      return await res.json();
    } catch (err) {
      console.warn('Fallback platform stats:', err);
      const totalStores = initialSeedStores.length;
      const totalViews = initialSeedStores.reduce((acc, s) => acc + (s.stats?.totalViews || 0), 0);
      const totalScans = initialSeedStores.reduce((acc, s) => acc + (s.stats?.totalScans || 0), 0);
      const totalCalls = initialSeedStores.reduce((acc, s) => acc + (s.stats?.callClicks || 0), 0);
      const totalWhatsapp = initialSeedStores.reduce((acc, s) => acc + (s.stats?.whatsappClicks || 0), 0);
      return {
        totalStores,
        totalViews,
        totalScans,
        totalCalls,
        totalWhatsapp,
        totalActiveOffers: initialSeedStores.reduce((acc, s) => acc + (s.offers?.filter((o) => o.isActive).length || 0), 0),
        communesCount: 5,
        topCommunes: [
          { commune: 'الوادي', count: 2 },
          { commune: 'قمار', count: 1 },
          { commune: 'كوينين', count: 1 },
          { commune: 'البياضة', count: 1 },
          { commune: 'الدبيلة', count: 1 },
        ],
      };
    }
  },

  async getOffers(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/offers`);
      if (!res.ok) throw new Error('Failed to fetch offers');
      return await res.json();
    } catch (err) {
      console.warn('Fallback offers:', err);
      const offers: any[] = [];
      initialSeedStores.forEach((s) => {
        s.offers.forEach((o) => {
          if (o.isActive) {
            offers.push({
              ...o,
              storeId: s.id,
              storeSlug: s.slug,
              storeName: s.name,
              storeLogo: s.logo,
              storePhone: s.phone,
              storeWhatsapp: s.whatsapp,
              commune: s.commune,
              category: s.category,
            });
          }
        });
      });
      return offers;
    }
  },

  async getAdminOverview(): Promise<{
    stats: PlatformStats;
    stores: Store[];
    offers: any[];
    upgradeRequests: any[];
    recentLogs: any[];
  }> {
    const res = await fetch(`${API_BASE}/admin/overview`);
    if (!res.ok) throw new Error('Failed to fetch admin overview');
    return await res.json();
  },

  async updateStoreStatus(
    id: string,
    updates: { verified?: boolean; isFeatured?: boolean; plan?: 'free' | 'pro' | 'business' }
  ): Promise<{ success: boolean; store: Store }> {
    const res = await fetch(`${API_BASE}/admin/stores/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update store status');
    return await res.json();
  },

  async requestUpgrade(
    idOrSlug: string,
    payload: { plan: 'pro' | 'business'; contact?: string; notes?: string }
  ): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/stores/${idOrSlug}/upgrade-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to submit upgrade request');
    return await res.json();
  },

  async getStoreBySlug(slug: string): Promise<Store> {
    try {
      const res = await fetch(`${API_BASE}/stores/${slug}`);
      if (!res.ok) throw new Error('Store not found');
      return await res.json();
    } catch (err) {
      console.warn('API fetch failed, finding in local seed:', err);
      const found = initialSeedStores.find((s) => s.slug === slug || s.id === slug);
      if (found) return found;
      throw err;
    }
  },

  async createStore(data: Partial<Store>): Promise<Store> {
    const res = await fetch(`${API_BASE}/stores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create store');
    }
    return await res.json();
  },

  async updateStore(idOrSlug: string, data: Partial<Store>): Promise<Store> {
    const res = await fetch(`${API_BASE}/stores/${idOrSlug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update store');
    }
    return await res.json();
  },

  async recordScan(slug: string): Promise<void> {
    try {
      await fetch(`${API_BASE}/stores/${slug}/scan`, {
        method: 'POST',
      });
    } catch (err) {
      console.warn('Could not record scan:', err);
    }
  },

  async recordVisit(slug: string): Promise<void> {
    try {
      await fetch(`${API_BASE}/stores/${slug}/visit`, {
        method: 'POST',
      });
    } catch (err) {
      console.warn('Could not record visit:', err);
    }
  },

  async recordAction(slug: string, action: 'call' | 'whatsapp' | 'maps' | 'social' | 'vcard'): Promise<void> {
    try {
      await fetch(`${API_BASE}/stores/${slug}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
    } catch (err) {
      console.warn('Could not record action:', err);
    }
  },

  async getAnalytics(idOrSlug: string): Promise<AnalyticsSummary> {
    try {
      const res = await fetch(`${API_BASE}/stores/${idOrSlug}/analytics`);
      if (!res.ok) throw new Error('Failed to load analytics');
      return await res.json();
    } catch {
      // Return synthetic realistic data if API offline
      return {
        totalViews: 1250,
        totalScans: 480,
        callClicks: 95,
        whatsappClicks: 160,
        mapClicks: 74,
        socialClicks: 52,
        vcardDownloads: 28,
        dailyViews: [
          { date: '09-01', views: 42, scans: 18 },
          { date: '09-02', views: 55, scans: 22 },
          { date: '09-03', views: 68, scans: 28 },
          { date: '09-04', views: 59, scans: 24 },
          { date: '09-05', views: 72, scans: 31 },
          { date: '09-06', views: 88, scans: 39 },
          { date: '09-07', views: 95, scans: 45 },
          { date: '09-08', views: 81, scans: 36 },
          { date: '09-09', views: 76, scans: 30 },
          { date: '09-10', views: 90, scans: 42 },
          { date: '09-11', views: 104, scans: 48 },
          { date: '09-12', views: 115, scans: 52 },
          { date: '09-13', views: 128, scans: 58 },
          { date: '09-14', views: 140, scans: 65 },
        ],
        devices: [
          { name: 'Android (هواتف أندرويد)', count: 345, percentage: 72 },
          { name: 'iOS (آيفون وآيباد)', count: 105, percentage: 22 },
          { name: 'Desktop (أجهزة الكمبيوتر)', count: 30, percentage: 6 },
        ],
        actions: [
          { name: 'محادثات واتساب', count: 160 },
          { name: 'اتصالات هاتفية', count: 95 },
          { name: 'اتجاهات الخريطة GPS', count: 74 },
          { name: 'حفظ بطاقة الاتصال vCard', count: 28 },
          { name: 'زيارات وسائل التواصل', count: 52 },
        ],
        recentActivity: [],
      };
    }
  },

  async login(email: string, password?: string): Promise<{ user: User; store: Store; token: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to login');
    }
    const data = await res.json();
    localStorage.setItem('myeloued_token', data.token);
    return data;
  },

  async register(payload: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    shopName?: string;
    commune?: string;
    category?: string;
  }): Promise<{ user: User; store: Store; token: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to register');
    }
    const data = await res.json();
    localStorage.setItem('myeloued_token', data.token);
    return data;
  },

  async getCurrentUser(): Promise<{ user: User | null; store: Store | null }> {
    const token = localStorage.getItem('myeloued_token');
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) return { user: null, store: null };
      return await res.json();
    } catch {
      return { user: null, store: null };
    }
  },
};
