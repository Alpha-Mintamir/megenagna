'use client';

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users, Calendar, Share2, Check } from "lucide-react";
import { 
  gregorianToEthiopian, 
  formatEthiopianDate, 
  ETHIOPIAN_DAYS,
  toGeezNumeral 
} from "@/lib/ethiopian-calendar";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/components/LanguageProvider";

interface Props {
  meetingId: string;
}

export default function MeetingPageClient({ meetingId }: Props) {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [meeting, setMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [userName, setUserName] = useState("");
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [userId, setUserId] = useState("");
  const [copied, setCopied] = useState(false);

  // Generate userId on client mount only
  useEffect(() => {
    setUserId(Math.random().toString(36).substring(2, 11));
  }, []);

  // Fetch meeting from database
  useEffect(() => {
    
    async function fetchMeeting() {
      try {
        console.log('Fetching meeting:', meetingId);
        const response = await fetch(`/api/meetings/${meetingId}`);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('API error:', errorData);
          throw new Error(errorData.error || 'Meeting not found');
        }
        
        const data = await response.json();
        console.log('Meeting data:', data);
        
        if (!data.meeting) {
          throw new Error('No meeting data received');
        }
        
        setMeeting(data.meeting);
      } catch (error: any) {
        console.error('Error fetching meeting:', error);
        alert(`Failed to load meeting: ${error.message}`);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    }
    
    fetchMeeting();
  }, [meetingId]);

  // Get meeting duration, default to 1 hour for backwards compatibility
  const meetingDuration = meeting?.duration || 1;

  // Generate time slots - MUST be called before any early returns
  // Generate individual hour slots for display, but group them by duration
  const timeSlots = useMemo(() => {
    if (!meeting) return [];
    const slots = [];
    const durationHours = meeting?.duration || 1;
    
    // Generate slots based on duration blocks
    // e.g., if duration is 2 hours and range is 9-17, slots are: 9:00, 11:00, 13:00, 15:00
    for (let hour = meeting.timeRange.start.hour; hour < meeting.timeRange.end.hour; hour += durationHours) {
      // Only add slot if there's enough time remaining
      if (hour + durationHours <= meeting.timeRange.end.hour) {
        slots.push({
          startHour: hour,
          displayTime: `${hour.toString().padStart(2, '0')}:00`,
          durationHours: durationHours
        });
      }
    }
    return slots;
  }, [meeting]);


  // Generate date range - MUST be called before any early returns
  const dates = useMemo(() => {
    if (!meeting) return [];
    const start = new Date(meeting.dateRange.start);
    const end = new Date(meeting.dateRange.end);
    const dateArray = [];
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dateArray.push(new Date(d));
    }
    
    return dateArray;
  }, [meeting]);

  // Calculate availability count for each slot - MUST be called before any early returns
  const slotCounts = useMemo(() => {
    if (!meeting) return {};
    const counts: { [key: string]: number } = {};
    
    meeting.availability.forEach((entry: any) => {
      entry.slots.forEach((slot: string) => {
        counts[slot] = (counts[slot] || 0) + 1;
      });
    });
    
    return counts;
  }, [meeting]);

  const maxCount = useMemo(() => {
    const values = Object.values(slotCounts);
    return values.length > 0 ? Math.max(...values, 0) : 0;
  }, [slotCounts]);

  // Mouse event handlers - MUST be defined before early returns
  const handleMouseUp = () => {
    setIsSelecting(false);
  };

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-[3px] border-ethiopian-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={`text-lg font-medium text-gray-600 dark:text-gray-400 ${language === 'am' ? 'font-amharic' : ''}`}>{t.common.loading}</p>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className={`text-xl font-semibold text-gray-900 dark:text-white mb-4 ${language === 'am' ? 'font-amharic' : ''}`}>{t.meeting.meetingNotFound}</h1>
          <button
            onClick={() => router.push('/')}
            className={`px-5 py-2 bg-ethiopian-green text-white rounded-lg hover:bg-ethiopian-dark-green transition-colors ${language === 'am' ? 'font-amharic' : ''}`}
          >
            {t.meeting.goHome}
          </button>
        </div>
      </div>
    );
  }

  // Helper function to get all slot IDs for a duration block
  const getSlotIdsForDuration = (date: Date, startHour: number, durationHours: number): string[] => {
    const slotIds: string[] = [];
    const dateStr = date.toISOString().split('T')[0];
    
    for (let i = 0; i < durationHours; i++) {
      const hour = startHour + i;
      if (hour < meeting.timeRange.end.hour) {
        slotIds.push(`${dateStr}T${hour.toString().padStart(2, '0')}:00`);
      }
    }
    
    return slotIds;
  };

  const handleSlotClick = (date: Date, startHour: number, durationHours: number) => {
    if (hasSubmitted) return;
    
    const slotIds = getSlotIdsForDuration(date, startHour, durationHours);
    const newSelected = new Set(selectedSlots);
    
    // Check if all slots in this duration block are already selected
    const allSelected = slotIds.every(id => newSelected.has(id));
    
    if (allSelected) {
      // Deselect all slots in this duration block
      slotIds.forEach(id => newSelected.delete(id));
    } else {
      // Select all slots in this duration block
      slotIds.forEach(id => newSelected.add(id));
    }
    
    setSelectedSlots(newSelected);
  };

  const handleMouseDown = (date: Date, startHour: number, durationHours: number) => {
    if (hasSubmitted) return;
    setIsSelecting(true);
    handleSlotClick(date, startHour, durationHours);
  };

  const handleMouseEnter = (date: Date, startHour: number, durationHours: number) => {
    if (isSelecting && !hasSubmitted) {
      handleSlotClick(date, startHour, durationHours);
    }
  };

  const handleSubmit = async () => {
    if (!userName.trim()) {
      alert(language === 'am' ? 'እባክዎ ስምዎን ያስገቡ' : 'Please enter your name');
      return;
    }

    try {
      const response = await fetch(`/api/meetings/${meetingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          userName: userName.trim(),
          slots: Array.from(selectedSlots),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if we got a valid error message from the API
        const errorMessage = data.error || 'Failed to save availability';
        throw new Error(errorMessage);
      }

      // Verify we got a meeting object back
      if (!data || !data.meeting) {
        throw new Error('Invalid response from server');
      }

      setMeeting(data.meeting);
      setHasSubmitted(true);
    } catch (error: any) {
      console.error('Error saving availability:', error);
      const errorMessage = error.message || 'Failed to save availability. Please try again.';
      alert(errorMessage);
    }
  };

  // Check if a duration block is selected (all its hour slots are selected)
  const isDurationBlockSelected = (date: Date, startHour: number, durationHours: number): boolean => {
    const slotIds = getSlotIdsForDuration(date, startHour, durationHours);
    return slotIds.length > 0 && slotIds.every(id => selectedSlots.has(id));
  };

  // Get the minimum availability count for a duration block
  const getDurationBlockCount = (date: Date, startHour: number, durationHours: number): number => {
    const slotIds = getSlotIdsForDuration(date, startHour, durationHours);
    if (slotIds.length === 0) return 0;
    
    // Return the minimum count across all slots in the block
    // This ensures we only show availability if ALL slots in the block are available
    const counts = slotIds.map(id => slotCounts[id] || 0);
    return Math.min(...counts);
  };

  const getSlotColor = (date: Date, startHour: number, durationHours: number) => {
    const isSelected = isDurationBlockSelected(date, startHour, durationHours);
    
    if (isSelected && !hasSubmitted) {
      return "bg-ethiopian-green border-ethiopian-green";
    }
    
    const count = getDurationBlockCount(date, startHour, durationHours);
    if (count === 0) return "bg-gray-100 border-gray-200";
    
    const intensity = count / Math.max(maxCount, 1);
    
    if (intensity >= 0.8) return "bg-green-500 border-green-500";
    if (intensity >= 0.6) return "bg-green-400 border-green-400";
    if (intensity >= 0.4) return "bg-yellow-400 border-yellow-400";
    if (intensity >= 0.2) return "bg-yellow-300 border-yellow-300";
    return "bg-orange-200 border-orange-200";
  };

  const copyLink = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 md:pb-0" onMouseUp={handleMouseUp}>
      {/* Mobile-Optimized Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 md:relative">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-8">
          {/* Mobile: Compact header */}
          <div className="md:hidden">
            <div className="flex items-center gap-3 mb-3">
              <button
                onClick={() => router.push('/')}
                className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-manipulation"
              >
                <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
              <div className="flex-1 min-w-0">
                <h1 className={`text-base font-bold text-gray-900 dark:text-white truncate ${language === 'am' ? 'font-amharic' : ''}`}>
                  {meeting.title}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] text-gray-500 dark:text-gray-400 ${language === 'am' ? 'font-amharic' : ''}`}>
                    {new Date(meeting.dateRange.start).toLocaleDateString(language === 'am' ? 'am-ET' : 'en-US', { month: 'short', day: 'numeric' })} - {new Date(meeting.dateRange.end).toLocaleDateString(language === 'am' ? 'am-ET' : 'en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">·</span>
                  <span className="text-[10px] font-ethiopic text-gray-700 dark:text-gray-300 font-semibold">{toGeezNumeral(meeting.availability.length)}</span>
                  <span className={`text-[10px] text-gray-500 dark:text-gray-400 ${language === 'am' ? 'font-amharic' : ''}`}>{language === 'am' ? 'ምላሾች' : 'responses'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <LanguageToggle />
                <ThemeToggle />
                <button
                  onClick={copyLink}
                  className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors touch-manipulation"
                >
                  {copied ? <Check size={18} className="text-gray-700 dark:text-gray-300" /> : <Share2 size={18} className="text-gray-700 dark:text-gray-300" />}
                </button>
              </div>
            </div>
          </div>
          
          {/* Desktop: Full header */}
          <div className="hidden md:block">
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => router.push('/')}
                className={`flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-0 text-sm transition-colors group ${language === 'am' ? 'font-amharic' : ''}`}
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span>{t.common.back}</span>
              </button>
              <div className="flex items-center gap-2">
                <LanguageToggle />
                <ThemeToggle />
              </div>
            </div>
            
            <div className="flex flex-row items-start justify-between gap-8">
              <div className="flex-1 min-w-0">
                <h1 className={`text-3xl font-bold text-gray-900 dark:text-white mb-2 break-words ${language === 'am' ? 'font-amharic' : ''}`}>
                  {meeting.title}
                </h1>
                {meeting.description && (
                  <p className={`text-gray-500 dark:text-gray-400 text-base mb-6 ${language === 'am' ? 'font-amharic' : ''}`}>{meeting.description}</p>
                )}
                <div className={`flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 ${language === 'am' ? 'font-amharic' : ''}`}>
                  <span className="flex items-center gap-1.5">
                    <Calendar size={16} className="text-gray-400 dark:text-gray-500" />
                    <span>
                      {new Date(meeting.dateRange.start).toISOString().split('T')[0]} - {new Date(meeting.dateRange.end).toISOString().split('T')[0]}
                    </span>
                  </span>
                  <span className="text-gray-300 dark:text-gray-600">·</span>
                  <span className="flex items-center gap-1.5">
                    <Users size={16} className="text-gray-400 dark:text-gray-500" />
                    <span className="font-ethiopic font-semibold text-gray-700 dark:text-gray-300">{toGeezNumeral(meeting.availability.length)}</span>
                    <span>{language === 'am' ? 'ምላሾች' : 'responses'}</span>
                  </span>
                </div>
              </div>
              
              <button
                onClick={copyLink}
                className={`flex items-center gap-2 px-5 py-2.5 bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white rounded-lg transition-all text-sm font-medium flex-shrink-0 ${language === 'am' ? 'font-amharic' : ''}`}
              >
                {copied ? <Check size={18} /> : <Share2 size={18} />}
                {copied ? t.common.copied : t.common.share}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-4 sm:py-6 md:py-8">
        {/* Mobile: Sticky Bottom Input */}
        {!hasSubmitted && (
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-40 p-4">
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder={language === 'am' ? 'ስምዎ' : 'Your name'}
                className={`flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ethiopian-green focus:border-ethiopian-green transition-all text-base touch-manipulation bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 ${language === 'am' ? 'font-amharic' : ''}`}
              />
              <button
                onClick={handleSubmit}
                disabled={selectedSlots.size === 0 || !userName.trim()}
                className={`px-5 py-3 bg-ethiopian-green text-white rounded-lg font-semibold text-base disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-all touch-manipulation flex items-center justify-center min-w-[90px] active:scale-95 ${language === 'am' ? 'font-amharic' : ''}`}
              >
                <Check size={18} />
                <span className="ml-1">{t.common.submit}</span>
              </button>
            </div>
            <div className={`flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 ${language === 'am' ? 'font-amharic' : ''}`}>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-ethiopian-green rounded"></div>
                <span>{t.meeting.tapToSelect}</span>
              </div>
              <span className="font-ethiopic font-semibold text-gray-700 dark:text-gray-300">{toGeezNumeral(selectedSlots.size)} {t.meeting.selected}</span>
            </div>
          </div>
        )}
        
        {/* Desktop: User Input Section */}
        {!hasSubmitted && (
          <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-8 mb-8">
            <div className="mb-6">
              <h2 className={`text-2xl font-bold text-gray-900 dark:text-white mb-1 ${language === 'am' ? 'font-amharic' : ''}`}>
                {t.meeting.markAvailability}
              </h2>
              <p className={`text-gray-600 dark:text-gray-400 ${language === 'am' ? 'font-amharic' : ''}`}>{t.meeting.markAvailabilityDesc}</p>
            </div>

            <div className="flex items-end gap-4 mb-6">
              <div className="flex-1">
                <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${language === 'am' ? 'font-amharic' : ''}`}>
                  {t.meeting.yourName}
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder={language === 'am' ? 'ስምዎን ያስገቡ' : 'Enter your name'}
                  className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ethiopian-green focus:border-ethiopian-green transition-all text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 ${language === 'am' ? 'font-amharic' : ''}`}
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={selectedSlots.size === 0 || !userName.trim()}
                className={`px-6 py-3 bg-ethiopian-green text-white rounded-lg font-semibold text-base hover:bg-ethiopian-dark-green disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-all flex items-center gap-2 ${language === 'am' ? 'font-amharic' : ''}`}
              >
                <Check size={20} />
                {t.common.submit}
              </button>
            </div>

            {/* Instructions */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <p className={`text-sm text-gray-600 dark:text-gray-300 mb-3 ${language === 'am' ? 'font-amharic' : ''}`}>
                {t.meeting.instructionsText} <span className="font-semibold text-gray-900 dark:text-white">{meetingDuration === 1 ? (language === 'am' ? '1 ሰዓት' : '1-hour') : meetingDuration === 0.5 ? (language === 'am' ? '30 ደቂቃ' : '30-minute') : `${meetingDuration} ${language === 'am' ? 'ሰዓት' : 'hour'}`}</span> {language === 'am' ? 'የስብሰባ ክፍል' : 'meeting block'}.
              </p>
              <div className={`flex items-center gap-6 text-xs text-gray-500 dark:text-gray-400 ${language === 'am' ? 'font-amharic' : ''}`}>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-ethiopian-green rounded"></div>
                  <span>{t.meeting.yourSelection}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span>{t.meeting.mostAvailable}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
                  <span>{t.meeting.noResponses}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {hasSubmitted && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-ethiopian-green rounded-full p-2">
                <Check className="text-white" size={20} />
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold text-lg text-gray-900 dark:text-white mb-1 ${language === 'am' ? 'font-amharic' : ''}`}>
                  {t.meeting.successMessage}
                </h3>
                <p className={`text-gray-600 dark:text-gray-300 text-sm ${language === 'am' ? 'font-amharic' : ''}`}>{t.meeting.successDescription}</p>
              </div>
            </div>
          </div>
        )}

        {/* Calendar Grid */}
        {dates.length > 0 && timeSlots.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6 md:p-8 overflow-x-auto -mx-4 sm:mx-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div>
              <h2 className={`text-xl sm:text-2xl font-bold mb-1 text-gray-900 dark:text-white ${language === 'am' ? 'font-amharic' : ''}`}>
                {t.meeting.availabilityGrid}
              </h2>
              <p className={`text-gray-500 dark:text-gray-400 text-sm ${language === 'am' ? 'font-amharic' : ''}`}>{t.meeting.availabilityGridDesc}</p>
            </div>
            <div className={`flex flex-wrap items-center gap-4 text-xs sm:text-sm ${language === 'am' ? 'font-amharic' : ''}`}>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-gray-600 dark:text-gray-400">{t.meeting.mostAvailable}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                <span className="text-gray-600 dark:text-gray-400">{t.meeting.somewhatAvailable}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
                <span className="text-gray-600 dark:text-gray-400">{t.meeting.noResponses}</span>
              </div>
            </div>
          </div>

          <div className="min-w-max pb-2">
            <div 
              className="grid gap-1.5 sm:gap-2" 
              style={{ 
                gridTemplateColumns: `minmax(100px, 140px) repeat(${dates.length}, minmax(70px, 90px))`
              }}
            >
              {/* Header Row */}
              <div className="sticky left-0 bg-white z-10"></div>
              {dates.map((date, idx) => {
                const ethDate = gregorianToEthiopian(date);
                const dayOfWeek = date.getDay();
                // Adjust: JS getDay() returns 0=Sunday, 1=Monday, etc.
                // ETHIOPIAN_DAYS array is [Monday, Tuesday, ..., Sunday]
                // So we need: Sunday->6, Monday->0, Tuesday->1, etc.
                const adjustedIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                return (
                  <div key={idx} className="text-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="font-ethiopic text-xs sm:text-sm text-ethiopian-green font-semibold mb-1">
                      {ETHIOPIAN_DAYS[adjustedIndex]}
                    </div>
                    <div className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                      {date.getMonth() + 1}/{date.getDate()}
                    </div>
                    <div className="font-ethiopic text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1 hidden sm:block">
                      {formatEthiopianDate(ethDate, false)}
                    </div>
                    <div className="font-ethiopic text-[10px] sm:text-xs text-ethiopian-green font-medium mt-0.5">
                      {toGeezNumeral(ethDate.day)}
                    </div>
                  </div>
                );
              })}

              {/* Time Slots */}
              {timeSlots.map((slotInfo) => {
                const durationHours = slotInfo.durationHours || 1;
                const endHour = slotInfo.startHour + durationHours;
                const timeDisplay = durationHours === 1 
                  ? slotInfo.displayTime 
                  : `${slotInfo.displayTime} - ${endHour.toString().padStart(2, '0')}:00`;
                
                return (
                  <React.Fragment key={`group-${slotInfo.startHour}`}>
                    <div key={`time-${slotInfo.startHour}`} className="sticky left-0 bg-gray-50 dark:bg-gray-700 z-10 p-2 sm:p-3 text-right font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600 rounded-l-lg">
                      <span className="text-sm sm:text-base">{timeDisplay}</span>
                      {durationHours > 1 && (
                        <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1">
                          ({durationHours}h)
                        </div>
                      )}
                    </div>
                    {dates.map((date, idx) => {
                      const count = getDurationBlockCount(date, slotInfo.startHour, durationHours);
                      const isSelected = isDurationBlockSelected(date, slotInfo.startHour, durationHours);
                      
                      return (
                        <div
                          key={`${date}-${slotInfo.startHour}`}
                          className={`relative border cursor-pointer select-none rounded ${getSlotColor(date, slotInfo.startHour, durationHours)} ${!hasSubmitted ? 'hover:opacity-90 active:opacity-75' : ''} transition-opacity touch-manipulation`}
                          style={{ 
                            height: `${50 * durationHours}px`, 
                            minHeight: `${50 * durationHours}px` 
                          }}
                          onMouseDown={() => handleMouseDown(date, slotInfo.startHour, durationHours)}
                          onMouseEnter={() => handleMouseEnter(date, slotInfo.startHour, durationHours)}
                          onTouchStart={(e) => {
                            e.preventDefault();
                            handleMouseDown(date, slotInfo.startHour, durationHours);
                          }}
                        >
                          {count > 0 && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="font-ethiopic font-semibold text-white text-sm sm:text-base">
                                {toGeezNumeral(count)}
                              </span>
                            </div>
                          )}
                          {isSelected && !hasSubmitted && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Check className="text-white" size={16} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
        )}

        {/* Participants List */}
        {meeting.availability.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6 md:p-8 mt-6 sm:mt-8">
            <h2 className={`text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex flex-wrap items-center gap-2 sm:gap-3 text-gray-900 dark:text-white ${language === 'am' ? 'font-amharic' : ''}`}>
              <Users size={20} className="text-gray-600 dark:text-gray-400" />
              <span>{t.meeting.participants}</span>
              <span className="text-sm sm:text-base font-ethiopic bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 sm:px-3 py-1 rounded-full">
                {toGeezNumeral(meeting.availability.length)}
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {meeting.availability.map((entry: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3 sm:gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-ethiopian-green text-white flex items-center justify-center font-semibold text-base sm:text-lg flex-shrink-0">
                    {entry.userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate ${language === 'am' ? 'font-amharic' : ''}`}>{entry.userName}</div>
                    <div className={`text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 ${language === 'am' ? 'font-amharic' : ''}`}>
                      <span className="font-ethiopic text-gray-700 dark:text-gray-300">{toGeezNumeral(entry.slots.length)}</span>
                      <span>{language === 'am' ? 'ክፍቶች' : 'slots'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

