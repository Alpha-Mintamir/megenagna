"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Clock, Sparkles, Info } from "lucide-react";
import { getEthiopianToday, addDaysToEthiopianDate } from "@/lib/ethiopian-calendar";

export default function CreateMeeting() {
  const router = useRouter();
  
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(today.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(nextWeek.toISOString().split('T')[0]);
  const [startHour, setStartHour] = useState(9);
  const [endHour, setEndHour] = useState(17);
  const [creatorName, setCreatorName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !creatorName.trim()) {
      alert("Please fill in all required fields");
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
      
      // Small delay to ensure database write is complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      router.push(`/meeting/${data.meeting.id}`);
    } catch (error: any) {
      console.error('Error creating meeting:', error);
      alert(`Failed to create meeting: ${error.message || 'Please try again.'}`);
    }
  };

  return (
    <div className="min-h-screen ethiopian-pattern">
      {/* Header */}
      <header className="ethiopian-border bg-white shadow-xl">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6 md:py-8">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-ethiopian-green mb-4 sm:mb-6 font-semibold transition-colors group text-sm sm:text-base"
            >
              <ArrowLeft size={18} className="sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Home</span>
            </button>
          <div className="flex items-center gap-3 sm:gap-4">
            <Sparkles className="text-ethiopian-green flex-shrink-0" size={32} style={{ width: '32px', height: '32px' }} />
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-ethiopian-green mb-1 flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="font-ethiopic">መገናኛ</span>
                <span>·</span>
                <span>Create Meeting</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-700">Set up a meeting and share with your team</p>
            </div>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-4xl mx-auto px-4 py-4 sm:py-6 md:py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10 ethiopian-border">
          {/* Meeting Title */}
          <div className="mb-6 sm:mb-8">
            <label className="block text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
              <span>Meeting Title</span>
              <span className="text-ethiopian-red">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Team Weekly Standup, Project Review Meeting"
              className="w-full px-4 sm:px-6 py-3 sm:py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-ethiopian-green/20 focus:border-ethiopian-green transition-all text-base sm:text-lg"
              required
            />
          </div>

          {/* Your Name */}
          <div className="mb-6 sm:mb-8">
            <label className="block text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
              <span>Your Name</span>
              <span className="text-ethiopian-red">*</span>
            </label>
            <input
              type="text"
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 sm:px-6 py-3 sm:py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-ethiopian-green/20 focus:border-ethiopian-green transition-all text-base sm:text-lg"
              required
            />
          </div>

          {/* Description */}
          <div className="mb-6 sm:mb-8">
            <label className="block text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
              <span>Description</span>
              <span className="text-xs sm:text-sm text-gray-500 font-normal">(Optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add any additional details about the meeting..."
              rows={4}
              className="w-full px-4 sm:px-6 py-3 sm:py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-ethiopian-green/20 focus:border-ethiopian-green transition-all text-base sm:text-lg resize-none"
            />
          </div>

          {/* Date Range */}
          <div className="mb-6 sm:mb-8">
            <label className="block text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
              <Calendar size={20} className="sm:w-6 sm:h-6 text-ethiopian-green" />
              <span>Date Range</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-ethiopian-green/20 focus:border-ethiopian-green transition-all text-base sm:text-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-ethiopian-green/20 focus:border-ethiopian-green transition-all text-base sm:text-lg"
                  required
                />
              </div>
            </div>
          </div>

          {/* Time Range */}
          <div className="mb-6 sm:mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Clock size={16} className="sm:w-[18px] sm:h-[18px]" />
              Time Range (for each day)
            </label>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Start Time</label>
                <select
                  value={startHour}
                  onChange={(e) => setStartHour(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ethiopian-green focus:border-transparent"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {i.toString().padStart(2, '0')}:00
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">End Time</label>
                <select
                  value={endHour}
                  onChange={(e) => setEndHour(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ethiopian-green focus:border-transparent"
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

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-6 border-t border-gray-200 gap-3 sm:gap-0">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="px-6 py-3 text-gray-600 hover:text-gray-900 text-base sm:text-lg order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-ethiopian-green hover:bg-ethiopian-green/90 text-white px-6 sm:px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all text-base sm:text-lg order-1 sm:order-2"
            >
              Create Meeting
            </button>
          </div>
        </form>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Create your meeting with the date and time ranges you want to consider</li>
            <li>Share the meeting link with your team members</li>
            <li>Each person marks the times they're available</li>
            <li>The calendar will show you which times work best for everyone</li>
          </ol>
        </div>
      </main>
    </div>
  );
}

