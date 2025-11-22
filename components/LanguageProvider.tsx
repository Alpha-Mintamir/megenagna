'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Language, translations } from '@/lib/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  // Initialize language from localStorage or browser preference
  useEffect(() => {
    setMounted(true);
    // Check localStorage and browser preference
    const savedLanguage = localStorage.getItem('language') as Language | null;
    const browserLang = navigator.language.split('-')[0];
    
    const initialLanguage = savedLanguage || (browserLang === 'am' ? 'am' : 'en');
    setLanguageState(initialLanguage);
    document.documentElement.lang = initialLanguage;
  }, []);

  // Update HTML lang attribute when language changes (only after mount)
  useEffect(() => {
    if (mounted) {
      document.documentElement.lang = language;
    }
  }, [language, mounted]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (mounted) {
      localStorage.setItem('language', lang);
      document.documentElement.lang = lang;
    }
  };

  // Prevent hydration mismatch - return default language during SSR
  if (!mounted) {
    return (
      <LanguageContext.Provider value={{ language: 'en', setLanguage, t: translations.en }}>
        {children}
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

