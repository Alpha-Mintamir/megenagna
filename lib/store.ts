import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TimeSlot {
  date: Date;
  hour: number;
  participants: string[];
}

export interface Participant {
  id: string;
  name: string;
  color: string;
}

// For meeting-based scheduling
export interface Meeting {
  id: string;
  title: string;
  description?: string;
  dateRange: {
    start: string;
    end: string;
  };
  timeRange: {
    start: { hour: number; minute: number };
    end: { hour: number; minute: number };
  };
  createdBy: string;
  availability: AvailabilityEntry[];
  createdAt: string;
}

export interface AvailabilityEntry {
  userId: string;
  userName: string;
  slots: string[];
}

interface SchedulerState {
  // Simple scheduling (original functionality)
  eventName: string;
  participants: Participant[];
  currentParticipant: string | null;
  selectedDates: Date[];
  timeSlots: Map<string, TimeSlot>;
  startHour: number;
  endHour: number;
  
  setEventName: (name: string) => void;
  addParticipant: (name: string) => void;
  setCurrentParticipant: (id: string) => void;
  addSelectedDate: (date: Date) => void;
  removeSelectedDate: (date: Date) => void;
  toggleTimeSlot: (date: Date, hour: number) => void;
  getAvailabilityCount: (date: Date, hour: number) => number;
  setTimeRange: (start: number, end: number) => void;
  clearParticipantAvailability: (participantId: string) => void;
  
  // Meeting-based scheduling (for create/share functionality)
  meetings: Meeting[];
  createMeeting: (meeting: Omit<Meeting, 'id' | 'availability' | 'createdAt'>) => string;
  getMeeting: (id: string) => Meeting | undefined;
  addAvailability: (meetingId: string, userId: string, userName: string, slots: string[]) => void;
  updateAvailability: (meetingId: string, userId: string, slots: string[]) => void;
}

const PARTICIPANT_COLORS = [
  '#EF2118', '#00843D', '#D4AF37', '#FF6B6B', '#4ECDC4',
  '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'
];

function getTimeSlotKey(date: Date, hour: number): string {
  return `${date.toISOString().split('T')[0]}_${hour}`;
}

export const useSchedulerStore = create<SchedulerState>((set, get) => ({
  eventName: '',
  participants: [],
  currentParticipant: null,
  selectedDates: [],
  timeSlots: new Map(),
  startHour: 9,
  endHour: 17,
  meetings: [],
  
  setEventName: (name) => set({ eventName: name }),
  
  addParticipant: (name) => {
    const state = get();
    const id = `participant-${Date.now()}`;
    const color = PARTICIPANT_COLORS[state.participants.length % PARTICIPANT_COLORS.length];
    const newParticipant: Participant = { id, name, color };
    
    set({
      participants: [...state.participants, newParticipant],
      currentParticipant: id
    });
  },
  
  setCurrentParticipant: (id) => set({ currentParticipant: id }),
  
  addSelectedDate: (date) => {
    const state = get();
    const dateStr = date.toISOString().split('T')[0];
    const exists = state.selectedDates.some(
      d => d.toISOString().split('T')[0] === dateStr
    );
    
    if (!exists) {
      set({ selectedDates: [...state.selectedDates, date].sort((a, b) => a.getTime() - b.getTime()) });
    }
  },
  
  removeSelectedDate: (date) => {
    const state = get();
    const dateStr = date.toISOString().split('T')[0];
    set({
      selectedDates: state.selectedDates.filter(
        d => d.toISOString().split('T')[0] !== dateStr
      )
    });
  },
  
  toggleTimeSlot: (date, hour) => {
    const state = get();
    const participantId = state.currentParticipant;
    
    if (!participantId) return;
    
    const key = getTimeSlotKey(date, hour);
    const newTimeSlots = new Map(state.timeSlots);
    const existingSlot = newTimeSlots.get(key);
    
    if (existingSlot) {
      const hasParticipant = existingSlot.participants.includes(participantId);
      if (hasParticipant) {
        existingSlot.participants = existingSlot.participants.filter(p => p !== participantId);
        if (existingSlot.participants.length === 0) {
          newTimeSlots.delete(key);
        }
      } else {
        existingSlot.participants.push(participantId);
      }
    } else {
      newTimeSlots.set(key, {
        date,
        hour,
        participants: [participantId]
      });
    }
    
    set({ timeSlots: newTimeSlots });
  },
  
  getAvailabilityCount: (date, hour) => {
    const state = get();
    const key = getTimeSlotKey(date, hour);
    const slot = state.timeSlots.get(key);
    return slot ? slot.participants.length : 0;
  },
  
  setTimeRange: (start, end) => set({ startHour: start, endHour: end }),
  
  clearParticipantAvailability: (participantId) => {
    const state = get();
    const newTimeSlots = new Map(state.timeSlots);
    
    for (const [key, slot] of newTimeSlots.entries()) {
      slot.participants = slot.participants.filter(p => p !== participantId);
      if (slot.participants.length === 0) {
        newTimeSlots.delete(key);
      }
    }
    
    set({ timeSlots: newTimeSlots });
  },
  
  // Meeting-based methods
  createMeeting: (meeting) => {
    const id = `meeting-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newMeeting: Meeting = {
      ...meeting,
      id,
      availability: [],
      createdAt: new Date().toISOString(),
    };
    
    set(state => ({
      meetings: [...state.meetings, newMeeting]
    }));
    
    return id;
  },
  
  getMeeting: (id) => {
    return get().meetings.find(m => m.id === id);
  },
  
  addAvailability: (meetingId, userId, userName, slots) => {
    set(state => ({
      meetings: state.meetings.map(meeting =>
        meeting.id === meetingId
          ? {
              ...meeting,
              availability: [...meeting.availability, { userId, userName, slots }]
            }
          : meeting
      )
    }));
  },
  
  updateAvailability: (meetingId, userId, slots) => {
    set(state => ({
      meetings: state.meetings.map(meeting =>
        meeting.id === meetingId
          ? {
              ...meeting,
              availability: meeting.availability.map(entry =>
                entry.userId === userId
                  ? { ...entry, slots }
                  : entry
              )
            }
          : meeting
      )
    }));
  },
}));

// Export as useStore alias for compatibility
export const useStore = useSchedulerStore;
