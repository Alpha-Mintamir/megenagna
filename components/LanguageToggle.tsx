'use client';

import { Globe } from 'lucide-react';
import { useLanguage } from './LanguageProvider';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'am' : 'en');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors touch-manipulation"
      aria-label="Toggle language"
      title={language === 'en' ? 'Switch to Amharic' : 'Switch to English'}
    >
      <Globe size={16} className="text-gray-700 dark:text-gray-300" />
      <span className={`text-xs font-semibold text-gray-700 dark:text-gray-300 ${language === 'am' ? 'font-amharic' : ''}`}>
        {language === 'en' ? 'EN' : 'አማ'}
      </span>
    </button>
  );
}

