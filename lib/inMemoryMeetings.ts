'use server';

interface TimeRange {
  start: { hour: number; minute: number };
  end: { hour: number; minute: number };
}

interface DateRange {
  start: string;
  end: string;
}

export interface AvailabilityEntry {
  userId: string;
  userName: string;
  slots: string[];
}

export interface MeetingRecord {
  id: string;
  title: string;
  description: string;
  dateRange: DateRange;
  timeRange: TimeRange;
  duration: number; // Duration in hours (e.g., 0.5, 1, 1.5, 2)
  createdBy: string;
  availability: AvailabilityEntry[];
  createdAt: string;
}

type MeetingStore = Map<string, MeetingRecord>;

declare global {
  // eslint-disable-next-line no-var
  var __meetingStore__: MeetingStore | undefined;
}

const store: MeetingStore =
  globalThis.__meetingStore__ ?? (globalThis.__meetingStore__ = new Map());

function cloneMeeting(meeting: MeetingRecord): MeetingRecord {
  return {
    ...meeting,
    availability: meeting.availability.map((entry) => ({
      ...entry,
      slots: [...entry.slots],
    })),
  };
}

export async function rememberMeeting(meeting: MeetingRecord): Promise<void> {
  store.set(meeting.id, cloneMeeting(meeting));
}

export async function getRememberedMeeting(
  id: string
): Promise<MeetingRecord | undefined> {
  const meeting = store.get(id);
  return meeting ? cloneMeeting(meeting) : undefined;
}

export async function listRememberedMeetings(): Promise<MeetingRecord[]> {
  return Array.from(store.values()).map(cloneMeeting);
}

export async function upsertAvailabilityInMemory(
  meetingId: string,
  userId: string,
  userName: string,
  slots: string[]
): Promise<MeetingRecord | undefined> {
  const meeting = store.get(meetingId);
  if (!meeting) {
    return undefined;
  }

  const uniqueSlots = Array.from(new Set(slots)).sort();
  const existingEntryIndex = meeting.availability.findIndex(
    (entry) => entry.userId === userId
  );

  if (existingEntryIndex >= 0) {
    meeting.availability[existingEntryIndex] = {
      ...meeting.availability[existingEntryIndex],
      slots: uniqueSlots,
    };
  } else {
    meeting.availability.push({
      userId,
      userName,
      slots: uniqueSlots,
    });
  }

  store.set(meetingId, meeting);
  return cloneMeeting(meeting);
}
