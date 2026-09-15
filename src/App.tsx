import React, { useState, useEffect } from 'react';
import { Store, User, Language } from './types';
import { api } from './services/api';
import { initialSeedStores } from './data/seedStores';
import { Navbar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { InteractiveDemo } from './components/InteractiveDemo';
import { FeaturesSection } from './components/FeaturesSection';
import { StoreDirectory } from './components/StoreDirectory';
import { Footer } from './components/Footer';
import { StorePublicPage } from './components/StorePublicPage';
import { Dashboard } from './components/Dashboard';
import { AuthModal } from './components/AuthModal';
import { QrModal } from './components/QrModal';

export function App() {
  const [lang, setLang] = useState<Language>('ar');
  const [currentView, setCurrentView] = useState<'landing' | 'store' | 'dashboard'>('landing');
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [activeStore, setActiveStore] = useState<Store | null>(null);

  // Auth & Active Merchant Store
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [merchantStore, setMerchantStore] = useState<Store | null>(null);

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [qrModalStore, setQrModalStore] = useState<Store | null>(null);

  // Handle URL routing / query parameters (?q=slug or path /q/slug)
  useEffect(() => {
    const handleUrlChange = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const qParam = urlParams.get('q');
      const hash = window.location.hash;
      const pathname = window.location.pathname;

      let extractedSlug: string | null = null;

      if (qParam) {
        extractedSlug = qParam;
      } else if (hash.startsWith('#/q/')) {
        extractedSlug = hash.replace('#/q/', '').split('?')[0].replace(/\/$/, '');
      } else if (hash.startsWith('#q=')) {
        extractedSlug = hash.replace('#q=', '').split('&')[0].replace(/\/$/, '');
      } else if (pathname.startsWith('/q/')) {
        extractedSlug = pathname.replace('/q/', '').split('?')[0].replace(/\/$/, '');
      } else if (pathname.startsWith('/scan/')) {
        extractedSlug = pathname.replace('/scan/', '').split('?')[0].replace(/\/$/, '');
      }

      if (extractedSlug) {
        setActiveSlug(extractedSlug);
        const match = initialSeedStores.find((s) => s.slug === extractedSlug || s.id === extractedSlug);
        if (match) setActiveStore(match);
        setCurrentView('store');
      }
    };

    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  // Set RTL or LTR document direction based on language
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // View store public page
  const handleOpenStore = (slug: string, store?: Store) => {
    setActiveSlug(slug);
    if (store) {
      setActiveStore(store);
    } else {
      const match = initialSeedStores.find((s) => s.slug === slug || s.id === slug);
      setActiveStore(match || null);
    }
    setCurrentView('store');
    window.history.pushState(null, '', `?q=${slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigate back to landing
  const handleNavigateHome = () => {
    setCurrentView('landing');
    setActiveSlug(null);
    setActiveStore(null);
    window.history.pushState(null, '', window.location.pathname.replace(/\/q\/.*|\/scan\/.*/, '') || '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrollToDirectory = () => {
    if (currentView !== 'landing') {
      setCurrentView('landing');
      setActiveSlug(null);
      setTimeout(() => {
        const el = document.getElementById('directory');
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById('directory');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Open Auth modal
  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (user: User, store: Store) => {
    setCurrentUser(user);
    setMerchantStore(store);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setMerchantStore(null);
    setCurrentView('landing');
  };

  const handleOpenDashboard = () => {
    if (currentUser && merchantStore) {
      setCurrentView('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleOpenAuth('login');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-stone-900 font-sans selection:bg-amber-500 selection:text-white flex flex-col">
      {/* If not in public standalone store mode, render primary Navbar */}
      {currentView !== 'store' && (
        <Navbar
          user={currentUser}
          store={merchantStore}
          lang={lang}
          onSetLang={setLang}
          onOpenAuth={handleOpenAuth}
          onOpenDashboard={handleOpenDashboard}
          onLogout={handleLogout}
          onNavigateHome={handleNavigateHome}
          onScrollToDirectory={handleScrollToDirectory}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {/* 1. Landing Page View */}
        {currentView === 'landing' && (
          <>
            <LandingHero
              lang={lang}
              onCreateStore={() => handleOpenAuth('register')}
              onExploreDirectory={handleScrollToDirectory}
            />

            <InteractiveDemo
              lang={lang}
              onOpenStore={handleOpenStore}
              onCreateStore={() => handleOpenAuth('register')}
            />

            <FeaturesSection lang={lang} />

            <StoreDirectory
              lang={lang}
              onOpenStore={handleOpenStore}
              onOpenQrModal={(s) => setQrModalStore(s)}
            />
          </>
        )}

        {/* 2. Public Storefront View */}
        {currentView === 'store' && activeSlug && (
          <StorePublicPage
            store={activeStore}
            slug={activeSlug}
            lang={lang}
            onBackHome={handleNavigateHome}
            onCreateOwnQr={() => {
              setCurrentView('landing');
              handleOpenAuth('register');
            }}
          />
        )}

        {/* 3. Merchant Dashboard View */}
        {currentView === 'dashboard' && merchantStore && (
          <Dashboard
            store={merchantStore}
            user={currentUser}
            lang={lang}
            onUpdateStore={(updated) => setMerchantStore(updated)}
            onViewPublicPage={handleOpenStore}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* Footer on Landing & Dashboard */}
      {currentView !== 'store' && (
        <Footer
          lang={lang}
          onExploreDirectory={handleScrollToDirectory}
          onCreateStore={() => handleOpenAuth('register')}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        lang={lang}
        initialMode={authModalMode}
      />

      {/* QR Code Quick Modal */}
      <QrModal
        store={qrModalStore}
        isOpen={!!qrModalStore}
        onClose={() => setQrModalStore(null)}
        lang={lang}
        onOpenStore={handleOpenStore}
      />
    </div>
  );
}

export default App;
