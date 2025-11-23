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
      const sanitized = meeting as unknown as MeetingRecord;
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
  let body: any;
  try {
    body = await request.json();
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
        } as any,
        {
          returnDocument: 'after',
          projection: { _id: 0 }
        }
      );
      
      if (result.value) {
        const sanitized = result.value as unknown as MeetingRecord;
        sanitized.availability = sanitized.availability ?? [];
        return NextResponse.json({ meeting: sanitized });
      }
      
      // If result.value is null, fetch the document to verify the update succeeded
      // This handles edge cases where findOneAndUpdate returns null but update succeeded
      const updatedMeeting = await db.collection('meetings').findOne(
        { id: params.id },
        { projection: { _id: 0 } }
      );
      
      if (updatedMeeting) {
        const sanitized = updatedMeeting as unknown as MeetingRecord;
        sanitized.availability = sanitized.availability ?? [];
        // Verify the update actually happened
        const updatedEntry = sanitized.availability.find((a: any) => a.userId === userId);
        if (updatedEntry && JSON.stringify(updatedEntry.slots.sort()) === JSON.stringify(uniqueSlots)) {
          return NextResponse.json({ meeting: sanitized });
        }
      }
    } else {
      // Add new entry
      const result = await db.collection('meetings').findOneAndUpdate(
        { id: params.id },
        { 
          $push: { 
            availability: { userId, userName, slots: uniqueSlots }
          } 
        } as any,
        {
          returnDocument: 'after',
          projection: { _id: 0 }
        }
      );
      
      if (result.value) {
        const sanitized = result.value as unknown as MeetingRecord;
        sanitized.availability = sanitized.availability ?? [];
        return NextResponse.json({ meeting: sanitized });
      }
      
      // If result.value is null, fetch the document to verify the update succeeded
      const updatedMeeting = await db.collection('meetings').findOne(
        { id: params.id },
        { projection: { _id: 0 } }
      );
      
      if (updatedMeeting) {
        const sanitized = updatedMeeting as unknown as MeetingRecord;
        sanitized.availability = sanitized.availability ?? [];
        // Verify the update actually happened
        const newEntry = sanitized.availability.find((a: any) => a.userId === userId);
        if (newEntry && JSON.stringify(newEntry.slots.sort()) === JSON.stringify(uniqueSlots)) {
          return NextResponse.json({ meeting: sanitized });
        }
      }
    }

    return NextResponse.json({ error: 'Failed to update meeting - document not returned' }, { status: 500 });
  } catch (error: any) {
    console.error('Database error during update:', error);
    
    // Only use memory fallback in development
    if (process.env.NODE_ENV === 'development' && body) {
      try {
        const { userId, userName, slots } = body;
        if (userId && userName && slots) {
          const fallback = await upsertAvailabilityInMemory(params.id, userId, userName, slots);
          if (fallback) {
            return NextResponse.json({ meeting: fallback, source: 'memory' });
          }
        }
      } catch (fallbackError) {
        // Ignore fallback errors
        console.error('Fallback error:', fallbackError);
      }
    }

    return NextResponse.json({ 
      error: 'Failed to save availability', 
      details: error.message 
    }, { status: 500 });
  }
}

