import { translations, Language } from '@/lib/translations'

describe('Translations', () => {
  describe('Translation structure', () => {
    it('should have English translations', () => {
      expect(translations.en).toBeDefined()
      expect(translations.en.common).toBeDefined()
      expect(translations.en.home).toBeDefined()
      expect(translations.en.create).toBeDefined()
      expect(translations.en.meeting).toBeDefined()
      expect(translations.en.duration).toBeDefined()
    })

    it('should have Amharic translations', () => {
      expect(translations.am).toBeDefined()
      expect(translations.am.common).toBeDefined()
      expect(translations.am.home).toBeDefined()
      expect(translations.am.create).toBeDefined()
      expect(translations.am.meeting).toBeDefined()
      expect(translations.am.duration).toBeDefined()
    })
  })

  describe('Common translations', () => {
    it('should have all common keys in English', () => {
      const commonKeys = ['back', 'cancel', 'submit', 'create', 'share', 'copied', 'loading', 'success', 'error', 'optional', 'required']
      commonKeys.forEach(key => {
        expect(translations.en.common).toHaveProperty(key)
        expect(typeof translations.en.common[key as keyof typeof translations.en.common]).toBe('string')
      })
    })

    it('should have all common keys in Amharic', () => {
      const commonKeys = ['back', 'cancel', 'submit', 'create', 'share', 'copied', 'loading', 'success', 'error', 'optional', 'required']
      commonKeys.forEach(key => {
        expect(translations.am.common).toHaveProperty(key)
        expect(typeof translations.am.common[key as keyof typeof translations.am.common]).toBe('string')
        expect(translations.am.common[key as keyof typeof translations.am.common].length).toBeGreaterThan(0)
      })
    })
  })

  describe('Home translations', () => {
    it('should have all home keys', () => {
      const homeKeys = [
        'title', 'subtitle', 'description', 'createMeeting', 'createMeetingDesc',
        'getStarted', 'features', 'howItWorks', 'ethiopianCalendar', 'ethiopianCalendarDesc',
        'teamCollaboration', 'teamCollaborationDesc', 'simpleFast', 'simpleFastDesc',
        'step1', 'step1Desc', 'step2', 'step2Desc', 'step3', 'step3Desc',
        'step4', 'step4Desc', 'footer', 'madeBy'
      ]
      
      homeKeys.forEach(key => {
        expect(translations.en.home).toHaveProperty(key)
        expect(translations.am.home).toHaveProperty(key)
        expect(typeof translations.en.home[key as keyof typeof translations.en.home]).toBe('string')
        expect(typeof translations.am.home[key as keyof typeof translations.am.home]).toBe('string')
      })
    })
  })

  describe('Create translations', () => {
    it('should have all create keys', () => {
      const createKeys = [
        'title', 'subtitle', 'meetingTitle', 'yourName', 'description',
        'dateRange', 'timeRange', 'startTime', 'endTime', 'meetingDuration',
        'meetingDurationDesc', 'calendarSystem', 'ethiopian', 'gregorian', 'both',
        'startDateEth', 'startDateGreg', 'endDateEth', 'endDateGreg',
        'startDate', 'endDate'
      ]
      
      createKeys.forEach(key => {
        expect(translations.en.create).toHaveProperty(key)
        expect(translations.am.create).toHaveProperty(key)
      })
    })
  })

  describe('Meeting translations', () => {
    it('should have all meeting keys', () => {
      const meetingKeys = [
        'markAvailability', 'markAvailabilityDesc', 'yourName', 'submitAvailability',
        'instructions', 'instructionsText', 'yourSelection', 'mostAvailable',
        'noResponses', 'availabilityGrid', 'availabilityGridDesc', 'somewhatAvailable',
        'participants', 'slotsSelected', 'tapToSelect', 'selected',
        'meetingNotFound', 'goHome', 'successMessage', 'successDescription'
      ]
      
      meetingKeys.forEach(key => {
        expect(translations.en.meeting).toHaveProperty(key)
        expect(translations.am.meeting).toHaveProperty(key)
      })
    })
  })

  describe('Duration translations', () => {
    it('should have all duration options', () => {
      const durationKeys = ['minutes30', 'hour1', 'hours1_5', 'hours2', 'hours2_5', 'hours3', 'hours4']
      
      durationKeys.forEach(key => {
        expect(translations.en.duration).toHaveProperty(key)
        expect(translations.am.duration).toHaveProperty(key)
      })
    })
  })

  describe('Translation completeness', () => {
    it('should have same structure for both languages', () => {
      const enKeys = Object.keys(translations.en)
      const amKeys = Object.keys(translations.am)
      
      expect(enKeys.sort()).toEqual(amKeys.sort())
    })

    it('should have non-empty strings for all translations', () => {
      const checkTranslations = (obj: any, path = '') => {
        for (const key in obj) {
          const currentPath = path ? `${path}.${key}` : key
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            checkTranslations(obj[key], currentPath)
          } else if (typeof obj[key] === 'string') {
            expect(obj[key].length).toBeGreaterThan(0)
          }
        }
      }
      
      checkTranslations(translations.en)
      checkTranslations(translations.am)
    })
  })
})

