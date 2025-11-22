
const { 
  gregorianToEthiopian, 
  ethiopianToGregorian, 
  getEthiopianWeekDay 
} = require('./lib/ethiopian-calendar');

const today = new Date('2025-11-22T12:00:00'); // Saturday
const tomorrow = new Date('2025-11-23T12:00:00'); // Sunday

console.log('Today (Gregorian):', today.toString());
console.log('Tomorrow (Gregorian):', tomorrow.toString());

const ethTomorrow = gregorianToEthiopian(tomorrow);
console.log('Tomorrow (Eth):', ethTomorrow); 
// Should be: 2018, Month 3 (Hidar), Day 14

const restoredTomorrow = ethiopianToGregorian(ethTomorrow);
console.log('Restored Tomorrow (Gregorian):', restoredTomorrow.toString());
// Should match Nov 23

console.log('Weekday:', getEthiopianWeekDay(restoredTomorrow));
// Should be 'እሁድ' (Sunday)

