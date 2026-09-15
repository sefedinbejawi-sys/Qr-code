import { WorkingDay, Store } from '../types';

export function checkStoreOpenStatus(workingHours: WorkingDay[]): {
  isOpen: boolean;
  label: string;
  badgeColor: string;
} {
  if (!workingHours || workingHours.length === 0) {
    return { isOpen: true, label: 'مفتوح', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  }

  const now = new Date();
  // Algeria UTC+1
  const utcHours = now.getUTCHours();
  const dzHours = (utcHours + 1) % 24;
  const dzMinutes = now.getUTCMinutes();
  const currentMinutes = dzHours * 60 + dzMinutes;

  const dayIndex = now.getUTCDay();
  const dayKeyMap: Record<number, WorkingDay['dayKey']> = {
    6: 'sat',
    0: 'sun',
    1: 'mon',
    2: 'tue',
    3: 'wed',
    4: 'thu',
    5: 'fri',
  };

  const todayKey = dayKeyMap[dayIndex];
  const todayConfig = workingHours.find((w) => w.dayKey === todayKey);

  if (!todayConfig || !todayConfig.isOpen) {
    return {
      isOpen: false,
      label: 'مغلق اليوم',
      badgeColor: 'bg-stone-100 text-stone-600 border-stone-200',
    };
  }

  const parseMins = (tStr: string) => {
    if (!tStr) return 0;
    const [h, m] = tStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const openMins = parseMins(todayConfig.openTime);
  const closeMins = parseMins(todayConfig.closeTime);

  if (currentMinutes >= openMins && currentMinutes <= closeMins) {
    return {
      isOpen: true,
      label: `مفتوح الآن (يغلق ${todayConfig.closeTime})`,
      badgeColor: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30',
    };
  } else if (currentMinutes < openMins) {
    return {
      isOpen: false,
      label: `يفتح ${todayConfig.openTime}`,
      badgeColor: 'bg-amber-500/10 text-amber-800 border-amber-500/30',
    };
  } else {
    return {
      isOpen: false,
      label: 'مغلق حالياً',
      badgeColor: 'bg-stone-200/80 text-stone-700 border-stone-300',
    };
  }
}

export function getCategoryLabel(category: string): string {
  const map: Record<string, string> = {
    dates: '🌴 تمور وغراس',
    food: '☕ مقاهي ومطاعم',
    sweets: '🍰 حلويات ومخابز',
    fashion: '👗 ألبسة وموضة',
    electronics: '📱 هواتف وإلكترونيات',
    crafts: '🧵 حرف وأزياء سوفية',
    health: '💊 صحة وجمال',
    realestate: '🏠 عقارات وتهيئة',
    hotels: '🏨 فنادق وسياحة',
    building: '🧱 مواد بناء ومقاولات',
    services: '🛠️ خدمات وحرفيون',
    automotive: '🚗 سيارات ونقل',
    other: '✨ أنشطة أخرى',
  };
  return map[category] || 'نشاط تجاري';
}
