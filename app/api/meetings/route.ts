import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// GET all meetings (for debugging) or POST to create a new meeting
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'calendarr');
    const meetings = await db.collection('meetings').find({}).toArray();
    
    return NextResponse.json({ meetings });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch meetings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, dateRange, timeRange, createdBy } = body;
    
    if (!title || !dateRange || !timeRange || !createdBy) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'calendarr');
    
    const meeting = {
      id: `meeting-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      description: description || '',
      dateRange,
      timeRange,
      createdBy,
      availability: [],
      createdAt: new Date().toISOString(),
    };
    
    await db.collection('meetings').insertOne(meeting);
    
    return NextResponse.json({ meeting }, { status: 201 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to create meeting' }, { status: 500 });
  }
}

