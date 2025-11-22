/**
 * Ethiopian Calendar Utilities
 * The Ethiopian calendar has 13 months - 12 months of 30 days each, 
 * and a 13th month (Pagume) with 5 or 6 days
 */

export interface EthiopianDate {
  year: number;
  month: number;
  day: number;
}

export const ETHIOPIAN_MONTHS = [
  'መስከረም', // Meskerem
  'ጥቅምት',   // Tikimt
  'ኅዳር',    // Hidar
  'ታኅሣሥ',   // Tahsas
  'ጥር',     // Tir
  'የካቲት',   // Yekatit
  'መጋቢት',   // Megabit
  'ሚያዝያ',   // Miazia
  'ግንቦት',   // Ginbot
  'ሰኔ',      // Sene
  'ሐምሌ',    // Hamle
  'ነሐሴ',    // Nehase
  'ጳጉሜ'     // Pagume
];

export const ETHIOPIAN_DAYS = [
  'ሰኞ',      // Monday
  'ማክሰኞ',   // Tuesday
  'ረቡዕ',    // Wednesday
  'ሐሙስ',    // Thursday
  'አርብ',    // Friday
  'ቅዳሜ',    // Saturday
  'እሁድ'     // Sunday
];

// Convert Ethiopic numerals to Arabic
const ETHIOPIC_NUMERALS: { [key: string]: number } = {
  '፩': 1, '፪': 2, '፫': 3, '፬': 4, '፭': 5, '፮': 6, '፯': 7, '፰': 8, '፱': 9,
  '፲': 10, '፳': 20, '፴': 30, '፵': 40, '፶': 50, '፷': 60, '፸': 70, '፹': 80, '፺': 90, '፻': 100
};

/**
 * Convert Arabic numeral to Ethiopic numeral
 * Uses proper Ge'ez numeral system
 */
export function toEthiopicNumeral(num: number): string {
  if (num === 0) return '0';
  if (num < 0) return '-' + toEthiopicNumeral(-num);
  
  let result = '';
  let remaining = num;
  
  // Handle 10000s (ten thousands) - ፼
  if (remaining >= 10000) {
    const tenThousands = Math.floor(remaining / 10000);
    result += convertDigit(tenThousands) + '፼';
    remaining = remaining % 10000;
  }
  
  // Handle 1000s (thousands) - ሺ
  if (remaining >= 1000) {
    const thousands = Math.floor(remaining / 1000);
    result += convertDigit(thousands) + 'ሺ';
    remaining = remaining % 1000;
  }
  
  // Handle 100s - ፻
  if (remaining >= 100) {
    const hundreds = Math.floor(remaining / 100);
    result += convertDigit(hundreds) + '፻';
    remaining = remaining % 100;
  }
  
  // Handle tens (10-90)
  if (remaining >= 10) {
    const tens = Math.floor(remaining / 10);
    const tensMap: { [key: number]: string } = {
      9: '፺', 8: '፹', 7: '፸', 6: '፷', 5: '፶',
      4: '፵', 3: '፴', 2: '፳', 1: '፲'
    };
    result += tensMap[tens];
    remaining = remaining % 10;
  }
  
  // Handle units (1-9)
  if (remaining > 0) {
    result += convertDigit(remaining);
  }
  
  return result;
}

/**
 * Convert single digit (1-9) to Ethiopic numeral
 */
function convertDigit(digit: number): string {
  const digitMap: { [key: number]: string } = {
    9: '፱', 8: '፰', 7: '፯', 6: '፮', 5: '፭',
    4: '፬', 3: '፫', 2: '፪', 1: '፩'
  };
  return digitMap[digit] || '';
}

/**
 * Check if Ethiopian year is a leap year
 */
export function isEthiopianLeapYear(year: number): boolean {
  return (year % 4 === 3);
}

/**
 * Convert Gregorian date to Ethiopian date
 */
export function gregorianToEthiopian(date: Date): EthiopianDate {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // Ethiopian year starts on Sept 11 (or Sept 12 in leap year)
  // From Jan 1 to Sept 10, it's Year-8
  // From Sept 11 to Dec 31, it's Year-7
  let ethYear = year - 8;
  if (month > 9 || (month === 9 && day >= 11)) {
    ethYear++;
  }
  
  // Calculate days from Ethiopian New Year
  const ethNewYear = new Date(year, 8, 11); // Sept 11
  if (date < ethNewYear) {
    ethNewYear.setFullYear(year - 1);
  }
  
  const diffTime = date.getTime() - ethNewYear.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Calculate Ethiopian month and day
  let ethMonth = Math.floor(diffDays / 30) + 1;
  let ethDay = (diffDays % 30) + 1;
  
  if (ethMonth > 13) {
    ethMonth = 1;
    ethYear++;
    ethDay = 1;
  }
  
  return {
    year: ethYear,
    month: ethMonth,
    day: ethDay
  };
}

/**
 * Convert Ethiopian date to Gregorian date
 */
export function ethiopianToGregorian(ethDate: EthiopianDate): Date {
  const { year, month, day } = ethDate;
  
  // Ethiopian New Year in Gregorian calendar
  // Ethiopian Year X starts in Gregorian Year X+7 (Sept 11/12)
  const gregYear = year + 7;
  const newYear = new Date(gregYear, 8, 11); // Sept 11
  
  // Calculate days to add
  const daysToAdd = (month - 1) * 30 + (day - 1);
  
  const result = new Date(newYear);
  result.setDate(result.getDate() + daysToAdd);
  
  return result;
}

/**
 * Get days in Ethiopian month
 */
export function getDaysInEthiopianMonth(year: number, month: number): number {
  if (month === 13) {
    return isEthiopianLeapYear(year) ? 6 : 5;
  }
  return 30;
}

/**
 * Get current Ethiopian date
 */
export function getCurrentEthiopianDate(): EthiopianDate {
  return gregorianToEthiopian(new Date());
}

/**
 * Format Ethiopian date
 */
export function formatEthiopianDate(date: EthiopianDate, useEthiopicNumerals = true): string {
  const monthName = ETHIOPIAN_MONTHS[date.month - 1];
  
  if (useEthiopicNumerals) {
    return `${toEthiopicNumeral(date.day)} ${monthName} ${toEthiopicNumeral(date.year)}`;
  }
  
  return `${date.day} ${monthName} ${date.year}`;
}

/**
 * Get week day name for a given date
 */
export function getEthiopianWeekDay(date: Date): string {
  const dayIndex = date.getDay();
  // Adjust: JS uses Sunday=0, we want Monday=0
  const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
  return ETHIOPIAN_DAYS[adjustedIndex];
}

/**
 * Get current Ethiopian date (alias for consistency)
 */
export function getEthiopianToday(): EthiopianDate {
  return getCurrentEthiopianDate();
}

/**
 * Add days to Ethiopian date
 */
export function addDaysToEthiopianDate(date: EthiopianDate, days: number): EthiopianDate {
  // Convert to Gregorian, add days, convert back
  const gregDate = ethiopianToGregorian(date);
  gregDate.setDate(gregDate.getDate() + days);
  return gregorianToEthiopian(gregDate);
}

/**
 * Convert Arabic numeral to Ge'ez (Ethiopic) numeral
 * Alias for toEthiopicNumeral for consistency
 */
export function toGeezNumeral(num: number): string {
  return toEthiopicNumeral(num);
}
