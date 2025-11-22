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
  const lastTouchTimeRef = useRef(0);
  
  if (selectedDates.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-12 text-center border-2 md:border-4 border-ethiopian-gold">
        <div className="text-4xl md:text-6xl mb-3 md:mb-4">📅</div>
        <h3 className="text-lg md:text-2xl font-bold text-ethiopian-dark-green dark:text-ethiopian-green mb-2">
          Select Dates
        </h3>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
          Please select dates from the calendar to start marking your availability
        </p>
      </div>
    );
  }
  
  if (!currentParticipant) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-12 text-center border-2 md:border-4 border-ethiopian-gold">
        <div className="text-4xl md:text-6xl mb-3 md:mb-4">👤</div>
        <h3 className="text-lg md:text-2xl font-bold text-ethiopian-dark-green dark:text-ethiopian-green mb-2">
          Add Your Name
        </h3>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
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
    // Ignore mouse events that fire immediately after touch events
    // Increase timeout to 1000ms to be safe on all devices
    if (Date.now() - lastTouchTimeRef.current < 1000) return;

    setIsDragging(true);
    const count = getAvailabilityCount(date, hour);
    const participant = participants.find(p => p.id === currentParticipant);
    const slot = useSchedulerStore.getState().timeSlots.get(
      `${date.toISOString().split('T')[0]}_${hour}`
    );
    const hasCurrentUser = slot?.participants.includes(currentParticipant);
    
    // Set drag mode based on current state of the clicked slot
    setDragMode(hasCurrentUser ? 'deselect' : 'select');
    
    // Immediately toggle the first slot
    toggleTimeSlot(date, hour);
  };

  const handleTouchStart = (date: Date, hour: number, e: React.TouchEvent) => {
    lastTouchTimeRef.current = Date.now();
    
    setIsDragging(true);
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

  // Handle touch move for mobile dragging
  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && dragMode) {
      const touch = e.touches[0];
      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      
      if (element) {
        // Try to get data attributes from the element or its parent
        const target = element.closest('[data-date][data-hour]') as HTMLElement;
        
        if (target) {
          const dateStr = target.dataset.date;
          const hourStr = target.dataset.hour;
          
          if (dateStr && hourStr) {
            const date = new Date(dateStr);
            const hour = parseInt(hourStr, 10);
            
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
        }
      }
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
    setDragMode(null);
  };
  
  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchend', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleMouseUp);
    };
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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 md:p-6 border-2 md:border-4 border-ethiopian-gold">
      <div className="mb-3 md:mb-4">
        <h3 className="text-base md:text-xl font-bold text-ethiopian-dark-green dark:text-ethiopian-green mb-1 md:mb-2">
          Mark Your Availability
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm mb-3 md:mb-4">
          Tap time slots to mark when you're available. Green intensity shows how many people are available.
        </p>
        
        {/* Legend */}
        <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2 md:gap-4 text-xs md:text-sm">
          <div className="flex items-center gap-1.5 md:gap-2">
            <div className="w-3 h-3 md:w-4 md:h-4 bg-ethiopian-green rounded flex-shrink-0"></div>
            <span className="dark:text-gray-300">Everyone</span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2">
            <div className="w-3 h-3 md:w-4 md:h-4 bg-green-400 rounded flex-shrink-0"></div>
            <span className="dark:text-gray-300">Most</span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2">
            <div className="w-3 h-3 md:w-4 md:h-4 bg-ethiopian-yellow rounded flex-shrink-0"></div>
            <span className="dark:text-gray-300">Some</span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2">
            <div className="w-3 h-3 md:w-4 md:h-4 bg-orange-300 rounded flex-shrink-0"></div>
            <span className="dark:text-gray-300">Few</span>
          </div>
        </div>
      </div>
      
      {/* Mobile: Vertical layout - one date per section */}
      <div className="md:hidden space-y-4">
        {selectedDates.map((date, dateIdx) => {
          const ethDate = gregorianToEthiopian(date);
          const weekDay = getEthiopianWeekDay(date);
          
          return (
            <div key={dateIdx} className="border-2 border-ethiopian-gold rounded-lg overflow-hidden">
              {/* Date header */}
              <div className="p-2 bg-ethiopian-light-gold dark:bg-gray-700 border-b-2 border-ethiopian-gold">
                <div className="text-center">
                  <div className="font-ethiopic font-bold text-ethiopian-dark-green dark:text-ethiopian-green text-sm">
                    {weekDay}
                  </div>
                  <div className="font-ethiopic text-xs text-ethiopian-green dark:text-ethiopian-green mt-0.5">
                    {formatEthiopianDate(ethDate, true)}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>
              
              {/* Time slots - vertical list */}
              <div className="bg-white dark:bg-gray-800">
                {hours.map(hour => {
                  const count = getAvailabilityCount(date, hour);
                  const isAvailable = isCurrentUserAvailable(date, hour);
                  
                  return (
                    <div
                      key={hour}
                      data-date={date.toISOString()}
                      data-hour={hour}
                      onTouchStart={(e) => handleTouchStart(date, hour, e)}
                      onTouchMove={handleTouchMove}
                      onMouseDown={() => handleMouseDown(date, hour)}
                      onMouseEnter={() => handleMouseEnter(date, hour)}
                      className={`
                        flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer transition-all touch-manipulation active:bg-gray-100 dark:active:bg-gray-600
                        ${getCellColor(date, hour)}
                        ${isAvailable ? 'ring-2 ring-inset ring-ethiopian-red' : ''}
                        active:opacity-80
                      `}
                    >
                      <span className="text-base font-semibold text-gray-700 dark:text-gray-300">
                        {formatHour(hour)}
                      </span>
                      {count > 0 && (
                        <span className="text-xs font-bold text-white bg-black bg-opacity-50 px-2.5 py-1 rounded-full">
                          {count}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Desktop: Horizontal layout */}
      <div className="hidden md:block overflow-x-auto scrollbar-hide">
        <div 
          ref={gridRef}
          className="inline-block min-w-full select-none"
          style={{ userSelect: 'none' }}
        >
          <div className="flex">
            {/* Time column */}
            <div className="flex flex-col sticky left-0 bg-white dark:bg-gray-800 z-10">
              <div className="h-24 border-b-2 border-ethiopian-gold"></div>
              {hours.map(hour => (
                <div
                  key={hour}
                  className="h-12 flex items-center justify-end pr-3 text-sm font-semibold text-ethiopian-dark-green dark:text-ethiopian-green border-b border-gray-200 dark:border-gray-700"
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
                  <div className="h-24 p-2 border-b-2 border-ethiopian-gold bg-ethiopian-light-gold dark:bg-gray-700">
                    <div className="text-center">
                      <div className="font-ethiopic font-bold text-ethiopian-dark-green dark:text-ethiopian-green text-sm">
                        {weekDay}
                      </div>
                      <div className="font-ethiopic text-xs text-ethiopian-green dark:text-ethiopian-green mt-1">
                        {formatEthiopianDate(ethDate, true)}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
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
                        data-date={date.toISOString()}
                        data-hour={hour}
                        onMouseDown={() => handleMouseDown(date, hour)}
                        onMouseEnter={() => handleMouseEnter(date, hour)}
                        className={`
                          h-14 border-b border-r border-gray-200 dark:border-gray-700 cursor-pointer transition-all
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

