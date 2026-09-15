import React, { useState } from 'react';
import { User, Store, Language } from '../types';
import { translations } from '../utils/translations';
import { SoufiArch, PalmBranch } from './SaharanDecor';
import {
  QrCode,
  Store as StoreIcon,
  LayoutDashboard,
  LogOut,
  LogIn,
  Globe,
  Menu,
  X,
  Sparkles,
  MapPin,
} from 'lucide-react';

interface NavbarProps {
  user: User | null;
  store: Store | null;
  lang: Language;
  onSetLang: (l: Language) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onOpenDashboard: () => void;
  onLogout: () => void;
  onNavigateHome: () => void;
  onScrollToDirectory: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  store,
  lang,
  onSetLang,
  onOpenAuth,
  onOpenDashboard,
  onLogout,
  onNavigateHome,
  onScrollToDirectory,
}) => {
  const t = translations[lang];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdown, setLangDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-amber-900/10 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand Identity */}
          <div
            onClick={onNavigateHome}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#1C1917] text-amber-500 flex items-center justify-center shadow-md border border-amber-600/30 group-hover:scale-105 transition-transform">
              <SoufiArch className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-xl font-black tracking-tight text-stone-900 font-sans">
                  MY El Oued QR
                </span>
                <span className="text-[10px] bg-amber-600 text-white font-extrabold px-1.5 py-0.2 rounded-md tracking-wider">
                  39
                </span>
              </div>
              <p className="text-[11px] text-amber-800/80 font-bold hidden sm:block">
                الهوية الرقمية لمحلات وادي سوف
              </p>
            </div>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-bold text-stone-700">
            <button
              onClick={onNavigateHome}
              className="hover:text-amber-700 transition-colors py-1"
            >
              {t.home}
            </button>
            <button
              onClick={onScrollToDirectory}
              className="hover:text-amber-700 transition-colors py-1 flex items-center gap-1"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              <span>{t.directory}</span>
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangDropdown(!langDropdown)}
                className="px-2.5 py-1.5 rounded-xl border border-stone-200/80 bg-white hover:bg-stone-50 text-xs font-bold text-stone-700 flex items-center gap-1.5 transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-stone-500" />
                <span>{lang === 'ar' ? 'العربية' : lang === 'fr' ? 'Français' : 'English'}</span>
              </button>

              {langDropdown && (
                <div className="absolute left-0 mt-1 w-32 bg-white rounded-2xl shadow-xl border border-stone-200/80 py-1.5 text-xs font-bold z-50 animate-in fade-in">
                  <button
                    onClick={() => {
                      onSetLang('ar');
                      setLangDropdown(false);
                    }}
                    className={`w-full text-right px-3 py-1.5 hover:bg-amber-50 ${
                      lang === 'ar' ? 'text-amber-700 bg-amber-50/50' : 'text-stone-700'
                    }`}
                  >
                    العربية (RTL)
                  </button>
                  <button
                    onClick={() => {
                      onSetLang('fr');
                      setLangDropdown(false);
                    }}
                    className={`w-full text-right px-3 py-1.5 hover:bg-amber-50 ${
                      lang === 'fr' ? 'text-amber-700 bg-amber-50/50' : 'text-stone-700'
                    }`}
                  >
                    Français
                  </button>
                  <button
                    onClick={() => {
                      onSetLang('en');
                      setLangDropdown(false);
                    }}
                    className={`w-full text-right px-3 py-1.5 hover:bg-amber-50 ${
                      lang === 'en' ? 'text-amber-700 bg-amber-50/50' : 'text-stone-700'
                    }`}
                  >
                    English
                  </button>
                </div>
              )}
            </div>

            {/* Auth / Dashboard Controls */}
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenDashboard}
                  className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>{t.dashboard}</span>
                </button>
                <button
                  onClick={onLogout}
                  title={t.logout}
                  className="p-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 text-stone-600 text-xs font-bold transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3.5 py-2 rounded-xl border border-stone-300 hover:border-amber-600 hover:text-amber-700 text-stone-800 font-bold text-xs transition-colors"
                >
                  {t.login}
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 transition-all flex items-center gap-1.5"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>{t.createQrNow}</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => onOpenAuth('register')}
              className="px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold shadow-xs"
            >
              أنشئ QR
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-stone-200/80 space-y-3">
            <button
              onClick={() => {
                onNavigateHome();
                setMobileMenuOpen(false);
              }}
              className="w-full text-right px-3 py-2 rounded-xl hover:bg-stone-100 text-sm font-bold text-stone-800"
            >
              {t.home}
            </button>
            <button
              onClick={() => {
                onScrollToDirectory();
                setMobileMenuOpen(false);
              }}
              className="w-full text-right px-3 py-2 rounded-xl hover:bg-stone-100 text-sm font-bold text-stone-800 flex items-center gap-2"
            >
              <MapPin className="w-4 h-4 text-amber-600" />
              <span>{t.directory}</span>
            </button>

            <div className="pt-2 border-t border-stone-100 flex items-center justify-between px-3">
              <span className="text-xs font-bold text-stone-500">اللغة / Langue:</span>
              <div className="flex gap-1.5">
                {(['ar', 'fr', 'en'] as Language[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => {
                      onSetLang(l);
                      setMobileMenuOpen(false);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                      lang === l ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100">
              {user ? (
                <div className="flex flex-col gap-2 px-3">
                  <button
                    onClick={() => {
                      onOpenDashboard();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 rounded-xl bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>{t.dashboard}</span>
                  </button>
                  <button
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2 rounded-xl bg-stone-100 text-stone-700 font-bold text-xs"
                  >
                    {t.logout}
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 px-3">
                  <button
                    onClick={() => {
                      onOpenAuth('login');
                      setMobileMenuOpen(false);
                    }}
                    className="flex-1 py-2.5 rounded-xl border border-stone-300 text-stone-800 font-bold text-xs"
                  >
                    {t.login}
                  </button>
                  <button
                    onClick={() => {
                      onOpenAuth('register');
                      setMobileMenuOpen(false);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-amber-600 text-white font-bold text-xs"
                  >
                    {t.register}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
