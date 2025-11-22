'use client';

import { useState } from 'react';
import Link from 'next/link';
import EthiopianCalendar from '@/components/EthiopianCalendar';
import AvailabilityGrid from '@/components/AvailabilityGrid';
import ParticipantPanel from '@/components/ParticipantPanel';
import EthiopianPattern from '@/components/EthiopianPattern';
import { useSchedulerStore } from '@/lib/store';
import { getCurrentEthiopianDate, formatEthiopianDate } from '@/lib/ethiopian-calendar';

export default function QuickSchedule() {
  const { 
    eventName, 
    setEventName, 
    selectedDates, 
    addSelectedDate, 
    removeSelectedDate,
    startHour,
    endHour,
    setTimeRange
  } = useSchedulerStore();
  
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [tempEventName, setTempEventName] = useState('');
  
  const currentEthDate = getCurrentEthiopianDate();
  
  const handleEventNameSubmit = () => {
    if (tempEventName.trim()) {
      setEventName(tempEventName.trim());
    }
    setIsEditingEvent(false);
  };
  
  const handleStartEdit = () => {
    setTempEventName(eventName);
    setIsEditingEvent(true);
  };
  
  return (
    <main className="min-h-screen bg-gradient-to-br from-ethiopian-light-gold via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-x-hidden">
      {/* Background pattern */}
      <EthiopianPattern />
      
      {/* Header */}
      <div className="relative z-10">
        <div className="bg-gradient-to-r from-ethiopian-green via-ethiopian-yellow to-ethiopian-red p-0.5 md:p-1">
          <div className="bg-white dark:bg-gray-800">
            <div className="max-w-7xl mx-auto px-3 md:px-4 py-3 md:py-6">
              {/* Mobile: Compact header */}
              <div className="md:hidden flex items-center justify-between gap-2">
                <Link href="/" className="flex-shrink-0">
                  <button className="p-1.5 hover:bg-ethiopian-light-gold dark:hover:bg-gray-700 rounded-lg transition-colors touch-manipulation">
                    <svg className="w-5 h-5 text-ethiopian-dark-green dark:text-ethiopian-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                  </button>
                </Link>
                
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-ethiopian-gold shadow-md flex-shrink-0">
                    <div className="ethiopian-gradient w-full h-full"></div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-base font-bold text-ethiopian-dark-green dark:text-ethiopian-green truncate">
                      <span className="font-ethiopic">መገናኛ</span>
                    </h1>
                    <p className="text-[10px] text-gray-600 dark:text-gray-400 truncate">
                      Quick Scheduler
                    </p>
                  </div>
                </div>
                
                <div className="text-right flex-shrink-0">
                  <div className="font-ethiopic text-ethiopian-green dark:text-ethiopian-green font-bold text-xs">
                    {formatEthiopianDate(currentEthDate, false)}
                  </div>
                </div>
              </div>
              
              {/* Desktop: Full header */}
              <div className="hidden md:flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <Link href="/">
                    <button className="p-2 hover:bg-ethiopian-light-gold dark:hover:bg-gray-700 rounded-lg transition-colors group">
                      <svg className="w-6 h-6 text-ethiopian-dark-green dark:text-ethiopian-green group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                    </button>
                  </Link>
                  
                  <div className="w-12 h-12 rounded-full overflow-hidden border-4 border-ethiopian-gold shadow-lg">
                    <div className="ethiopian-gradient w-full h-full"></div>
                  </div>
                  
                  <div className="animate-slideInLeft">
                    <h1 className="text-3xl md:text-4xl font-bold text-ethiopian-dark-green dark:text-ethiopian-green">
                      <span className="font-ethiopic">መገናኛ</span> · Megenagna
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
                      Quick Team Scheduler
                    </p>
                  </div>
                </div>
                
                <div className="text-right animate-slideInRight">
                  <div className="font-ethiopic text-ethiopian-green dark:text-ethiopian-green font-bold text-lg">
                    {formatEthiopianDate(currentEthDate, true)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date().toLocaleDateString('en-US', { 
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
        
        {/* Event name */}
        <div className="max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-6 animate-fadeIn">
          {!eventName && !isEditingEvent ? (
            <button
              onClick={handleStartEdit}
              className="w-full max-w-2xl mx-auto block py-3 md:py-4 bg-white dark:bg-gray-800 border-2 border-dashed border-ethiopian-gold rounded-xl hover:bg-ethiopian-light-gold dark:hover:bg-gray-700 transition-colors touch-manipulation"
            >
              <span className="text-gray-400 dark:text-gray-500 text-sm md:text-lg">
                + Name your event
              </span>
            </button>
          ) : isEditingEvent ? (
            <div className="max-w-2xl mx-auto">
              <input
                type="text"
                value={tempEventName}
                onChange={(e) => setTempEventName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleEventNameSubmit()}
                placeholder="e.g., Team Weekly Sync, Project Planning..."
                autoFocus
                className="w-full px-4 md:px-6 py-3 md:py-4 text-lg md:text-2xl font-bold border-2 border-ethiopian-gold rounded-xl focus:outline-none focus:ring-4 focus:ring-ethiopian-green/20 focus:border-ethiopian-green transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleEventNameSubmit}
                  className="flex-1 py-2 bg-ethiopian-green text-white rounded-lg hover:bg-ethiopian-dark-green transition-colors font-semibold text-sm md:text-base touch-manipulation"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditingEvent(false)}
                  className="flex-1 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors font-semibold text-sm md:text-base touch-manipulation"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-xl md:text-3xl font-bold text-ethiopian-dark-green dark:text-ethiopian-green mb-2 px-2 break-words">
                {eventName}
              </h2>
              <button
                onClick={handleStartEdit}
                className="text-xs md:text-sm text-ethiopian-green dark:text-ethiopian-green hover:text-ethiopian-dark-green transition-colors touch-manipulation"
              >
                ✏️ Edit
              </button>
            </div>
          )}
        </div>
        
        {/* Time range selector */}
        <div className="max-w-7xl mx-auto px-3 md:px-4 pb-4 md:pb-6 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 md:p-4 border-2 border-ethiopian-gold max-w-md mx-auto">
            <label className="block text-xs md:text-sm font-semibold text-ethiopian-dark-green dark:text-ethiopian-green mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Time Range
            </label>
            <div className="flex gap-3 md:gap-4 items-center">
              <div className="flex-1">
                <label className="text-xs text-gray-600 dark:text-gray-400">Start</label>
                <select
                  value={startHour}
                  onChange={(e) => setTimeRange(Number(e.target.value), endHour)}
                  className="w-full px-2 md:px-3 py-1.5 md:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-ethiopian-green text-sm md:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-600 dark:text-gray-400">End</label>
                <select
                  value={endHour}
                  onChange={(e) => setTimeRange(startHour, Number(e.target.value))}
                  className="w-full px-2 md:px-3 py-1.5 md:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-ethiopian-green text-sm md:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {Array.from({ length: 24 }, (_, i) => i + 1).map(i => (
                    <option key={i} value={i}>
                      {i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="max-w-7xl mx-auto px-3 md:px-4 pb-20 md:pb-12">
          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 md:gap-6">
            {/* Left column - Calendar and Participants */}
            <div className="lg:col-span-1 space-y-4 md:space-y-6">
              <div className="animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                <EthiopianCalendar
                  selectedDates={selectedDates}
                  onDateSelect={addSelectedDate}
                  onDateRemove={removeSelectedDate}
                />
              </div>
              
              <div className="animate-fadeIn" style={{ animationDelay: '0.3s' }}>
                <ParticipantPanel />
              </div>
            </div>
            
            {/* Right column - Availability Grid */}
            <div className="lg:col-span-2 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
              <AvailabilityGrid />
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="bg-ethiopian-dark-green text-white py-4 md:py-6">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-xs md:text-sm opacity-75">
              Made by Alpha prompting Cursor
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

