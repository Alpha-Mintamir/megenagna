import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// GET a specific meeting by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'calendarr');
    
    const meeting = await db.collection('meetings').findOne({ id: params.id });
    
    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }
    
    return NextResponse.json({ meeting });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch meeting' }, { status: 500 });
  }
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
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }
    
    const existingEntry = meeting.availability?.find((a: any) => a.userId === userId);
    
    if (existingEntry) {
      // Update existing entry
      await db.collection('meetings').updateOne(
        { id: params.id, 'availability.userId': userId },
        { $set: { 'availability.$.slots': slots } }
      );
    } else {
      // Add new entry
      await db.collection('meetings').updateOne(
        { id: params.id },
        { $push: { availability: { userId, userName, slots } } }
      );
    }
    
    const updatedMeeting = await db.collection('meetings').findOne({ id: params.id });
    
    return NextResponse.json({ meeting: updatedMeeting });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to update meeting' }, { status: 500 });
  }
}

