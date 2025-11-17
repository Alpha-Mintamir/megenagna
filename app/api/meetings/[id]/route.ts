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
  console.log('GET /api/meetings/[id] - ID:', meetingId);
  console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
  console.log('MONGODB_DB:', process.env.MONGODB_DB);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  
  try {
    const client = await Promise.race([
      clientPromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 10000))
    ]) as any;
    
    const db = client.db(process.env.MONGODB_DB || 'calendarr');
    const meeting = await db.collection('meetings').findOne({ id: meetingId });
    
    console.log('Meeting found in DB:', !!meeting);
    console.log('Meeting ID searched:', meetingId);

    if (meeting) {
      const { _id, ...sanitized } = meeting as MeetingRecord & { _id?: unknown };
      sanitized.availability = sanitized.availability ?? [];
      await rememberMeeting(sanitized);
      return NextResponse.json({ meeting: sanitized, source: 'database' });
    }
  } catch (error: any) {
    console.error('Database error:', error.message);
    console.error('Full error:', error);
    
    // In production, don't fall back to memory (serverless doesn't share memory)
    // Only use memory fallback in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Attempting memory fallback (dev only)');
      const fallbackMeeting = await getRememberedMeeting(meetingId);
      if (fallbackMeeting) {
        return NextResponse.json({ meeting: fallbackMeeting, source: 'memory' });
      }
    }
  }

  // Check memory as last resort (only works in dev or if same instance)
  const fallbackMeeting = await getRememberedMeeting(meetingId);
  if (fallbackMeeting) {
    console.log('Found meeting in memory fallback');
    return NextResponse.json({ meeting: fallbackMeeting, source: 'memory' });
  }

  console.error('Meeting not found:', meetingId);
  return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
}

// PATCH to update meeting (add availability)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let parsedBody: {
    userId?: string;
    userName?: string;
    slots?: string[];
  } = {};

  try {
    const body = await request.json();
    const { userId, userName, slots } = body;
    parsedBody = { userId, userName, slots };
    
    if (!userId || !userName || !slots) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'calendarr');

    // Check if user already has availability
    const meeting = await db.collection('meetings').findOne({ id: params.id });

    if (!meeting) {
      const fallback = await upsertAvailabilityInMemory(
        params.id,
        userId,
        userName,
        slots
      );

      if (fallback) {
        return NextResponse.json({ meeting: fallback, source: 'memory' });
      }

      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const uniqueSlots = Array.from(new Set(slots)).sort();
    const existingEntry = meeting.availability?.find((a: any) => a.userId === userId);

    if (existingEntry) {
      // Update existing entry
      await db.collection('meetings').updateOne(
        { id: params.id, 'availability.userId': userId },
        { $set: { 'availability.$.slots': uniqueSlots } } as any
      );
    } else {
      // Add new entry
      await db.collection('meetings').updateOne(
        { id: params.id },
        { $push: { availability: { userId, userName, slots: uniqueSlots } } } as any
      );
    }

    const updatedMeeting = await db.collection('meetings').findOne({ id: params.id });
    const { _id, ...sanitized } = updatedMeeting as MeetingRecord & { _id?: unknown };
    sanitized.availability = sanitized.availability ?? [];
    await rememberMeeting(sanitized);

    return NextResponse.json({ meeting: sanitized, source: 'database' });
  } catch (error) {
    console.warn('Database error during update, attempting memory fallback:', error);
    const { userId, userName, slots } = parsedBody;

    if (!userId || !userName || !slots) {
      return NextResponse.json({ error: 'Failed to update meeting' }, { status: 500 });
    }

    const fallback = await upsertAvailabilityInMemory(
      params.id,
      userId,
      userName,
      slots
    );

    if (fallback) {
      return NextResponse.json({ meeting: fallback, source: 'memory' });
    }

    return NextResponse.json({ error: 'Failed to update meeting' }, { status: 500 });
  }
}

