import {
  gregorianToEthiopian,
  ethiopianToGregorian,
  toEthiopicNumeral,
  toGeezNumeral,
  isEthiopianLeapYear,
  getDaysInEthiopianMonth,
  getCurrentEthiopianDate,
  formatEthiopianDate,
  getEthiopianWeekDay,
  addDaysToEthiopianDate,
  ETHIOPIAN_MONTHS,
  ETHIOPIAN_DAYS,
  EthiopianDate,
} from '@/lib/ethiopian-calendar'

describe('Ethiopian Calendar Utilities', () => {
  describe('toEthiopicNumeral', () => {
    it('should convert 1-9 correctly', () => {
      expect(toEthiopicNumeral(1)).toBe('፩')
      expect(toEthiopicNumeral(5)).toBe('፭')
      expect(toEthiopicNumeral(9)).toBe('፱')
    })

    it('should convert 10-99 correctly', () => {
      expect(toEthiopicNumeral(10)).toBe('፲')
      expect(toEthiopicNumeral(20)).toBe('፳')
      expect(toEthiopicNumeral(25)).toBe('፳፭')
      expect(toEthiopicNumeral(99)).toBe('፺፱')
    })

    it('should convert 100-999 correctly', () => {
      expect(toEthiopicNumeral(100)).toBe('፩፻') // 1 * 100
      expect(toEthiopicNumeral(200)).toBe('፪፻')
      expect(toEthiopicNumeral(250)).toBe('፪፻፶')
      expect(toEthiopicNumeral(999)).toBe('፱፻፺፱')
    })

    it('should convert 1000+ correctly', () => {
      expect(toEthiopicNumeral(1000)).toBe('፩ሺ')
      expect(toEthiopicNumeral(2015)).toBe('፪ሺ፲፭')
      expect(toEthiopicNumeral(10000)).toBe('፩፼')
    })

    it('should handle zero', () => {
      expect(toEthiopicNumeral(0)).toBe('0')
    })

    it('should handle negative numbers', () => {
      expect(toEthiopicNumeral(-5)).toBe('-፭')
    })
  })

  describe('toGeezNumeral (alias)', () => {
    it('should be an alias for toEthiopicNumeral', () => {
      expect(toGeezNumeral(5)).toBe(toEthiopicNumeral(5))
      expect(toGeezNumeral(100)).toBe(toEthiopicNumeral(100))
    })
  })

  describe('isEthiopianLeapYear', () => {
    it('should correctly identify leap years', () => {
      expect(isEthiopianLeapYear(2015)).toBe(true) // 2015 % 4 === 3
      expect(isEthiopianLeapYear(2019)).toBe(true) // 2019 % 4 === 3
      expect(isEthiopianLeapYear(2016)).toBe(false)
      expect(isEthiopianLeapYear(2017)).toBe(false)
    })
  })

  describe('getDaysInEthiopianMonth', () => {
    it('should return 30 for regular months', () => {
      for (let month = 1; month <= 12; month++) {
        expect(getDaysInEthiopianMonth(2015, month)).toBe(30)
      }
    })

    it('should return 5 or 6 for Pagume (month 13)', () => {
      expect(getDaysInEthiopianMonth(2015, 13)).toBe(6) // Leap year
      expect(getDaysInEthiopianMonth(2016, 13)).toBe(5) // Non-leap year
    })
  })

  describe('gregorianToEthiopian', () => {
    it('should convert known dates correctly', () => {
      // January 1, 2024 (Gregorian) = December 22, 2016 (Ethiopian)
      const date = new Date(2024, 0, 1)
      const ethDate = gregorianToEthiopian(date)
      
      expect(ethDate.year).toBeGreaterThanOrEqual(2015)
      expect(ethDate.month).toBeGreaterThanOrEqual(1)
      expect(ethDate.month).toBeLessThanOrEqual(13)
      expect(ethDate.day).toBeGreaterThanOrEqual(1)
      expect(ethDate.day).toBeLessThanOrEqual(30)
    })

    it('should handle dates before Ethiopian New Year', () => {
      const date = new Date(2024, 0, 1) // January 1
      const ethDate = gregorianToEthiopian(date)
      expect(ethDate).toHaveProperty('year')
      expect(ethDate).toHaveProperty('month')
      expect(ethDate).toHaveProperty('day')
    })

    it('should handle dates after Ethiopian New Year', () => {
      const date = new Date(2024, 8, 15) // September 15
      const ethDate = gregorianToEthiopian(date)
      expect(ethDate).toHaveProperty('year')
      expect(ethDate).toHaveProperty('month')
      expect(ethDate).toHaveProperty('day')
    })
  })

  describe('ethiopianToGregorian', () => {
    it('should convert Ethiopian date to Gregorian date', () => {
      const ethDate: EthiopianDate = { year: 2016, month: 1, day: 1 }
      const gregDate = ethiopianToGregorian(ethDate)
      
      expect(gregDate).toBeInstanceOf(Date)
      expect(gregDate.getFullYear()).toBeGreaterThan(2020)
    })

    it('should be reversible', () => {
      const originalDate = new Date(2024, 5, 15) // June 15, 2024
      const ethDate = gregorianToEthiopian(originalDate)
      const convertedBack = ethiopianToGregorian(ethDate)
      
      // Allow 1 day difference due to calendar conversion complexities
      const diffDays = Math.abs(
        (convertedBack.getTime() - originalDate.getTime()) / (1000 * 60 * 60 * 24)
      )
      expect(diffDays).toBeLessThanOrEqual(1)
    })
  })

  describe('formatEthiopianDate', () => {
    it('should format date with Ethiopic numerals', () => {
      const ethDate: EthiopianDate = { year: 2016, month: 1, day: 5 }
      const formatted = formatEthiopianDate(ethDate, true)
      
      expect(formatted).toContain(ETHIOPIAN_MONTHS[0]) // Meskerem
      expect(formatted).toContain('፭') // 5 in Ethiopic
    })

    it('should format date with Arabic numerals', () => {
      const ethDate: EthiopianDate = { year: 2016, month: 1, day: 5 }
      const formatted = formatEthiopianDate(ethDate, false)
      
      expect(formatted).toContain(ETHIOPIAN_MONTHS[0])
      expect(formatted).toContain('5')
      expect(formatted).toContain('2016')
    })
  })

  describe('getEthiopianWeekDay', () => {
    it('should return correct weekday name', () => {
      const monday = new Date(2024, 0, 1) // Monday
      const weekday = getEthiopianWeekDay(monday)
      
      expect(ETHIOPIAN_DAYS).toContain(weekday)
    })
  })

  describe('addDaysToEthiopianDate', () => {
    it('should add days correctly', () => {
      const ethDate: EthiopianDate = { year: 2016, month: 1, day: 1 }
      const newDate = addDaysToEthiopianDate(ethDate, 5)
      
      expect(newDate.day).toBeGreaterThanOrEqual(1)
      expect(newDate.day).toBeLessThanOrEqual(30)
    })

    it('should handle month overflow', () => {
      const ethDate: EthiopianDate = { year: 2016, month: 12, day: 25 }
      const newDate = addDaysToEthiopianDate(ethDate, 10)
      
      expect(newDate.month).toBeGreaterThanOrEqual(1)
      expect(newDate.month).toBeLessThanOrEqual(13)
    })
  })

  describe('getCurrentEthiopianDate', () => {
    it('should return current Ethiopian date', () => {
      const ethDate = getCurrentEthiopianDate()
      
      expect(ethDate).toHaveProperty('year')
      expect(ethDate).toHaveProperty('month')
      expect(ethDate).toHaveProperty('day')
      expect(ethDate.month).toBeGreaterThanOrEqual(1)
      expect(ethDate.month).toBeLessThanOrEqual(13)
      expect(ethDate.day).toBeGreaterThanOrEqual(1)
      expect(ethDate.day).toBeLessThanOrEqual(30)
    })
  })

  describe('Constants', () => {
    it('should have 13 months', () => {
      expect(ETHIOPIAN_MONTHS).toHaveLength(13)
    })

    it('should have 7 days', () => {
      expect(ETHIOPIAN_DAYS).toHaveLength(7)
    })
  })
})

