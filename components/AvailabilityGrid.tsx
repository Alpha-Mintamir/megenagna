'use client';

import { useState, useRef, useEffect } from 'react';
import { useSchedulerStore } from '@/lib/store';
import { gregorianToEthiopian, formatEthiopianDate, getEthiopianWeekDay } from '@/lib/ethiopian-calendar';

export default function AvailabilityGrid() {
  const {
    selectedDates,
    currentParticipant,
    participants,
    startHour,
    endHour,
    toggleTimeSlot,
    getAvailabilityCount
  } = useSchedulerStore();
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<'select' | 'deselect' | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  
  if (selectedDates.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 text-center border-4 border-ethiopian-gold">
        <div className="text-6xl mb-4">📅</div>
        <h3 className="text-2xl font-bold text-ethiopian-dark-green mb-2">
          Select Dates
        </h3>
        <p className="text-gray-600">
          Please select dates from the calendar to start marking your availability
        </p>
      </div>
    );
  }
  
  if (!currentParticipant) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 text-center border-4 border-ethiopian-gold">
        <div className="text-6xl mb-4">👤</div>
        <h3 className="text-2xl font-bold text-ethiopian-dark-green mb-2">
          Add Your Name
        </h3>
        <p className="text-gray-600">
          Please enter your name to mark your availability
        </p>
      </div>
    );
  }
  
  const hours = Array.from(
    { length: endHour - startHour },
    (_, i) => startHour + i
  );
  
  const formatHour = (hour: number): string => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:00 ${period}`;
  };
  
  const handleMouseDown = (date: Date, hour: number) => {
    setIsDragging(true);
    const count = getAvailabilityCount(date, hour);
    const participant = participants.find(p => p.id === currentParticipant);
    const slot = useSchedulerStore.getState().timeSlots.get(
      `${date.toISOString().split('T')[0]}_${hour}`
    );
    const hasCurrentUser = slot?.participants.includes(currentParticipant);
    
    setDragMode(hasCurrentUser ? 'deselect' : 'select');
    toggleTimeSlot(date, hour);
  };
  
  const handleMouseEnter = (date: Date, hour: number) => {
    if (isDragging && dragMode) {
      const slot = useSchedulerStore.getState().timeSlots.get(
        `${date.toISOString().split('T')[0]}_${hour}`
      );
      const hasCurrentUser = slot?.participants.includes(currentParticipant);
      
      if (
        (dragMode === 'select' && !hasCurrentUser) ||
        (dragMode === 'deselect' && hasCurrentUser)
      ) {
        toggleTimeSlot(date, hour);
      }
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
    setDragMode(null);
  };
  
  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);
  
  const getCellColor = (date: Date, hour: number): string => {
    const count = getAvailabilityCount(date, hour);
    const totalParticipants = participants.length;
    
    if (count === 0) return 'bg-gray-50';
    
    const percentage = count / totalParticipants;
    
    if (percentage === 1) return 'bg-ethiopian-green';
    if (percentage >= 0.7) return 'bg-green-400';
    if (percentage >= 0.4) return 'bg-ethiopian-yellow';
    return 'bg-orange-300';
  };
  
  const isCurrentUserAvailable = (date: Date, hour: number): boolean => {
    const slot = useSchedulerStore.getState().timeSlots.get(
      `${date.toISOString().split('T')[0]}_${hour}`
    );
    return slot?.participants.includes(currentParticipant) || false;
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-4 border-ethiopian-gold">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-ethiopian-dark-green mb-2">
          Mark Your Availability
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          Click and drag to mark when you're available. Green intensity shows how many people are available.
        </p>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-ethiopian-green rounded"></div>
            <span>Everyone available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-400 rounded"></div>
            <span>Most available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-ethiopian-yellow rounded"></div>
            <span>Some available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-300 rounded"></div>
            <span>Few available</span>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <div 
          ref={gridRef}
          className="inline-block min-w-full select-none"
          style={{ userSelect: 'none' }}
        >
          <div className="flex">
            {/* Time column */}
            <div className="flex flex-col sticky left-0 bg-white z-10">
              <div className="h-24 border-b-2 border-ethiopian-gold"></div>
              {hours.map(hour => (
                <div
                  key={hour}
                  className="h-12 flex items-center justify-end pr-3 text-sm font-semibold text-ethiopian-dark-green border-b border-gray-200"
                >
                  {formatHour(hour)}
                </div>
              ))}
            </div>
            
            {/* Date columns */}
            {selectedDates.map((date, dateIdx) => {
              const ethDate = gregorianToEthiopian(date);
              const weekDay = getEthiopianWeekDay(date);
              
              return (
                <div key={dateIdx} className="flex flex-col min-w-[120px]">
                  {/* Date header */}
                  <div className="h-24 p-2 border-b-2 border-ethiopian-gold bg-ethiopian-light-gold">
                    <div className="text-center">
                      <div className="font-ethiopic font-bold text-ethiopian-dark-green text-sm">
                        {weekDay}
                      </div>
                      <div className="font-ethiopic text-xs text-ethiopian-green mt-1">
                        {formatEthiopianDate(ethDate, true)}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  
                  {/* Time slots */}
                  {hours.map(hour => {
                    const count = getAvailabilityCount(date, hour);
                    const isAvailable = isCurrentUserAvailable(date, hour);
                    
                    return (
                      <div
                        key={hour}
                        onMouseDown={() => handleMouseDown(date, hour)}
                        onMouseEnter={() => handleMouseEnter(date, hour)}
                        className={`
                          h-12 border-b border-r border-gray-200 cursor-pointer transition-all
                          ${getCellColor(date, hour)}
                          ${isAvailable ? 'ring-2 ring-inset ring-ethiopian-red' : ''}
                          hover:opacity-80
                        `}
                      >
                        {count > 0 && (
                          <div className="h-full flex items-center justify-center">
                            <span className="text-xs font-bold text-white bg-black bg-opacity-50 px-2 py-1 rounded">
                              {count}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

