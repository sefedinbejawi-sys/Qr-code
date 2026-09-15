import React from 'react';
import { Store, Language } from '../types';
import { QrCodeView } from './QrCodeView';
import { X, Sparkles } from 'lucide-react';

interface QrModalProps {
  store: Store | null;
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
  onOpenStore: (slug: string, store?: Store) => void;
}

export const QrModal: React.FC<QrModalProps> = ({
  store,
  isOpen,
  onClose,
  lang = 'ar',
  onOpenStore,
}) => {
  if (!isOpen || !store) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-[#FAF7F2] rounded-3xl p-6 sm:p-8 shadow-2xl border border-amber-900/20 animate-in fade-in zoom-in duration-200 text-stone-900 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full bg-stone-200/70 hover:bg-stone-300 text-stone-700 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-800 border border-amber-500/20 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>رمز الاستجابة السريعة المباشر • وادي سوف</span>
          </div>
          <h3 className="text-xl font-extrabold text-stone-900">{store.name}</h3>
          <p className="text-xs text-stone-500 mt-0.5">{store.commune} • ولاية الوادي</p>
        </div>

        <QrCodeView
          store={store}
          lang={lang}
          showCustomizer={false}
          onOpenStore={(slug) => {
            onClose();
            onOpenStore(slug, store);
          }}
        />
      </div>
    </div>
  );
};
