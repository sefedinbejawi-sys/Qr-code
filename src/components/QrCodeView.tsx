import React, { useEffect, useState } from 'react';
import { Store, QRConfig, Language } from '../types';
import { generateQrDataUrl, generateQrSvgString, downloadFile, generatePrintableStandee } from '../utils/qrUtils';
import { api } from '../services/api';
import { translations } from '../utils/translations';
import { Download, Share2, Sparkles, Printer, Check, Copy, ExternalLink, Scan, Smartphone } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QrCodeViewProps {
  store: Store;
  lang?: Language;
  onOpenStore?: (slug: string) => void;
  showCustomizer?: boolean;
  onUpdateConfig?: (config: QRConfig) => void;
}

export const QrCodeView: React.FC<QrCodeViewProps> = ({
  store,
  lang = 'ar',
  onOpenStore,
  showCustomizer = false,
  onUpdateConfig,
}) => {
  const t = translations[lang];
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [svgString, setSvgString] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isGeneratingStandee, setIsGeneratingStandee] = useState(false);
  const [isSimulatingScan, setIsSimulatingScan] = useState(false);

  const [currentConfig, setCurrentConfig] = useState<QRConfig>(
    store.qrConfig || {
      frameStyle: 'golden_dune',
      color: '#D97706',
      bgColor: '#FFFFFF',
      centerLogo: true,
      customLabel: `امسح لزيارة ${store.name}`,
      cornerStyle: 'rounded',
    }
  );

  // The permanent dynamic link
  // Pointing to /scan/:slug or /q/:slug
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://qr.myeloued.com';
  const dynamicScanUrl = `${origin}/scan/${store.slug}`;
  const publicStoreUrl = `${origin}/?q=${store.slug}`;

  useEffect(() => {
    let isMounted = true;
    generateQrDataUrl(dynamicScanUrl, currentConfig, 800).then((url) => {
      if (isMounted) setQrDataUrl(url);
    });
    generateQrSvgString(dynamicScanUrl, currentConfig).then((svg) => {
      if (isMounted) setSvgString(svg);
    });
    return () => {
      isMounted = false;
    };
  }, [dynamicScanUrl, currentConfig]);

  const handleConfigChange = (partial: Partial<QRConfig>) => {
    const updated = { ...currentConfig, ...partial };
    setCurrentConfig(updated);
    if (onUpdateConfig) {
      onUpdateConfig(updated);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicStoreUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenStore = () => {
    if (onOpenStore) {
      onOpenStore(store.slug);
    } else {
      window.location.href = `/?q=${store.slug}`;
    }
  };

  const handleSimulateScan = async () => {
    setIsSimulatingScan(true);
    confetti({ particleCount: 40, spread: 70, origin: { y: 0.6 } });
    try {
      await api.recordScan(store.slug);
    } catch {
      // safe fallback
    }
    setTimeout(() => {
      setIsSimulatingScan(false);
      if (onOpenStore) {
        onOpenStore(store.slug);
      } else {
        window.location.href = `/?q=${store.slug}&from=qr`;
      }
    }, 500);
  };

  const handleDownloadPng = () => {
    if (!qrDataUrl) return;
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    downloadFile(qrDataUrl, `${store.slug}-qr-eloued.png`, 'image/png');
  };

  const handleDownloadSvg = () => {
    if (!svgString) return;
    downloadFile(svgString, `${store.slug}-qr-eloued.svg`, 'image/svg+xml');
  };

  const handleDownloadStandee = async () => {
    if (!qrDataUrl) return;
    setIsGeneratingStandee(true);
    try {
      const standeeData = await generatePrintableStandee(store, qrDataUrl);
      downloadFile(standeeData, `${store.slug}-table-standee.png`, 'image/png');
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingStandee(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
      {/* Visual QR Code Display Container */}
      <div className="w-full max-w-md mx-auto flex flex-col items-center">
        {/* Frame styling wrapper based on selected template */}
        <div
          id="qr-preview-card"
          className={`relative p-6 sm:p-8 rounded-3xl transition-all duration-300 w-full flex flex-col items-center text-center ${
            currentConfig.frameStyle === 'desert_badge'
              ? 'bg-[#1C1917] text-[#FAF7F2] border-2 border-[#D97706]/60 shadow-2xl shadow-black/40'
              : currentConfig.frameStyle === 'modern_oasis'
              ? 'bg-[#064E3B] text-[#ECFDF5] border-2 border-[#10B981]/40 shadow-xl'
              : currentConfig.frameStyle === 'classic'
              ? 'bg-white text-[#1C1917] border border-stone-200 shadow-lg'
              : 'bg-gradient-to-b from-[#FFFDF9] via-[#FAF7F2] to-[#F5EFEB] text-[#1C1917] border-2 border-[#D97706]/30 shadow-xl'
          }`}
        >
          {/* Top Brand Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-4 bg-amber-500/10 text-amber-600 border border-amber-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>MY El Oued QR • {store.commune}</span>
          </div>

          {/* Store Name & Category */}
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight mb-1">{store.name}</h3>
          <p className="text-xs sm:text-sm opacity-75 mb-5 max-w-xs">{currentConfig.customLabel || store.address}</p>

          {/* Interactive QR Code Canvas with click-to-simulate and optional center logo */}
          <div
            onClick={handleSimulateScan}
            title="انقر لتجربة مسح الكود كزبون ومعاينة المتجر"
            className="group relative p-4 bg-white rounded-2xl shadow-inner border border-stone-100 flex items-center justify-center cursor-pointer transition-all hover:ring-4 hover:ring-amber-500/30 hover:scale-[1.02]"
          >
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR code for ${store.name}`}
                className="w-56 h-56 sm:w-64 sm:h-64 object-contain"
              />
            ) : svgString ? (
              <div
                dangerouslySetInnerHTML={{ __html: svgString }}
                className="w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
              />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center text-stone-400">
                جاري توليد الرمز...
              </div>
            )}

            {/* Centered Logo badge */}
            {currentConfig.centerLogo && store.logo && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white p-1 shadow-md border-2 border-amber-500 flex items-center justify-center overflow-hidden">
                  <img
                    src={store.logo}
                    alt={store.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </div>
            )}

            {/* Hover overlay hint */}
            <div className="absolute inset-0 bg-stone-900/60 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-bold transition-opacity p-4">
              <Scan className="w-8 h-8 text-amber-400 mb-1.5 animate-pulse" />
              <span>انقر لمحاكاة المسح والمعاينة</span>
            </div>
          </div>

          {/* Instruction below QR */}
          <div className="mt-5 flex items-center gap-2 text-xs sm:text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>امسح بكاميرا الهاتف للوصول إلى المتجر مباشرة</span>
          </div>

          {/* Permanent URL badge */}
          <div className="mt-3 text-[11px] opacity-60 font-mono dir-ltr">
            qr.myeloued.com/q/{store.slug}
          </div>
        </div>

        {/* Quick Test & Share Actions */}
        <div className="w-full mt-4 flex flex-col gap-2.5">
          {/* Main Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={handleOpenStore}
              className="py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
            >
              <ExternalLink className="w-4 h-4" />
              <span>معاينة صفحة المحل الحية</span>
            </button>

            <button
              onClick={handleSimulateScan}
              disabled={isSimulatingScan}
              className="py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
            >
              <Scan className="w-4 h-4 text-amber-400" />
              <span>{isSimulatingScan ? 'جاري مسح الرمز...' : 'تجربة المسح كزبون'}</span>
            </button>
          </div>

          {/* Link Copy Bar */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-stone-100 border border-stone-200 text-xs">
            <span className="text-stone-500 truncate flex-1 font-mono text-[11px] px-2 text-left" dir="ltr">
              {publicStoreUrl}
            </span>
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-stone-50 text-stone-700 font-bold border border-stone-200 flex items-center gap-1 shrink-0 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'تم النسخ' : 'نسخ الرابط'}</span>
            </button>
          </div>

          {/* Download Buttons Grid */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleDownloadPng}
              className="py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>تحميل PNG</span>
            </button>
            <button
              onClick={handleDownloadSvg}
              className="py-2.5 px-3 rounded-xl bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-stone-500" />
              <span>متجهي SVG</span>
            </button>
            <button
              onClick={handleDownloadStandee}
              disabled={isGeneratingStandee}
              className="py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <Printer className="w-3.5 h-3.5 text-amber-600" />
              <span>{isGeneratingStandee ? 'تجهيز...' : 'لافتة طاولة'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* QR Customization Panel (if enabled) */}
      {showCustomizer && (
        <div className="w-full max-w-md bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h4 className="font-bold text-stone-900 text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <span>تخصيص هوية الـ QR Code</span>
            </h4>
            <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2.5 py-0.5 rounded-full">
              ديناميكي دائم
            </span>
          </div>

          {/* Style selector */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              نمط الإطار الصحراوي
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 'golden_dune', name: 'كثبان ذهبية', desc: 'ألوان رملية ناعمة' },
                { id: 'desert_badge', name: 'أسود سوفي فاخر', desc: 'أونيكس داكن وذهبي' },
                { id: 'modern_oasis', name: 'واحة النخيل', desc: 'أخضر زمردي عميق' },
                { id: 'classic', name: 'كلاسيكي حديث', desc: 'خلفية بيضاء بسيطة' },
              ].map((style) => (
                <button
                  key={style.id}
                  onClick={() => handleConfigChange({ frameStyle: style.id as QRConfig['frameStyle'] })}
                  className={`p-3 rounded-2xl text-right border transition-all ${
                    currentConfig.frameStyle === style.id
                      ? 'border-amber-600 bg-amber-50/70 shadow-sm'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <p className="font-bold text-xs text-stone-900">{style.name}</p>
                  <p className="text-[10px] text-stone-500 mt-0.5">{style.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Color Palettes */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              لون رمز الاستجابة
            </label>
            <div className="flex items-center gap-3">
              {[
                { label: 'ذهبي وادي سوف', color: '#D97706' },
                { label: 'أونيكس داكن', color: '#1C1917' },
                { label: 'نخيل الواحات', color: '#065F46' },
                { label: 'طين صحراوي', color: '#B45309' },
                { label: 'أزرق كحلي ليلي', color: '#1E293B' },
              ].map((palette) => (
                <button
                  key={palette.color}
                  onClick={() => handleConfigChange({ color: palette.color })}
                  title={palette.label}
                  className={`w-9 h-9 rounded-full transition-transform flex items-center justify-center ${
                    currentConfig.color === palette.color
                      ? 'ring-2 ring-offset-2 ring-amber-600 scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: palette.color }}
                >
                  {currentConfig.color === palette.color && (
                    <Check className="w-4 h-4 text-white drop-shadow" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Center Logo Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-stone-50 rounded-2xl border border-stone-200/60">
            <div>
              <p className="font-bold text-xs text-stone-900">شعار المتجر في قلب الـ QR</p>
              <p className="text-[11px] text-stone-500">يعزز الثقة والتعرف على علامتك التجارية</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={currentConfig.centerLogo}
                onChange={(e) => handleConfigChange({ centerLogo: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>

          {/* Custom Label Input */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              النص التوجيهي تحت العنوان
            </label>
            <input
              type="text"
              value={currentConfig.customLabel || ''}
              onChange={(e) => handleConfigChange({ customLabel: e.target.value })}
              placeholder="مثال: امسح لطلب التمور وقائمة الأسعار"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Permanent Guarantee Notice */}
          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/50 text-[11px] text-amber-900 leading-relaxed">
            🛡️ <strong>ضمان الثبات:</strong> يمكنك طباعة الـ QR وتثبيته على لافتات محلك في الوادي؛ الرابط ديناميكي ولن يتغير أبدًا حتى لو قمت بتغيير أرقام الهاتف أو إضافة منتجات جديدة.
          </div>
        </div>
      )}
    </div>
  );
};
