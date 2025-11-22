"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Clock, Sparkles, Info } from "lucide-react";
import { getEthiopianToday, addDaysToEthiopianDate } from "@/lib/ethiopian-calendar";
import EthiopianDatePicker from "@/components/EthiopianDatePicker";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/components/LanguageProvider";

export default function CreateMeeting() {
  const router = useRouter();
  const { t, language } = useLanguage();
  
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(today.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(nextWeek.toISOString().split('T')[0]);
  const [startHour, setStartHour] = useState(9);
  const [endHour, setEndHour] = useState(17);
  const [duration, setDuration] = useState(1); // Duration in hours, default 1 hour
  const [creatorName, setCreatorName] = useState("");
  const [calendarType, setCalendarType] = useState<'ethiopian' | 'gregorian' | 'both'>('ethiopian');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !creatorName.trim()) {
      alert(language === 'am' ? 'እባክዎ ሁሉንም የሚጠይቁ መስኮች ይሙሉ' : 'Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          dateRange: {
            start: startDate,
            end: endDate,
          },
          timeRange: {
            start: { hour: startHour, minute: 0 },
            end: { hour: endHour, minute: 0 },
          },
          duration: duration,
          createdBy: creatorName.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.details || 'Failed to create meeting';
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (!data.meeting || !data.meeting.id) {
        throw new Error('Invalid response from server');
      }
      
      // No delay needed - MongoDB write is synchronous from API perspective
      // The database write completes before the response is sent
      router.push(`/meeting/${data.meeting.id}`);
    } catch (error: any) {
      console.error('Error creating meeting:', error);
      alert(`Failed to create meeting: ${error.message || 'Please try again.'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 md:pb-0">
      {/* Mobile-Optimized Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 md:relative">
        <div className="max-w-4xl mx-auto px-4 py-3 md:py-8">
          {/* Mobile: Compact header */}
          <div className="md:hidden flex items-center gap-3 mb-4">
            <button
              onClick={() => router.push('/')}
              className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-manipulation"
            >
              <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
            <div className="flex-1">
              <h1 className={`text-lg font-semibold text-gray-900 dark:text-white ${language === 'am' ? 'font-amharic' : ''}`}>
                {t.create.title}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>
          
          {/* Desktop: Full header */}
          <div className="hidden md:block">
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => router.push('/')}
                className={`flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm transition-colors group ${language === 'am' ? 'font-amharic' : ''}`}
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span>{t.common.back}</span>
              </button>
              <div className="flex items-center gap-2">
                <LanguageToggle />
                <ThemeToggle />
              </div>
            </div>
            <div>
              <h1 className={`text-3xl font-bold text-gray-900 dark:text-white mb-2 ${language === 'am' ? 'font-amharic' : ''}`}>
                {t.create.title}
              </h1>
              <p className={`text-gray-600 dark:text-gray-400 ${language === 'am' ? 'font-amharic' : ''}`}>{t.create.subtitle}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-4xl mx-auto px-4 py-4 md:py-8">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6 md:p-8 space-y-6">
          {/* Meeting Title */}
          <div>
            <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${language === 'am' ? 'font-amharic' : ''}`}>
              {t.create.meetingTitle} <span className="text-red-500">{t.common.required}</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={language === 'am' ? 'ለምሳሌ፣ የቡድን ሳምንታዊ ስብሰባ' : 'e.g., Team Weekly Standup'}
              className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ethiopian-green focus:border-ethiopian-green transition-all text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 ${language === 'am' ? 'font-amharic' : ''}`}
              required
            />
          </div>

          {/* Your Name */}
          <div>
            <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${language === 'am' ? 'font-amharic' : ''}`}>
              {t.create.yourName} <span className="text-red-500">{t.common.required}</span>
            </label>
            <input
              type="text"
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              placeholder={language === 'am' ? 'ስምዎን ያስገቡ' : 'Enter your name'}
              className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ethiopian-green focus:border-ethiopian-green transition-all text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 ${language === 'am' ? 'font-amharic' : ''}`}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${language === 'am' ? 'font-amharic' : ''}`}>
              {t.create.description} <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">{t.common.optional}</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={language === 'am' ? 'ስብሰባው ላይ ተጨማሪ ዝርዝሮችን ያክሉ...' : 'Add any additional details about the meeting...'}
              rows={4}
              className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ethiopian-green focus:border-ethiopian-green transition-all text-base resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 ${language === 'am' ? 'font-amharic' : ''}`}
            />
          </div>

          {/* Date Range */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <label className={`text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2 ${language === 'am' ? 'font-amharic' : ''}`}>
                <Calendar size={16} className="text-gray-500 dark:text-gray-400" />
                <span>{t.create.dateRange}</span>
              </label>
              
              {/* Calendar System Selector */}
              <div className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setCalendarType('ethiopian')}
                  className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${language === 'am' ? 'font-amharic' : ''} ${
                    calendarType === 'ethiopian' 
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  {t.create.ethiopian}
                </button>
                <button
                  type="button"
                  onClick={() => setCalendarType('gregorian')}
                  className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${language === 'am' ? 'font-amharic' : ''} ${
                    calendarType === 'gregorian' 
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  {t.create.gregorian}
                </button>
                <button
                  type="button"
                  onClick={() => setCalendarType('both')}
                  className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${language === 'am' ? 'font-amharic' : ''} ${
                    calendarType === 'both' 
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  {t.create.both}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                {(calendarType === 'ethiopian' || calendarType === 'both') && (
                  <div className={calendarType === 'both' ? "mb-3" : ""}>
                    <EthiopianDatePicker
                      label={calendarType === 'both' ? t.create.startDateEth : t.create.startDate}
                      value={startDate}
                      onChange={(date) => setStartDate(date)}
                    />
                  </div>
                )}
                {(calendarType === 'gregorian' || calendarType === 'both') && (
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${language === 'am' ? 'font-amharic' : ''}`}>
                      {calendarType === 'both' ? t.create.startDateGreg : t.create.startDate}
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ethiopian-green focus:border-ethiopian-green transition-all text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required={calendarType === 'gregorian'}
                    />
                  </div>
                )}
              </div>
              <div>
                {(calendarType === 'ethiopian' || calendarType === 'both') && (
                  <div className={calendarType === 'both' ? "mb-3" : ""}>
                    <EthiopianDatePicker
                      label={calendarType === 'both' ? t.create.endDateEth : t.create.endDate}
                      value={endDate}
                      onChange={(date) => setEndDate(date)}
                      minDate={startDate}
                    />
                  </div>
                )}
                {(calendarType === 'gregorian' || calendarType === 'both') && (
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${language === 'am' ? 'font-amharic' : ''}`}>
                      {calendarType === 'both' ? t.create.endDateGreg : t.create.endDate}
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ethiopian-green focus:border-ethiopian-green transition-all text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required={calendarType === 'gregorian'}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Time Range */}
          <div>
            <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2 ${language === 'am' ? 'font-amharic' : ''}`}>
              <Clock size={16} className="text-gray-500 dark:text-gray-400" />
              <span>{t.create.timeRange}</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs text-gray-500 dark:text-gray-400 mb-1.5 ${language === 'am' ? 'font-amharic' : ''}`}>{t.create.startTime}</label>
                <select
                  value={startHour}
                  onChange={(e) => setStartHour(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ethiopian-green focus:border-ethiopian-green transition-all text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {i.toString().padStart(2, '0')}:00
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-xs text-gray-500 dark:text-gray-400 mb-1.5 ${language === 'am' ? 'font-amharic' : ''}`}>{t.create.endTime}</label>
                <select
                  value={endHour}
                  onChange={(e) => setEndHour(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ethiopian-green focus:border-ethiopian-green transition-all text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {Array.from({ length: 24 }, (_, i) => i + 1).map((i) => (
                    <option key={i} value={i}>
                      {i.toString().padStart(2, '0')}:00
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Meeting Duration */}
          <div>
            <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${language === 'am' ? 'font-amharic' : ''}`}>
              {t.create.meetingDuration}
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ethiopian-green focus:border-ethiopian-green transition-all text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${language === 'am' ? 'font-amharic' : ''}`}
            >
              <option value={0.5}>{t.duration.minutes30}</option>
              <option value={1}>{t.duration.hour1}</option>
              <option value={1.5}>{t.duration.hours1_5}</option>
              <option value={2}>{t.duration.hours2}</option>
              <option value={2.5}>{t.duration.hours2_5}</option>
              <option value={3}>{t.duration.hours3}</option>
              <option value={4}>{t.duration.hours4}</option>
            </select>
            <p className={`text-xs text-gray-500 dark:text-gray-400 mt-2 ${language === 'am' ? 'font-amharic' : ''}`}>
              {t.create.meetingDurationDesc} {duration === 1 ? t.duration.hour1 : duration === 0.5 ? t.duration.minutes30 : `${duration} ${language === 'am' ? 'ሰዓታት' : 'hours'}`}.
            </p>
          </div>

          {/* Mobile: Sticky Bottom Button */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 shadow-lg z-40">
            <button
              type="submit"
              className={`w-full bg-ethiopian-green hover:bg-ethiopian-dark-green text-white px-6 py-3 rounded-lg font-semibold transition-all touch-manipulation flex items-center justify-center gap-2 ${language === 'am' ? 'font-amharic' : ''}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t.common.create} {language === 'am' ? 'ስብሰባ' : 'Meeting'}
            </button>
          </div>
          
          {/* Desktop: Submit Button */}
          <div className="hidden md:flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => router.push('/')}
              className={`px-5 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 text-sm transition-colors ${language === 'am' ? 'font-amharic' : ''}`}
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              className={`bg-ethiopian-green hover:bg-ethiopian-dark-green text-white px-6 py-2.5 rounded-lg font-semibold transition-colors ${language === 'am' ? 'font-amharic' : ''}`}
            >
              {t.common.create} {language === 'am' ? 'ስብሰባ' : 'Meeting'}
            </button>
          </div>
        </form>

        {/* Info Box - Hidden on mobile to save space */}
        <div className="hidden md:block mt-12 mb-8 animate-fadeIn">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">How Megenagna Works</h3>
            <p className="text-gray-600">Simple steps to coordinate your team</p>
          </div>
          
          <div className="grid grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-white rounded-xl p-6 shadow-lg border-b-4 border-ethiopian-green transform hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 bg-ethiopian-green/10 rounded-full flex items-center justify-center mb-4 mx-auto text-ethiopian-green">
                <Calendar size={24} />
              </div>
              <h4 className="font-bold text-gray-900 mb-2 text-center">1. Create</h4>
              <p className="text-sm text-gray-600 text-center leading-relaxed">
                Set your meeting details, date range, and meeting duration.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-xl p-6 shadow-lg border-b-4 border-ethiopian-yellow transform hover:-translate-y-1 transition-transform duration-300 delay-100">
              <div className="w-12 h-12 bg-ethiopian-yellow/20 rounded-full flex items-center justify-center mb-4 mx-auto text-yellow-700">
                <div className="font-bold text-xl">🔗</div>
              </div>
              <h4 className="font-bold text-gray-900 mb-2 text-center">2. Share</h4>
              <p className="text-sm text-gray-600 text-center leading-relaxed">
                Get a unique link and share it with your participants.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-xl p-6 shadow-lg border-b-4 border-ethiopian-red transform hover:-translate-y-1 transition-transform duration-300 delay-200">
              <div className="w-12 h-12 bg-ethiopian-red/10 rounded-full flex items-center justify-center mb-4 mx-auto text-ethiopian-red">
                <div className="font-bold text-xl">✅</div>
              </div>
              <h4 className="font-bold text-gray-900 mb-2 text-center">3. Vote</h4>
              <p className="text-sm text-gray-600 text-center leading-relaxed">
                Participants mark their available time slots easily.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-xl p-6 shadow-lg border-b-4 border-blue-500 transform hover:-translate-y-1 transition-transform duration-300 delay-300">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4 mx-auto text-blue-600">
                <Sparkles size={24} />
              </div>
              <h4 className="font-bold text-gray-900 mb-2 text-center">4. Schedule</h4>
              <p className="text-sm text-gray-600 text-center leading-relaxed">
                See the best times that work for everyone and book it!
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

