import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import {
  rememberMeeting,
  getRememberedMeeting,
  upsertAvailabilityInMemory,
  MeetingRecord,
} from '@/lib/inMemoryMeetings';

// GET a specific meeting by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const meetingId = params.id;
  
  try {
    // Get client directly - connection is pooled
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'calendarr');
    
    // Use projection to exclude _id and only fetch needed fields
    // Add hint to use index if available (will be created via script)
    const meeting = await db.collection('meetings').findOne(
      { id: meetingId },
      { 
        projection: { _id: 0 },
        // Optimize query - MongoDB will use index on 'id' field if available
      }
    );

    if (meeting) {
      const sanitized = meeting as MeetingRecord;
      sanitized.availability = sanitized.availability ?? [];
      return NextResponse.json({ meeting: sanitized });
    }
  } catch (error: any) {
    console.error('Database error:', error.message);
    
    // Only use memory fallback in development
    if (process.env.NODE_ENV === 'development') {
      const fallbackMeeting = await getRememberedMeeting(meetingId);
      if (fallbackMeeting) {
        return NextResponse.json({ meeting: fallbackMeeting, source: 'memory' });
      }
    }
  }

  // Check memory as last resort (dev only)
  if (process.env.NODE_ENV === 'development') {
    const fallbackMeeting = await getRememberedMeeting(meetingId);
    if (fallbackMeeting) {
      return NextResponse.json({ meeting: fallbackMeeting, source: 'memory' });
    }
  }

  return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
}

// PATCH to update meeting (add availability)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { userId, userName, slots } = body;
    
    if (!userId || !userName || !slots) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'calendarr');

    const uniqueSlots = Array.from(new Set(slots)).sort();
    
    // First, check if meeting exists and if user already has an entry
    const meeting = await db.collection('meetings').findOne(
      { id: params.id },
      { projection: { _id: 0, availability: 1 } }
    );
    
    if (!meeting) {
      if (process.env.NODE_ENV === 'development') {
        const fallback = await upsertAvailabilityInMemory(params.id, userId, userName, slots);
        if (fallback) {
          return NextResponse.json({ meeting: fallback, source: 'memory' });
        }
      }
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const existingEntry = meeting.availability?.find((a: any) => a.userId === userId);

    // Use findOneAndUpdate to atomically update and return the document in one operation
    // This reduces round trips from 2-3 queries to just 1
    if (existingEntry) {
      // Update existing entry
      const result = await db.collection('meetings').findOneAndUpdate(
        { id: params.id, 'availability.userId': userId },
        { 
          $set: { 
            'availability.$.userName': userName, 
            'availability.$.slots': uniqueSlots 
          } 
        },
        {
          returnDocument: 'after',
          projection: { _id: 0 }
        }
      );
      
      if (result.value) {
        const sanitized = result.value as MeetingRecord;
        sanitized.availability = sanitized.availability ?? [];
        return NextResponse.json({ meeting: sanitized });
      }
    } else {
      // Add new entry
      const result = await db.collection('meetings').findOneAndUpdate(
        { id: params.id },
        { 
          $push: { 
            availability: { userId, userName, slots: uniqueSlots } 
          } 
        },
        {
          returnDocument: 'after',
          projection: { _id: 0 }
        }
      );
      
      if (result.value) {
        const sanitized = result.value as MeetingRecord;
        sanitized.availability = sanitized.availability ?? [];
        return NextResponse.json({ meeting: sanitized });
      }
    }

    return NextResponse.json({ error: 'Failed to update meeting' }, { status: 500 });
  } catch (error: any) {
    console.error('Database error during update:', error.message);
    
    // Only use memory fallback in development
    if (process.env.NODE_ENV === 'development') {
      try {
        const body = await request.json();
        const { userId, userName, slots } = body;
        if (userId && userName && slots) {
          const fallback = await upsertAvailabilityInMemory(params.id, userId, userName, slots);
          if (fallback) {
            return NextResponse.json({ meeting: fallback, source: 'memory' });
          }
        }
      } catch {
        // Ignore fallback errors
      }
    }

    return NextResponse.json({ error: 'Failed to update meeting' }, { status: 500 });
  }
}

