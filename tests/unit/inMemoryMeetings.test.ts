import {
  rememberMeeting,
  getRememberedMeeting,
  listRememberedMeetings,
  upsertAvailabilityInMemory,
  MeetingRecord,
} from '@/lib/inMemoryMeetings'

describe('In-Memory Meetings', () => {
  beforeEach(() => {
    // Clear the store before each test
    const store = (globalThis as any).__meetingStore__
    if (store) {
      store.clear()
    }
  })

  describe('rememberMeeting', () => {
    it('should store a meeting', async () => {
      const meeting: MeetingRecord = {
        id: 'test-meeting-1',
        title: 'Test Meeting',
        description: 'Test Description',
        dateRange: { start: '2024-01-01', end: '2024-01-07' },
        timeRange: { start: { hour: 9, minute: 0 }, end: { hour: 17, minute: 0 } },
        duration: 1,
        createdBy: 'Test User',
        availability: [],
        createdAt: new Date().toISOString(),
      }

      await rememberMeeting(meeting)
      const retrieved = await getRememberedMeeting('test-meeting-1')

      expect(retrieved).toBeDefined()
      expect(retrieved?.id).toBe(meeting.id)
      expect(retrieved?.title).toBe(meeting.title)
    })

    it('should clone the meeting to prevent mutations', async () => {
      const meeting: MeetingRecord = {
        id: 'test-meeting-2',
        title: 'Test Meeting',
        description: 'Test Description',
        dateRange: { start: '2024-01-01', end: '2024-01-07' },
        timeRange: { start: { hour: 9, minute: 0 }, end: { hour: 17, minute: 0 } },
        duration: 1,
        createdBy: 'Test User',
        availability: [],
        createdAt: new Date().toISOString(),
      }

      await rememberMeeting(meeting)
      const retrieved = await getRememberedMeeting('test-meeting-2')

      // Modify the original
      meeting.title = 'Modified Title'

      // Retrieved should not be affected
      expect(retrieved?.title).toBe('Test Meeting')
    })
  })

  describe('getRememberedMeeting', () => {
    it('should return undefined for non-existent meeting', async () => {
      const result = await getRememberedMeeting('non-existent')
      expect(result).toBeUndefined()
    })

    it('should return cloned meeting', async () => {
      const meeting: MeetingRecord = {
        id: 'test-meeting-3',
        title: 'Test Meeting',
        description: 'Test Description',
        dateRange: { start: '2024-01-01', end: '2024-01-07' },
        timeRange: { start: { hour: 9, minute: 0 }, end: { hour: 17, minute: 0 } },
        duration: 1,
        createdBy: 'Test User',
        availability: [],
        createdAt: new Date().toISOString(),
      }

      await rememberMeeting(meeting)
      const retrieved1 = await getRememberedMeeting('test-meeting-3')
      const retrieved2 = await getRememberedMeeting('test-meeting-3')

      // Both should be different objects
      expect(retrieved1).not.toBe(retrieved2)
      expect(retrieved1?.id).toBe(retrieved2?.id)
    })
  })

  describe('listRememberedMeetings', () => {
    it('should return empty array when no meetings', async () => {
      const meetings = await listRememberedMeetings()
      expect(meetings).toEqual([])
    })

    it('should return all stored meetings', async () => {
      const meeting1: MeetingRecord = {
        id: 'test-meeting-4',
        title: 'Meeting 1',
        description: 'Description 1',
        dateRange: { start: '2024-01-01', end: '2024-01-07' },
        timeRange: { start: { hour: 9, minute: 0 }, end: { hour: 17, minute: 0 } },
        duration: 1,
        createdBy: 'User 1',
        availability: [],
        createdAt: new Date().toISOString(),
      }

      const meeting2: MeetingRecord = {
        id: 'test-meeting-5',
        title: 'Meeting 2',
        description: 'Description 2',
        dateRange: { start: '2024-01-01', end: '2024-01-07' },
        timeRange: { start: { hour: 9, minute: 0 }, end: { hour: 17, minute: 0 } },
        duration: 1,
        createdBy: 'User 2',
        availability: [],
        createdAt: new Date().toISOString(),
      }

      await rememberMeeting(meeting1)
      await rememberMeeting(meeting2)

      const meetings = await listRememberedMeetings()
      expect(meetings).toHaveLength(2)
      expect(meetings.map(m => m.id)).toContain('test-meeting-4')
      expect(meetings.map(m => m.id)).toContain('test-meeting-5')
    })
  })

  describe('upsertAvailabilityInMemory', () => {
    it('should add availability for new user', async () => {
      const meeting: MeetingRecord = {
        id: 'test-meeting-6',
        title: 'Test Meeting',
        description: 'Test Description',
        dateRange: { start: '2024-01-01', end: '2024-01-07' },
        timeRange: { start: { hour: 9, minute: 0 }, end: { hour: 17, minute: 0 } },
        duration: 1,
        createdBy: 'Test User',
        availability: [],
        createdAt: new Date().toISOString(),
      }

      await rememberMeeting(meeting)
      const updated = await upsertAvailabilityInMemory(
        'test-meeting-6',
        'user-1',
        'User One',
        ['2024-01-01T09:00', '2024-01-01T10:00']
      )

      expect(updated).toBeDefined()
      expect(updated?.availability).toHaveLength(1)
      expect(updated?.availability[0].userId).toBe('user-1')
      expect(updated?.availability[0].userName).toBe('User One')
      expect(updated?.availability[0].slots).toEqual(['2024-01-01T09:00', '2024-01-01T10:00'])
    })

    it('should update availability for existing user', async () => {
      const meeting: MeetingRecord = {
        id: 'test-meeting-7',
        title: 'Test Meeting',
        description: 'Test Description',
        dateRange: { start: '2024-01-01', end: '2024-01-07' },
        timeRange: { start: { hour: 9, minute: 0 }, end: { hour: 17, minute: 0 } },
        duration: 1,
        createdBy: 'Test User',
        availability: [
          {
            userId: 'user-1',
            userName: 'User One',
            slots: ['2024-01-01T09:00'],
          },
        ],
        createdAt: new Date().toISOString(),
      }

      await rememberMeeting(meeting)
      const updated = await upsertAvailabilityInMemory(
        'test-meeting-7',
        'user-1',
        'User One Updated',
        ['2024-01-01T10:00', '2024-01-01T11:00']
      )

      expect(updated).toBeDefined()
      expect(updated?.availability).toHaveLength(1)
      expect(updated?.availability[0].userName).toBe('User One Updated')
      expect(updated?.availability[0].slots).toEqual(['2024-01-01T10:00', '2024-01-01T11:00'])
    })

    it('should remove duplicates from slots', async () => {
      const meeting: MeetingRecord = {
        id: 'test-meeting-8',
        title: 'Test Meeting',
        description: 'Test Description',
        dateRange: { start: '2024-01-01', end: '2024-01-07' },
        timeRange: { start: { hour: 9, minute: 0 }, end: { hour: 17, minute: 0 } },
        duration: 1,
        createdBy: 'Test User',
        availability: [],
        createdAt: new Date().toISOString(),
      }

      await rememberMeeting(meeting)
      const updated = await upsertAvailabilityInMemory(
        'test-meeting-8',
        'user-1',
        'User One',
        ['2024-01-01T09:00', '2024-01-01T09:00', '2024-01-01T10:00']
      )

      expect(updated?.availability[0].slots).toEqual(['2024-01-01T09:00', '2024-01-01T10:00'])
    })

    it('should sort slots', async () => {
      const meeting: MeetingRecord = {
        id: 'test-meeting-9',
        title: 'Test Meeting',
        description: 'Test Description',
        dateRange: { start: '2024-01-01', end: '2024-01-07' },
        timeRange: { start: { hour: 9, minute: 0 }, end: { hour: 17, minute: 0 } },
        duration: 1,
        createdBy: 'Test User',
        availability: [],
        createdAt: new Date().toISOString(),
      }

      await rememberMeeting(meeting)
      const updated = await upsertAvailabilityInMemory(
        'test-meeting-9',
        'user-1',
        'User One',
        ['2024-01-01T10:00', '2024-01-01T09:00', '2024-01-01T11:00']
      )

      expect(updated?.availability[0].slots).toEqual([
        '2024-01-01T09:00',
        '2024-01-01T10:00',
        '2024-01-01T11:00',
      ])
    })

    it('should return undefined for non-existent meeting', async () => {
      const result = await upsertAvailabilityInMemory(
        'non-existent',
        'user-1',
        'User One',
        ['2024-01-01T09:00']
      )

      expect(result).toBeUndefined()
    })
  })
})

