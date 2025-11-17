'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users, Calendar, Share2, Check, Sparkles } from 'lucide-react';
import { 
  gregorianToEthiopian, 
  formatEthiopianDate, 
  ETHIOPIAN_DAYS,
  toGeezNumeral 
} from '@/lib/ethiopian-calendar';

interface Props {
  id: string;
}

export default function MeetingClient({ id }: Props) {
  const router = useRouter();
  const [meeting, setMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const [userName, setUserName] = useState('');
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [userId, setUserId] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUserId(Math.random().toString(36).substring(2, 11));
  }, []);

  useEffect(() => {
    if (!mounted) return;
    async function fetchMeeting() {
      try {
        console.log('Fetching meeting:', id);
        const response = await fetch(`/api/meetings/${id}`);
        console.log('Response status:', response.status);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('API error:', errorData);
          throw new Error(errorData.error || 'Meeting not found');
        }
        const data = await response.json();
        console.log('Meeting data:', data);
        if (!data.meeting) throw new Error('No meeting data received');
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
  }, [id, mounted]);

  if (!mounted) return null;
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
          <button onClick={() => router.push('/')} className="px-6 py-3 bg-ethiopian-green text-white rounded-lg hover:bg-ethiopian-dark-green">Go Home</button>
        </div>
      </div>
    );
  }

  // time slots generation
  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    for (let hour = meeting.timeRange.start.hour; hour < meeting.timeRange.end.hour; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  }, [meeting.timeRange]);

  const dates = useMemo(() => {
    const start = new Date(meeting.dateRange.start);
    const end = new Date(meeting.dateRange.end);
    const dateArray: Date[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dateArray.push(new Date(d));
    }
    return dateArray;
  }, [meeting.dateRange]);

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
    const next = new Set(selectedSlots);
    next.has(slotId) ? next.delete(slotId) : next.add(slotId);
    setSelectedSlots(next);
  };

  const handleMouseDown = (date: Date, time: string) => {
    if (hasSubmitted) return;
    setIsSelecting(true);
    handleSlotClick(date, time);
  };

  const handleMouseEnter = (date: Date, time: string) => {
    if (isSelecting && !hasSubmitted) handleSlotClick(date, time);
  };

  const handleMouseUp = () => setIsSelecting(false);

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const getSlotColor = (slotId: string) => {
    if (selectedSlots.has(slotId) && !hasSubmitted) return 'bg-blue-500 border-blue-600';
    const count = slotCounts[slotId] || 0;
    const intensity = count / Math.max(maxCount, 1);
    if (count === 0) return 'bg-gray-100 border-gray-200';
    if (intensity >= 0.8) return 'bg-ethiopian-green border-ethiopian-green';
    if (intensity >= 0.6) return 'bg-green-400 border-green-500';
    if (intensity >= 0.4) return 'bg-ethiopian-yellow border-yellow-500';
    if (intensity >= 0.2) return 'bg-yellow-300 border-yellow-400';
    return 'bg-orange-200 border-orange-300';
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
          <button onClick={() => router.push('/')} className="flex items-center gap-2 text-gray-600 hover:text-ethiopian-green mb-6 font-semibold transition-colors group">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </button>
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Sparkles className="text-ethiopian-green" size={32} />
                <h1 className="text-4xl font-bold text-gray-900">{meeting.title}</h1>
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
            <button onClick={copyLink} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-ethiopian-green to-green-600 text-white rounded-xl hover:shadow-xl transition-all font-semibold">
              {copied ? <Check size={20} /> : <Share2 size={20} />}
              {copied ? 'Copied!' : 'Share Link'}
            </button>
          </div>
        </div>
      </header>

      {/* The rest of the content mirrors the previous page component (grid, list, etc.) */}

      {/* Calendar Grid */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* ... keep existing JSX from previous page for grid and participants ... */}
      </main>
    </div>
  );
}




