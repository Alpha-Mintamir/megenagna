/**
 * Test Helper Utilities
 * Common functions used across tests
 */

import { MeetingRecord } from '@/lib/inMemoryMeetings'

/**
 * Create a mock meeting for testing
 */
export function createMockMeeting(overrides?: Partial<MeetingRecord>): MeetingRecord {
  return {
    id: `test-meeting-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: 'Test Meeting',
    description: 'Test Description',
    dateRange: { start: '2024-01-01', end: '2024-01-07' },
    timeRange: { start: { hour: 9, minute: 0 }, end: { hour: 17, minute: 0 } },
    duration: 1,
    createdBy: 'Test User',
    availability: [],
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

/**
 * Generate time slots for testing
 */
export function generateTimeSlots(
  date: string,
  startHour: number,
  endHour: number,
  duration: number = 1
): string[] {
  const slots: string[] = []
  for (let hour = startHour; hour < endHour; hour += duration) {
    slots.push(`${date}T${hour.toString().padStart(2, '0')}:00`)
  }
  return slots
}

/**
 * Wait for async operations
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Mock fetch response
 */
export function mockFetchResponse(data: any, ok: boolean = true): void {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok,
    json: async () => data,
    status: ok ? 200 : 400,
    statusText: ok ? 'OK' : 'Bad Request',
  } as Response)
}

/**
 * Clear all mocks
 */
export function clearAllMocks(): void {
  jest.clearAllMocks()
  const store = (globalThis as any).__meetingStore__
  if (store) {
    store.clear()
  }
}

