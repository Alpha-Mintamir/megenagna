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
    <div className="bg-white rounded-xl shadow-lg p-6 border-4 border-ethiopian-gold">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-ethiopian-light-gold rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-ethiopian-dark-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="text-center">
            <h2 className="text-2xl font-ethiopic font-bold text-ethiopian-dark-green">
              {ETHIOPIAN_MONTHS[currentDate.month - 1]}
            </h2>
            <p className="text-lg font-ethiopic text-ethiopian-green">
              {toEthiopicNumeral(currentDate.year)}
            </p>
          </div>
          
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-ethiopian-light-gold rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-ethiopian-dark-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        <button
          onClick={goToToday}
          className="w-full py-2 bg-ethiopian-green text-white rounded-lg hover:bg-ethiopian-dark-green transition-colors font-semibold"
        >
          Today
        </button>
      </div>
      
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['ሰ', 'ማ', 'ረ', 'ሐ', 'አ', 'ቅ', 'እ'].map((day, i) => (
          <div key={i} className="text-center font-ethiopic font-bold text-ethiopian-dark-green py-2">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
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
                aspect-square rounded-lg font-ethiopic text-lg transition-all
                ${selected 
                  ? 'bg-ethiopian-green text-white ring-4 ring-ethiopian-yellow shadow-lg transform scale-105' 
                  : 'bg-gray-50 hover:bg-ethiopian-light-gold text-ethiopian-dark-green'
                }
                ${todayDate && !selected ? 'ring-2 ring-ethiopian-red' : ''}
                ${past ? 'opacity-30 cursor-not-allowed' : 'hover:scale-105 cursor-pointer'}
              `}
            >
              {toEthiopicNumeral(day)}
            </button>
          );
        })}
      </div>
      
      {/* Selected dates counter */}
      {selectedDates.length > 0 && (
        <div className="mt-4 p-3 bg-ethiopian-light-gold rounded-lg text-center">
          <p className="text-ethiopian-dark-green font-semibold">
            {selectedDates.length} {selectedDates.length === 1 ? 'day' : 'days'} selected
          </p>
        </div>
      )}
    </div>
  );
}

