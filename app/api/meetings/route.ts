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
    
    // Use projection to exclude _id and limit fields for better performance
    const meetings = await db.collection('meetings')
      .find({}, { projection: { _id: 0 } })
      .sort({ createdAt: -1 }) // Most recent first
      .limit(100) // Limit results for performance
      .toArray();

    return NextResponse.json({ meetings, source: 'database' });
  } catch (error: any) {
    console.error('Database error:', error.message);
    
    // Only use memory fallback in development
    if (process.env.NODE_ENV === 'development') {
      const meetings = await listRememberedMeetings();
      if (meetings.length > 0) {
        return NextResponse.json({ meetings, source: 'memory' });
      }
    }

    return NextResponse.json(
      { error: 'Failed to fetch meetings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const hasMongoUri = !!process.env.MONGODB_URI;
    const mongoDb = process.env.MONGODB_DB || 'calendarr';
    
    if (!hasMongoUri) {
      return NextResponse.json({ 
        error: 'Database configuration error', 
        details: 'MONGODB_URI environment variable is not set. Please configure it in Vercel settings.' 
      }, { status: 500 });
    }

    const body = await request.json();
    const { title, description, dateRange, timeRange, duration, createdBy } = body;
    
    if (!title || !dateRange || !timeRange || !createdBy) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const meeting: MeetingRecord = {
      id: `meeting-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      description: description || '',
      dateRange,
      timeRange,
      duration: duration || 1,
      createdBy,
      availability: [],
      createdAt: new Date().toISOString(),
    };

    try {
      // Get client directly - connection is already pooled
      const client = await clientPromise;
      const db = client.db(mongoDb);
      
      // Insert meeting - MongoDB will handle connection pooling efficiently
      await db.collection('meetings').insertOne(meeting);
      
      // Return immediately - no need to wait for memory backup in production
      return NextResponse.json({ meeting }, { status: 201 });
    } catch (dbError: any) {
      // Only log errors, not success paths
      console.error('MongoDB save failed:', dbError.message);
      
      let errorDetails = dbError.message;
      if (dbError.message?.includes('authentication')) {
        errorDetails = 'MongoDB authentication failed. Please check your username and password in the connection string.';
      } else if (dbError.message?.includes('timeout') || dbError.message?.includes('ETIMEOUT')) {
        errorDetails = 'MongoDB connection timeout. Please check your network access settings in MongoDB Atlas.';
      } else if (dbError.message?.includes('ENOTFOUND') || dbError.message?.includes('DNS')) {
        errorDetails = 'MongoDB hostname not found. Please check your connection string.';
      } else if (dbError.message?.includes('not authorized')) {
        errorDetails = 'Not authorized to access database. Please check your database user permissions.';
      }
      
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ 
          error: 'Failed to save meeting to database', 
          details: errorDetails
        }, { status: 500 });
      }
      
      // Development fallback only
      await rememberMeeting(meeting);
      return NextResponse.json({ meeting }, { status: 201 });
    }
  } catch (error: any) {
    console.error('API error:', error.message);
    return NextResponse.json({ 
      error: 'Failed to create meeting', 
      details: error.message 
    }, { status: 500 });
  }
}

