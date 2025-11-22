'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { 
  toGeezNumeral, 
  gregorianToEthiopian, 
  ethiopianToGregorian, 
  ETHIOPIAN_MONTHS, 
  ETHIOPIAN_DAYS, 
  EthiopianDate,
  getDaysInEthiopianMonth
} from '@/lib/ethiopian-calendar';
import { useLanguage } from './LanguageProvider';

interface EthiopianDatePickerProps {
  value: string; // Gregorian date string (YYYY-MM-DD)
  onChange: (date: string) => void;
  label?: string;
  minDate?: string;
}

export default function EthiopianDatePicker({ value, onChange, label, minDate }: EthiopianDatePickerProps) {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Parse initial date
  const initialDate = value ? new Date(value) : new Date();
  const initialEthDate = gregorianToEthiopian(initialDate);
  
  const [viewDate, setViewDate] = useState<EthiopianDate>(initialEthDate);
  
  // Update view when value changes externally
  useEffect(() => {
    if (value) {
      setViewDate(gregorianToEthiopian(new Date(value)));
    }
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePrevMonth = () => {
    let newMonth = viewDate.month - 1;
    let newYear = viewDate.year;
    
    if (newMonth < 1) {
      newMonth = 13;
      newYear--;
    }
    
    setViewDate({ ...viewDate, month: newMonth, year: newYear });
  };

  const handleNextMonth = () => {
    let newMonth = viewDate.month + 1;
    let newYear = viewDate.year;
    
    if (newMonth > 13) {
      newMonth = 1;
      newYear++;
    }
    
    setViewDate({ ...viewDate, month: newMonth, year: newYear });
  };

  const handleDayClick = (day: number) => {
    const selectedEthDate: EthiopianDate = {
      year: viewDate.year,
      month: viewDate.month,
      day: day
    };
    
    const gregDate = ethiopianToGregorian(selectedEthDate);
    
    // Check min date if provided
    if (minDate) {
      const min = new Date(minDate);
      // Reset time parts for accurate date comparison
      min.setHours(0, 0, 0, 0);
      gregDate.setHours(0, 0, 0, 0);
      
      if (gregDate < min) {
        return; // Do nothing if before min date
      }
    }
    
    // Format to YYYY-MM-DD
    // Adjust for timezone offset to ensure the correct date string
    const offset = gregDate.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(gregDate.getTime() - offset)).toISOString().slice(0, 10);
    
    onChange(localISOTime);
    setIsOpen(false);
  };

  const daysInMonth = getDaysInEthiopianMonth(viewDate.year, viewDate.month);
  
  // Determine starting day of the week for the month
  // 1st day of month in Gregorian
  const firstDayGreg = ethiopianToGregorian({ year: viewDate.year, month: viewDate.month, day: 1 });
  const startDayOfWeek = firstDayGreg.getDay(); // 0 (Sun) - 6 (Sat)
  // Adjust for Ethiopian week (Monday=0, ..., Sunday=6)
  // Wait, ETHIOPIAN_DAYS array is [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
  // standard JS getDay(): 0=Sun, 1=Mon, ...
  // So we need: Sun->6, Mon->0, Tue->1 ...
  const ethStartDay = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  const currentEthDate = gregorianToEthiopian(new Date(value));
  
  // Check if a day is disabled (before minDate)
  const isDayDisabled = (day: number) => {
    if (!minDate) return false;
    const date = ethiopianToGregorian({ year: viewDate.year, month: viewDate.month, day });
    const min = new Date(minDate);
    min.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < min;
  };

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${language === 'am' ? 'font-amharic' : ''}`}>
          {label}
        </label>
      )}
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ethiopian-green focus:border-ethiopian-green transition-all text-base cursor-pointer bg-white dark:bg-gray-700 flex items-center justify-between group hover:border-gray-400 dark:hover:border-gray-500"
      >
        <span className="font-ethiopic font-medium text-gray-900 dark:text-white">
          {toGeezNumeral(currentEthDate.day)} {ETHIOPIAN_MONTHS[currentEthDate.month - 1]} {toGeezNumeral(currentEthDate.year)}
        </span>
        <Calendar className="text-gray-400 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" size={18} />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full sm:w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 p-3 flex items-center justify-between">
            <button 
              onClick={(e) => { e.stopPropagation(); handlePrevMonth(); }}
              className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
            <div className="font-semibold text-base font-ethiopic text-gray-900 dark:text-white">
              {ETHIOPIAN_MONTHS[viewDate.month - 1]} {toGeezNumeral(viewDate.year)}
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); handleNextMonth(); }}
              className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              <ChevronRight size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 p-2 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
            {ETHIOPIAN_DAYS.map((day, i) => (
              <div key={i} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 font-ethiopic">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 p-2 gap-1">
            {/* Empty slots for start of month */}
            {Array.from({ length: ethStartDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-9"></div>
            ))}

            {/* Actual days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected = day === currentEthDate.day && 
                               viewDate.month === currentEthDate.month && 
                               viewDate.year === currentEthDate.year;
              const disabled = isDayDisabled(day);
              
              return (
                <button
                  key={day}
                  onClick={(e) => { e.stopPropagation(); !disabled && handleDayClick(day); }}
                  disabled={disabled}
                  className={`
                    h-9 rounded-md flex items-center justify-center font-ethiopic font-medium text-sm transition-all
                    ${isSelected 
                      ? 'bg-ethiopian-green text-white' 
                      : disabled
                        ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  {toGeezNumeral(day)}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

