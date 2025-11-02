"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users, Calendar, Share2, Copy, Check, Sparkles } from "lucide-react";
import { 
  gregorianToEthiopian, 
  formatEthiopianDate, 
  ETHIOPIAN_DAYS,
  toGeezNumeral 
} from "@/lib/ethiopian-calendar";

interface PageProps {
  params: { id: string };
}

export default function MeetingPage({ params }: PageProps) {
  const router = useRouter();
  const [meeting, setMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  const [userName, setUserName] = useState("");
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [userId, setUserId] = useState("");
  const [copied, setCopied] = useState(false);

  // Fix hydration issues - generate userId on client only
  useEffect(() => {
    setMounted(true);
    setUserId(Math.random().toString(36).substring(2, 11));
  }, []);

  // Fetch meeting from database - only on client side
  useEffect(() => {
    if (!mounted) return;
    
    async function fetchMeeting() {
      try {
        console.log('Fetching meeting:', params.id);
        const response = await fetch(`/api/meetings/${params.id}`);
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
        alert(`Failed to load meeting: ${error.message}. Check if MongoDB environment variables are set in Vercel.`);
        // Don't redirect immediately, let user see the error
        setLoading(false);
      } finally {
        setLoading(false);
      }
    }
    
    fetchMeeting();
  }, [params.id, router, mounted]);

  // Avoid rendering on the server to prevent hydration mismatches (timezone/locale)
  if (!mounted) {
    return null;
  }

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

  // Generate time slots
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = meeting.timeRange.start.hour; hour < meeting.timeRange.end.hour; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  }, [meeting.timeRange]);

  // Generate date range
  const dates = useMemo(() => {
    const start = new Date(meeting.dateRange.start);
    const end = new Date(meeting.dateRange.end);
    const dateArray = [];
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dateArray.push(new Date(d));
    }
    
    return dateArray;
  }, [meeting.dateRange]);

  // Calculate availability count for each slot
  const slotCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    
    meeting.availability.forEach((entry: any) => {
      entry.slots.forEach((slot: string) => {
        counts[slot] = (counts[slot] || 0) + 1;
      });
    });
    
    return counts;
  }, [meeting.availability]);

  const maxCount = Math.max(...Object.values(slotCounts), 0);

  const handleSlotClick = (date: Date, time: string) => {
    if (hasSubmitted) return;
    
    const slotId = `${date.toISOString().split('T')[0]}T${time}`;
    const newSelected = new Set(selectedSlots);
    
    if (newSelected.has(slotId)) {
      newSelected.delete(slotId);
    } else {
      newSelected.add(slotId);
    }
    
    setSelectedSlots(newSelected);
  };

  const handleMouseDown = (date: Date, time: string) => {
    if (hasSubmitted) return;
    setIsSelecting(true);
    handleSlotClick(date, time);
  };

  const handleMouseEnter = (date: Date, time: string) => {
    if (isSelecting && !hasSubmitted) {
      handleSlotClick(date, time);
    }
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
  };

  const handleSubmit = async () => {
    if (!userName.trim()) {
      alert("Please enter your name");
      return;
    }

    try {
      const response = await fetch(`/api/meetings/${params.id}`, {
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

  const getSlotColor = (slotId: string) => {
    if (selectedSlots.has(slotId) && !hasSubmitted) {
      return "bg-blue-500 border-blue-600";
    }
    
    const count = slotCounts[slotId] || 0;
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
    <div className="min-h-screen ethiopian-pattern" onMouseUp={handleMouseUp}>
      {/* Header */}
      <header className="ethiopian-border bg-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-8">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-ethiopian-green mb-6 font-semibold transition-colors group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span>Back to Home</span>
            </button>
          
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Sparkles className="text-ethiopian-green" size={32} />
                <h1 className="text-4xl font-bold text-gray-900">
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
                    {new Date(meeting.dateRange.start).toLocaleDateString()} - {new Date(meeting.dateRange.end).toLocaleDateString()}
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
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* User Input Section */}
        {!hasSubmitted && (
          <div className="bg-gradient-to-br from-white to-ethiopian-green/5 rounded-2xl shadow-2xl p-8 mb-8 ethiopian-border animate-fadeIn">
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
        <div className="bg-white rounded-2xl shadow-2xl p-8 overflow-x-auto ethiopian-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold mb-1 text-gray-900">
                Availability Grid
              </h2>
              <p className="text-gray-600">Heat map showing team availability</p>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-ethiopian-green border-2 border-ethiopian-green rounded-lg shadow-md"></div>
                <span className="font-semibold">Most available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-ethiopian-yellow border-2 border-yellow-500 rounded-lg shadow-md"></div>
                <span className="font-semibold">Somewhat available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-100 border-2 border-gray-200 rounded-lg"></div>
                <span className="font-semibold">No responses</span>
              </div>
            </div>
          </div>

          <div className="min-w-max">
            <div className="grid gap-2" style={{ gridTemplateColumns: `140px repeat(${dates.length}, 90px)` }}>
              {/* Header Row */}
              <div className="sticky left-0 bg-white z-10"></div>
              {dates.map((date, idx) => {
                const ethDate = gregorianToEthiopian(date);
                const dayOfWeek = date.getDay();
                return (
                  <div key={idx} className="text-center p-3 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl shadow-sm">
                    <div className="font-ethiopic text-sm text-ethiopian-green font-bold mb-1">
                      {ETHIOPIAN_DAYS[dayOfWeek]}
                    </div>
                    <div className="text-base font-bold text-gray-800">
                      {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="font-ethiopic text-xs text-gray-600 mt-1">
                      {formatEthiopianDate(ethDate, false)}
                    </div>
                    <div className="font-ethiopic text-xs text-ethiopian-green font-semibold">
                      {toGeezNumeral(ethDate.day)}
                    </div>
                  </div>
                );
              })}

              {/* Time Slots */}
              {timeSlots.map((time) => (
                <React.Fragment key={`group-${time}`}>
                  <div key={`time-${time}`} className="sticky left-0 bg-gradient-to-r from-white to-gray-50 z-10 p-3 text-right font-bold text-gray-800 border-r-4 border-ethiopian-green/20 rounded-l-lg">
                    <span className="text-lg">{time}</span>
                  </div>
                  {dates.map((date, idx) => {
                    const slotId = `${date.toISOString().split('T')[0]}T${time}`;
                    const count = slotCounts[slotId] || 0;
                    
                    return (
                      <div
                        key={`${date}-${time}`}
                        className={`relative border-2 cursor-pointer select-none slot-cell rounded-lg ${getSlotColor(slotId)} ${!hasSubmitted ? 'hover:scale-105' : ''}`}
                        style={{ height: '60px' }}
                        onMouseDown={() => handleMouseDown(date, time)}
                        onMouseEnter={() => handleMouseEnter(date, time)}
                      >
                        {count > 0 && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="font-ethiopic font-bold text-white drop-shadow-lg text-xl">
                              {toGeezNumeral(count)}
                            </span>
                          </div>
                        )}
                        {selectedSlots.has(slotId) && !hasSubmitted && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Check className="text-white drop-shadow-lg" size={24} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Participants List */}
        {meeting.availability.length > 0 && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 mt-8 ethiopian-border">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-gray-900">
              <Users size={32} className="text-ethiopian-green" />
              <span>Participants</span>
              <span className="text-xl font-ethiopic bg-ethiopian-green text-white px-4 py-1 rounded-full">
                ({toGeezNumeral(meeting.availability.length)})
              </span>
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {meeting.availability.map((entry: any, idx: number) => (
                <div key={idx} className="flex items-center gap-4 p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 card-hover shadow-md">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-ethiopian-green to-green-600 text-white flex items-center justify-center font-bold text-xl shadow-lg">
                    {entry.userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-lg text-gray-900">{entry.userName}</div>
                    <div className="text-sm text-gray-600 flex items-center gap-1">
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

