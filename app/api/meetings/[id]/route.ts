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
  try {
    console.log('GET /api/meetings/[id] - ID:', params.id);
    console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
    console.log('MONGODB_DB:', process.env.MONGODB_DB);
    
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'calendarr');

    const meeting = await db.collection('meetings').findOne({ id: params.id });
    console.log('Meeting found:', !!meeting);

    if (meeting) {
      const { _id, ...sanitized } = meeting as MeetingRecord & {
        _id?: unknown;
      };
      sanitized.availability = sanitized.availability ?? [];
      await rememberMeeting(sanitized);
      return NextResponse.json({ meeting: sanitized, source: 'database' });
    }
  } catch (error: any) {
    console.warn('Database error, attempting memory fallback:', error);
  }

  const fallbackMeeting = await getRememberedMeeting(params.id);

  if (fallbackMeeting) {
    return NextResponse.json({ meeting: fallbackMeeting, source: 'memory' });
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

    const updatedMeeting = await db
      .collection('meetings')
      .findOne({ id: params.id });
    const { _id, ...sanitized } = updatedMeeting as MeetingRecord & {
      _id?: unknown;
    };
    sanitized.availability = sanitized.availability ?? [];
    await rememberMeeting(sanitized);

    return NextResponse.json({ meeting: sanitized, source: 'database' });
  } catch (error) {
    console.warn('Database error during update, attempting memory fallback:', error);
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

