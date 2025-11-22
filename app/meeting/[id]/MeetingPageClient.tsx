'use client';

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users, Calendar, Share2, Check, Sparkles } from "lucide-react";
import { 
  gregorianToEthiopian, 
  formatEthiopianDate, 
  ETHIOPIAN_DAYS,
  toGeezNumeral 
} from "@/lib/ethiopian-calendar";

interface Props {
  meetingId: string;
}

export default function MeetingPageClient({ meetingId }: Props) {
  const router = useRouter();
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
      <div className="min-h-screen flex items-center justify-center ethiopian-pattern">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-ethiopian-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Loading meeting...</p>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-screen flex items-center justify-center ethiopian-pattern">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Meeting not found</h1>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-ethiopian-green text-white rounded-lg hover:bg-ethiopian-dark-green"
          >
            Go Home
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
      alert("Please enter your name");
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

      if (!response.ok) {
        throw new Error('Failed to save availability');
      }

      const data = await response.json();
      setMeeting(data.meeting);
      setHasSubmitted(true);
    } catch (error) {
      console.error('Error saving availability:', error);
      alert('Failed to save availability. Please try again.');
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
      return "bg-blue-500 border-blue-600";
    }
    
    const count = getDurationBlockCount(date, startHour, durationHours);
    if (count === 0) return "bg-gray-100 border-gray-200";
    
    const intensity = count / Math.max(maxCount, 1);
    
    if (intensity >= 0.8) return "bg-ethiopian-green border-ethiopian-green";
    if (intensity >= 0.6) return "bg-green-400 border-green-500";
    if (intensity >= 0.4) return "bg-ethiopian-yellow border-yellow-500";
    if (intensity >= 0.2) return "bg-yellow-300 border-yellow-400";
    return "bg-orange-200 border-orange-300";
  };

  const copyLink = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen ethiopian-pattern pb-24 md:pb-0" onMouseUp={handleMouseUp}>
      {/* Mobile-Optimized Header */}
      <header className="ethiopian-border bg-white shadow-xl sticky top-0 z-40 md:relative">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-8">
          {/* Mobile: Compact header */}
          <div className="md:hidden">
            <div className="flex items-center gap-3 mb-3">
              <button
                onClick={() => router.push('/')}
                className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors touch-manipulation"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div className="flex-1 min-w-0">
                <h1 className="text-base font-bold text-gray-900 truncate">
                  {meeting.title}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-gray-500">
                    {new Date(meeting.dateRange.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(meeting.dateRange.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-[10px] text-gray-500">·</span>
                  <span className="text-[10px] font-ethiopic text-ethiopian-green font-bold">{toGeezNumeral(meeting.availability.length)}</span>
                  <span className="text-[10px] text-gray-500">responses</span>
                </div>
              </div>
              <button
                onClick={copyLink}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-ethiopian-green/10 hover:bg-ethiopian-green/20 transition-colors touch-manipulation"
              >
                {copied ? <Check size={18} className="text-ethiopian-green" /> : <Share2 size={18} className="text-ethiopian-green" />}
              </button>
            </div>
          </div>
          
          {/* Desktop: Full header */}
          <div className="hidden md:block">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-ethiopian-green mb-6 font-semibold transition-colors group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span>Back to Home</span>
            </button>
            
            <div className="flex flex-row items-start justify-between gap-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles className="text-ethiopian-green" size={32} />
                  <h1 className="text-4xl font-bold text-gray-900 break-words">
                    {meeting.title}
                  </h1>
                </div>
                {meeting.description && (
                  <p className="text-gray-600 text-lg mb-4 ml-11">{meeting.description}</p>
                )}
                <div className="flex items-center gap-6 text-sm text-gray-600 ml-11">
                  <span className="flex items-center gap-2 bg-ethiopian-green/10 px-4 py-2 rounded-full">
                    <Calendar size={18} className="text-ethiopian-green" />
                    <span className="font-semibold">
                      {new Date(meeting.dateRange.start).toISOString().split('T')[0]} - {new Date(meeting.dateRange.end).toISOString().split('T')[0]}
                    </span>
                  </span>
                  <span className="flex items-center gap-2 bg-ethiopian-yellow/20 px-4 py-2 rounded-full">
                    <Users size={18} className="text-yellow-700" />
                    <span className="font-ethiopic font-bold">{toGeezNumeral(meeting.availability.length)}</span>
                    <span className="font-semibold">responses</span>
                  </span>
                </div>
              </div>
              
              <button
                onClick={copyLink}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-ethiopian-green to-green-600 text-white rounded-xl hover:shadow-xl transition-all font-semibold"
              >
                {copied ? <Check size={20} /> : <Share2 size={20} />}
                {copied ? "Copied!" : "Share Link"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-4 sm:py-6 md:py-8">
        {/* Mobile: Sticky Bottom Input */}
        {!hasSubmitted && (
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl z-40 p-4">
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Your name"
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-ethiopian-green/20 focus:border-ethiopian-green transition-all text-base touch-manipulation"
              />
              <button
                onClick={handleSubmit}
                disabled={selectedSlots.size === 0 || !userName.trim()}
                className="px-6 py-3 bg-gradient-to-r from-ethiopian-green to-green-600 text-white rounded-xl font-bold text-base shadow-lg disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all touch-manipulation flex items-center justify-center min-w-[80px]"
              >
                <Check size={20} />
                Submit
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <div className="w-4 h-4 bg-blue-500 border-2 border-blue-600 rounded"></div>
              <p>
                Tap slots to select · <span className="font-ethiopic font-bold text-ethiopian-green">{toGeezNumeral(selectedSlots.size)}</span> selected
              </p>
            </div>
          </div>
        )}
        
        {/* Desktop: User Input Section */}
        {!hasSubmitted && (
          <div className="hidden md:block bg-gradient-to-br from-white to-ethiopian-green/5 rounded-2xl shadow-2xl p-8 mb-8 ethiopian-border animate-fadeIn">
            <h2 className="text-2xl font-bold mb-2 text-gray-900">
              Mark Your Availability
            </h2>
            <p className="text-gray-600 mb-6">Select the times when you're free to meet</p>
            <div className="flex items-center gap-4">
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-ethiopian-green/20 focus:border-ethiopian-green transition-all text-lg"
              />
              <button
                onClick={handleSubmit}
                disabled={selectedSlots.size === 0 || !userName.trim()}
                className="px-8 py-4 bg-gradient-to-r from-ethiopian-green to-green-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                <Check size={24} />
                Submit
              </button>
            </div>
            <div className="flex items-center gap-2 mt-4 text-sm text-gray-600">
              <div className="w-6 h-6 bg-blue-500 border-2 border-blue-600 rounded"></div>
              <p>
                Click and drag to select times when you're available · Selected: <span className="font-ethiopic font-bold text-ethiopian-green">{toGeezNumeral(selectedSlots.size)}</span> slots
              </p>
            </div>
          </div>
        )}

        {hasSubmitted && (
          <div className="bg-gradient-to-r from-ethiopian-green/10 to-green-50 border-2 border-ethiopian-green rounded-2xl p-8 mb-8 animate-fadeIn">
            <div className="flex items-center gap-4">
              <div className="bg-ethiopian-green rounded-full p-3">
                <Check className="text-white" size={32} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-2xl text-gray-900 mb-1">
                  Success!
                </h3>
                <p className="text-gray-700 text-lg">Your availability has been saved. Share this link with others to collect their availability.</p>
              </div>
            </div>
          </div>
        )}

        {/* Calendar Grid */}
        {dates.length > 0 && timeSlots.length > 0 && (
        <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 overflow-x-auto ethiopian-border -mx-4 sm:mx-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-1 text-gray-900">
                Availability Grid
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">Heat map showing team availability</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm w-full sm:w-auto">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-ethiopian-green border-2 border-ethiopian-green rounded-lg shadow-md flex-shrink-0"></div>
                <span className="font-semibold whitespace-nowrap">Most available</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-ethiopian-yellow border-2 border-yellow-500 rounded-lg shadow-md flex-shrink-0"></div>
                <span className="font-semibold whitespace-nowrap">Somewhat available</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-100 border-2 border-gray-200 rounded-lg flex-shrink-0"></div>
                <span className="font-semibold whitespace-nowrap">No responses</span>
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
                return (
                  <div key={idx} className="text-center p-2 sm:p-3 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-lg sm:rounded-xl shadow-sm">
                    <div className="font-ethiopic text-xs sm:text-sm text-ethiopian-green font-bold mb-0.5 sm:mb-1">
                      {ETHIOPIAN_DAYS[dayOfWeek]}
                    </div>
                    <div className="text-sm sm:text-base font-bold text-gray-800">
                      {date.getMonth() + 1}/{date.getDate()}
                    </div>
                    <div className="font-ethiopic text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1 hidden sm:block">
                      {formatEthiopianDate(ethDate, false)}
                    </div>
                    <div className="font-ethiopic text-[10px] sm:text-xs text-ethiopian-green font-semibold">
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
                    <div key={`time-${slotInfo.startHour}`} className="sticky left-0 bg-gradient-to-r from-white to-gray-50 z-10 p-2 sm:p-3 text-right font-bold text-gray-800 border-r-2 sm:border-r-4 border-ethiopian-green/20 rounded-l-md sm:rounded-l-lg">
                      <span className="text-sm sm:text-base md:text-lg">{timeDisplay}</span>
                      {durationHours > 1 && (
                        <div className="text-[10px] sm:text-xs text-gray-500 mt-1">
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
                          className={`relative border-2 cursor-pointer select-none slot-cell rounded-md sm:rounded-lg ${getSlotColor(date, slotInfo.startHour, durationHours)} ${!hasSubmitted ? 'active:scale-95 sm:hover:scale-105' : ''} touch-manipulation`}
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
                              <span className="font-ethiopic font-bold text-white drop-shadow-lg text-base sm:text-lg md:text-xl">
                                {toGeezNumeral(count)}
                              </span>
                            </div>
                          )}
                          {isSelected && !hasSubmitted && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Check className="text-white drop-shadow-lg" size={18} style={{ width: '18px', height: '18px' }} />
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
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 mt-6 sm:mt-8 ethiopian-border">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 flex flex-wrap items-center gap-2 sm:gap-3 text-gray-900">
              <Users size={24} className="sm:w-8 sm:h-8 text-ethiopian-green" />
              <span>Participants</span>
              <span className="text-lg sm:text-xl font-ethiopic bg-ethiopian-green text-white px-3 sm:px-4 py-1 rounded-full">
                ({toGeezNumeral(meeting.availability.length)})
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {meeting.availability.map((entry: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 card-hover shadow-md">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-ethiopian-green to-green-600 text-white flex items-center justify-center font-bold text-lg sm:text-xl shadow-lg flex-shrink-0">
                    {entry.userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-base sm:text-lg text-gray-900 truncate">{entry.userName}</div>
                    <div className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
                      <span className="font-ethiopic text-ethiopian-green font-semibold">{toGeezNumeral(entry.slots.length)}</span>
                      <span>slots selected</span>
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

