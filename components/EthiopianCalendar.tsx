'use client';

import { useState } from 'react';
import { 
  getCurrentEthiopianDate, 
  ethiopianToGregorian, 
  gregorianToEthiopian,
  ETHIOPIAN_MONTHS,
  toEthiopicNumeral,
  getDaysInEthiopianMonth,
  EthiopianDate
} from '@/lib/ethiopian-calendar';

interface EthiopianCalendarProps {
  selectedDates: Date[];
  onDateSelect: (date: Date) => void;
  onDateRemove: (date: Date) => void;
}

export default function EthiopianCalendar({ selectedDates, onDateSelect, onDateRemove }: EthiopianCalendarProps) {
  const [currentDate, setCurrentDate] = useState<EthiopianDate>(getCurrentEthiopianDate());
  
  const daysInMonth = getDaysInEthiopianMonth(currentDate.year, currentDate.month);
  
  const goToPreviousMonth = () => {
    if (currentDate.month === 1) {
      setCurrentDate({ year: currentDate.year - 1, month: 13, day: 1 });
    } else {
      setCurrentDate({ ...currentDate, month: currentDate.month - 1 });
    }
  };
  
  const goToNextMonth = () => {
    if (currentDate.month === 13) {
      setCurrentDate({ year: currentDate.year + 1, month: 1, day: 1 });
    } else {
      setCurrentDate({ ...currentDate, month: currentDate.month + 1 });
    }
  };
  
  const goToToday = () => {
    setCurrentDate(getCurrentEthiopianDate());
  };
  
  const isDateSelected = (ethDay: number): boolean => {
    const gregDate = ethiopianToGregorian({ ...currentDate, day: ethDay });
    const dateStr = gregDate.toISOString().split('T')[0];
    return selectedDates.some(d => d.toISOString().split('T')[0] === dateStr);
  };
  
  const handleDateClick = (ethDay: number) => {
    const gregDate = ethiopianToGregorian({ ...currentDate, day: ethDay });
    
    if (isDateSelected(ethDay)) {
      onDateRemove(gregDate);
    } else {
      onDateSelect(gregDate);
    }
  };
  
  const getFirstDayOffset = (): number => {
    const firstDay = ethiopianToGregorian({ ...currentDate, day: 1 });
    const dayOfWeek = firstDay.getDay();
    // Convert to Monday start (0 = Monday)
    return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  };
  
  const isPastDate = (ethDay: number): boolean => {
    const gregDate = ethiopianToGregorian({ ...currentDate, day: ethDay });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return gregDate < today;
  };
  
  const today = getCurrentEthiopianDate();
  const isToday = (ethDay: number): boolean => {
    return currentDate.year === today.year && 
           currentDate.month === today.month && 
           ethDay === today.day;
  };
  
  const offset = getFirstDayOffset();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 md:p-6 border-2 md:border-4 border-ethiopian-gold">
      {/* Header */}
      <div className="mb-3 md:mb-6">
        <div className="flex items-center justify-between mb-2 md:mb-4">
          <button
            onClick={goToPreviousMonth}
            className="p-1.5 md:p-2 hover:bg-ethiopian-light-gold dark:hover:bg-gray-700 rounded-lg transition-colors touch-manipulation"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6 text-ethiopian-dark-green dark:text-ethiopian-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="text-center">
            <h2 className="text-base md:text-2xl font-ethiopic font-bold text-ethiopian-dark-green dark:text-ethiopian-green">
              {ETHIOPIAN_MONTHS[currentDate.month - 1]}
            </h2>
            <p className="text-sm md:text-lg font-ethiopic text-ethiopian-green">
              {toEthiopicNumeral(currentDate.year)}
            </p>
          </div>
          
          <button
            onClick={goToNextMonth}
            className="p-1.5 md:p-2 hover:bg-ethiopian-light-gold dark:hover:bg-gray-700 rounded-lg transition-colors touch-manipulation"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6 text-ethiopian-dark-green dark:text-ethiopian-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        <button
          onClick={goToToday}
          className="w-full py-1.5 md:py-2 bg-ethiopian-green text-white rounded-lg hover:bg-ethiopian-dark-green transition-colors font-semibold text-sm md:text-base touch-manipulation"
        >
          Today
        </button>
      </div>
      
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 md:gap-2 mb-1 md:mb-2">
        {['ሰ', 'ማ', 'ረ', 'ሐ', 'አ', 'ቅ', 'እ'].map((day, i) => (
          <div key={i} className="text-center font-ethiopic font-bold text-ethiopian-dark-green dark:text-ethiopian-green py-1 md:py-2 text-xs md:text-sm">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {Array.from({ length: offset }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        
        {days.map((day) => {
          const selected = isDateSelected(day);
          const past = isPastDate(day);
          const todayDate = isToday(day);
          
          return (
            <button
              key={day}
              onClick={() => !past && handleDateClick(day)}
              disabled={past}
              className={`
                aspect-square rounded-md md:rounded-lg font-ethiopic text-xs md:text-lg transition-all touch-manipulation
                ${selected 
                  ? 'bg-ethiopian-green text-white ring-2 md:ring-4 ring-ethiopian-yellow shadow-md md:shadow-lg transform scale-105' 
                  : 'bg-gray-50 dark:bg-gray-700 hover:bg-ethiopian-light-gold dark:hover:bg-gray-600 text-ethiopian-dark-green dark:text-gray-200'
                }
                ${todayDate && !selected ? 'ring-1 md:ring-2 ring-ethiopian-red' : ''}
                ${past ? 'opacity-30 cursor-not-allowed' : 'active:scale-95 cursor-pointer'}
              `}
            >
              {toEthiopicNumeral(day)}
            </button>
          );
        })}
      </div>
      
      {/* Selected dates counter */}
      {selectedDates.length > 0 && (
        <div className="mt-3 md:mt-4 p-2 md:p-3 bg-ethiopian-light-gold dark:bg-gray-700 rounded-lg text-center">
          <p className="text-ethiopian-dark-green dark:text-gray-200 font-semibold text-xs md:text-sm">
            {selectedDates.length} {selectedDates.length === 1 ? 'day' : 'days'} selected
          </p>
        </div>
      )}
    </div>
  );
}

