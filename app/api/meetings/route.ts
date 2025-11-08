import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import {
  rememberMeeting,
  listRememberedMeetings,
  MeetingRecord,
} from '@/lib/inMemoryMeetings';

// GET all meetings (for debugging) or POST to create a new meeting
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'calendarr');
    const meetings = await db.collection('meetings').find({}).toArray();

    return NextResponse.json({ meetings, source: 'database' });
  } catch (error) {
    console.warn('Database unavailable, serving meetings from memory:', error);
    const meetings = listRememberedMeetings();

    if (meetings.length > 0) {
      return NextResponse.json({ meetings, source: 'memory' });
    }

    return NextResponse.json(
      { error: 'Failed to fetch meetings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, dateRange, timeRange, createdBy } = body;
    
    if (!title || !dateRange || !timeRange || !createdBy) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const meeting: MeetingRecord = {
      id: `meeting-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      description: description || '',
      dateRange,
      timeRange,
      createdBy,
      availability: [],
      createdAt: new Date().toISOString(),
    };

    rememberMeeting(meeting);
    
    try {
      const client = await Promise.race([
        clientPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 3000))
      ]) as any;
      
      const db = client.db(process.env.MONGODB_DB || 'calendarr');
      await db.collection('meetings').insertOne(meeting);
      console.log('✅ Meeting saved to MongoDB');
    } catch (dbError: any) {
      console.warn('⚠️ MongoDB unavailable, meeting created in-memory only:', dbError.message);
      // Continue without database - meeting is still created
    }
    
    return NextResponse.json({ meeting }, { status: 201 });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Failed to create meeting', details: error.message }, { status: 500 });
  }
}

