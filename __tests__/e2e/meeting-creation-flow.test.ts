/**
 * End-to-End Tests for Meeting Creation Flow
 * Tests the complete user journey from creating a meeting to viewing it
 */

import { rememberMeeting, getRememberedMeeting, upsertAvailabilityInMemory } from '@/lib/inMemoryMeetings'
import { createMockMeeting, generateTimeSlots } from '../utils/test-helpers'

describe('E2E: Meeting Creation Flow', () => {
  beforeEach(() => {
    const store = (globalThis as any).__meetingStore__
    if (store) {
      store.clear()
    }
  })

  describe('User Journey: Create and Participate', () => {
    it('should complete full meeting lifecycle', async () => {
      // Step 1: Creator creates a meeting
      const meeting = createMockMeeting({
        title: 'Team Standup',
        description: 'Weekly team sync',
        dateRange: { start: '2024-01-15', end: '2024-01-19' },
        timeRange: { start: { hour: 9, minute: 0 }, end: { hour: 12, minute: 0 } },
        duration: 0.5, // 30-minute slots
        createdBy: 'Team Lead',
      })

      await rememberMeeting(meeting)
      const createdMeeting = await getRememberedMeeting(meeting.id)
      expect(createdMeeting).toBeDefined()

      // Step 2: Multiple team members mark their availability
      const teamMembers = [
        { userId: 'user-alice', userName: 'Alice', preferredSlots: ['2024-01-15T09:00', '2024-01-15T09:30', '2024-01-15T10:00'] },
        { userId: 'user-bob', userName: 'Bob', preferredSlots: ['2024-01-15T09:30', '2024-01-15T10:00', '2024-01-15T10:30'] },
        { userId: 'user-charlie', userName: 'Charlie', preferredSlots: ['2024-01-15T10:00', '2024-01-15T10:30', '2024-01-15T11:00'] },
      ]

      let updatedMeeting = createdMeeting!
      for (const member of teamMembers) {
        updatedMeeting = (await upsertAvailabilityInMemory(
          meeting.id,
          member.userId,
          member.userName,
          member.preferredSlots
        ))!
      }

      // Step 3: Verify all participants are recorded
      expect(updatedMeeting.availability).toHaveLength(3)
      expect(updatedMeeting.availability.map(a => a.userName)).toEqual(['Alice', 'Bob', 'Charlie'])

      // Step 4: Find best meeting time (most overlapping slots)
      const allSlots = updatedMeeting.availability.flatMap(a => a.slots)
      const slotCounts = allSlots.reduce((acc, slot) => {
        acc[slot] = (acc[slot] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const bestSlots = Object.entries(slotCounts)
        .filter(([_, count]) => count >= 2) // At least 2 people available
        .sort(([_, a], [__, b]) => b - a)
        .map(([slot]) => slot)

      // Best slots should be 10:00 and 10:30 (all 3 available)
      expect(bestSlots).toContain('2024-01-15T10:00')
      expect(bestSlots).toContain('2024-01-15T10:30')

      // Step 5: Update availability (someone changes their mind)
      updatedMeeting = (await upsertAvailabilityInMemory(
        meeting.id,
        'user-alice',
        'Alice',
        ['2024-01-15T09:00', '2024-01-15T09:30'] // Removed 10:00
      ))!

      // Step 6: Verify updated availability
      const aliceAvailability = updatedMeeting.availability.find(a => a.userId === 'user-alice')
      expect(aliceAvailability?.slots).toEqual(['2024-01-15T09:00', '2024-01-15T09:30'])

      // Step 7: Final meeting state
      const finalMeeting = await getRememberedMeeting(meeting.id)
      expect(finalMeeting?.availability).toHaveLength(3)
      expect(finalMeeting?.title).toBe('Team Standup')
    })

    it('should handle meeting with custom duration', async () => {
      const meeting = createMockMeeting({
        title: '2-Hour Workshop',
        duration: 2, // 2-hour slots
        dateRange: { start: '2024-01-20', end: '2024-01-20' },
        timeRange: { start: { hour: 9, minute: 0 }, end: { hour: 17, minute: 0 } },
      })

      await rememberMeeting(meeting)

      // Generate slots for 2-hour duration
      const slots = generateTimeSlots('2024-01-20', 9, 17, 2)
      expect(slots).toEqual([
        '2024-01-20T09:00',
        '2024-01-20T11:00',
        '2024-01-20T13:00',
        '2024-01-20T15:00',
      ])

      // Add availability
      await upsertAvailabilityInMemory(meeting.id, 'user-1', 'User One', slots.slice(0, 2))
      const updated = await getRememberedMeeting(meeting.id)
      expect(updated?.availability[0].slots).toHaveLength(2)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty availability', async () => {
      const meeting = createMockMeeting()
      await rememberMeeting(meeting)

      const retrieved = await getRememberedMeeting(meeting.id)
      expect(retrieved?.availability).toHaveLength(0)
    })

    it('should handle single participant', async () => {
      const meeting = createMockMeeting()
      await rememberMeeting(meeting)

      await upsertAvailabilityInMemory(meeting.id, 'user-1', 'Solo User', ['2024-01-01T09:00'])
      const updated = await getRememberedMeeting(meeting.id)

      expect(updated?.availability).toHaveLength(1)
      expect(updated?.availability[0].slots).toEqual(['2024-01-01T09:00'])
    })

    it('should handle many participants', async () => {
      const meeting = createMockMeeting()
      await rememberMeeting(meeting)

      // Add 20 participants
      for (let i = 0; i < 20; i++) {
        await upsertAvailabilityInMemory(
          meeting.id,
          `user-${i}`,
          `User ${i}`,
          [`2024-01-01T${9 + (i % 8)}:00`]
        )
      }

      const updated = await getRememberedMeeting(meeting.id)
      expect(updated?.availability).toHaveLength(20)
    })
  })
})

