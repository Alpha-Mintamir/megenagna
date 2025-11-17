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
    const meetings = await listRememberedMeetings();

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
    // Log environment check
    const hasMongoUri = !!process.env.MONGODB_URI;
    const mongoDb = process.env.MONGODB_DB || 'calendarr';
    console.log('POST /api/meetings - Environment check:');
    console.log('  MONGODB_URI exists:', hasMongoUri);
    console.log('  MONGODB_DB:', mongoDb);
    console.log('  NODE_ENV:', process.env.NODE_ENV);
    
    if (!hasMongoUri) {
      console.error('❌ MONGODB_URI is not set in environment variables');
      return NextResponse.json({ 
        error: 'Database configuration error', 
        details: 'MONGODB_URI environment variable is not set. Please configure it in Vercel settings.' 
      }, { status: 500 });
    }

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

    console.log('Attempting to save meeting:', meeting.id);

    // In production, MongoDB MUST succeed - don't rely on memory fallback
    // because serverless functions don't share memory
    try {
      console.log('Connecting to MongoDB...');
      const client = await Promise.race([
        clientPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout after 10 seconds')), 10000))
      ]) as any;
      
      console.log('✅ MongoDB client connected');
      const db = client.db(mongoDb);
      console.log('Using database:', mongoDb);
      
      console.log('Inserting meeting into collection...');
      const result = await db.collection('meetings').insertOne(meeting);
      console.log('✅ Meeting saved to MongoDB:', meeting.id);
      console.log('Insert result:', { insertedId: result.insertedId });
      
      // Also store in memory as backup
      await rememberMeeting(meeting);
      
      return NextResponse.json({ meeting }, { status: 201 });
    } catch (dbError: any) {
      console.error('❌ MongoDB save failed');
      console.error('Error name:', dbError.name);
      console.error('Error message:', dbError.message);
      console.error('Error code:', dbError.code);
      console.error('Error codeName:', dbError.codeName);
      console.error('Full error object:', JSON.stringify(dbError, Object.getOwnPropertyNames(dbError)));
      
      // Provide more specific error messages
      let errorDetails = dbError.message;
      if (dbError.message?.includes('authentication')) {
        errorDetails = 'MongoDB authentication failed. Please check your username and password in the connection string.';
      } else if (dbError.message?.includes('timeout') || dbError.message?.includes('ETIMEOUT')) {
        errorDetails = 'MongoDB connection timeout. Please check your network access settings in MongoDB Atlas and ensure your IP is whitelisted (or use 0.0.0.0/0 to allow all IPs).';
      } else if (dbError.message?.includes('ENOTFOUND') || dbError.message?.includes('DNS')) {
        errorDetails = 'MongoDB hostname not found. Please check your connection string.';
      } else if (dbError.message?.includes('not authorized')) {
        errorDetails = 'Not authorized to access database. Please check your database user permissions in MongoDB Atlas.';
      }
      
      // In production, fail if MongoDB is unavailable
      // In development, allow memory fallback
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ 
          error: 'Failed to save meeting to database', 
          details: errorDetails,
          errorCode: dbError.code,
          errorName: dbError.name
        }, { status: 500 });
      }
      
      // Development fallback
      console.warn('⚠️ MongoDB unavailable, using memory fallback (dev only)');
      await rememberMeeting(meeting);
      return NextResponse.json({ meeting }, { status: 201 });
    }
  } catch (error: any) {
    console.error('API error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json({ 
      error: 'Failed to create meeting', 
      details: error.message 
    }, { status: 500 });
  }
}

