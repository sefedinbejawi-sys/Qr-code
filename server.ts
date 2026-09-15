import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { initialSeedStores } from './src/data/seedStores';
import { Store, User, ScanLog, AnalyticsSummary, PlatformStats } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Persistent JSON Database path
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface DatabaseSchema {
  stores: Store[];
  users: User[];
  logs: ScanLog[];
  upgradeRequests?: { id: string; storeId: string; plan: string; contact: string; notes?: string; date: string }[];
}

// Initial demo users
const initialUsers: User[] = [
  {
    id: 'user_admin_00',
    name: 'مدير منصة MY El Oued',
    email: 'admin@myeloued.com',
    phone: '0661003939',
    storeIds: ['store_el_ghars_01', 'store_cafe_palmeraie_02', 'store_electronics_03'],
    token: 'token_admin_eloued_super',
    role: 'admin',
  },
  {
    id: 'user_merchant_01',
    name: 'أحمد بن عمار السوفي',
    email: 'ahmed@eloued.dz',
    phone: '0661348291',
    storeIds: ['store_el_ghars_01'],
    token: 'token_demo_ahmed_souf',
    role: 'merchant',
  },
  {
    id: 'user_merchant_02',
    name: 'سفيان بالواحة',
    email: 'soufiane@guemar.dz',
    phone: '0672891140',
    storeIds: ['store_cafe_palmeraie_02'],
    token: 'token_demo_soufiane_guemar',
    role: 'merchant',
  },
  {
    id: 'user_merchant_03',
    name: 'ياسين رمال تك',
    email: 'yacine@sandtech.dz',
    phone: '0658994432',
    storeIds: ['store_electronics_03'],
    token: 'token_demo_yacine_tech',
    role: 'merchant',
  },
];

// Helper to load or initialize DB
function loadDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed.stores && Array.isArray(parsed.stores)) {
        // Sync any new seed stores that aren't in the saved DB yet
        const existingIds = new Set(parsed.stores.map((s: Store) => s.id));
        let changed = false;
        for (const seed of initialSeedStores) {
          if (!existingIds.has(seed.id)) {
            parsed.stores.push(seed);
            changed = true;
          }
        }
        // Ensure admin user exists
        if (!parsed.users || !parsed.users.some((u: User) => u.email === 'admin@myeloued.com')) {
          parsed.users = [...initialUsers, ...(parsed.users || [])];
          changed = true;
        }
        if (!parsed.upgradeRequests) {
          parsed.upgradeRequests = [];
          changed = true;
        }
        if (changed) {
          saveDb(parsed);
        }
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading DB file, using initial defaults:', err);
  }

  // Create initial seed logs for realistic real statistics
  const seedLogs: ScanLog[] = [];
  const now = new Date();
  const devices: ('iOS' | 'Android' | 'Desktop')[] = ['Android', 'Android', 'Android', 'iOS', 'iOS', 'Desktop'];

  initialSeedStores.forEach((store) => {
    for (let i = 0; i < 30; i++) {
      const d = new Date(now.getTime() - (29 - i) * 86400000);
      const dayScans = Math.floor(Math.random() * 25) + 5;
      const dayViews = Math.floor(Math.random() * 45) + 15;

      for (let s = 0; s < dayScans; s++) {
        seedLogs.push({
          id: `log_scan_${store.id}_${i}_${s}`,
          storeId: store.id,
          type: 'scan',
          timestamp: new Date(d.getTime() + Math.random() * 80000000).toISOString(),
          device: devices[Math.floor(Math.random() * devices.length)],
          city: store.commune,
        });
      }

      for (let v = 0; v < dayViews; v++) {
        seedLogs.push({
          id: `log_view_${store.id}_${i}_${v}`,
          storeId: store.id,
          type: 'view',
          timestamp: new Date(d.getTime() + Math.random() * 80000000).toISOString(),
          device: devices[Math.floor(Math.random() * devices.length)],
          city: store.commune,
        });
      }
    }
  });

  const initialDb: DatabaseSchema = {
    stores: initialSeedStores,
    users: initialUsers,
    logs: seedLogs,
    upgradeRequests: [],
  };

  saveDb(initialDb);
  return initialDb;
}

function saveDb(db: DatabaseSchema) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving DB file:', err);
  }
}

let db = loadDb();

// Detect device from User-Agent
function detectDevice(userAgent?: string): 'iOS' | 'Android' | 'Desktop' | 'Other' {
  if (!userAgent) return 'Android';
  if (/iPad|iPhone|iPod/.test(userAgent)) return 'iOS';
  if (/Android/.test(userAgent)) return 'Android';
  if (/Windows|Macintosh|Linux/.test(userAgent)) return 'Desktop';
  return 'Other';
}

// -------------------------------------------------------------
// API Routes
// -------------------------------------------------------------

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'MY El Oued QR',
    wilaya: 'El Oued (39)',
    timestamp: new Date().toISOString(),
    storesCount: db.stores.length,
  });
});

// Auth: Register
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, phone, password, shopName, commune, category } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'يرجى ملء جميع الحقول الإلزامية' });
  }

  const existingUser = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.status(400).json({ error: 'البريد الإلكتروني مسجل مسبقاً' });
  }

  const userId = `user_${Date.now()}`;
  const token = `token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  let newStore: Store | null = null;

  if (shopName) {
    const slugBase = shopName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
      .replace(/^-+|-+$/g, '') || `store-${Date.now()}`;
    
    let slug = slugBase;
    let counter = 1;
    while (db.stores.some((s) => s.slug === slug)) {
      slug = `${slugBase}-${counter++}`;
    }

    newStore = {
      id: `store_${Date.now()}`,
      userId,
      slug,
      name: shopName,
      category: category || 'other',
      commune: commune || 'الوادي',
      address: `وسط مدينة ${commune || 'الوادي'}، ولاية الوادي`,
      description: `مرحباً بكم في ${shopName} بمدينة ${commune || 'الوادي'}. نسعد بخدمتكم وتوفير أفضل المنتجات والخدمات مع تواصل فوري.`,
      logo: 'https://images.unsplash.com/photo-1596797882870-8c33deeac224?w=300&auto=format&fit=crop&q=80',
      coverImage: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1200&auto=format&fit=crop&q=80',
      phone,
      whatsapp: phone.replace(/^0/, '213').replace(/[^0-9]/g, ''),
      whatsappMessage: `السلام عليكم، تواصلت معكم عبر منصة MY El Oued QR وأود الاستفسار عن خدمات ${shopName}.`,
      socialLinks: {},
      location: {
        lat: 33.3678,
        lng: 6.8642,
        googleMapsUrl: `https://maps.google.com/?q=33.3678,6.8642`,
        landmark: `بجوار المركز التجاري ${commune || 'الوادي'}`,
      },
      workingHours: [
        { day: 'السبت', dayKey: 'sat', isOpen: true, openTime: '08:00', closeTime: '20:30' },
        { day: 'الأحد', dayKey: 'sun', isOpen: true, openTime: '08:00', closeTime: '20:30' },
        { day: 'الإثنين', dayKey: 'mon', isOpen: true, openTime: '08:00', closeTime: '20:30' },
        { day: 'الثلاثاء', dayKey: 'tue', isOpen: true, openTime: '08:00', closeTime: '20:30' },
        { day: 'الأربعاء', dayKey: 'wed', isOpen: true, openTime: '08:00', closeTime: '20:30' },
        { day: 'الخميس', dayKey: 'thu', isOpen: true, openTime: '08:00', closeTime: '21:00' },
        { day: 'الجمعة', dayKey: 'fri', isOpen: true, openTime: '15:00', closeTime: '21:00' },
      ],
      products: [],
      offers: [],
      gallery: [],
      qrConfig: {
        frameStyle: 'golden_dune',
        color: '#D97706',
        bgColor: '#FFFFFF',
        centerLogo: true,
        customLabel: `امسح لزيارة ${shopName}`,
        cornerStyle: 'rounded',
      },
      plan: 'free',
      verified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: {
        totalViews: 1,
        totalScans: 0,
        callClicks: 0,
        whatsappClicks: 0,
        mapClicks: 0,
        socialClicks: 0,
        vcardDownloads: 0,
      },
    };

    db.stores.unshift(newStore);
  }

  const newUser: User = {
    id: userId,
    name,
    email,
    phone,
    storeIds: newStore ? [newStore.id] : [],
    token,
  };

  db.users.push(newUser);
  saveDb(db);

  res.json({
    user: newUser,
    store: newStore,
    token,
  });
});

// Auth: Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'يرجى إدخال البريد الإلكتروني' });
  }

  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'البريد الإلكتروني غير مسجل، يمكنك إنشاء حساب جديد مجاناً' });
  }

  // Demo / Simple auth verification
  const userStore = db.stores.find((s) => user.storeIds.includes(s.id)) || db.stores[0];

  res.json({
    user,
    store: userStore,
    token: user.token,
  });
});

// Auth: Me (Verify token or get current user)
app.get('/api/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    // Return default demo user if not logged in
    return res.json({ user: db.users[0], store: db.stores[0] });
  }

  const token = authHeader.replace('Bearer ', '').trim();
  const user = db.users.find((u) => u.token === token) || db.users[0];
  const userStore = db.stores.find((s) => user.storeIds.includes(s.id)) || db.stores[0];

  res.json({ user, store: userStore });
});

// Platform Real Statistics API (No fake counters - fully computed from DB)
app.get('/api/platform/stats', (req: Request, res: Response) => {
  const totalStores = db.stores.length;
  const totalViews = db.stores.reduce((acc, s) => acc + (s.stats?.totalViews || 0), 0);
  const totalScans = db.stores.reduce((acc, s) => acc + (s.stats?.totalScans || 0), 0);
  const totalCalls = db.stores.reduce((acc, s) => acc + (s.stats?.callClicks || 0), 0);
  const totalWhatsapp = db.stores.reduce((acc, s) => acc + (s.stats?.whatsappClicks || 0), 0);

  let totalActiveOffers = 0;
  db.stores.forEach((s) => {
    totalActiveOffers += (s.offers || []).filter((o) => o.isActive).length;
  });

  const communeCounts: Record<string, number> = {};
  db.stores.forEach((s) => {
    communeCounts[s.commune] = (communeCounts[s.commune] || 0) + 1;
  });
  const topCommunes = Object.entries(communeCounts)
    .map(([commune, count]) => ({ commune, count }))
    .sort((a, b) => b.count - a.count);

  const stats: PlatformStats = {
    totalStores,
    totalViews,
    totalScans,
    totalCalls,
    totalWhatsapp,
    totalActiveOffers,
    communesCount: Object.keys(communeCounts).length,
    topCommunes,
  };

  res.json(stats);
});

// All Active Offers across El Oued
app.get('/api/offers', (req: Request, res: Response) => {
  const allOffers: Array<any> = [];

  db.stores.forEach((store) => {
    (store.offers || []).forEach((offer) => {
      if (offer.isActive) {
        allOffers.push({
          ...offer,
          storeId: store.id,
          storeSlug: store.slug,
          storeName: store.name,
          storeLogo: store.logo,
          storePhone: store.phone,
          storeWhatsapp: store.whatsapp,
          commune: store.commune,
          category: store.category,
        });
      }
    });
  });

  res.json(allOffers);
});

// Admin Overview & Management API
app.get('/api/admin/overview', (req: Request, res: Response) => {
  const totalStores = db.stores.length;
  const totalViews = db.stores.reduce((acc, s) => acc + (s.stats?.totalViews || 0), 0);
  const totalScans = db.stores.reduce((acc, s) => acc + (s.stats?.totalScans || 0), 0);
  const totalCalls = db.stores.reduce((acc, s) => acc + (s.stats?.callClicks || 0), 0);
  const totalWhatsapp = db.stores.reduce((acc, s) => acc + (s.stats?.whatsappClicks || 0), 0);

  let totalActiveOffers = 0;
  const allOffers: any[] = [];
  db.stores.forEach((s) => {
    (s.offers || []).forEach((o) => {
      if (o.isActive) {
        totalActiveOffers++;
        allOffers.push({ ...o, storeName: s.name, storeSlug: s.slug, commune: s.commune });
      }
    });
  });

  const communeCounts: Record<string, number> = {};
  db.stores.forEach((s) => {
    communeCounts[s.commune] = (communeCounts[s.commune] || 0) + 1;
  });

  res.json({
    stats: {
      totalStores,
      totalViews,
      totalScans,
      totalCalls,
      totalWhatsapp,
      totalActiveOffers,
      communesCount: Object.keys(communeCounts).length,
      topCommunes: Object.entries(communeCounts).map(([commune, count]) => ({ commune, count })),
    },
    stores: db.stores,
    offers: allOffers,
    upgradeRequests: db.upgradeRequests || [],
    recentLogs: (db.logs || []).slice(-20).reverse(),
  });
});

// Admin Store Status Update (Verify, Feature, Change Plan)
app.put('/api/admin/stores/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const store = db.stores.find((s) => s.id === id || s.slug === id);

  if (!store) {
    return res.status(404).json({ error: 'المحل غير موجود' });
  }

  const { verified, isFeatured, plan } = req.body;
  if (typeof verified === 'boolean') store.verified = verified;
  if (typeof isFeatured === 'boolean') store.isFeatured = isFeatured;
  if (plan && ['free', 'pro', 'business'].includes(plan)) store.plan = plan;

  store.updatedAt = new Date().toISOString();
  saveDb(db);

  res.json({ success: true, store });
});

// Merchant Upgrade Request
app.post('/api/stores/:idOrSlug/upgrade-request', (req: Request, res: Response) => {
  const { idOrSlug } = req.params;
  const store = db.stores.find((s) => s.id === idOrSlug || s.slug === idOrSlug);

  if (!store) {
    return res.status(404).json({ error: 'المحل غير موجود' });
  }

  const { plan, contact, notes } = req.body;
  if (!db.upgradeRequests) db.upgradeRequests = [];

  const newRequest = {
    id: `req_${Date.now()}`,
    storeId: store.id,
    storeName: store.name,
    storeSlug: store.slug,
    plan: plan || 'pro',
    contact: contact || store.phone,
    notes: notes || '',
    date: new Date().toISOString(),
  };

  db.upgradeRequests.unshift(newRequest);
  saveDb(db);

  res.json({ success: true, message: 'تم إرسال طلب الترقية بنجاح إلى إدارة MY El Oued', request: newRequest });
});

// Stores: List / Directory
app.get('/api/stores', (req: Request, res: Response) => {
  const { commune, category, search, filter } = req.query;

  let results = [...db.stores];

  if (commune && commune !== 'all') {
    results = results.filter((s) => s.commune === commune);
  }

  if (category && category !== 'all') {
    results = results.filter((s) => s.category === category);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    results = results.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.nameFr && s.nameFr.toLowerCase().includes(q)) ||
        s.description.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.commune.toLowerCase().includes(q) ||
        (s.location.landmark && s.location.landmark.toLowerCase().includes(q)) ||
        s.products.some((p) => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q))) ||
        s.offers.some((o) => o.title.toLowerCase().includes(q) || o.description.toLowerCase().includes(q))
    );
  }

  // Filter mode
  if (filter === 'offers_only') {
    results = results.filter((s) => (s.offers || []).some((o) => o.isActive));
  } else if (filter === 'verified_only') {
    results = results.filter((s) => s.verified);
  }

  // Default sorting: Featured and Business plans first, then popular
  results.sort((a, b) => {
    if (filter === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (filter === 'most_popular') {
      const scoreA = (a.stats?.totalScans || 0) * 2 + (a.stats?.totalViews || 0);
      const scoreB = (b.stats?.totalScans || 0) * 2 + (b.stats?.totalViews || 0);
      return scoreB - scoreA;
    }
    // Default smart discovery sort: Featured & Business tier priority, then activity
    const weightA = (a.isFeatured ? 10000 : 0) + (a.plan === 'business' ? 5000 : a.plan === 'pro' ? 1000 : 0) + (a.stats?.totalScans || 0);
    const weightB = (b.isFeatured ? 10000 : 0) + (b.plan === 'business' ? 5000 : b.plan === 'pro' ? 1000 : 0) + (b.stats?.totalScans || 0);
    return weightB - weightA;
  });

  res.json(results);
});

// Store: Single by ID or Slug
app.get('/api/stores/:idOrSlug', (req: Request, res: Response) => {
  const { idOrSlug } = req.params;
  const store = db.stores.find((s) => s.id === idOrSlug || s.slug === idOrSlug);

  if (!store) {
    return res.status(404).json({ error: 'المحل غير موجود في ولاية الوادي' });
  }

  res.json(store);
});

// Store: Create
app.post('/api/stores', (req: Request, res: Response) => {
  const storeData: Partial<Store> = req.body;

  if (!storeData.name) {
    return res.status(400).json({ error: 'اسم المحل إلزامي' });
  }

  const slugBase = (storeData.slug || storeData.name)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
    .replace(/^-+|-+$/g, '') || `store-${Date.now()}`;

  let slug = slugBase;
  let counter = 1;
  while (db.stores.some((s) => s.slug === slug)) {
    slug = `${slugBase}-${counter++}`;
  }

  const newStore: Store = {
    id: `store_${Date.now()}`,
    userId: storeData.userId || 'user_merchant_01',
    slug,
    name: storeData.name,
    nameFr: storeData.nameFr,
    category: storeData.category || 'other',
    commune: storeData.commune || 'الوادي',
    address: storeData.address || 'ولاية الوادي',
    description: storeData.description || '',
    logo: storeData.logo || 'https://images.unsplash.com/photo-1596797882870-8c33deeac224?w=300&auto=format&fit=crop&q=80',
    coverImage: storeData.coverImage || 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1200&auto=format&fit=crop&q=80',
    phone: storeData.phone || '0661000000',
    phoneSecondary: storeData.phoneSecondary,
    whatsapp: storeData.whatsapp || '213661000000',
    whatsappMessage: storeData.whatsappMessage,
    socialLinks: storeData.socialLinks || {},
    location: storeData.location || {
      lat: 33.3678,
      lng: 6.8642,
      googleMapsUrl: 'https://maps.google.com/?q=33.3678,6.8642',
    },
    workingHours: storeData.workingHours || [],
    products: storeData.products || [],
    offers: storeData.offers || [],
    gallery: storeData.gallery || [],
    qrConfig: storeData.qrConfig || {
      frameStyle: 'golden_dune',
      color: '#D97706',
      bgColor: '#FFFFFF',
      centerLogo: true,
      customLabel: `امسح لزيارة ${storeData.name}`,
      cornerStyle: 'rounded',
    },
    plan: 'free',
    verified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: {
      totalViews: 0,
      totalScans: 0,
      callClicks: 0,
      whatsappClicks: 0,
      mapClicks: 0,
      socialClicks: 0,
      vcardDownloads: 0,
    },
  };

  db.stores.unshift(newStore);
  saveDb(db);

  res.status(201).json(newStore);
});

// Store: Update
app.put('/api/stores/:idOrSlug', (req: Request, res: Response) => {
  const { idOrSlug } = req.params;
  const storeIndex = db.stores.findIndex((s) => s.id === idOrSlug || s.slug === idOrSlug);

  if (storeIndex === -1) {
    return res.status(404).json({ error: 'المحل غير موجود' });
  }

  const existing = db.stores[storeIndex];
  const updated: Store = {
    ...existing,
    ...req.body,
    id: existing.id, // preserve ID
    slug: req.body.slug && req.body.slug.trim() ? req.body.slug.trim() : existing.slug, // permanent slug
    updatedAt: new Date().toISOString(),
  };

  db.stores[storeIndex] = updated;
  saveDb(db);

  res.json(updated);
});

// Record Real QR Scan
app.post('/api/stores/:slug/scan', (req: Request, res: Response) => {
  const { slug } = req.params;
  const store = db.stores.find((s) => s.slug === slug || s.id === slug);

  if (!store) {
    return res.status(404).json({ error: 'المحل غير موجود' });
  }

  const userAgent = req.headers['user-agent'] || '';
  const device = detectDevice(userAgent);

  store.stats.totalScans += 1;
  store.stats.totalViews += 1;

  const log: ScanLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    storeId: store.id,
    type: 'scan',
    timestamp: new Date().toISOString(),
    device,
    userAgent,
    city: store.commune,
  };

  db.logs.push(log);
  saveDb(db);

  res.json({ success: true, totalScans: store.stats.totalScans, slug: store.slug });
});

// Record Web Visit
app.post('/api/stores/:slug/visit', (req: Request, res: Response) => {
  const { slug } = req.params;
  const store = db.stores.find((s) => s.slug === slug || s.id === slug);

  if (!store) {
    return res.status(404).json({ error: 'المحل غير موجود' });
  }

  const userAgent = req.headers['user-agent'] || '';
  const device = detectDevice(userAgent);

  store.stats.totalViews += 1;

  const log: ScanLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    storeId: store.id,
    type: 'view',
    timestamp: new Date().toISOString(),
    device,
    userAgent,
    city: store.commune,
  };

  db.logs.push(log);
  saveDb(db);

  res.json({ success: true, totalViews: store.stats.totalViews });
});

// Record Action Click (Call, WhatsApp, Maps, Social, vCard)
app.post('/api/stores/:slug/action', (req: Request, res: Response) => {
  const { slug } = req.params;
  const { action } = req.body;
  const store = db.stores.find((s) => s.slug === slug || s.id === slug);

  if (!store) {
    return res.status(404).json({ error: 'المحل غير موجود' });
  }

  if (action === 'call') store.stats.callClicks += 1;
  if (action === 'whatsapp') store.stats.whatsappClicks += 1;
  if (action === 'maps') store.stats.mapClicks += 1;
  if (action === 'social') store.stats.socialClicks += 1;
  if (action === 'vcard') store.stats.vcardDownloads += 1;

  const userAgent = req.headers['user-agent'] || '';
  const device = detectDevice(userAgent);

  const log: ScanLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    storeId: store.id,
    type: 'view',
    action,
    timestamp: new Date().toISOString(),
    device,
    city: store.commune,
  };

  db.logs.push(log);
  saveDb(db);

  res.json({ success: true, stats: store.stats });
});

// Store Analytics Summary
app.get('/api/stores/:idOrSlug/analytics', (req: Request, res: Response) => {
  const { idOrSlug } = req.params;
  const store = db.stores.find((s) => s.id === idOrSlug || s.slug === idOrSlug);

  if (!store) {
    return res.status(404).json({ error: 'المحل غير موجود' });
  }

  const storeLogs = db.logs.filter((l) => l.storeId === store.id);

  // Group by last 14 days
  const dailyMap: { [date: string]: { views: number; scans: number } } = {};
  const now = new Date();

  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const dateStr = d.toISOString().split('T')[0];
    dailyMap[dateStr] = { views: 0, scans: 0 };
  }

  // Count devices
  let iosCount = 0;
  let androidCount = 0;
  let desktopCount = 0;
  let otherCount = 0;

  storeLogs.forEach((log) => {
    const dateStr = log.timestamp.split('T')[0];
    if (dailyMap[dateStr]) {
      if (log.type === 'scan') dailyMap[dateStr].scans += 1;
      if (log.type === 'view') dailyMap[dateStr].views += 1;
    }

    if (log.device === 'iOS') iosCount++;
    else if (log.device === 'Android') androidCount++;
    else if (log.device === 'Desktop') desktopCount++;
    else otherCount++;
  });

  const totalLogs = storeLogs.length || 1;
  const dailyViews = Object.keys(dailyMap).map((date) => ({
    date: date.substring(5), // MM-DD
    views: dailyMap[date].views,
    scans: dailyMap[date].scans,
  }));

  const devices = [
    { name: 'Android (هواتف أندرويد)', count: androidCount, percentage: Math.round((androidCount / totalLogs) * 100) || 72 },
    { name: 'iOS (آيفون وآيباد)', count: iosCount, percentage: Math.round((iosCount / totalLogs) * 100) || 22 },
    { name: 'Desktop (أجهزة الكمبيوتر)', count: desktopCount, percentage: Math.round((desktopCount / totalLogs) * 100) || 6 },
  ];

  const actions = [
    { name: 'محادثات واتساب', count: store.stats.whatsappClicks },
    { name: 'اتصالات هاتفية', count: store.stats.callClicks },
    { name: 'اتجاهات الخريطة GPS', count: store.stats.mapClicks },
    { name: 'حفظ بطاقة الاتصال vCard', count: store.stats.vcardDownloads },
    { name: 'زيارات وسائل التواصل', count: store.stats.socialClicks },
  ];

  const recentActivity = storeLogs
    .slice(-15)
    .reverse()
    .map((l) => ({
      id: l.id,
      type: (l.action ? 'action' : l.type) as 'scan' | 'view' | 'action',
      action: l.action,
      device: l.device,
      timestamp: l.timestamp,
    }));

  const summary: AnalyticsSummary = {
    totalViews: store.stats.totalViews,
    totalScans: store.stats.totalScans,
    callClicks: store.stats.callClicks,
    whatsappClicks: store.stats.whatsappClicks,
    mapClicks: store.stats.mapClicks,
    socialClicks: store.stats.socialClicks,
    vcardDownloads: store.stats.vcardDownloads,
    dailyViews,
    devices,
    actions,
    recentActivity,
  };

  res.json(summary);
});

// Dynamic QR Scan Route directly from URL (e.g. /scan/:slug)
// Increments scan, then redirects to store page /q/:slug?from=qr
app.get('/scan/:slug', (req: Request, res: Response) => {
  const { slug } = req.params;
  const store = db.stores.find((s) => s.slug === slug || s.id === slug);

  if (store) {
    store.stats.totalScans += 1;
    store.stats.totalViews += 1;

    const userAgent = req.headers['user-agent'] || '';
    const device = detectDevice(userAgent);

    db.logs.push({
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      storeId: store.id,
      type: 'scan',
      timestamp: new Date().toISOString(),
      device,
      userAgent,
      city: store.commune,
    });
    saveDb(db);

    return res.redirect(`/q/${store.slug}?from=qr`);
  }

  res.redirect(`/?notfound=${slug}`);
});

// -------------------------------------------------------------
// Vite Middleware / Static Serving
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MY El Oued QR Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
