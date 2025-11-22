
const { 
  gregorianToEthiopian, 
  ethiopianToGregorian, 
  getEthiopianWeekDay, 
  toEthiopicNumeral 
} = require('./lib/ethiopian-calendar');

// Mock Date for consistency if needed, but we'll use specific dates
// Nov 22, 2025 is Saturday
// Nov 23, 2025 is Sunday

const today = new Date('2025-11-22T12:00:00'); // Saturday
const tomorrow = new Date('2025-11-23T12:00:00'); // Sunday

console.log('Today (Gregorian):', today.toString());
console.log('Tomorrow (Gregorian):', tomorrow.toString());

// Test 1: Check Week Day
console.log('\n--- Week Day Check ---');
console.log('Today Weekday (should be Saturday/ቅዳሜ):', getEthiopianWeekDay(today));
console.log('Tomorrow Weekday (should be Sunday/እሁድ):', getEthiopianWeekDay(tomorrow));

// Test 2: Check Conversion to Ethiopian
console.log('\n--- Greg -> Eth Conversion ---');
const ethToday = gregorianToEthiopian(today);
console.log('Today (Eth):', ethToday); 
// Expected: 2018, Month 3 (Hidar), Day 13?
// Let's check: Sept 11 (Meskerem 1) -> Nov 22.
// Sept: 30-11 = 19 days. Oct: 31. Nov: 22.
// Total days: 19 + 31 + 22 = 72 days.
// 72 / 30 = 2 months (Meskerem, Tikimt). Remainder 12.
// So 2 months passed. We are in Month 3 (Hidar).
// Day = 12 + 1 = 13.
// So Hidar 13.

const ethTomorrow = gregorianToEthiopian(tomorrow);
console.log('Tomorrow (Eth):', ethTomorrow); // Should be Hidar 14

// Test 3: Round Trip
console.log('\n--- Round Trip (Eth -> Greg) ---');
const gregFromEthToday = ethiopianToGregorian(ethToday);
console.log('Restored Today:', gregFromEthToday.toString());
console.log('Matches original?', 
  gregFromEthToday.getDate() === today.getDate() && 
  gregFromEthToday.getMonth() === today.getMonth() &&
  gregFromEthToday.getFullYear() === today.getFullYear()
);

const gregFromEthTomorrow = ethiopianToGregorian(ethTomorrow);
console.log('Restored Tomorrow:', gregFromEthTomorrow.toString());
console.log('Matches original?', 
  gregFromEthTomorrow.getDate() === tomorrow.getDate() && 
  gregFromEthTomorrow.getMonth() === tomorrow.getMonth() &&
  gregFromEthTomorrow.getFullYear() === tomorrow.getFullYear()
);

// Test 4: Check Weekday of Restored Date
console.log('\n--- Restored Date Weekday ---');
console.log('Restored Tomorrow Weekday:', getEthiopianWeekDay(gregFromEthTomorrow));


