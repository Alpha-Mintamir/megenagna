'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import EthiopianPattern from '@/components/EthiopianPattern';
import { getCurrentEthiopianDate, formatEthiopianDate, toEthiopicNumeral } from '@/lib/ethiopian-calendar';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageToggle from '@/components/LanguageToggle';
import { useLanguage } from '@/components/LanguageProvider';

export default function Home() {
  const router = useRouter();
  const currentEthDate = getCurrentEthiopianDate();
  const { t, language } = useLanguage();
  
  return (
    <main className="min-h-screen ethiopian-pattern bg-gray-50 dark:bg-gray-900 relative overflow-hidden pb-20 md:pb-0">
      {/* Background pattern */}
      <EthiopianPattern />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Mobile-Optimized Header */}
        <div className="ethiopian-border bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-lg sticky top-0 z-50 md:relative">
          <div className="max-w-7xl mx-auto px-4 py-3 md:py-6">
            {/* Mobile: Compact header */}
            <div className="md:hidden flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full overflow-hidden border-[3px] border-ethiopian-gold shadow-lg flex-shrink-0">
                  <div className="ethiopian-gradient w-full h-full"></div>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-ethiopian-dark-green dark:text-ethiopian-green leading-tight">
                    <span className="font-ethiopic">መገናኛ</span>
                  </h1>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">Megenagna</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <LanguageToggle />
                <ThemeToggle />
                <div className="text-right">
                  <div className="font-ethiopic text-ethiopian-green font-bold text-sm">
                    {formatEthiopianDate(currentEthDate, false)}
                  </div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400">
                    {new Date().toLocaleDateString(language === 'am' ? 'am-ET' : 'en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Desktop: Full header */}
            <div className="hidden md:flex flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-ethiopian-gold shadow-xl animate-pulse-slow flex-shrink-0">
                  <div className="ethiopian-gradient w-full h-full"></div>
                </div>
                <div className="animate-slideInLeft">
                  <h1 className="text-4xl md:text-5xl font-bold text-ethiopian-dark-green dark:text-ethiopian-green">
                    <span className="font-ethiopic">መገናኛ</span> · Megenagna
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg">
                    The Meeting Place - Ethiopian Calendar Scheduler
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <LanguageToggle />
                <ThemeToggle />
                <div className="text-right animate-slideInRight">
                  <div className="font-ethiopic text-ethiopian-green font-bold text-2xl">
                    {formatEthiopianDate(currentEthDate, true)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date().toLocaleDateString(language === 'am' ? 'am-ET' : 'en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Hero Section - Mobile Optimized */}
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-12 lg:py-24">
          {/* Mobile: Simplified hero */}
          <div className="md:hidden text-center mb-6 animate-fadeIn">
            <h2 className={`text-2xl font-bold text-ethiopian-green dark:text-ethiopian-green mb-2 ${language === 'am' ? 'font-amharic' : ''}`}>
              {t.home.title}
            </h2>
            <p className={`text-sm text-gray-600 dark:text-gray-400 ${language === 'am' ? 'font-amharic' : ''}`}>
              {t.home.subtitle}
            </p>
          </div>
          
          {/* Desktop: Full hero */}
          <div className="hidden md:block text-center mb-12 md:mb-16 animate-fadeIn">
            <h2 className={`text-4xl md:text-5xl lg:text-6xl font-bold text-ethiopian-green dark:text-ethiopian-green mb-6 px-2 ${language === 'am' ? 'font-amharic' : ''}`}>
              {t.home.title}
            </h2>
            <p className={`text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-4 px-2 ${language === 'am' ? 'font-amharic' : ''}`}>
              {t.home.subtitle}
            </p>
            <p className={`text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4 ${language === 'am' ? 'font-amharic' : ''}`}>
              <span className="font-ethiopic text-ethiopian-green font-semibold">መገናኛ</span> {t.home.description}
            </p>
          </div>
          
          {/* Desktop: Main Action Card */}
          <div className="hidden md:block max-w-2xl mx-auto mb-12 md:mb-16">
            <Link href="/create">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 md:p-12 cursor-pointer card-hover group animate-scaleUp">
                <div className="text-center">
                  <div className="w-24 md:w-28 bg-gradient-to-br from-ethiopian-green to-green-600 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform shadow-xl aspect-square">
                    <svg className="w-12 md:w-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h3 className={`text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 ${language === 'am' ? 'font-amharic' : ''}`}>
                    {t.home.createMeeting}
                  </h3>
                  <p className={`text-gray-600 dark:text-gray-400 text-lg md:text-xl leading-relaxed mb-8 ${language === 'am' ? 'font-amharic' : ''}`}>
                    {t.home.createMeetingDesc}
                  </p>
                  <div className={`inline-flex items-center text-ethiopian-green font-bold text-xl group-hover:gap-3 gap-2 transition-all ${language === 'am' ? 'font-amharic' : ''}`}>
                    {t.home.getStarted}
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </div>
          
          {/* Mobile: Quick Features Cards */}
          <div className="md:hidden space-y-3 mb-6">
            {[
              { icon: '📅', title: t.home.ethiopianCalendar },
              { icon: '👥', title: t.home.teamCollaboration },
              { icon: '⚡', title: t.home.simpleFast }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3 card-hover">
                <div className="text-2xl">{feature.icon}</div>
                <div className="flex-1">
                  <h4 className={`font-bold text-sm text-gray-900 dark:text-white ${language === 'am' ? 'font-amharic' : ''}`}>{feature.title}</h4>
                </div>
              </div>
            ))}
          </div>
          
          {/* Desktop: Features Section */}
          <div className="hidden md:block bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 md:p-10 max-w-5xl mx-auto animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <h3 className={`text-2xl sm:text-3xl font-bold text-center mb-8 md:mb-10 text-gray-900 dark:text-white ${language === 'am' ? 'font-amharic' : ''}`}>
              {t.home.features}
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
              {/* Feature 1 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-ethiopian-green rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className={`font-bold text-xl mb-2 text-gray-900 dark:text-white ${language === 'am' ? 'font-amharic' : ''}`}>{t.home.ethiopianCalendar}</h4>
                <p className={`text-gray-600 dark:text-gray-400 ${language === 'am' ? 'font-amharic' : ''}`}>
                  {t.home.ethiopianCalendarDesc}
                </p>
              </div>
              
              {/* Feature 2 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-ethiopian-yellow rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h4 className={`font-bold text-xl mb-2 text-gray-900 dark:text-white ${language === 'am' ? 'font-amharic' : ''}`}>{t.home.teamCollaboration}</h4>
                <p className={`text-gray-600 dark:text-gray-400 ${language === 'am' ? 'font-amharic' : ''}`}>
                  {t.home.teamCollaborationDesc}
                </p>
              </div>
              
              {/* Feature 3 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-ethiopian-red rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className={`font-bold text-xl mb-2 text-gray-900 dark:text-white ${language === 'am' ? 'font-amharic' : ''}`}>{t.home.simpleFast}</h4>
                <p className={`text-gray-600 dark:text-gray-400 ${language === 'am' ? 'font-amharic' : ''}`}>
                  {t.home.simpleFastDesc}
                </p>
              </div>
            </div>
          </div>
          
          {/* Mobile: How It Works - Vertical Grid */}
          <div className="md:hidden mb-6">
            <h3 className={`text-lg font-bold mb-3 text-gray-900 dark:text-white px-1 ${language === 'am' ? 'font-amharic' : ''}`}>{t.home.howItWorks}</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { step: '፩', title: t.home.step1, desc: t.home.step1Desc },
                { step: '፪', title: t.home.step2, desc: t.home.step2Desc },
                { step: '፫', title: t.home.step3, desc: t.home.step3Desc },
                { step: '፬', title: t.home.step4, desc: t.home.step4Desc }
              ].map((item, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-md border border-gray-200 dark:border-gray-700 text-center card-hover">
                  <div className="w-10 h-10 bg-gradient-to-br from-ethiopian-green to-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-ethiopic text-xl font-bold shadow-lg">
                    {item.step}
                  </div>
                  <h4 className={`font-bold text-xs mb-1 text-gray-900 dark:text-white ${language === 'am' ? 'font-amharic' : ''}`}>{item.title}</h4>
                  <p className={`text-[10px] text-gray-600 dark:text-gray-400 leading-tight ${language === 'am' ? 'font-amharic' : ''}`}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Desktop: How It Works Section */}
          <div className="hidden md:block mt-12 md:mt-16 max-w-5xl mx-auto px-2">
            <h3 className={`text-2xl sm:text-3xl font-bold text-center mb-8 md:mb-10 text-gray-900 dark:text-white ${language === 'am' ? 'font-amharic' : ''}`}>
              {t.home.howItWorks}
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { step: '፩', title: t.home.step1, desc: t.home.step1Desc },
                { step: '፪', title: t.home.step2, desc: t.home.step2Desc },
                { step: '፫', title: t.home.step3, desc: t.home.step3Desc },
                { step: '፬', title: t.home.step4, desc: t.home.step4Desc }
              ].map((item, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 text-center card-hover">
                  <div className="w-16 h-16 bg-gradient-to-br from-ethiopian-green to-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-ethiopic text-3xl font-bold shadow-lg">
                    {item.step}
                  </div>
                  <h4 className={`font-bold text-lg mb-2 text-gray-900 dark:text-white ${language === 'am' ? 'font-amharic' : ''}`}>{item.title}</h4>
                  <p className={`text-gray-600 dark:text-gray-400 text-sm ${language === 'am' ? 'font-amharic' : ''}`}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Mobile: Floating Action Button */}
        <Link href="/create" className="md:hidden fixed bottom-6 right-6 z-50">
          <div className="w-16 h-16 bg-gradient-to-br from-ethiopian-green to-green-600 rounded-full shadow-2xl flex items-center justify-center animate-bounce-subtle touch-manipulation">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
            </svg>
          </div>
        </Link>
        
        {/* Footer */}
        <div className="bg-gradient-to-r from-ethiopian-green via-ethiopian-dark-green to-ethiopian-green text-white py-6 md:py-8 mt-8 md:mt-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className={`text-base md:text-xl mb-1 md:mb-2 font-semibold ${language === 'am' ? 'font-amharic' : ''}`}>
              {t.home.footer}
            </p>
            <p className={`text-xs md:text-sm opacity-75 ${language === 'am' ? 'font-amharic' : ''}`}>
              {t.home.madeBy}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
