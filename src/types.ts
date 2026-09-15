export type Language = 'ar' | 'fr' | 'en';
export type PlanTier = 'free' | 'pro' | 'business';

export type StoreCategory = 
  | 'dates' 
  | 'food' 
  | 'fashion' 
  | 'electronics' 
  | 'crafts' 
  | 'health' 
  | 'services' 
  | 'building' 
  | 'automotive'
  | 'realestate'
  | 'sweets'
  | 'hotels'
  | 'other';

export type CommuneElOued =
  | 'الوادي'
  | 'قمار'
  | 'كوينين'
  | 'الرقيبة'
  | 'الدبيلة'
  | 'الرباح'
  | 'البياضة'
  | 'حاسي خليفة'
  | 'المقرن'
  | 'الطالب العربي'
  | 'سيدي عون'
  | 'جامعة'
  | 'المغير';

export interface WorkingDay {
  day: string;
  dayKey: 'sat' | 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri';
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  breakTime?: string;
}

export interface StoreProduct {
  id: string;
  name: string;
  nameFr?: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
  isAvailable: boolean;
  isFeatured?: boolean;
}

export interface StoreOffer {
  id: string;
  title: string;
  description: string;
  discountPercentage?: number;
  badge?: string;
  validUntil?: string;
  isActive: boolean;
  code?: string;
  isDailyDeal?: boolean;
}

export interface QRConfig {
  frameStyle: 'classic' | 'desert_badge' | 'golden_dune' | 'modern_oasis' | 'scan_here' | 'soufi_pattern';
  color: string;
  bgColor: string;
  centerLogo: boolean;
  customLabel?: string;
  cornerStyle: 'square' | 'rounded' | 'dots';
}

export interface StoreStats {
  totalViews: number;
  totalScans: number;
  callClicks: number;
  whatsappClicks: number;
  mapClicks: number;
  socialClicks: number;
  vcardDownloads: number;
}

export interface Store {
  id: string;
  userId: string;
  slug: string;
  name: string;
  nameFr?: string;
  category: StoreCategory;
  commune: CommuneElOued;
  address: string;
  description: string;
  logo: string;
  coverImage: string;
  phone: string;
  phoneSecondary?: string;
  whatsapp: string;
  whatsappMessage?: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    website?: string;
  };
  location: {
    lat: number;
    lng: number;
    googleMapsUrl: string;
    landmark?: string;
  };
  workingHours: WorkingDay[];
  products: StoreProduct[];
  offers: StoreOffer[];
  gallery: string[];
  qrConfig: QRConfig;
  plan: 'free' | 'pro' | 'business';
  verified: boolean;
  isFeatured?: boolean;
  createdAt: string;
  updatedAt: string;
  stats: StoreStats;
}

export interface ScanLog {
  id: string;
  storeId: string;
  type: 'scan' | 'view';
  action?: 'call' | 'whatsapp' | 'maps' | 'social' | 'vcard';
  timestamp: string;
  device: 'iOS' | 'Android' | 'Desktop' | 'Other';
  userAgent?: string;
  city?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  storeIds: string[];
  token?: string;
  role?: 'admin' | 'merchant';
}

export interface PlatformStats {
  totalStores: number;
  totalViews: number;
  totalScans: number;
  totalCalls: number;
  totalWhatsapp: number;
  totalActiveOffers: number;
  communesCount: number;
  topCommunes: { commune: string; count: number }[];
}

export interface AnalyticsSummary {
  totalViews: number;
  totalScans: number;
  callClicks: number;
  whatsappClicks: number;
  mapClicks: number;
  socialClicks: number;
  vcardDownloads: number;
  dailyViews: { date: string; views: number; scans: number }[];
  devices: { name: string; count: number; percentage: number }[];
  actions: { name: string; count: number }[];
  recentActivity: {
    id: string;
    type: 'scan' | 'view' | 'action';
    action?: string;
    device: string;
    timestamp: string;
  }[];
}
