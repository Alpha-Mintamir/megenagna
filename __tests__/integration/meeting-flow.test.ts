/**
 * Integration Tests for Meeting Flow
 * Tests the complete flow from creating a meeting to marking availability
 */

import { rememberMeeting, getRememberedMeeting, upsertAvailabilityInMemory } from '@/lib/inMemoryMeetings'
import { MeetingRecord } from '@/lib/inMemoryMeetings'

describe('Meeting Flow Integration', () => {
  beforeEach(() => {
    const store = (globalThis as any).__meetingStore__
    if (store) {
      store.clear()
    }
  })

  describe('Complete Meeting Lifecycle', () => {
    it('should create meeting, add availability, and retrieve updated meeting', async () => {
      // Step 1: Create a meeting
      const meeting: MeetingRecord = {
        id: 'integration-test-meeting',
        title: 'Integration Test Meeting',
        description: 'Testing complete flow',
        dateRange: { start: '2024-01-01', end: '2024-01-07' },
        timeRange: { start: { hour: 9, minute: 0 }, end: { hour: 17, minute: 0 } },
        duration: 1,
        createdBy: 'Test Creator',
        availability: [],
        createdAt: new Date().toISOString(),
      }

      await rememberMeeting(meeting)

      // Step 2: Verify meeting was created
      const createdMeeting = await getRememberedMeeting('integration-test-meeting')
      expect(createdMeeting).toBeDefined()
      expect(createdMeeting?.title).toBe('Integration Test Meeting')
      expect(createdMeeting?.availability).toHaveLength(0)

      // Step 3: Add availability for first user
      const updatedMeeting1 = await upsertAvailabilityInMemory(
        'integration-test-meeting',
        'user-1',
        'User One',
        ['2024-01-01T09:00', '2024-01-01T10:00', '2024-01-01T11:00']
      )

      expect(updatedMeeting1).toBeDefined()
      expect(updatedMeeting1?.availability).toHaveLength(1)
      expect(updatedMeeting1?.availability[0].userId).toBe('user-1')
      expect(updatedMeeting1?.availability[0].slots).toHaveLength(3)

      // Step 4: Add availability for second user
      const updatedMeeting2 = await upsertAvailabilityInMemory(
        'integration-test-meeting',
        'user-2',
        'User Two',
        ['2024-01-01T10:00', '2024-01-01T11:00', '2024-01-01T14:00']
      )

      expect(updatedMeeting2).toBeDefined()
      expect(updatedMeeting2?.availability).toHaveLength(2)
      expect(updatedMeeting2?.availability[1].userId).toBe('user-2')

      // Step 5: Update first user's availability
      const updatedMeeting3 = await upsertAvailabilityInMemory(
        'integration-test-meeting',
        'user-1',
        'User One Updated',
        ['2024-01-01T09:00', '2024-01-01T10:00']
      )

      expect(updatedMeeting3).toBeDefined()
      expect(updatedMeeting3?.availability).toHaveLength(2)
      // Find user-1 entry (might not be first after updates)
      const user1Entry = updatedMeeting3?.availability.find(a => a.userId === 'user-1')
      expect(user1Entry).toBeDefined()
      expect(user1Entry?.userName).toBe('User One Updated')
      expect(user1Entry?.slots).toHaveLength(2)

      // Step 6: Retrieve final meeting state
      const finalMeeting = await getRememberedMeeting('integration-test-meeting')
      expect(finalMeeting).toBeDefined()
      expect(finalMeeting?.availability).toHaveLength(2)
      
      // Verify overlapping slots (10:00 and 11:00)
      const user1Slots = finalMeeting?.availability.find(a => a.userId === 'user-1')?.slots || []
      const user2Slots = finalMeeting?.availability.find(a => a.userId === 'user-2')?.slots || []
      
      const overlappingSlots = user1Slots.filter(slot => user2Slots.includes(slot))
      expect(overlappingSlots).toContain('2024-01-01T10:00')
    })

    it('should handle multiple meetings independently', async () => {
      const meeting1: MeetingRecord = {
        id: 'meeting-1',
        title: 'Meeting One',
        description: 'First meeting',
        dateRange: { start: '2024-01-01', end: '2024-01-07' },
        timeRange: { start: { hour: 9, minute: 0 }, end: { hour: 17, minute: 0 } },
        duration: 1,
        createdBy: 'Creator 1',
        availability: [],
        createdAt: new Date().toISOString(),
      }

      const meeting2: MeetingRecord = {
        id: 'meeting-2',
        title: 'Meeting Two',
        description: 'Second meeting',
        dateRange: { start: '2024-01-08', end: '2024-01-14' },
        timeRange: { start: { hour: 10, minute: 0 }, end: { hour: 18, minute: 0 } },
        duration: 2,
        createdBy: 'Creator 2',
        availability: [],
        createdAt: new Date().toISOString(),
      }

      await rememberMeeting(meeting1)
      await rememberMeeting(meeting2)

      // Add availability to meeting 1
      await upsertAvailabilityInMemory('meeting-1', 'user-1', 'User One', ['2024-01-01T09:00'])

      // Add availability to meeting 2
      await upsertAvailabilityInMemory('meeting-2', 'user-1', 'User One', ['2024-01-08T10:00'])

      // Verify meetings are independent
      const retrieved1 = await getRememberedMeeting('meeting-1')
      const retrieved2 = await getRememberedMeeting('meeting-2')

      expect(retrieved1?.availability).toHaveLength(1)
      expect(retrieved1?.availability[0].slots).toEqual(['2024-01-01T09:00'])

      expect(retrieved2?.availability).toHaveLength(1)
      expect(retrieved2?.availability[0].slots).toEqual(['2024-01-08T10:00'])
    })
  })

  describe('Data Integrity', () => {
    it('should maintain data consistency across operations', async () => {
      const meeting: MeetingRecord = {
        id: 'consistency-test',
        title: 'Consistency Test',
        description: 'Testing data consistency',
        dateRange: { start: '2024-01-01', end: '2024-01-07' },
        timeRange: { start: { hour: 9, minute: 0 }, end: { hour: 17, minute: 0 } },
        duration: 1,
        createdBy: 'Test Creator',
        availability: [],
        createdAt: new Date().toISOString(),
      }

      await rememberMeeting(meeting)

      // Multiple updates
      for (let i = 0; i < 5; i++) {
        await upsertAvailabilityInMemory(
          'consistency-test',
          `user-${i}`,
          `User ${i}`,
          [`2024-01-01T${9 + i}:00`]
        )
      }

      const finalMeeting = await getRememberedMeeting('consistency-test')
      expect(finalMeeting?.availability).toHaveLength(5)
      expect(finalMeeting?.title).toBe('Consistency Test')
      expect(finalMeeting?.duration).toBe(1)
    })
  })
})

